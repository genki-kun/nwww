'use client';

import { useState, useEffect, useCallback } from 'react';
import { Moon, Sun } from 'lucide-react';
import styles from './ThemeToggle.module.css';

export default function ThemeToggle() {
    const [theme, setTheme] = useState<'light' | 'dark'>('light');
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        const current = document.documentElement.getAttribute('data-theme');
        if (current === 'dark') {
            setTheme('dark');
        } else {
            setTheme('light');
        }
        setMounted(true);
    }, []);

    const toggle = useCallback(() => {
        const next = theme === 'light' ? 'dark' : 'light';
        setTheme(next);
        document.documentElement.setAttribute('data-theme', next);
        localStorage.setItem('theme', next);
    }, [theme]);

    if (!mounted) {
        return <div className={styles.placeholder} />;
    }

    return (
        <button
            className={styles.toggleContainer}
            onClick={toggle}
            aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
            type="button"
        >
            <div className={styles.track}>
                <div className={`${styles.slider} ${theme === 'dark' ? styles.sliderDark : ''}`}>
                    {theme === 'light' ? (
                        <Sun size={14} className={styles.sliderIcon} />
                    ) : (
                        <Moon size={14} className={styles.sliderIcon} />
                    )}
                </div>
                <div className={styles.icons}>
                    <span className={`${styles.iconBase} ${theme === 'light' ? styles.iconHidden : ''}`}>
                        <Sun size={14} />
                    </span>
                    <span className={`${styles.iconBase} ${theme === 'dark' ? styles.iconHidden : ''}`}>
                        <Moon size={14} />
                    </span>
                </div>
            </div>
            <span className={styles.label}>{theme === 'light' ? 'LIGHT' : 'DARK'}</span>
        </button>
    );
}
