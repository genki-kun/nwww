'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, X, Search, Hash } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import BoardIcon from './BoardIcon';
import styles from './MobileHeader.module.css';

interface Board {
    id: string;
    name: string;
    category?: string;
}

interface MobileHeaderProps {
    boards: Board[];
}

export default function MobileHeader({ boards }: MobileHeaderProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    // Prevent body scroll when drawer is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    // Group boards by category
    const categories = boards.reduce((acc, board) => {
        const category = board.category || 'Other';
        if (!acc[category]) acc[category] = [];
        acc[category].push(board);
        return acc;
    }, {} as Record<string, Board[]>);

    return (
        <>
            <header className={styles.header}>
                <Link href="/" className={styles.logoLink} onClick={() => setIsOpen(false)}>
                    <Image
                        src="/nwww_logo.png?v=2"
                        alt="NWWW (β)"
                        width={80}
                        height={28}
                        className={styles.logoLight}
                        style={{ objectFit: 'contain' }}
                        priority
                        unoptimized
                    />
                    <Image
                        src="/nwww_logo_w.png"
                        alt="NWWW (β)"
                        width={80}
                        height={28}
                        className={styles.logoDark}
                        style={{ objectFit: 'contain' }}
                        priority
                        unoptimized
                    />
                </Link>
                <div className={styles.headerRight}>
                    <button
                        className={styles.menuButton}
                        onClick={() => setIsOpen(!isOpen)}
                        aria-label={isOpen ? 'メニューを閉じる' : 'メニューを開く'}
                    >
                        {isOpen ? <X size={22} /> : <Menu size={22} />}
                    </button>
                </div>
            </header>

            {/* Overlay */}
            <div
                className={`${styles.overlay} ${isOpen ? styles.overlayVisible : ''}`}
                onClick={() => setIsOpen(false)}
            />

            {/* Drawer */}
            <nav className={`${styles.drawer} ${isOpen ? styles.drawerOpen : ''}`}>
                {/* Search */}
                <form
                    action="/search"
                    method="get"
                    className={styles.searchForm}
                    onSubmit={() => setIsOpen(false)}
                >
                    <Search className={styles.searchIcon} size={16} />
                    <input
                        type="text"
                        name="q"
                        placeholder="スレッドを検索"
                        className={styles.searchInput}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </form>

                {/* Board List */}
                <div className={styles.boardList}>
                    <div className={styles.boardListHeader}>
                        <span className={styles.boardListTitle}>板一覧</span>
                        <span className={styles.boardCount}>{boards.length} Boards</span>
                    </div>
                    {Object.entries(categories).map(([category, categoryBoards]) => (
                        <div key={category} className={styles.categorySection}>
                            <h3 className={styles.categoryTitle}>
                                <BoardIcon category={category} size={16} />
                                {category}
                            </h3>
                            <ul className={styles.list}>
                                {categoryBoards.map((board) => (
                                    <li key={board.id}>
                                        <Link
                                            href={`/${board.id}`}
                                            className={styles.boardLink}
                                            onClick={() => setIsOpen(false)}
                                        >
                                            <Hash size={12} style={{ opacity: 0.4 }} />
                                            {board.name}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                {/* Drawer Footer */}
                <div className={styles.drawerFooter}>
                    <div className={styles.footerDivider} />
                    <div className={styles.legalLinks}>
                        <Link href="/tos" className={styles.legalLink} onClick={() => setIsOpen(false)}>利用規約</Link>
                        <Link href="/privacy" className={styles.legalLink} onClick={() => setIsOpen(false)}>プライバシー</Link>
                    </div>
                    <ThemeToggle />
                </div>
            </nav>
        </>
    );
}
