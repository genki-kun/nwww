'use client';

import { useState } from 'react';
import { deleteThreadAction, restoreThreadAction } from '@/app/actions';
import styles from './ThreadManager.module.css';

interface Board {
    id: string;
    name: string;
    category: string;
}

interface Thread {
    id: string;
    title: string;
    status: string;
    postCount: number;
    createdAt: string;
    lastUpdated: string;
    isAiGenerated: boolean;
}

interface ThreadManagerProps {
    boards: Board[];
}

export default function ThreadManager({ boards }: ThreadManagerProps) {
    const [selectedBoard, setSelectedBoard] = useState('');
    const [threads, setThreads] = useState<Thread[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isUpdating, setIsUpdating] = useState<string | null>(null);

    const fetchThreads = async (boardId: string) => {
        if (!boardId) {
            setThreads([]);
            return;
        }
        setIsLoading(true);
        try {
            const res = await fetch(`/api/admin/threads?boardId=${boardId}`);
            if (res.ok) {
                const data = await res.json();
                setThreads(data);
            }
        } catch (err) {
            console.error('Failed to fetch threads:', err);
        }
        setIsLoading(false);
    };

    const handleBoardChange = (boardId: string) => {
        setSelectedBoard(boardId);
        fetchThreads(boardId);
    };

    const handleDelete = async (thread: Thread) => {
        if (!confirm(`「${thread.title}」を削除しますか？`)) return;

        setIsUpdating(thread.id);
        const formData = new FormData();
        formData.append('threadId', thread.id);
        formData.append('boardId', selectedBoard);

        const result = await deleteThreadAction(formData);
        if (result.success) {
            setThreads(threads.map(t => t.id === thread.id ? { ...t, status: 'deleted' } : t));
        } else {
            alert('削除に失敗しました');
        }
        setIsUpdating(null);
    };

    const handleRestore = async (thread: Thread) => {
        setIsUpdating(thread.id);
        const formData = new FormData();
        formData.append('threadId', thread.id);
        formData.append('boardId', selectedBoard);

        const result = await restoreThreadAction(formData);
        if (result.success) {
            setThreads(threads.map(t => t.id === thread.id ? { ...t, status: 'active' } : t));
        } else {
            alert('復元に失敗しました');
        }
        setIsUpdating(null);
    };

    const activeCount = threads.filter(t => t.status === 'active').length;
    const deletedCount = threads.filter(t => t.status === 'deleted').length;

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h2>スレッド管理</h2>
                <select
                    className={styles.select}
                    value={selectedBoard}
                    onChange={(e) => handleBoardChange(e.target.value)}
                >
                    <option value="">板を選択...</option>
                    {boards.map(board => (
                        <option key={board.id} value={board.id}>
                            {board.name}
                        </option>
                    ))}
                </select>
            </div>

            {selectedBoard && !isLoading && threads.length > 0 && (
                <div className={styles.stats}>
                    {activeCount} 件公開中 / {deletedCount} 件削除済 / 全 {threads.length} 件
                </div>
            )}

            {isLoading && <div className={styles.loading}>読み込み中...</div>}

            {!isLoading && selectedBoard && threads.length === 0 && (
                <div className={styles.empty}>スレッドがありません</div>
            )}

            <div className={styles.list}>
                {threads.map(thread => (
                    <div
                        key={thread.id}
                        className={`${styles.card} ${thread.status === 'deleted' ? styles.deleted : ''}`}
                    >
                        <div className={styles.info}>
                            <div className={styles.titleRow}>
                                <h3 className={styles.title}>{thread.title}</h3>
                                {thread.isAiGenerated && <span className={styles.aiBadge}>AI</span>}
                                <span className={`${styles.statusBadge} ${styles[thread.status]}`}>
                                    {thread.status}
                                </span>
                            </div>
                            <div className={styles.meta}>
                                <span>{thread.postCount} レス</span>
                                <span>{new Date(thread.createdAt).toLocaleDateString('ja-JP')}</span>
                            </div>
                        </div>
                        <div className={styles.actions}>
                            {thread.status === 'deleted' ? (
                                <button
                                    onClick={() => handleRestore(thread)}
                                    disabled={isUpdating === thread.id}
                                    className={styles.restoreBtn}
                                >
                                    {isUpdating === thread.id ? '処理中...' : '復元'}
                                </button>
                            ) : (
                                <button
                                    onClick={() => handleDelete(thread)}
                                    disabled={isUpdating === thread.id}
                                    className={styles.deleteBtn}
                                >
                                    {isUpdating === thread.id ? '処理中...' : '削除'}
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
