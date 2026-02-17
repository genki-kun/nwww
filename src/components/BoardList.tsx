
import Link from 'next/link';
import { Hash } from 'lucide-react';
import { Board } from '@/data/mockBBS';
import BoardIcon from './BoardIcon'; // Import Icon
import styles from './BoardList.module.css';

interface BoardListProps {
    boards: Board[];
}

export default function BoardList({ boards }: BoardListProps) {
    // ... (grouping logic remains)
    const categories = boards.reduce((acc, board) => {
        const category = board.category || 'Other';
        if (!acc[category]) {
            acc[category] = [];
        }
        acc[category].push(board);
        return acc;
    }, {} as Record<string, Board[]>);

    return (
        <nav className={styles.boardList}>
            {/* ... header ... */}
            <div className={styles.header}>
                <h2 className={styles.title}>板一覧</h2>
                <span className={styles.count}>{boards.length} Boards</span>
            </div>

            <div className={styles.scrollArea}>
                {Object.entries(categories).map(([category, categoryBoards]) => (
                    <div key={category} className={styles.categorySection}>
                        <h3 className={styles.categoryTitle} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <BoardIcon category={category} size={18} />
                            {category}
                        </h3>
                        <ul className={styles.list}>
                            {categoryBoards.map((board) => (
                                <li key={board.id} className={styles.item}>
                                    <Link href={`/${board.id}`} className={styles.link}>
                                        <Hash className={styles.icon} size={14} style={{ opacity: 0.5 }} />
                                        <span className={styles.boardName}>{board.name}</span>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>
        </nav>
    );
}
