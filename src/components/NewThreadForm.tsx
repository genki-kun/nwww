'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import { createNewThread } from '@/app/actions';
import { Sparkles, X, Type, FileText, CheckCircle2, Loader2, Check } from 'lucide-react';
import styles from './NewThreadForm.module.css';

interface NewThreadFormProps {
    boardId: string;
    variant?: 'default' | 'primary';
}

// DEV BOY 承認テスト：物理ボタンでの最終合意を確認中
export default function NewThreadForm({ boardId, variant = 'default' }: NewThreadFormProps) {
    const router = useRouter();
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    // AI Mode State
    const [mode, setMode] = useState<'manual' | 'ai'>('manual');
    const [aiUrl, setAiUrl] = useState('');
    const [result, setResult] = useState<{ threadId: string; boardId: string } | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleAiSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!aiUrl) return;
        setIsSubmitting(true);
        setError(null);

        const honeypot = (e.currentTarget as HTMLFormElement).elements.namedItem('website_url_verification') as HTMLInputElement;
        if (honeypot?.value) {
            return; // Silently reject spam
        }
        try {
            const res = await fetch('/api/thread/generate', {
                method: 'POST',
                body: JSON.stringify({
                    url: aiUrl,
                    website_url_verification: honeypot?.value || ''
                }),
                headers: { 'Content-Type': 'application/json' }
            });
            const data = await res.json();
            if (data.success) {
                setResult({ threadId: data.threadId, boardId: data.boardId || boardId });
                setTimeout(() => {
                    setAiUrl('');
                    setIsOpen(false);
                    setResult(null);
                    // AI might have picked a different board
                    router.push(`/${data.boardId || boardId}/${data.threadId}`);
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
        setAiUrl('');
        setResult(null);
        setError(null);
        setIsSubmitting(false);
        setTitle('');
        setContent('');
    };

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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim() || !content.trim()) return;

        setIsSubmitting(true);

        const formData = new FormData();
        formData.append('boardId', boardId);
        formData.append('title', title);
        formData.append('content', content);

        const result = await createNewThread(formData);

        if (result.success && result.threadId) {
            setTitle('');
            setContent('');
            setIsOpen(false);
            setShowSuccess(true);

            // Wait for toast to be seen before redirecting
            setTimeout(() => {
                router.push(`/${boardId}/${result.threadId}`);
            }, 1000);
        } else {
            alert('スレッド作成に失敗しました。');
            setIsSubmitting(false);
        }
    };

    // Auto-hide toast after delay (cleanup if component unmounts or to be safe)
    useEffect(() => {
        if (showSuccess) {
            const timer = setTimeout(() => setShowSuccess(false), 3000);
            return () => clearTimeout(timer);
        }
    }, [showSuccess]);

    if (!isOpen) {
        return (
            <>
                {showSuccess && (
                    <div className={styles.toast}>
                        <CheckCircle2 size={18} />
                        スレッドを作成しました
                    </div>
                )}
                <button
                    className={variant === 'primary' ? styles.primaryTriggerButton : styles.triggerButton}
                    onClick={() => setIsOpen(true)}
                >
                    新規スレッド作成
                </button>
            </>
        );
    }

    return createPortal(
        <div className={styles.overlay} onClick={handleClose}>
            <div className={styles.modal} onClick={e => e.stopPropagation()}>
                {result ? (
                    <div className={styles.doneState}>
                        <div className={styles.doneIcon}><Check size={28} /></div>
                        <p className={styles.doneText}>スレッドを作成しました！</p>
                        <p className={styles.doneSubtext}>
                            移動中...
                        </p>
                    </div>
                ) : isSubmitting && mode === 'ai' ? (
                    <div className={styles.processingState}>
                        <Loader2 size={32} className={styles.spinner} />
                        <p className={styles.processingText}>NWWWが記事を分析し、最適な板を選定しています...</p>
                        <p className={styles.processingSub}>これには数秒かかる場合があります</p>
                    </div>
                ) : (
                    <>
                        <div className={styles.header}>
                            <div className={styles.titleArea}>
                                <h2 className={styles.title}>
                                    新規スレッド作成
                                </h2>
                            </div>
                            <button className={styles.closeButton} onClick={handleClose}>
                                <X size={24} />
                            </button>
                        </div>

                        <div className={styles.tabs}>
                            <button
                                className={`${styles.tab} ${mode === 'manual' ? styles.activeTab : ''}`}
                                onClick={() => setMode('manual')}
                            >
                                <Type size={18} />
                                <span>自分で作る</span>
                            </button>
                            <button
                                className={`${styles.tab} ${mode === 'ai' ? styles.activeTab : ''}`}
                                onClick={() => setMode('ai')}
                            >
                                <Sparkles size={18} />
                                <span>記事から自動で作る (Beta)</span>
                            </button>
                        </div>

                        {mode === 'manual' ? (
                            <form onSubmit={handleSubmit} className={styles.form}>
                                <div className={styles.field}>
                                    <label className={styles.label}>
                                        <Type size={16} />
                                        スレッドタイトル
                                    </label>
                                    <input
                                        type="text"
                                        className={styles.input}
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        disabled={isSubmitting}
                                        placeholder="タイトルを入れてね"
                                    />
                                </div>

                                <div className={styles.field}>
                                    <label className={styles.label}>
                                        <FileText size={16} />
                                        コメント
                                    </label>
                                    <textarea
                                        className={styles.textarea}
                                        value={content}
                                        onChange={(e) => setContent(e.target.value)}
                                        disabled={isSubmitting}
                                        rows={6}
                                        placeholder="コメントを書いてね"
                                    />
                                </div>

                                {/* Honeypot field for anti-spam (invisible to users) */}
                                <div style={{ display: 'none' }} aria-hidden="true">
                                    <input
                                        type="text"
                                        name="website_url_verification"
                                        autoComplete="off"
                                        tabIndex={-1}
                                    />
                                </div>

                                <div className={styles.actions}>
                                    <button
                                        type="button"
                                        className={styles.cancelButton}
                                        onClick={handleClose}
                                        disabled={isSubmitting}
                                    >
                                        キャンセル
                                    </button>
                                    <button
                                        type="submit"
                                        className={styles.submitButton}
                                        disabled={isSubmitting || !title.trim() || !content.trim()}
                                    >
                                        {isSubmitting ? '作成中...' : 'スレッドを作成'}
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <form onSubmit={handleAiSubmit} className={styles.form}>
                                <div className={styles.field}>
                                    <label className={styles.label}>
                                        <Sparkles size={16} />
                                        記事やポストのURL
                                    </label>
                                    <input
                                        type="url"
                                        className={styles.input}
                                        value={aiUrl}
                                        onChange={(e) => setAiUrl(e.target.value)}
                                        disabled={isSubmitting}
                                        placeholder="https://example.com/news/..."
                                        required
                                    />
                                    <p className={styles.helperText}>
                                        URL先の内容をNWWWが分析して、適切な板にスレ立てします。
                                    </p>
                                    {error && (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#ef4444', marginTop: '8px', fontSize: '0.85rem' }}>
                                            <CheckCircle2 size={16} style={{ color: '#ef4444' }} /> {/* Reusing CheckCircle2 for now or X */}
                                            <span>{error}</span>
                                        </div>
                                    )}
                                </div>

                                <div className={styles.actions}>
                                    <button
                                        type="button"
                                        className={styles.cancelButton}
                                        onClick={handleClose}
                                        disabled={isSubmitting}
                                    >
                                        キャンセル
                                    </button>
                                    <button
                                        type="submit"
                                        className={styles.submitButtonAi}
                                        disabled={isSubmitting || !aiUrl.trim()}
                                    >
                                        <Sparkles size={18} />
                                        {isSubmitting ? 'NWWWが生成中...' : '記事から作成'}
                                    </button>
                                </div>
                            </form>
                        )}
                    </>
                )}
            </div>
        </div>,
        document.body
    );
}

