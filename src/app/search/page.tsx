import Link from 'next/link';
import { searchThreads } from '@/data/db-actions';
import { ArrowLeft, Search, Clock, Eye, MessageCircle } from 'lucide-react';
import styles from './page.module.css';

interface PageProps {
    searchParams: Promise<{
        q?: string;
        board?: string;
    }>;
}

export default async function SearchPage({ searchParams }: PageProps) {
    const { q, board } = await searchParams;
    const query = q?.trim() || '';
    const results = query ? await searchThreads(query, board) : [];

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <Link href="/" className={styles.backButton}>
                    <ArrowLeft size={16} />
                </Link>
                <h1 className={styles.title}>
                    <Search size={18} />
                    検索結果
                </h1>
            </header>

            {/* Search Form */}
            <form action="/search" method="get" className={styles.searchForm}>
                <div className={styles.searchInputWrapper}>
                    <Search size={16} className={styles.searchIcon} />
                    <input
                        type="text"
                        name="q"
                        defaultValue={query}
                        placeholder="スレッドタイトル・本文を検索..."
                        className={styles.searchInput}
                        autoFocus
                    />
                </div>
                <button type="submit" className={styles.searchButton}>検索</button>
            </form>

            {/* Results */}
            <main className={styles.results}>
                {query && (
                    <p className={styles.resultCount}>
                        「<strong>{query}</strong>」の検索結果: {results.length}件
                    </p>
                )}

                {query && results.length === 0 && (
                    <div className={styles.empty}>
                        <Search size={48} style={{ opacity: 0.3 }} />
                        <p>該当するスレッドが見つかりませんでした</p>
                    </div>
                )}

                <div className={styles.threadList}>
                    {results.map((thread: any) => (
                        <Link
                            href={`/${thread.boardId}/${thread.id}`}
                            key={thread.id}
                            className={styles.cardLink}
                        >
                            <article className={styles.threadCard}>
                                <div className={styles.cardHeader}>
                                    <span className={styles.boardBadge}>{thread.boardName}</span>
                                    <h3 className={styles.threadTitle}>{thread.title}</h3>
                                </div>
                                <div className={styles.cardFooter}>
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
                            </article>
                        </Link>
                    ))}
                </div>
            </main>
        </div>
    );
}
