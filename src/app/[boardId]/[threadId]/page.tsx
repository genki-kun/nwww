import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getThread } from '@/data/db-actions';
import { SourceCard } from '@/components/SourceCard';
import ThreadInteractiveView from '@/components/ThreadInteractiveView';
import styles from './page.module.css';
import { Metadata } from 'next';

interface PageProps {
    params: Promise<{
        boardId: string;
        threadId: string;
    }>;
    searchParams: Promise<{
        admin?: string;
    }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const paramsPromise = params;
    const { boardId, threadId } = await paramsPromise;
    const thread = await getThread(boardId, threadId);

    if (!thread) {
        return {
            title: 'Thread Not Found - NWWW',
        };
    }

    const title = thread.title;
    const boardName = thread.board?.name || boardId;

    const ogUrl = new URL(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/og`);
    ogUrl.searchParams.set('title', title);
    ogUrl.searchParams.set('boardName', boardName);

    return {
        title: `${title} - ${boardName} | NWWW`,
        description: thread.aiAnalysis || thread.title,
        openGraph: {
            title: title,
            images: [
                {
                    url: ogUrl.toString(),
                    width: 1200,
                    height: 630,
                    alt: title,
                },
            ],
        },
        twitter: {
            card: 'summary_large_image',
            title: title,
            images: [ogUrl.toString()],
        },
    };
}

import { getServerSession } from "next-auth/next";

export default async function ThreadPage({ params }: PageProps) {
    const paramsPromise = params;

    const { boardId, threadId } = await paramsPromise;
    const thread = await getThread(boardId, threadId);
    const session = await getServerSession();
    const isAdmin = !!session;

    if (!thread) {
        notFound();
    }

    return (
        <div className={styles.container}>
            <div className={styles.nav}>
                <Link href={`/${boardId}`} className={styles.backLink}>
                    &lt; 板に戻る
                </Link>
            </div>

            <header className={styles.header}>
                <h1 className={styles.title}>{thread.title}</h1>
                <div className={styles.meta}>
                    <span>Res: {thread.postCount}</span>
                    <span>Updated: {new Date(thread.lastUpdated).toLocaleString()}</span>
                </div>
            </header>

            <SourceCard
                sourceUrl={thread.sourceUrl}
                sourceTitle={thread.sourceTitle}
                sourcePlatform={thread.sourcePlatform}
            />

            <ThreadInteractiveView
                boardId={boardId}
                thread={{
                    id: thread.id,
                    title: thread.title,
                    postCount: thread.postCount,
                    status: thread.status,
                    aiSummary: thread.aiSummary,
                    posts: thread.posts.map((p: any) => ({
                        id: p.id,
                        author: p.author,
                        content: p.content,
                        createdAt: p.createdAt,
                        userId: p.userId,
                        status: p.status
                    }))
                } as any}
                isAdmin={isAdmin}
            />
        </div>
    );
}
