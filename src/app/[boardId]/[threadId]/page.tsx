import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getThread } from '@/data/db-actions';
import { SourceCard } from '@/components/SourceCard';
import ThreadInteractiveView from '@/components/ThreadInteractiveView';
import styles from './page.module.css';

interface PageProps {
    params: Promise<{
        boardId: string;
        threadId: string;
    }>;
}

export default async function ThreadPage({ params }: PageProps) {
    const { boardId, threadId } = await params;
    const thread = await getThread(boardId, threadId);

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

            <ThreadInteractiveView boardId={boardId} thread={thread} />
        </div>
    );
}
