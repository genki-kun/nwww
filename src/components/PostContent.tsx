'use client';

import React, { useState } from 'react';
import { Post } from '@/data/mockBBS';
import styles from './PostContent.module.css';

interface PostContentProps {
    content: string;
    posts: Post[];
    isDeleted?: boolean;
}

export default function PostContent({ content, posts, isDeleted }: PostContentProps) {
    if (isDeleted) {
        return <div className={styles.deletedText}>あぼーん</div>;
    }

    // Split content by anchor pattern (>>NUMBER)
    // Regex matches: (>>\d+)
    const parts = content.split(/(>>\d+)/g);

    return (
        <div className={styles.content}>
            {parts.map((part, index) => {
                const match = part.match(/^>>(\d+)$/);
                if (match) {
                    const targetIndex = parseInt(match[1], 10) - 1;
                    const targetPost = posts[targetIndex];

                    if (targetPost) {
                        return (
                            <AnchorLink
                                key={index}
                                anchorText={part}
                                targetPost={targetPost}
                                targetIndex={targetIndex + 1}
                            />
                        );
                    } else {
                        // Target doesn't exist (e.g. >>999)
                        return <span key={index} className={styles.brokenAnchor}>{part}</span>;
                    }
                }

                // Render regular text, handling newlines
                return (
                    <span key={index}>
                        {part.split('\n').map((line, i) => (
                            <React.Fragment key={i}>
                                {i > 0 && <br />}
                                {line}
                            </React.Fragment>
                        ))}
                    </span>
                );
            })}
        </div>
    );
}

function AnchorLink({ anchorText, targetPost, targetIndex }: { anchorText: string, targetPost: Post, targetIndex: number }) {
    const [showPreview, setShowPreview] = useState(false);

    const handleClick = (e: React.MouseEvent) => {
        e.preventDefault();
        const element = document.getElementById(`post-${targetIndex}`);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            // Highlight effect could be added here
            element.classList.add(styles.highlightTarget);
            setTimeout(() => element.classList.remove(styles.highlightTarget), 2000);
        }
    };

    return (
        <span
            className={styles.anchorWrapper}
            onMouseEnter={() => setShowPreview(true)}
            onMouseLeave={() => setShowPreview(false)}
        >
            <a href={`#post-${targetIndex}`} onClick={handleClick} className={styles.anchorLink}>
                {anchorText}
            </a>

            {showPreview && (
                <div className={styles.previewCard}>
                    <div className={styles.previewHeader}>
                        <span className={styles.previewNumber}>{targetIndex}</span>
                        <span className={styles.previewName}>{targetPost.author}</span>
                        <span className={styles.previewDate}>
                            {new Date(targetPost.createdAt).toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' })}
                        </span>
                    </div>
                    <div className={styles.previewBody}>
                        {targetPost.content.length > 100
                            ? targetPost.content.slice(0, 100) + '...'
                            : targetPost.content}
                    </div>
                </div>
            )}
        </span>
    );
}
