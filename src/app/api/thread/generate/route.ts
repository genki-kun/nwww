import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import * as cheerio from 'cheerio';
import prisma from '@/lib/prisma';

// Helper: Try to scrape content via generic HTTP fetch + OGP metadata
async function scrapeGeneric(url: string): Promise<{ title: string; content: string }> {
    const res = await fetch(url, {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
    });
    if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`);
    const html = await res.text();
    const $ = cheerio.load(html);

    $('script, style, nav, footer, iframe, noscript').remove();

    const ogTitle = $('meta[property="og:title"]').attr('content');
    const ogDesc = $('meta[property="og:description"]').attr('content');
    const twitterDesc = $('meta[name="twitter:description"]').attr('content');
    const desc = $('meta[name="description"]').attr('content');

    const title = ogTitle || $('title').text().trim() || 'No Title';
    const metaSummary = [ogDesc, twitterDesc, desc].filter(Boolean).join('\n');

    let bodyText = $('article').text() || $('main').text() || $('body').text();
    bodyText = bodyText.replace(/\s+/g, ' ').trim();

    const content = `Summary: ${metaSummary}\nContent: ${bodyText.slice(0, 10000)}`;

    if (content.length < 30 && !metaSummary) {
        throw new Error('Content too short and no metadata found');
    }

    return { title, content };
}

// Helper: Try Twitter oEmbed API
async function scrapeTwitter(url: string): Promise<{ title: string; content: string } | null> {
    try {
        const oembedUrl = `https://publish.twitter.com/oembed?url=${encodeURIComponent(url)}`;
        const res = await fetch(oembedUrl);

        if (!res.ok) {
            console.warn(`Twitter oEmbed returned ${res.status}, falling back to generic scraping`);
            return null; // Signal to use fallback
        }

        const data = await res.json();
        const $ = cheerio.load(data.html || '');
        const tweetText = $('p').text();

        return {
            title: `【X】${data.author_name}のポスト`,
            content: [
                `[Platform]: X (Twitter)`,
                `[Author]: ${data.author_name}`,
                `[Tweet Link]: ${url}`,
                `[Content]:`,
                tweetText,
            ].join('\n'),
        };
    } catch (error) {
        console.warn('Twitter oEmbed failed, falling back:', error);
        return null;
    }
}

export async function POST(req: Request) {
    try {
        const { url, website_url_verification } = await req.json();

        if (website_url_verification) {
            return NextResponse.json({ error: 'Spam detected' }, { status: 400 });
        }

        if (!url) {
            return NextResponse.json({ error: 'URL is required' }, { status: 400 });
        }

        if (!process.env.GEMINI_API_KEY) {
            console.error('GEMINI_API_KEY is missing');
            return NextResponse.json({ error: 'Server configuration error: GEMINI_API_KEY missing' }, { status: 500 });
        }

        // 1. Fetch content — try platform-specific first, fallback to generic
        let textContent = '';
        let pageTitle = '';
        const isTwitter = url.includes('twitter.com') || url.includes('x.com');

        try {
            if (isTwitter) {
                // Try oEmbed first; if it fails, fall back to generic scraping
                const twitterResult = await scrapeTwitter(url);
                if (twitterResult) {
                    pageTitle = twitterResult.title;
                    textContent = twitterResult.content;
                } else {
                    // Fallback: generic scraping (will get OGP meta at minimum)
                    const genericResult = await scrapeGeneric(url);
                    pageTitle = genericResult.title;
                    textContent = genericResult.content;
                }
            } else {
                const genericResult = await scrapeGeneric(url);
                pageTitle = genericResult.title;
                textContent = genericResult.content;
            }
        } catch (error) {
            console.error('Content extraction failed:', error);
            return NextResponse.json(
                { error: 'Failed to retrieve content from URL. Please try another URL.' },
                { status: 400 }
            );
        }

        // 2. Get available boards for categorization (only active ones)
        const boards = await prisma.board.findMany({
            where: { status: 'active' },
            select: { id: true, name: true, description: true }
        });
        const boardsList = boards.map((b: { id: string; name: string; description: string | null }) =>
            `- ID: "${b.id}" (${b.name}): ${b.description}`
        ).join('\n');

        // 3. Call Gemini API — try multiple model names for compatibility
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

        const modelsToTry = [
            'gemini-2.0-flash',
            'gemini-1.5-flash-001',
            'gemini-1.5-flash',
            'gemini-pro',
        ];

        const prompt = `
    あなたは「2ちゃんねる（5ちゃんねる）のニュース速報＋板」にスレを立てる、百戦錬磨の「スレ立て記者」です。
    以下の記事情報をもとに、住人（ねらー）が最も食いつき、議論が白熱（炎上）するような「クソスレ」ギリギリの「良スレ」を作成してください。

    ## 記事情報
    Title: ${pageTitle}
    URL: ${url}
    Content Summary: ${textContent.slice(0, 5000)}... (truncated)

    ## 文体・トーンの指示 (重要)
    - **報道機関のような中立的・丁寧な口調は厳禁**です。「〜ですね」「〜しましょう」は排除してください。
    - **断定調**、**倒置法**、**ネットスラング**（「〜な件」「〜不可避」「【悲報】」「【朗報】」など）を自然に混ぜてください。
    - 記事の核心を突き、一言で「要するにこういうことだろ」と断じるような、短くキレのある文体にしてください。

    ## 重要: AI要約 (aiAnalysis) の制約
    - 必ず **3行** の箇条書きで構成してください。
    - **各行は全角10文字以内** に厳格に収めてください。
    - 体言止めや短いフレーズを使用し、簡潔に要点を突いてください。

    ## 出力コンテンツの要件

    ### 1. Title (スレッドタイトル)
    - 30文字以内。
    - 記事のタイトルをそのまま使うのではなく、ねらーが思わずクリックしたくなるように改変してください。

    ### 2. Initial Post Content (>>1 本文)
    - **極めて簡潔に**書いてください。ダラダラとした説明は不要です。
    - 記事の**客観的な要約**（2〜3行程度、短い文で）を最初に書いてください。
    - その後に、スレ立て記者（あなた）としての**一言コメント**（煽り、ボヤキ、皮肉など）を1行〜2行程度で添えてください。
    - **「お前らどう思う？」や「議論しましょう」といった、住人に媚びるような問いかけは一切不要です。** 記者の独り言として完結させてください。
    - スマホでも1画面に収まる程度の分量を意識してください。

    ## 出力フォーマット (JSONのみ)
    {
      "title": "スレッドタイトル（30文字以内）",
      "boardId": "以下のリストから最も適切なIDを選択",
      "tags": ["タグ1", "タグ2", "タグ3"],
      "aiAnalysis": "3行箇条書き（各行10文字以内）。",
      "initialPostContent": "要約部分...\\n\\n(一言コメント)..."
    }

    ## 選択可能なBoard IDリスト
    ${boardsList}

    重要: "boardId" は必ずリストの中から正確に選んでください。
    JSON以外のテキストは出力しないでください。
    `;

        let generatedText = '';
        let lastError: Error | null = null;

        for (const modelName of modelsToTry) {
            try {
                console.log(`Trying model: ${modelName}`);
                const model = genAI.getGenerativeModel({ model: modelName });

                // Add simple retry logic for 429/404
                let attempts = 0;
                while (attempts < 2) { // Retry once per model
                    try {
                        const result = await model.generateContent(prompt);
                        const response = await result.response;
                        generatedText = response.text();
                        console.log(`Success with model: ${modelName}`);
                        break;
                    } catch (e: any) {
                        attempts++;
                        console.warn(`Attempt ${attempts} failed for ${modelName}:`, e.message);
                        if (attempts >= 2) throw e;
                        // Wait 2 seconds before retry
                        await new Promise(resolve => setTimeout(resolve, 2000));
                    }
                }
                if (generatedText) break; // Success — exit model loop

            } catch (error) {
                console.warn(`Model ${modelName} failed after retries:`, error);
                lastError = error as Error;
                // Wait a bit before trying next model to avoid hitting rate limits properly
                await new Promise(resolve => setTimeout(resolve, 1000));
                continue; // Try next model
            }
        }

        if (!generatedText) {
            console.error('All models failed. Last error:', lastError);
            return NextResponse.json(
                { error: 'AI generation failed. All model variants returned errors.', details: String(lastError) },
                { status: 500 }
            );
        }

        // ... existing code ...

        // Extract JSON from response
        const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            console.error('AI Response (No JSON):', generatedText); // Log raw text
            throw new Error('No JSON found in AI response. Raw output logged.');
        }

        let data;
        try {
            data = JSON.parse(jsonMatch[0]);
        } catch (e) {
            console.error('JSON Parse Error:', e);
            console.error('Raw JSON String:', jsonMatch[0]);
            throw new Error('Failed to parse (valid?) JSON from AI response');
        }

        // Validate boardId
        const validBoardIds = boards.map((b: { id: string }) => b.id);
        let targetBoardId = data.boardId;
        if (!validBoardIds.includes(targetBoardId)) {
            console.warn(`Invalid boardId "${targetBoardId}" returned. Defaulting to news-global.`);
            targetBoardId = validBoardIds.includes('news-global') ? 'news-global' : validBoardIds[0];
        }

        // 4. Save to Database (Transaction)
        try {
            const newThread = await prisma.$transaction(async (tx: any) => {
                const thread = await tx.thread.create({
                    data: {
                        title: data.title,
                        boardId: targetBoardId,
                        isAiGenerated: true,
                        sourceUrl: url,
                        sourceTitle: pageTitle,
                        sourcePlatform: isTwitter ? 'twitter' : 'web',
                        aiAnalysis: typeof data.aiAnalysis === 'string'
                            ? data.aiAnalysis
                            : Array.isArray(data.aiAnalysis)
                                ? data.aiAnalysis.join('\n')
                                : String(data.aiAnalysis), // Fallback to String() instead of JSON.stringify()
                        tags: data.tags || [],
                        views: 0,
                        postCount: 1,
                        momentum: 1000,
                        lastUpdated: new Date(),
                    }
                });

                await tx.post.create({
                    data: {
                        content: data.initialPostContent,
                        author: '@ニュ〜くんはAIなのです',
                        userId: 'NWWW_KUN_',
                        threadId: thread.id,
                    }
                });

                return thread;
            });
            return NextResponse.json({ success: true, threadId: newThread.id, boardId: targetBoardId });
        } catch (dbError) {
            console.error('Database Transaction Error:', dbError);
            throw new Error(`Database error: ${dbError}`);
        }

    } catch (error: any) {
        console.error('API Implementation Error:', error);
        // Return the specific error message to client for debugging
        return NextResponse.json(
            { error: 'Internal Server Error', details: error.message || String(error) },
            { status: 500 }
        );
    }
}
