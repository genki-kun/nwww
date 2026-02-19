
import styles from './page.module.css';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function Loading() {
    return (
        <div className={styles.pageContainer}>
            {/* Sticky Header Skeleton */}
            <header className={styles.stickyHeader}>
                <div className={styles.headerInner}>
                    <div className={styles.headerLeft}>
                        <Link href="/" className={styles.backButton}>
                            <ArrowLeft size={16} />
                        </Link>
                        <div className={styles.boardInfo}>
                            <div className={styles.skeleton} style={{ width: '150px', height: '24px', marginBottom: '8px', background: 'var(--border)' }}></div>
                            <div className={styles.skeleton} style={{ width: '300px', height: '14px', background: 'var(--border)' }}></div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Content Area Skeleton */}
            <main className={styles.contentArea}>
                <div className={styles.listHeader}>
                    <div className={styles.skeleton} style={{ width: '100px', height: '20px', background: 'var(--border)' }}></div>
                    <div className={styles.skeleton} style={{ width: '120px', height: '36px', borderRadius: '20px', background: 'var(--border)' }}></div>
                </div>

                <div className={styles.threadList}>
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <article key={i} className={styles.threadCard} style={{ opacity: 0.7 }}>
                            <div className={styles.cardHeader}>
                                <div className={styles.skeleton} style={{ width: '70%', height: '20px', marginBottom: '12px', background: 'var(--border)' }}></div>
                            </div>
                            <div className={styles.cardFooter}>
                                <div className={styles.skeleton} style={{ width: '40%', height: '14px', background: 'var(--border)' }}></div>
                            </div>
                        </article>
                    ))}
                </div>
            </main>
        </div>
    );
}
