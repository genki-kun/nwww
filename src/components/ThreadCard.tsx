import Link from 'next/link';
import { Thread } from '@/data/mockBBS';
import styles from './ThreadCard.module.css';
import { getRelativeTime } from '@/utils/time';
import { Clock } from 'lucide-react';

export interface ThreadSummary {
    id: string;
    title: string;
    postCount: number;
    lastUpdated: string;
    createdAt?: string;
    status?: string;
    aiSummary?: string | null;
}

interface ThreadCardProps {
    thread: ThreadSummary;
    boardName: string;
    boardId: string;
    variant?: 'horizontal' | 'grid' | 'list';
}

export default function ThreadCard({ thread, boardName, boardId, variant = 'grid' }: ThreadCardProps) {
    const isGrid = variant === 'grid';

    // ─── List Variant ───
    if (variant === 'list') {
        return (
            <Link
                href={`/${boardId}/${thread.id}`}
                className={styles.listItem}
            >
                {/* Title */}
                <h4 className={styles.listTitle}>
                    {thread.title}
                </h4>
                {/* Meta Row */}
                <div className={styles.listMeta}>
                    <div className={styles.listMetaLeft}>
                        <span className={styles.listBoardName}>{boardName}</span>
                        <span className={styles.listSeparator}>•</span>
                        <div className={styles.listTimeWrapper}>
                            <Clock size={12} />
                            <span>{getRelativeTime(thread.lastUpdated)}</span>
                        </div>
                    </div>
                    <div className={styles.listCommentStats}>
                        <span className={styles.listCommentCount}>{thread.postCount}</span>
                        <span className={styles.listCommentLabel}>コメント</span>
                    </div>
                </div>
            </Link>
        );
    }

    // ─── Card Variants (horizontal / grid) ───
    return (
        <Link
            href={`/${boardId}/${thread.id}`}
            className={`${styles.card} ${variant === 'horizontal' ? styles.horizontal : styles.grid}`}
        >
            {/* Meta Info */}
            <div className={styles.meta}>
                <span className={styles.boardName}>{boardName}</span>
                <span className={styles.separator}>•</span>
                <div className={styles.timeWrapper}>
                    <Clock size={12} />
                    <span>{getRelativeTime(thread.lastUpdated)}</span>
                </div>
            </div>

            {/* Title */}
            <h3 className={`${styles.title} ${styles.lineClamp2} ${isGrid ? styles.titleGrid : ''} ${variant === 'horizontal' ? styles.horizontalTitle : ''}`}>
                {thread.title}
            </h3>


            {/* Stats - Comment count emphasis for grid cards */}
            {isGrid && (
                <div className={styles.stats}>
                    <span className={styles.commentCount}>{thread.postCount}</span>
                    <span className={styles.commentLabel}>コメント</span>
                </div>
            )}
        </Link>
    );
}
