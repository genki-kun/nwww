
'use client';

import { useState } from 'react';
import { submitPost } from '@/app/actions';
import styles from './PostForm.module.css';

interface PostFormProps {
    boardId: string;
    threadId: string;
}

export default function PostForm({ boardId, threadId }: PostFormProps) {
    const [content, setContent] = useState('');
    const [author, setAuthor] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim()) return;

        setIsSubmitting(true);

        const formData = new FormData();
        formData.append('boardId', boardId);
        formData.append('threadId', threadId);
        formData.append('content', content);
        formData.append('author', author);

        // Add Honeypot if present in form
        const honeypot = (e.currentTarget as HTMLFormElement).elements.namedItem('website_url_verification') as HTMLInputElement;
        if (honeypot) {
            formData.append('website_url_verification', honeypot.value);
        }

        const result = await submitPost(formData);

        if (result.success) {
            setContent('');
            // Optional: Scroll to bottom or show toast
        } else {
            alert('書き込みに失敗しました。');
        }

        setIsSubmitting(false);
    };

    return (
        <div className={styles.container}>
            <h3 className={styles.title}>書き込み</h3>
            <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.inputGroup}>
                    <input
                        type="text"
                        className={styles.input}
                        placeholder="名前（省略可）"
                        value={author}
                        onChange={(e) => setAuthor(e.target.value)}
                        disabled={isSubmitting}
                    />
                </div>
                <textarea
                    className={styles.textarea}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="コメントを入力してください..."
                    rows={4}
                    disabled={isSubmitting}
                />

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
                        type="submit"
                        className={styles.button}
                        disabled={isSubmitting || !content.trim()}
                    >
                        {isSubmitting ? '送信中...' : '書き込む'}
                    </button>
                </div>
            </form>
        </div>
    );
}
