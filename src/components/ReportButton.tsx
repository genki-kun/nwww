'use client';

import { useState } from 'react';
import { Flag } from 'lucide-react';
import { reportPost } from '@/app/actions';
import styles from './ReportButton.module.css';

interface ReportButtonProps {
    postId: string;
}

const REPORT_REASONS = [
    { value: 'spam', label: 'スパム・宣伝' },
    { value: 'abuse', label: '誹謗中傷・暴言' },
    { value: 'illegal', label: '違法な内容' },
    { value: 'other', label: 'その他' },
];

export default function ReportButton({ postId }: ReportButtonProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [done, setDone] = useState(false);

    const handleReport = async (reason: string) => {
        setIsSubmitting(true);
        const formData = new FormData();
        formData.append('postId', postId);
        formData.append('reason', reason);
        await reportPost(formData);
        setIsSubmitting(false);
        setDone(true);
        setTimeout(() => {
            setIsOpen(false);
            setDone(false);
        }, 2000);
    };

    return (
        <div className={styles.container}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={styles.trigger}
                title="通報"
            >
                <Flag size={12} />
            </button>

            {isOpen && (
                <div className={styles.dropdown}>
                    {done ? (
                        <div className={styles.done}>✓ 通報しました</div>
                    ) : (
                        <>
                            <div className={styles.dropdownTitle}>通報理由を選択</div>
                            {REPORT_REASONS.map(r => (
                                <button
                                    key={r.value}
                                    onClick={() => handleReport(r.value)}
                                    disabled={isSubmitting}
                                    className={styles.reasonButton}
                                >
                                    {r.label}
                                </button>
                            ))}
                        </>
                    )}
                </div>
            )}
        </div>
    );
}
