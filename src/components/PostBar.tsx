'use client';

import { useState, useRef, useEffect } from 'react';
import { submitPost } from '@/app/actions';
import { Edit3, X, Reply, CheckCircle2, Send } from 'lucide-react';
import styles from './PostBar.module.css';

interface PostBarProps {
    boardId: string;
    threadId: string;
    replyTarget?: number | null;
    onReplyHandled?: () => void;
    isOpen: boolean;
    onClose: () => void;
    onOpen: () => void;
}

export default function PostBar({
    boardId,
    threadId,
    replyTarget,
    onReplyHandled,
    isOpen,
    onClose,
    onOpen
}: PostBarProps) {
    const [content, setContent] = useState('');
    const [author, setAuthor] = useState('');
    const [isAnonymous, setIsAnonymous] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Close on ESC
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === "Escape" && isOpen) {
                onClose();
            }
        };
        window.addEventListener("keydown", handleEscape);
        return () => window.removeEventListener("keydown", handleEscape);
    }, [isOpen, onClose]);

    // Focus textarea when expanded
    useEffect(() => {
        if (isOpen && textareaRef.current) {
            // Small delay to allow transition to start/finish
            setTimeout(() => textareaRef.current?.focus(), 100);
        }
    }, [isOpen]);

    // Handle Reply Target
    useEffect(() => {
        if (replyTarget) {
            // Ensure bar is open
            if (!isOpen) onOpen();

            // Append anchor if not already present or just append
            const anchor = `>>${replyTarget}\n`;
            setContent(prev => {
                // Determine if we need a newline before
                const prefix = prev.length > 0 && !prev.endsWith('\n') ? '\n' : '';
                return prev + prefix + anchor;
            });

            // Signal that we've handled it
            if (onReplyHandled) {
                onReplyHandled();
            }
        }
    }, [replyTarget, onReplyHandled, isOpen, onOpen]);

    // Handle Success Toast timer
    useEffect(() => {
        if (showSuccess) {
            const timer = setTimeout(() => setShowSuccess(false), 3000);
            return () => clearTimeout(timer);
        }
    }, [showSuccess]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim()) return;

        setIsSubmitting(true);

        const formData = new FormData();
        formData.append('boardId', boardId);
        formData.append('threadId', threadId);
        formData.append('content', content);

        const submitAuthor = isAnonymous ? '名無しさん@ニュ〜' : author;
        formData.append('author', submitAuthor);

        const result = await submitPost(formData);

        if (result.success) {
            setContent('');
            setAuthor('');
            onClose();
            setShowSuccess(true);
            window.location.reload();
        } else {
            alert('書き込みに失敗しました。');
        }

        setIsSubmitting(false);
    };

    return (
        <>
            {/* Success Toast */}
            {showSuccess && (
                <div className={styles.toast}>
                    <CheckCircle2 size={16} />
                    書き込みました
                </div>
            )}

            {/* Overlay */}
            <div
                className={`${styles.overlay} ${isOpen ? styles.visible : ''}`}
                onClick={onClose}
            />

            {/* Floating Action Button (Visible when collapsed) */}
            {!isOpen && (
                <button
                    onClick={onOpen}
                    className={styles.fab}
                    title="書き込む"
                >
                    <Edit3 size={24} />
                </button>
            )}

            {/* Panel */}
            <div className={`${styles.panel} ${isOpen ? styles.open : ''}`}>
                <div className={styles.header}>
                    <h3 className={styles.title}>
                        <Edit3 size={18} />
                        書き込む
                    </h3>
                    <button
                        className={styles.closeButton}
                        onClick={onClose}
                        title="閉じる"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className={styles.content}>
                    <form onSubmit={handleSubmit} id="post-form" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', flex: 1 }}>
                        {/* Author Input */}
                        <div className={styles.inputGroup}>
                            <label className={styles.label}>名前</label>
                            <div className={styles.nameInputContainer}>
                                <label className={styles.checkboxLabel}>
                                    <input
                                        type="checkbox"
                                        checked={isAnonymous}
                                        onChange={(e) => setIsAnonymous(e.target.checked)}
                                    />
                                    匿名で投稿する
                                </label>
                                {!isAnonymous && (
                                    <input
                                        type="text"
                                        placeholder="名前を入力"
                                        value={author}
                                        onChange={(e) => setAuthor(e.target.value)}
                                        className={styles.input}
                                        disabled={isSubmitting}
                                    />
                                )}
                            </div>
                        </div>

                        {/* Main Textarea */}
                        <div className={styles.inputGroup} style={{ flex: 1 }}>
                            <label className={styles.label}>
                                本文 <span style={{ color: 'var(--muted-foreground)', fontWeight: 'normal', marginLeft: '0.5rem', fontSize: '0.75rem' }}>(Markdown対応)</span>
                            </label>
                            <textarea
                                ref={textareaRef}
                                className={styles.textarea}
                                placeholder="本文を入力..."
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                disabled={isSubmitting}
                                style={{ flex: 1 }}
                            />
                            <div className={styles.helpText} style={{ marginTop: '0.5rem' }}>
                                <p style={{ fontSize: '0.8rem', color: 'var(--muted-foreground)', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
                                    <Reply size={14} />
                                    <span><code className={styles.helpCode}>&gt;&gt;1</code> のように指定すると返信できます。複数指定もできるよ</span>
                                </p>
                            </div>
                        </div>
                    </form>
                </div>

                <div className={styles.footer}>
                    <button
                        type="submit"
                        form="post-form"
                        className={styles.submitButton}
                        disabled={isSubmitting || !content.trim()}
                        style={{ marginLeft: 'auto' }}
                    >
                        <Send size={16} />
                        {isSubmitting ? '送信中...' : '書き込む'}
                    </button>
                </div>
            </div>
        </>
    );
}
