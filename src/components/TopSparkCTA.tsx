'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, X, Check, Loader2, Link as LinkIcon, AlertCircle } from 'lucide-react';
import styles from './TopSparkCTA.module.css';

interface BoardInfo {
    id: string;
    name: string;
    category: string;
    description: string;
}

interface TopSparkCTAProps {
    boards: BoardInfo[];
}

export default function TopSparkCTA({ boards }: TopSparkCTAProps) {
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);
    const [url, setUrl] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [result, setResult] = useState<{ threadId: string; boardId: string } | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Lock body scroll when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    const handleGenerate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!url.trim()) return;

        setIsSubmitting(true);
        setError(null);

        try {
            const res = await fetch('/api/thread/generate', {
                method: 'POST',
                body: JSON.stringify({ url }),
                headers: { 'Content-Type': 'application/json' }
            });
            const data = await res.json();

            if (data.success) {
                setResult({ threadId: data.threadId, boardId: data.boardId || '' });
                setTimeout(() => {
                    const targetBoardId = data.boardId || 'news-global';
                    router.push(`/${targetBoardId}/${data.threadId}`);
                }, 1500);
            } else {
                setError(data.error || '生成に失敗しました');
                setIsSubmitting(false);
            }
        } catch (e) {
            setError('ネットワークエラーが発生しました');
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        setIsOpen(false);
        setUrl('');
        setResult(null);
        setError(null);
        setIsSubmitting(false);
    };

    const getBoardName = (id: string) => {
        const b = boards.find(b => b.id === id);
        return b ? b.name : id;
    };

    if (!isOpen) {
        return (
            <div className={styles.triggerButtonWrapper}>
                <button onClick={() => setIsOpen(true)} className={styles.triggerButton}>
                    <span>新規スレッド作成</span>
                </button>
            </div>
        );
    }

    return (
        <div className={styles.overlay} onClick={handleClose}>
            <div className={styles.modal} onClick={e => e.stopPropagation()}>
                {result ? (
                    <div className={styles.doneState}>
                        <div className={styles.doneIcon}><Check size={28} /></div>
                        <p className={styles.doneText}>スレッドを作成しました！</p>
                        <p className={styles.doneSubtext}>
                            {getBoardName(result.boardId)} へリダイレクト中...
                        </p>
                    </div>
                ) : isSubmitting ? (
                    <div className={styles.processingState}>
                        <Loader2 size={32} className={styles.spinner} />
                        <p className={styles.processingText}>AIが記事を分析し、最適な板を選定しています...</p>
                        <p className={styles.processingSub}>これには数秒かかる場合があります</p>
                    </div>
                ) : (
                    <>
                        <div className={styles.header}>
                            <div className={styles.titleArea}>
                                <h2 className={styles.title}>
                                    <Sparkles className={styles.titleIcon} size={24} />
                                    AIスレッド生成 (Beta)
                                </h2>
                                <p className={styles.description}>
                                    記事のURLを入力すると、AIが内容を分析し、最適な板を選んでスレッドを自動作成します。
                                </p>
                            </div>
                            <button className={styles.closeButton} onClick={handleClose}>
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleGenerate} className={styles.form}>
                            <div className={styles.field}>
                                <label className={styles.label}>
                                    <LinkIcon size={16} />
                                    記事のURL
                                </label>
                                <input
                                    type="url"
                                    value={url}
                                    onChange={(e) => setUrl(e.target.value)}
                                    placeholder="https://example.com/news/..."
                                    className={styles.input}
                                    autoFocus
                                    required
                                />
                                <p className={styles.helperText}>
                                    URL先の内容をNWWWが分析して、適切な板にスレ立てします。
                                </p>
                                {error && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#ef4444', marginTop: '8px', fontSize: '0.85rem' }}>
                                        <AlertCircle size={16} />
                                        <span>{error}</span>
                                    </div>
                                )}
                            </div>

                            <div className={styles.actions}>
                                <button
                                    type="button"
                                    className={styles.cancelButton}
                                    onClick={handleClose}
                                >
                                    キャンセル
                                </button>
                                <button
                                    type="submit"
                                    className={styles.submitButtonAi}
                                    disabled={!url.trim()}
                                >
                                    <Sparkles size={18} />
                                    記事から作成
                                </button>
                            </div>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
}
