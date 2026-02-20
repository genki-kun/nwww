import { GoogleGenerativeAI } from '@google/generative-ai';
import { revalidateTag } from 'next/cache';
import prisma from '@/lib/prisma';
import crypto from 'crypto';

const MODELS_TO_TRY = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash'];

// スレッドあたりのAIレス累計上限
const MAX_AI_REPLIES_PER_THREAD = 10;
// 人間の投稿に対してAIがレスする確率 (0〜1)
const AI_REPLY_PROBABILITY = 0.4;

/** Gemini APIを呼んでJSON配列を取得する共通ヘルパー */
async function callGemini(prompt: string): Promise<{ content: string }[]> {
    if (!process.env.GEMINI_API_KEY) {
        console.warn('[AIReply] GEMINI_API_KEY not set, skipping');
        return [];
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    let replyText = '';
    for (const modelName of MODELS_TO_TRY) {
        try {
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent(prompt);
            replyText = result.response.text();
            if (replyText) break;
        } catch (e: unknown) {
            console.warn(`[AIReply] Model ${modelName} failed:`, e);
            continue;
        }
    }

    if (!replyText) {
        console.error('[AIReply] All models failed');
        return [];
    }

    const jsonMatch = replyText.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
        console.error('[AIReply] No JSON array found:', replyText);
        return [];
    }

    try {
        return JSON.parse(jsonMatch[0]);
    } catch {
        console.error('[AIReply] JSON parse failed:', jsonMatch[0]);
        return [];
    }
}

/** AIレスをDBに書き込む共通ヘルパー */
async function postAiReplies(
    replies: { content: string }[],
    threadId: string,
    boardId: string,
    maxCount: number,
    baseDelayMinutes: number
) {
    const now = Date.now();
    let posted = 0;
    for (let i = 0; i < replies.length && i < maxCount; i++) {
        const reply = replies[i];
        if (!reply.content) continue;

        const randomId = crypto.randomBytes(5).toString('hex').substring(0, 9);
        const minDelay = (baseDelayMinutes + i * 2) * 60 * 1000;
        const maxDelay = (baseDelayMinutes + 2 + i * 3) * 60 * 1000;
        const delay = minDelay + Math.random() * (maxDelay - minDelay);
        const createdAt = new Date(now + delay);

        await prisma.post.create({
            data: {
                content: reply.content,
                author: '名無しさん@ニュ〜',
                userId: `AI_${randomId}`,
                threadId,
                isAiGenerated: true,
                createdAt,
            }
        });

        await prisma.thread.update({
            where: { id: threadId },
            data: {
                postCount: { increment: 1 },
                momentum: { increment: 10 },
                lastUpdated: createdAt,
            }
        });

        posted++;
        console.log(`[AIReply] Posted reply ${posted} for thread ${threadId} (createdAt: ${createdAt.toISOString()})`);
    }

    if (posted > 0) {
        revalidateTag(`board-${boardId}`, { expire: 0 });
        revalidateTag('all-threads', { expire: 0 });
    }

    return posted;
}

/**
 * スレ立て直後に2〜3件のAIレスを生成する（fire-and-forget）
 */
export async function generateAiReplies(
    threadId: string,
    boardId: string,
    threadTitle: string,
    initialPostContent: string
) {
    const prompt = `
あなたは匿名掲示板「NWWW」の住人です。以下のスレッドの>>1を読んで、
2〜3人の別々の名無しとして自然なレスを書いてください。

## スレッド情報
タイトル: ${threadTitle}
>>1: ${initialPostContent}

## レスの指示
- 各レスは別人として書く（口調や視点を変える）
- ツッコミ、同意、煽り、補足情報、体験談、豆知識など多様に
- アンカー（>>1 や >>2 など）を自然に使ってよい（使わなくてもよい）
- 1レスは短め（1〜3行程度）
- 報道口調・丁寧語は禁止。断定調、ため口で
- 「w」「草」「それな」「〜だろ」「〜じゃね」などネットスラングを自然に
- 絵文字は使わない

## 出力（JSON配列のみ、他のテキスト不要）
[
  { "content": "レス内容" },
  { "content": "レス内容" },
  { "content": "レス内容" }
]
`;

    const replies = await callGemini(prompt);
    const posted = await postAiReplies(replies, threadId, boardId, 3, 3);
    console.log(`[AIReply] Thread init done: ${posted} replies for thread ${threadId}`);
}

/**
 * 人間の投稿に対してAIが1〜2件レスする（fire-and-forget）
 * - 40%の確率で発火
 * - スレッド内のAIレス累計上限10件
 * - AI投稿には反応しない
 */
export async function maybeReplyToHumanPost(
    threadId: string,
    boardId: string,
    isAiPost: boolean
) {
    // AI投稿にはAIが反応しない
    if (isAiPost) return;

    // 確率判定
    if (Math.random() > AI_REPLY_PROBABILITY) {
        console.log(`[AIReply] Skipped (probability) for thread ${threadId}`);
        return;
    }

    // スレッド内のAIレス数を確認（上限チェック）
    const aiPostCount = await prisma.post.count({
        where: { threadId, isAiGenerated: true }
    });

    if (aiPostCount >= MAX_AI_REPLIES_PER_THREAD) {
        console.log(`[AIReply] Skipped (limit ${aiPostCount}/${MAX_AI_REPLIES_PER_THREAD}) for thread ${threadId}`);
        return;
    }

    const remaining = MAX_AI_REPLIES_PER_THREAD - aiPostCount;
    const maxNewReplies = Math.min(remaining, 2); // 最大2件

    // スレッド情報と直近レスを取得
    const thread = await prisma.thread.findUnique({
        where: { id: threadId },
        select: {
            title: true,
            posts: {
                orderBy: { createdAt: 'desc' },
                take: 10,
                select: { content: true, author: true, isAiGenerated: true }
            }
        }
    });

    if (!thread) return;

    // 直近レスを古い順に並べてコンテキスト構築
    const recentPosts = thread.posts.reverse();
    const conversation = recentPosts
        .map((p, i) => `>>${recentPosts.length - i} ${p.author}: ${p.content}`)
        .join('\n');

    const prompt = `
あなたは匿名掲示板「NWWW」の住人です。以下のスレッドの会話を読んで、
自然なレスを1〜2件書いてください。

## スレッド情報
タイトル: ${thread.title}

## 直近の会話（古い順）
${conversation}

## レスの指示
- 直近の会話の流れに自然に乗っかること（最新のレスへの返答が理想）
- 1〜2人の別々の名無しとして書く
- ツッコミ、同意、煽り、補足情報、体験談、豆知識など
- アンカー（>>${recentPosts.length} など）を自然に使ってよい
- 1レスは短め（1〜3行程度）
- 報道口調・丁寧語は禁止。断定調、ため口で
- 「w」「草」「それな」「〜だろ」「〜じゃね」などネットスラングを自然に
- 絵文字は使わない
- 会話が盛り上がるようなレスを心がける

## 出力（JSON配列のみ、他のテキスト不要）
[
  { "content": "レス内容" }
]
`;

    const replies = await callGemini(prompt);
    // 1〜3分後にレス（スレ立て時より短い遅延）
    const posted = await postAiReplies(replies, threadId, boardId, maxNewReplies, 1);
    console.log(`[AIReply] Conversation reply done: ${posted} replies for thread ${threadId} (total AI: ${aiPostCount + posted}/${MAX_AI_REPLIES_PER_THREAD})`);
}
