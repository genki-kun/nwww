'use client';

import styles from './AdminAnalytics.module.css';

interface DailyStat {
    date: string;
    count: number;
}

interface ThreadStat {
    id: string;
    title: string;
    momentum: number;
    views: number;
    board: { name: string };
}

interface AnalyticsProps {
    totalThreads: number;
    totalPosts: number;
    totalActiveThreads: number;
    dailyChartData: DailyStat[];
    aiRatio: {
        threads: number;
        posts: number;
    };
    topMoverThreads: ThreadStat[];
}

export default function AdminAnalytics({ stats }: { stats: AnalyticsProps }) {
    const maxDaily = Math.max(...stats.dailyChartData.map(d => d.count), 10);

    return (
        <div className={styles.container}>
            <h2 className={styles.title}>Community Pulse</h2>

            {/* 1. Overview Cards */}
            <div className={styles.grid}>
                <div className={styles.card}>
                    <h3>Total Posts</h3>
                    <p className={styles.bigNumber}>{stats.totalPosts.toLocaleString()}</p>
                    <div className={styles.subtext}>
                        AI Generated: {stats.aiRatio.posts} ({Math.round((stats.aiRatio.posts / stats.totalPosts) * 100)}%)
                    </div>
                </div>
                <div className={styles.card}>
                    <h3>Active Threads</h3>
                    <p className={styles.bigNumber}>{stats.totalActiveThreads.toLocaleString()}</p>
                    <div className={styles.subtext}>
                        /{stats.totalThreads.toLocaleString()} Total
                    </div>
                </div>
                <div className={styles.card}>
                    <h3>Est. DAU</h3>
                    <p className={styles.bigNumber}>-</p>
                    <div className={styles.subtext}>See Vercel Analytics</div>
                </div>
            </div>

            {/* 2. Charts & Rankings */}
            <div className={styles.chartsRow}>
                {/* 7-Day Post Volume (CSS Bar Chart) */}
                <div className={`${styles.card} ${styles.chartCard}`}>
                    <h3>Post Volume (Last 7 Days)</h3>
                    <div className={styles.barChart}>
                        {stats.dailyChartData.map((d) => {
                            const height = Math.max((d.count / maxDaily) * 100, 4); // Min 4% height
                            return (
                                <div key={d.date} className={styles.barWrapper}>
                                    <div className={styles.barValue}>{d.count}</div>
                                    <div
                                        className={styles.bar}
                                        style={{ height: `${height}%` }}
                                    />
                                    <div className={styles.barLabel}>{d.date.slice(5)}</div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Momentum Ranking */}
                <div className={`${styles.card} ${styles.rankingCard}`}>
                    <h3>🔥 Top Momentum Threads</h3>
                    <ul className={styles.rankingList}>
                        {stats.topMoverThreads.map((t, index) => (
                            <li key={t.id} className={styles.rankingItem}>
                                <span className={styles.rank}>#{index + 1}</span>
                                <div className={styles.info}>
                                    <div className={styles.threadTitle}>{t.title}</div>
                                    <div className={styles.meta}>
                                        {t.board.name} | ⚡{t.momentum} | 👀{t.views}
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}
