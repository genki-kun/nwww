
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Google News RSS トピック → 取得するニュースカテゴリ
// 板の選定はGemini AIが記事内容から自動判定するため、ここでは板マッピング不要
const RSS_TOPICS = [
    {
        name: '国内ニュース',
        topicId: 'CAAqIQgKIhtDQkFTRGdvSUwyMHZNRE5mTTJRU0FtcGhLQUFQAQ',
    },
    {
        name: 'テクノロジー',
        topicId: 'CAAqJggKIiBDQkFTRWdvSUwyMHZNRGRqTVhZU0FtcGhHZ0pLVUNnQVAB',
    },
    {
        name: 'ビジネス',
        topicId: 'CAAqJggKIiBDQkFTRWdvSUwyMHZNRGx6TVdZU0FtcGhHZ0pLVUNnQVAB',
    },
    {
        name: 'エンタメ',
        topicId: 'CAAqJggKIiBDQkFTRWdvSUwyMHZNREpxYW5RU0FtcGhHZ0pLVUNnQVAB',
    },
    {
        name: 'スポーツ',
        topicId: 'CAAqJggKIiBDQkFTRWdvSUwyMHZNRFp1ZEdvU0FtcGhHZ0pLVUNnQVAB',
    },
    {
        name: '科学',
        topicId: 'CAAqJggKIiBDQkFTRWdvSUwyMHZNRFp0Y1RjU0FtcGhHZ0pLVUNnQVAB',
    },
];

// 1回のCron実行で生成するスレッド数上限
const MAX_THREADS_PER_RUN = 3;

interface RSSItem {
    title: string;
    link: string;
    pubDate: string;
}

// シンプルなXMLパーサー（RSS <item> を抽出）
function parseRSSItems(xml: string): RSSItem[] {
    const items: RSSItem[] = [];
    const itemRegex = /<item>([\s\S]*?)<\/item>/g;
    let match;

    while ((match = itemRegex.exec(xml)) !== null) {
        const itemXml = match[1];

        const titleMatch = itemXml.match(/<title><!\[CDATA\[([\s\S]*?)\]\]><\/title>/) ||
            itemXml.match(/<title>([\s\S]*?)<\/title>/);
        const linkMatch = itemXml.match(/<link>([\s\S]*?)<\/link>/);
        const pubDateMatch = itemXml.match(/<pubDate>([\s\S]*?)<\/pubDate>/);

        if (titleMatch && linkMatch) {
            items.push({
                title: titleMatch[1].trim(),
                link: linkMatch[1].trim(),
                pubDate: pubDateMatch ? pubDateMatch[1].trim() : '',
            });
        }
    }

    return items;
}

// Google News のリダイレクトURLから実際の記事URLを取得
async function resolveGoogleNewsUrl(gnewsUrl: string): Promise<string> {
    try {
        const res = await fetch(gnewsUrl, { redirect: 'manual' });
        const location = res.headers.get('location');
        if (location) return location;
    } catch {
        // フォールバック: そのまま返す
    }
    return gnewsUrl;
}

export async function GET(req: Request) {
    try {
        // 認証チェック: Vercel Cronまたは手動実行時のシークレット
        const authHeader = req.headers.get('authorization');
        const cronSecret = process.env.CRON_SECRET;

        if (!cronSecret) {
            return NextResponse.json(
                { error: 'CRON_SECRET not configured' },
                { status: 500 }
            );
        }

        if (authHeader !== `Bearer ${cronSecret}`) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const baseUrl = process.env.NEXTAUTH_URL || process.env.VERCEL_URL
            ? `https://${process.env.VERCEL_URL}`
            : 'http://localhost:3000';

        console.log('[AutoPost] Starting auto-post cron job');

        // 全トピックからRSS記事を収集
        const allArticles: { topic: string; item: RSSItem }[] = [];

        for (const topic of RSS_TOPICS) {
            try {
                const rssUrl = `https://news.google.com/rss/topics/${topic.topicId}?hl=ja&gl=JP&ceid=JP:ja`;
                const res = await fetch(rssUrl);

                if (!res.ok) {
                    console.warn(`[AutoPost] Failed to fetch RSS for ${topic.name}: ${res.status}`);
                    continue;
                }

                const xml = await res.text();
                const items = parseRSSItems(xml);

                // 各トピックから上位5件を候補に
                items.slice(0, 5).forEach(item => {
                    allArticles.push({ topic: topic.name, item });
                });

                console.log(`[AutoPost] ${topic.name}: ${items.length} articles found`);
            } catch (error) {
                console.warn(`[AutoPost] Error fetching ${topic.name}:`, error);
            }
        }

        if (allArticles.length === 0) {
            return NextResponse.json({ message: 'No articles found from RSS feeds', generated: 0 });
        }

        // 既存のsourceUrlと照合して重複を除外
        const candidateUrls = allArticles.map(a => a.item.link);
        const existingThreads = await prisma.thread.findMany({
            where: {
                sourceUrl: { in: candidateUrls }
            },
            select: { sourceUrl: true }
        });
        const existingUrls = new Set(existingThreads.map(t => t.sourceUrl));

        const newArticles = allArticles.filter(a => !existingUrls.has(a.item.link));
        console.log(`[AutoPost] ${newArticles.length} new articles after dedup (from ${allArticles.length} candidates)`);

        if (newArticles.length === 0) {
            return NextResponse.json({ message: 'All articles already posted', generated: 0 });
        }

        // トピックをシャッフルして偏りを防ぐ
        const shuffled = newArticles.sort(() => Math.random() - 0.5);
        const toProcess = shuffled.slice(0, MAX_THREADS_PER_RUN);

        const results: { url: string; success: boolean; threadId?: string; error?: string }[] = [];

        for (const article of toProcess) {
            try {
                // Google Newsリダイレクトを解決
                const articleUrl = await resolveGoogleNewsUrl(article.item.link);
                console.log(`[AutoPost] Processing: ${article.item.title} → ${articleUrl}`);

                // 既存の generate API を内部呼び出し
                const res = await fetch(`${baseUrl}/api/thread/generate`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-cron-secret': cronSecret,
                    },
                    body: JSON.stringify({ url: articleUrl }),
                });

                const data = await res.json();

                if (res.ok && data.success) {
                    console.log(`[AutoPost] Created thread ${data.threadId} in board ${data.boardId}`);
                    results.push({ url: articleUrl, success: true, threadId: data.threadId });
                } else {
                    console.warn(`[AutoPost] Failed for ${articleUrl}: ${data.error}`);
                    results.push({ url: articleUrl, success: false, error: data.error });
                }

                // API間隔を空ける（Gemini APIレート制限対策）
                await new Promise(resolve => setTimeout(resolve, 3000));

            } catch (error: any) {
                console.error(`[AutoPost] Error processing article:`, error);
                results.push({
                    url: article.item.link,
                    success: false,
                    error: error.message
                });
            }
        }

        const successCount = results.filter(r => r.success).length;
        console.log(`[AutoPost] Completed: ${successCount}/${results.length} threads generated`);

        return NextResponse.json({
            message: `Auto-post completed: ${successCount} threads generated`,
            generated: successCount,
            results,
        });

    } catch (error: any) {
        console.error('[AutoPost] Cron job error:', error);
        return NextResponse.json(
            { error: 'Cron job failed', details: error.message },
            { status: 500 }
        );
    }
}
