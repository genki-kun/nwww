
import prisma from '@/lib/prisma';
import { unstable_cache } from 'next/cache'; // DB負荷軽減のためキャッシュを使う場合

// 型定義は既存のもの(Mock)と互換性を持たせるため、一旦ここで定義するか、mockBBSからインポートするか。
// 依存関係を考えると、mockBBSから型だけインポートするのが楽ですが、DBモデルとずれる可能性があるので、
// ここで独自に定義しなおすか、Prismaの型を拡張します。
// 今回はコンポーネント変更を最小限にするため、戻り値をMockBBS互換に変換します。

export const getBoards = unstable_cache(
    async (includeLocked = false) => {
        const boards = await prisma.board.findMany({
            where: includeLocked ? {} : { status: 'active' },
            // Sidebar only needs board metadata - no threads/posts needed
            select: {
                id: true,
                name: true,
                description: true,
                category: true,
                status: true,
                createdAt: true,
                updatedAt: true,
            }
        });

        return boards.map(board => ({
            ...board,
            threads: [] // Sidebar doesn't render threads
        }));
    },
    ['getBoards', 'v2'],
    { tags: ['boards'], revalidate: 120 }
);

// Cached per boardId+page with board-specific tag for targeted invalidation
export function getBoard(boardId: string, page = 1, perPage = 30) {
    return unstable_cache(
        async () => {
            const [board, totalThreads] = await Promise.all([
                prisma.board.findUnique({
                    where: { id: boardId },
                    include: {
                        threads: {
                            where: { status: 'active' },
                            orderBy: { lastUpdated: 'desc' },
                            skip: (page - 1) * perPage,
                            take: perPage,
                            select: {
                                id: true,
                                title: true,
                                views: true,
                                postCount: true,
                                momentum: true,
                                status: true,
                                lastUpdated: true,
                                createdAt: true,
                                tags: true,
                                isAiGenerated: true,
                                sourceUrl: true,
                                sourceTitle: true,
                                sourcePlatform: true,
                                aiAnalysis: true,
                            }
                        }
                    }
                }),
                prisma.thread.count({
                    where: { boardId, status: 'active' }
                })
            ]);

            if (!board) return null;

            return {
                ...board,
                threads: board.threads.map(t => convertThread(t)),
                totalThreads,
                totalPages: Math.ceil(totalThreads / perPage),
                currentPage: page
            };
        },
        ['getBoard', 'v2', boardId, String(page)],
        { tags: [`board-${boardId}`], revalidate: 120 }
    )();
}

export async function getArchivedThreads(boardId: string) {
    const threads = await prisma.thread.findMany({
        where: {
            boardId: boardId,
            status: { in: ['filled', 'archived'] }
        },
        orderBy: { lastUpdated: 'desc' },
        include: {
            posts: {
                take: 1,
                orderBy: { createdAt: 'desc' }
            },
            board: true
        }
    });

    return threads.map(convertThread);
}

export async function getThread(boardId: string, threadId: string) {
    const thread = await prisma.thread.findUnique({
        where: { id: threadId },
        include: {
            posts: {
                orderBy: { createdAt: 'asc' } // Posts in chronological order
            },
            board: true,
        } // All status allowed (Archive should be readable)
    });

    if (!thread) return null;

    return convertThread(thread);
}

// Prisma types helper
interface PrismaThread {
    id: string;
    title: string;
    lastUpdated: Date;
    postCount: number;
    views: number;
    momentum: number;
    tags: any;
    aiAnalysis: string | null;
    isAiGenerated: boolean;
    sourceUrl: string | null;
    sourceTitle: string | null;
    sourcePlatform: string | null;
    createdAt: Date;
    status: string;
    posts?: PrismaPost[];
    board?: any;
}

interface PrismaPost {
    id: string;
    author: string;
    content: string;
    createdAt: Date;
    status: string;
    likes: number;
}

// Helper to convert Prisma Thread to App Thread (Date -> String, JSON string tags -> Array)
function convertThread(thread: PrismaThread) {
    // With PostgreSQL Json type, tags come directly as an array or object
    const tags = Array.isArray(thread.tags) ? thread.tags : [];

    return {
        ...thread,
        lastUpdated: thread.lastUpdated.toISOString(),
        createdAt: thread.createdAt.toISOString(),
        tags: tags,
        posts: thread.posts ? thread.posts.map((post: PrismaPost) => ({
            ...post,
            createdAt: post.createdAt.toISOString(),
            status: post.status,
            likes: post.likes,
        })) : [],
        // Add AI fields if needed
        isAiGenerated: thread.isAiGenerated,
        sourceUrl: thread.sourceUrl,
        aiAnalysis: thread.aiAnalysis,
        aiSummary: thread.aiAnalysis,
    };
}

// Data Mutation Actions
import { revalidatePath } from 'next/cache';
import { revalidateTag } from 'next/cache';
import { after } from 'next/server';
import { generateAiReplies, maybeReplyToHumanPost } from '@/lib/ai-replies';

export async function addPost(boardId: string, threadId: string, data: { author: string, content: string, userId: string }) {
    // Wrap in transaction for data integrity
    const { post, updatedThread } = await prisma.$transaction(async (tx) => {
        // Check limits
        const thread = await tx.thread.findUnique({
            where: { id: threadId },
            select: { postCount: true, status: true }
        });

        if (!thread) throw new Error('Thread not found');
        if (thread.postCount >= 1000 || thread.status === 'filled') {
            throw new Error('Thread has reached 1000 posts');
        }

        const post = await tx.post.create({
            data: {
                content: data.content,
                author: data.author,
                userId: data.userId,
                threadId: threadId,
            }
        });

        const newPostCount = thread.postCount + 1;
        const newStatus = newPostCount >= 1000 ? 'filled' : 'active';

        const updatedThread = await tx.thread.update({
            where: { id: threadId },
            data: {
                lastUpdated: new Date(),
                postCount: { increment: 1 },
                momentum: { increment: 10 },
                status: newStatus
            }
        });

        return { post, updatedThread };
    });

    // Auto-trigger AI summarization at milestones (fire-and-forget)
    const SUMMARY_THRESHOLDS = [20, 50, 100, 200, 500, 1000];
    if (SUMMARY_THRESHOLDS.includes(updatedThread.postCount)) {
        console.log(`[AutoSummarize] Triggering for thread ${threadId} at ${updatedThread.postCount} posts`);
        // Fire-and-forget: don't await, don't block the response
        const baseUrl = process.env.NEXTAUTH_URL || process.env.VERCEL_URL || 'http://localhost:3000';
        fetch(`${baseUrl}/api/thread/summarize`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-cron-secret': process.env.CRON_SECRET || '',
            },
            body: JSON.stringify({ threadId }),
        }).catch(err => console.error('[AutoSummarize] Background call failed:', err));
    }

    // Invalidate data caches for the affected board + top page
    revalidateTag(`board-${boardId}`, { expire: 0 });
    revalidateTag('all-threads', { expire: 0 });
    revalidatePath(`/${boardId}/${threadId}`);

    // after() ensures this runs after the response is sent (survives serverless shutdown)
    const isAiPost = data.userId.startsWith('AI_');
    after(async () => {
        try {
            await maybeReplyToHumanPost(threadId, boardId, isAiPost);
        } catch (err) {
            console.error('[AIReply] Conversation reply failed:', err);
        }
    });

    return post;
}

export async function createThread(boardId: string, title: string, content: string, userId: string) {
    // コンテンツを最初のPostとして作成するか、Thread.contentに入れるか。
    // スキーマには Thread.content は無いが、最初のPostを作るのが２ちゃんねる流。
    // しかしPrismaのtransactionを使うべき。

    const result = await prisma.$transaction(async (tx) => {
        const thread = await tx.thread.create({
            data: {
                title: title,
                boardId: boardId,
                lastUpdated: new Date(),
                postCount: 1, // First post
                views: 0,
                momentum: 100, // Initial momentum
                tags: [], // Empty tags for new manual thread
            }
        });

        await tx.post.create({
            data: {
                content: content,
                author: '名無しさん@ニュ〜', // Default
                userId: userId,
                threadId: thread.id,
            }
        });

        return thread;
    });


    // End of transaction


    // Invalidate data caches for the affected board + top page
    revalidateTag(`board-${boardId}`, { expire: 0 });
    revalidateTag('all-threads', { expire: 0 });
    revalidatePath(`/${boardId}`);

    // after() ensures this runs after the response is sent (survives serverless shutdown)
    after(async () => {
        try {
            await generateAiReplies(result.id, boardId, title, content);
        } catch (err) {
            console.error('[AIReply] Failed for manual thread:', err);
        }
    });

    return result;
}

export const getAllThreads = unstable_cache(
    async (limit = 100) => {
        const threads = await prisma.thread.findMany({
            where: { status: 'active' },
            orderBy: { lastUpdated: 'desc' },
            take: limit,
            include: {
                board: true,
                posts: {
                    take: 1,
                    orderBy: { createdAt: 'desc' }
                }
            }
        });

        return threads.map(t => ({
            ...convertThread(t),
            boardName: t.board.name,
            boardId: t.board.id
        }));
    },
    ['getAllThreads', 'v2'],
    { tags: ['all-threads'], revalidate: 120 }
);


export async function getAllRecentThreads(limit = 100) {
    const threads = await prisma.thread.findMany({
        where: { status: 'active' },
        orderBy: { lastUpdated: 'desc' },
        take: limit,
        include: {
            board: true
        }
    });

    // Prisma include posts for convertThread compatibility
    // actually let's just fetch them or make convertThread safe
    // The current convertThread implementation:
    // posts: thread.posts ? thread.posts.map(...) : []
    // So it is safe.

    return threads.map(t => ({
        ...convertThread(t),
        boardName: t.board.name,
        boardId: t.board.id
    }));
}

export async function searchThreads(query: string, boardId?: string) {
    if (!query.trim()) return [];
    if (query.length > 100) query = query.substring(0, 100);

    const where: Record<string, any> = {
        status: 'active',
        OR: [
            { title: { contains: query, mode: 'insensitive' } },
            { posts: { some: { content: { contains: query, mode: 'insensitive' } } } }
        ]
    };

    if (boardId) {
        where.boardId = boardId;
    }

    const threads = await prisma.thread.findMany({
        where,
        orderBy: { lastUpdated: 'desc' },
        take: 50,
        include: {
            board: true,
            posts: {
                take: 1,
                orderBy: { createdAt: 'desc' }
            }
        }
    });

    return threads.map(t => ({
        ...convertThread(t),
        boardName: t.board.name,
        boardId: t.board.id
    }));
}

// Administrative Actions
export async function updatePostStatus(postId: string, status: 'active' | 'deleted') {
    const post = await prisma.post.update({
        where: { id: postId },
        data: { status }
    });

    // Recalculate momentum or other stats if needed

    return post;
}

export async function updateThreadStatus(threadId: string, status: 'active' | 'deleted' | 'archived' | 'filled') {
    const thread = await prisma.thread.update({
        where: { id: threadId },
        data: { status }
    });

    return thread;
}

// Reports management
export async function getReports(limit = 100) {
    const reports = await prisma.report.findMany({
        where: {
            status: 'pending'
        },
        orderBy: {
            createdAt: 'desc'
        },
        take: limit,
        include: {
            post: {
                include: {
                    thread: {
                        include: {
                            board: true
                        }
                    }
                }
            }
        }
    });

    return reports.map(report => ({
        ...report,
        createdAt: report.createdAt.toISOString(),
        post: {
            ...report.post,
            createdAt: report.post.createdAt.toISOString(),
            threadTitle: report.post.thread.title,
            boardName: report.post.thread.board.name,
            threadId: report.post.thread.id,
            boardId: report.post.thread.board.id,
        }
    }));
}

export async function updateReportStatus(reportId: string, status: 'pending' | 'resolved' | 'dismissed') {
    const report = await prisma.report.update({
        where: { id: reportId },
        data: { status }
    });

    return report;
}

export async function getThreadsForAdmin(boardId: string) {
    const threads = await prisma.thread.findMany({
        where: { boardId },
        orderBy: { lastUpdated: 'desc' },
        take: 100,
        select: {
            id: true,
            title: true,
            status: true,
            postCount: true,
            createdAt: true,
            lastUpdated: true,
            isAiGenerated: true,
        }
    });

    return threads.map(t => ({
        ...t,
        createdAt: t.createdAt.toISOString(),
        lastUpdated: t.lastUpdated.toISOString(),
    }));
}

export async function updateBoardStatus(boardId: string, status: 'active' | 'locked') {
    const board = await prisma.board.update({
        where: { id: boardId },
        data: { status }
    });

    return board;
}
// Analytics
export async function getDailyStats() {
    // 1. Total Counts
    const totalThreads = await prisma.thread.count();
    const totalPosts = await prisma.post.count();
    const totalActiveThreads = await prisma.thread.count({ where: { status: 'active' } });

    // 2. Daily Post Count (Last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const postsLast7Days = await prisma.post.groupBy({
        by: ['createdAt'],
        where: {
            createdAt: {
                gte: sevenDaysAgo
            }
        },
        _count: {
            id: true
        }
    });

    // Group by date string (YYYY-MM-DD)
    const dailyPostCounts: Record<string, number> = {};
    for (let i = 0; i < 7; i++) {
        const d = new Date(sevenDaysAgo);
        d.setDate(d.getDate() + i);
        const dateStr = d.toISOString().split('T')[0];
        dailyPostCounts[dateStr] = 0;
    }

    postsLast7Days.forEach((p: { createdAt: Date, _count: { id: number } }) => {
        const dateStr = p.createdAt.toISOString().split('T')[0];
        if (dailyPostCounts[dateStr] !== undefined) {
            dailyPostCounts[dateStr] += p._count.id;
        }
    });

    const dailyChartData = Object.entries(dailyPostCounts).map(([date, count]) => ({ date, count }));

    // 3. AI Generated Content Ratio
    const aiThreadsCount = await prisma.thread.count({ where: { isAiGenerated: true } });
    const aiPostsCount = await prisma.post.count({ where: { isAiGenerated: true } });

    // 4. Momentum Ranking (Top 5 Active Threads)
    const topThreads = await prisma.thread.findMany({
        where: { status: 'active' },
        orderBy: { momentum: 'desc' },
        take: 5,
        select: {
            id: true,
            title: true,
            momentum: true,
            views: true,
            board: { select: { name: true } }
        }
    });

    return {
        totalThreads,
        totalPosts,
        totalActiveThreads,
        dailyChartData,
        aiRatio: {
            threads: aiThreadsCount,
            posts: aiPostsCount
        },
        topMoverThreads: topThreads
    };
}
