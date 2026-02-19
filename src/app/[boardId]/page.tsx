
import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { getBoard } from '@/data/db-actions';
import NewThreadForm from '@/components/NewThreadForm';
import { ArrowLeft, Eye, MessageCircle, Clock, Archive, ChevronLeft, ChevronRight } from 'lucide-react';
import styles from './page.module.css';
import Loading from './loading';

// Force dynamic rendering to ensure UI updates aren't stuck in stale static generation,
// while relying on unstable_cache for data performance.
export const dynamic = 'force-dynamic';

interface PageProps {
    params: Promise<{
        boardId: string;
    }>;
    searchParams: Promise<{
        page?: string;
    }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { boardId } = await params;
    const board = await getBoard(boardId);

    if (!board) {
        return {
            title: '板が見つかりません',
        };
    }

    return {
        title: board.name,
        description: `${board.name}板の公式スレッド一覧。${board.description}`,
    };
}



export default function BoardPageWrapper({ params, searchParams }: PageProps) {
    return (
        <Suspense fallback={<Loading />}>
            <BoardContent params={params} searchParams={searchParams} />
        </Suspense>
    );
}

async function BoardContent({ params, searchParams }: PageProps) {
    const paramsPromise = params;
    const searchParamsPromise = searchParams;

    const { boardId } = await paramsPromise;
    const { page: pageStr } = await searchParamsPromise;

    const page = Math.max(1, parseInt(pageStr || '1', 10));
    // Use smaller sleep to simulate network if needed for testing, but remove for prod

    const board = await getBoard(boardId, page);

    if (!board) {
        notFound();
    }

    return (
        <div className={styles.pageContainer}>
            {/* Sticky Header */}
            <header className={styles.stickyHeader}>
                <div className={styles.headerInner}>
                    <div className={styles.headerLeft}>
                        <Link href="/" className={styles.backButton}>
                            <ArrowLeft size={16} />
                        </Link>
                        <div className={styles.boardInfo}>
                            <h2 className={styles.boardTitle}>{board.name}</h2>
                            <p className={styles.boardDesc}>{board.description}</p>
                        </div>
                    </div>
                </div>
            </header>

            {/* Content Area */}
            <main className={styles.contentArea}>
                {/* Sub Header: Category & New Thread Button */}
                <div className={styles.listHeader}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <span className={styles.categoryBadge}>{board.category}</span>
                        <Link href={`/${boardId}/archive`} style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                            fontSize: '0.8rem',
                            color: 'var(--muted-foreground)',
                            textDecoration: 'none'
                        }}>
                            <Archive size={14} />
                            アーカイブ
                        </Link>
                    </div>
                    <NewThreadForm boardId={boardId} />
                </div>

                <div className={styles.threadList}>
                    {board.threads.length === 0 ? (
                        <div className={styles.emptyState}>
                            <div className={styles.emptyContent}>
                                <div className={styles.emptyIconWrapper}>
                                    <MessageCircle size={48} strokeWidth={1.5} />
                                </div>
                                <h3 className={styles.emptyTitle}>まだスレッドがないよ</h3>
                                <p className={styles.emptyDescription}>
                                    スレ立てしてね。<br />
                                    気になる記事やXの投稿のURLからも自動で作れるよ。
                                </p>
                                <div className={styles.emptyAction}>
                                    <NewThreadForm boardId={boardId} variant="primary" />
                                </div>
                            </div>
                        </div>
                    ) : (
                        board.threads.map((thread) => (
                            <Link href={`/${boardId}/${thread.id}`} key={thread.id} className={styles.cardLink}>
                                <article className={styles.threadCard}>
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

                {/* Pagination */}
                {board.totalPages > 1 && (
                    <nav className={styles.pagination}>
                        {page > 1 ? (
                            <Link href={`/${boardId}?page=${page - 1}`} className={styles.pageButton}>
                                <ChevronLeft size={16} />
                                前へ
                            </Link>
                        ) : (
                            <span className={`${styles.pageButton} ${styles.pageButtonDisabled}`}>
                                <ChevronLeft size={16} />
                                前へ
                            </span>
                        )}

                        <span className={styles.pageInfo}>
                            {board.currentPage} / {board.totalPages}
                        </span>

                        {page < board.totalPages ? (
                            <Link href={`/${boardId}?page=${page + 1}`} className={styles.pageButton}>
                                次へ
                                <ChevronRight size={16} />
                            </Link>
                        ) : (
                            <span className={`${styles.pageButton} ${styles.pageButtonDisabled}`}>
                                次へ
                                <ChevronRight size={16} />
                            </span>
                        )}
                    </nav>
                )}
            </main>
        </div>
    );
}
