
import prisma from '@/lib/prisma';
import { unstable_cache } from 'next/cache'; // DB負荷軽減のためキャッシュを使う場合

// 型定義は既存のもの(Mock)と互換性を持たせるため、一旦ここで定義するか、mockBBSからインポートするか。
// 依存関係を考えると、mockBBSから型だけインポートするのが楽ですが、DBモデルとずれる可能性があるので、
// ここで独自に定義しなおすか、Prismaの型を拡張します。
// 今回はコンポーネント変更を最小限にするため、戻り値をMockBBS互換に変換します。

export async function getBoards(includeLocked = false) {
    const boards = await prisma.board.findMany({
        where: includeLocked ? {} : { status: 'active' },
        include: {
            threads: {
                where: { status: 'active' },
                orderBy: { lastUpdated: 'desc' },
                take: 5, // Top page only needs recent threads
                include: {
                    posts: {
                        take: 1,
                        orderBy: { createdAt: 'desc' }
                    }
                }
            }
        }
    });

    return boards.map(board => ({
        ...board,
        threads: board.threads.map(convertThread)
    }));
}

export async function getBoard(boardId: string, page = 1, perPage = 30) {
    const board = await prisma.board.findUnique({
        where: { id: boardId },
        include: {
            threads: {
                where: { status: 'active' }, // Only active threads
                orderBy: { lastUpdated: 'desc' },
                skip: (page - 1) * perPage,
                take: perPage,
                include: {
                    posts: {
                        take: 1,
                        orderBy: { createdAt: 'desc' }
                    }
                }
            }
        }
    });

    if (!board) return null;

    // Get total active thread count for pagination
    const totalThreads = await prisma.thread.count({
        where: { boardId, status: 'active' }
    });

    return {
        ...board,
        threads: board.threads.map(convertThread),
        totalThreads,
        totalPages: Math.ceil(totalThreads / perPage),
        currentPage: page
    };
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
    tags: any;
    aiAnalysis?: string | null;
    isAiGenerated: boolean;
    sourceUrl?: string | null;
    createdAt: Date;
    status: string;
    posts?: PrismaPost[];
}

interface PrismaPost {
    id: string;
    author: string;
    content: string;
    createdAt: Date;
    status: string;
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

export async function addPost(boardId: string, threadId: string, data: { author: string, content: string, userId: string }) {
    // Check limits
    const thread = await prisma.thread.findUnique({
        where: { id: threadId },
        select: { postCount: true, status: true }
    });

    if (!thread) throw new Error('Thread not found');
    if (thread.postCount >= 1000 || thread.status === 'filled') {
        throw new Error('Thread has reached 1000 posts');
    }

    const post = await prisma.post.create({
        data: {
            content: data.content,
            author: data.author, // トリップなどの処理はここで
            userId: data.userId,
            threadId: threadId,
            // No boardId in Post model
        }
    });

    // Threadの統計情報を更新
    const newPostCount = thread.postCount + 1;
    const newStatus = newPostCount >= 1000 ? 'filled' : 'active';

    const updatedThread = await prisma.thread.update({
        where: { id: threadId },
        data: {
            lastUpdated: new Date(),
            postCount: { increment: 1 },
            momentum: { increment: 10 }, // 勢い計算（簡易）
            status: newStatus
        }
    });

    // Auto-trigger AI summarization at milestones (fire-and-forget)
    const SUMMARY_THRESHOLDS = [20, 50, 100, 200, 500, 1000];
    if (SUMMARY_THRESHOLDS.includes(updatedThread.postCount)) {
        console.log(`[AutoSummarize] Triggering for thread ${threadId} at ${updatedThread.postCount} posts`);
        // Fire-and-forget: don't await, don't block the response
        const baseUrl = process.env.NEXTAUTH_URL || process.env.VERCEL_URL || 'http://localhost:3000';
        fetch(`${baseUrl}/api/thread/summarize`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ threadId }),
        }).catch(err => console.error('[AutoSummarize] Background call failed:', err));
    }

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
                author: '名無しさん', // Default
                userId: userId,
                threadId: thread.id,
            }
        });

        return thread;
    });


    return result;
}

export async function getAllThreads(limit = 100) {
    const threads = await prisma.thread.findMany({
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
}


export async function getAllRecentThreads(limit = 100) {
    const threads = await prisma.thread.findMany({
        orderBy: { lastUpdated: 'desc' },
        take: limit,
        include: {
            board: true
            // posts not needed for list view, but convertThread expects it?
            // convertThread handles missing posts gracefully if posts is optional in type, 
            // but in my implementation it maps over posts. 
            // let's include posts for safety or update convertThread
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

    const where: Record<string, any> = {
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

export async function updateBoardStatus(boardId: string, status: 'active' | 'locked') {
    const board = await prisma.board.update({
        where: { id: boardId },
        data: { status }
    });

    return board;
}
