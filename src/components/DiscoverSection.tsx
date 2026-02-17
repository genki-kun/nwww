'use client';

import { useEffect, useState } from 'react';
import { Thread } from '@/data/mockBBS';
import ThreadCard from './ThreadCard';
import styles from './DiscoverSection.module.css';

type ThreadWithBoard = Thread & { boardId: string; boardName: string };

interface DiscoverSectionProps {
    allThreads: ThreadWithBoard[];
    excludeIds: string[];
}

// LocalStorage key for browsing history
const HISTORY_KEY = 'nwww_board_history';
const MAX_HISTORY = 20;

function getBoardHistory(): string[] {
    if (typeof window === 'undefined') return [];
    try {
        const raw = localStorage.getItem(HISTORY_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
}

export function recordBoardVisit(boardId: string) {
    if (typeof window === 'undefined') return;
    try {
        const history = getBoardHistory().filter(id => id !== boardId);
        history.unshift(boardId);
        localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, MAX_HISTORY)));
    } catch {
        // ignore
    }
}

export default function DiscoverSection({ allThreads, excludeIds }: DiscoverSectionProps) {
    const [threads, setThreads] = useState<ThreadWithBoard[]>([]);

    useEffect(() => {
        const excludeSet = new Set(excludeIds);
        const candidates = allThreads.filter(t => !excludeSet.has(t.id));
        const history = getBoardHistory();

        if (history.length === 0) {
            // No history: random shuffle
            const shuffled = [...candidates].sort(() => Math.random() - 0.5);
            setThreads(shuffled.slice(0, 12));
            return;
        }

        // Score by board affinity: more recent visits = higher score
        const scored = candidates.map(t => {
            const idx = history.indexOf(t.boardId);
            // If board is in history, score based on recency (lower index = higher score)
            const affinityScore = idx >= 0 ? (MAX_HISTORY - idx) / MAX_HISTORY : 0;
            // Add randomness to avoid always showing the same threads
            const randomFactor = Math.random() * 0.3;
            return { thread: t, score: affinityScore + randomFactor };
        });

        scored.sort((a, b) => b.score - a.score);
        setThreads(scored.slice(0, 12).map(s => s.thread));
    }, [allThreads, excludeIds]);

    return (
        <div className={styles.list}>
            {threads.map(thread => (
                <ThreadCard
                    key={thread.id}
                    thread={thread}
                    boardName={thread.boardName}
                    boardId={thread.boardId}
                    variant="list"
                />
            ))}
            {threads.length === 0 && (
                <p className={styles.empty}>スレッドがまだありません。</p>
            )}
        </div>
    );
}
