'use client';

import { useState } from 'react';
import { triggerScheduledSpark } from '@/app/spark-actions';
import styles from './SparkAdmin.module.css';

export default function SparkAdmin() {
    const [isTriggering, setIsTriggering] = useState(false);
    const [lastRun, setLastRun] = useState<string | null>(null);

    const handleTrigger = async () => {
        setIsTriggering(true);
        // Randomly select a board from the expanded list
        const boards = [
            'news-global', 'news-domestic', 'politics-econ', 'media-sns', 'biz-startups',
            'life-work', 'life-relationships', 'life-mental', 'life-money', 'region-local',
            'culture-anime', 'culture-movies', 'culture-gaming', 'culture-music', 'culture-books', 'culture-youtube',
            'science-natural', 'humanities', 'philosophy', 'tech-future',
            'occult', 'urban-legends', 'internet-culture'
        ];
        const randomBoard = boards[Math.floor(Math.random() * boards.length)];

        await triggerScheduledSpark(randomBoard);
        setLastRun(`${new Date().toLocaleTimeString()} (${randomBoard})`);
        setIsTriggering(false);
    };

    return (
        <div className={styles.container}>
            <h4 className={styles.title}>Admin / Debug</h4>
            <div className={styles.controls}>
                <button
                    onClick={handleTrigger}
                    disabled={isTriggering}
                    className={styles.button}
                >
                    {isTriggering ? 'Running...' : 'Trigger Scheduled Spark'}
                </button>
                {lastRun && <p className={styles.status}>Last run: {lastRun}</p>}
                <p className={styles.note}>
                    *Simulates the &quot;Every 3 Hours&quot; auto-generation task.
                </p>
            </div>
        </div>
    );
}
