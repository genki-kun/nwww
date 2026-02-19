import { Metadata } from 'next';
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

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
    const { q } = await searchParams;
    const query = q?.trim() || '';

    if (!query) {
        return {
            title: '検索',
        };
    }

    return {
        title: `検索: ${query}`,
        description: `NWWW での「${query}」の検索結果。`,
    };
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
                        <Search size={64} strokeWidth={1} style={{ opacity: 0.2 }} />
                        <div className={styles.emptyText}>
                            <p>「<strong>{query}</strong>」に関するスレッドは見つかりませんでした。</p>
                            <div className={styles.recommendations}>
                                <p>他のキーワードで試してみるか、トップページで話題をチェックしてみてください。</p>
                                <ul className={styles.recommendationList}>
                                    <li><Link href="/" className={styles.recommendationItem}>トップへ戻る</Link></li>
                                    <li><Link href="/search?q=ニュース" className={styles.recommendationItem}>ニュース</Link></li>
                                    <li><Link href="/search?q=雑談" className={styles.recommendationItem}>雑談</Link></li>
                                </ul>
                            </div>
                        </div>
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
                                        {new Date(thread.lastUpdated).toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' })}
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
