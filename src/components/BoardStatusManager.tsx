
'use client';

import { useState } from 'react';
import { toggleBoardStatusAction } from '@/app/actions';
import styles from './BoardStatusManager.module.css';

interface Board {
    id: string;
    name: string;
    status: string;
    category: string;
}

interface BoardStatusManagerProps {
    initialBoards: Board[];
}

export default function BoardStatusManager({ initialBoards }: BoardStatusManagerProps) {
    const [boards, setBoards] = useState(initialBoards);
    const [isUpdating, setIsUpdating] = useState<string | null>(null);

    const handleToggle = async (boardId: string, currentStatus: string) => {
        const nextStatus = currentStatus === 'active' ? 'locked' : 'active';

        setIsUpdating(boardId);
        const formData = new FormData();
        formData.append('boardId', boardId);
        formData.append('status', nextStatus);

        const result = await toggleBoardStatusAction(formData);

        if (result.success) {
            setBoards(boards.map(b => b.id === boardId ? { ...b, status: nextStatus } : b));
        } else {
            alert(result.message || '更新に失敗しました');
        }
        setIsUpdating(null);
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h2>板の公開管理 ({boards.filter(b => b.status === 'active').length} / {boards.length} 公開中)</h2>
            </div>
            <div className={styles.grid}>
                {boards.map(board => (
                    <div key={board.id} className={`${styles.card} ${board.status === 'locked' ? styles.locked : ''}`}>
                        <div className={styles.info}>
                            <span className={styles.category}>{board.category}</span>
                            <h3 className={styles.name}>{board.name}</h3>
                            <code className={styles.id}>{board.id}</code>
                        </div>
                        <div className={styles.actions}>
                            <button
                                onClick={() => handleToggle(board.id, board.status)}
                                disabled={isUpdating === board.id}
                                className={board.status === 'active' ? styles.lockBtn : styles.unlockBtn}
                            >
                                {isUpdating === board.id ? '更新中...' : board.status === 'active' ? '非公開にする' : '公開する'}
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
