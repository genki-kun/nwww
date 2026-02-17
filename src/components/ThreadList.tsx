
import Link from 'next/link';
import { Thread, MOCK_BOARDS } from '@/data/mockBBS';
import styles from './ThreadList.module.css';
import { Clock, Eye, MessageCircle } from 'lucide-react';

interface ThreadListProps {
    threads: Thread[];
    boardId: string;
}

function getRelativeTime(dateString: string): string {
    const now = new Date();
    const past = new Date(dateString);
    const diffMs = now.getTime() - past.getTime();

    // Convert to seconds
    const diffSec = Math.floor(diffMs / 1000);
    if (diffSec < 60) return `${diffSec}秒前`;

    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}分前`;

    const diffHour = Math.floor(diffMin / 60);
    if (diffHour < 24) return `${diffHour}時間前`;

    const diffDay = Math.floor(diffHour / 24);
    if (diffDay < 7) return `${diffDay}日前`;

    return past.toLocaleDateString('ja-JP');
}

export default function ThreadList({ threads, boardId }: ThreadListProps) {
    // Find board name for the badge
    const boardName = MOCK_BOARDS.find(b => b.id === boardId)?.name.split(' ')[0] || '一般';

    return (
        <div className={styles.container}>
            {threads.length === 0 ? (
                <p className={styles.empty}>スレッドはまだありません。</p>
            ) : (
                <ul className={styles.list}>
                    {threads.map((thread) => (
                        <li key={thread.id} className={styles.item}>
                            <Link href={`/${boardId}/${thread.id}`} className={styles.link}>
                                {/* Row 1: Title */}
                                <h3 className={styles.title}>{thread.title}</h3>

                                {/* Row 2: Metadata */}
                                <div className={styles.metaRow}>
                                    <div className={styles.metaLeft}>
                                        <span className={styles.boardName}>{boardName}</span>

                                        {thread.tags && thread.tags.length > 0 && (
                                            <div className={styles.tags}>
                                                {thread.tags.map(tag => (
                                                    <span key={tag} className={styles.tag}>#{tag}</span>
                                                ))}
                                            </div>
                                        )}

                                        <div className={styles.separator} />

                                        <div className={styles.iconItem}>
                                            <Clock size={14} />
                                            <span>{getRelativeTime(thread.lastUpdated)}</span>
                                        </div>

                                        <div className={styles.iconItem}>
                                            <Eye size={14} />
                                            <span>{thread.views || 0}</span>
                                        </div>
                                    </div>

                                    <div className={styles.metaRight}>
                                        <MessageCircle size={16} />
                                        <span className={styles.commentCount}>{thread.postCount}</span>
                                        <span className={styles.commentLabel}>コメント</span>
                                    </div>
                                </div>
                            </Link>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
