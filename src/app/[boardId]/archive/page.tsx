
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getBoard, getArchivedThreads } from '@/data/db-actions';
import { ArrowLeft, Clock, Eye, MessageCircle, Archive } from 'lucide-react';
import styles from '../page.module.css'; // Reuse BoardPage styles

interface PageProps {
    params: Promise<{
        boardId: string;
    }>;
}

export default async function ArchivePage({ params }: PageProps) {
    const { boardId } = await params;
    const board = await getBoard(boardId);
    const threads = await getArchivedThreads(boardId);

    if (!board) {
        notFound();
    }

    return (
        <div className={styles.pageContainer}>
            {/* Sticky Header */}
            <header className={styles.stickyHeader}>
                <div className={styles.headerInner}>
                    <div className={styles.headerLeft}>
                        <Link href={`/${boardId}`} className={styles.backButton}>
                            <ArrowLeft size={16} />
                        </Link>
                        <div className={styles.boardInfo}>
                            <h2 className={styles.boardTitle}>
                                <span style={{ opacity: 0.7, marginRight: '0.5rem' }}>{board.name}</span>
                                アーカイブ
                            </h2>
                        </div>
                    </div>
                </div>
            </header>

            {/* Content Area */}
            <main className={styles.contentArea}>
                <div className={styles.listHeader}>
                    <span className={styles.categoryBadge} style={{ backgroundColor: 'var(--muted)', color: 'var(--muted-foreground)' }}>Archived</span>
                    <p style={{ fontSize: '0.8rem', color: 'var(--muted-foreground)', marginLeft: '1rem' }}>
                        アーカイブされたスレッドです
                    </p>
                </div>

                <div className={styles.threadList}>
                    {threads.length === 0 ? (
                        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--muted-foreground)' }}>
                            <Archive size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
                            <p>過去ログはありません</p>
                        </div>
                    ) : (
                        threads.map((thread) => (
                            <Link href={`/${boardId}/${thread.id}`} key={thread.id} className={styles.cardLink}>
                                <article className={styles.threadCard} style={{ opacity: 0.8 }}>
                                    <div className={styles.cardHeader}>
                                        <h3 className={styles.threadTitle}>{thread.title}</h3>
                                    </div>
                                    <div className={styles.cardFooter}>
                                        <div className={styles.metaData}>
                                            <span className={styles.timestamp}>
                                                <Clock size={14} />
                                                {new Date(thread.lastUpdated).toLocaleString('en-US', { hour12: true })}
                                            </span>
                                            <div className={styles.stats}>
                                                <span className={styles.statItem}>
                                                    <Eye size={14} />
                                                    {thread.views}
                                                </span>
                                                <span className={styles.statItem}>
                                                    <MessageCircle size={14} />
                                                    {thread.postCount}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </article>
                            </Link>
                        ))
                    )}
                </div>
            </main>
        </div>
    );
}
