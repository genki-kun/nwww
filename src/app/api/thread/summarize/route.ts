import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import prisma from '@/lib/prisma';

export async function POST(req: Request) {
    try {
        // Internal-only: require cron secret (origin/referer headers are spoofable)
        const cronSecret = req.headers.get('x-cron-secret');
        if (!cronSecret || cronSecret !== process.env.CRON_SECRET) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        let body: any;
        try {
            body = await req.json();
        } catch {
            return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
        }
        const { threadId } = body;

        if (!threadId) {
            return NextResponse.json({ error: 'threadId is required' }, { status: 400 });
        }

        if (!process.env.GEMINI_API_KEY) {
            return NextResponse.json({ error: 'GEMINI_API_KEY missing' }, { status: 500 });
        }

        // Fetch thread with all posts
        const thread = await prisma.thread.findUnique({
            where: { id: threadId },
            include: {
                posts: {
                    orderBy: { createdAt: 'asc' },
                },
            },
        });

        if (!thread) {
            return NextResponse.json({ error: 'Thread not found' }, { status: 404 });
        }

        if (thread.posts.length < 20) {
            return NextResponse.json({ error: 'Not enough posts (min 20)' }, { status: 400 });
        }

        // Build conversation text from posts (latest 100 posts max)
        const postsToAnalyze = thread.posts.slice(-100);
        const conversation = postsToAnalyze.map((p, i) =>
            `>>${i + 1} ${p.author}: ${p.content}`
        ).join('\n');

        const prompt = `
あなたはスレッド要約AIです。
以下の掲示板スレッドのレスを分析し、議論の要点を **3行の箇条書き** で要約してください。

## 厳格な制約
- 必ず **3行** にすること。
- **各行は全角10文字以内** に厳格に収めること。
- 体言止めや短いフレーズを使用すること。
- 各行は「・」で始めること。

## 出力例
・AI規制の是非
・著作権法の限界
・技術発展の阻害

## スレッドタイトル
${thread.title}

## スレッド内容 (${postsToAnalyze.length}件のレス)
${conversation.slice(0, 8000)}

上記の制約に従い、3行の要約のみを出力してください。JSON不要。
`;

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const modelsToTry = ['gemini-2.0-flash', 'gemini-1.5-flash-001', 'gemini-1.5-flash'];

        let summaryText = '';
        let lastError: Error | null = null;

        for (const modelName of modelsToTry) {
            try {
                const model = genAI.getGenerativeModel({ model: modelName });
                let attempts = 0;
                while (attempts < 2) {
                    try {
                        const result = await model.generateContent(prompt);
                        summaryText = result.response.text().trim();
                        break;
                    } catch (e: any) {
                        attempts++;
                        if (attempts >= 2) throw e;
                        await new Promise(resolve => setTimeout(resolve, 2000));
                    }
                }
                if (summaryText) break;
            } catch (error) {
                lastError = error as Error;
                await new Promise(resolve => setTimeout(resolve, 1000));
                continue;
            }
        }

        if (!summaryText) {
            return NextResponse.json(
                { error: 'AI summarization failed', details: String(lastError) },
                { status: 500 }
            );
        }

        // Update the thread's aiAnalysis in DB
        await prisma.thread.update({
            where: { id: threadId },
            data: { aiAnalysis: summaryText },
        });

        return NextResponse.json({ success: true, summary: summaryText });

    } catch (error) {
        console.error('Summarize API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
