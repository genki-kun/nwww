'use client';

import { useState, useEffect } from 'react';
import { Thread } from '@/data/mockBBS';
import PostBar from './PostBar';
import ThreadSummarizer from './ThreadSummarizer';
import PostContent from './PostContent';
import ReportButton from './ReportButton';
import { recordBoardVisit } from './DiscoverSection';
import styles from '@/app/[boardId]/[threadId]/page.module.css'; // Importing from page module to reuse styles
import { MessageSquareReply } from 'lucide-react';

interface ThreadInteractiveViewProps {
    boardId: string;
    thread: Thread;
}

export default function ThreadInteractiveView({ boardId, thread }: ThreadInteractiveViewProps) {
    const [replyTarget, setReplyTarget] = useState<number | null>(null);
    const [isWriteBarExpanded, setIsWriteBarExpanded] = useState(false);

    // Record board visit for recommendation engine
    useEffect(() => {
        recordBoardVisit(boardId);
    }, [boardId]);

    const handleReply = (index: number) => {
        setReplyTarget(index);
        setIsWriteBarExpanded(true);
    };

    return (
        <>
            <div
                className={styles.postList}
                style={{
                    transition: 'margin-right 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                    marginRight: isWriteBarExpanded ? 'var(--panel-width, 0px)' : '0',
                }}
            >
                {/* We use a specific variable for panel width that effectively is 0 on mobile/tablet and 400px on xl */}
                <style jsx global>{`
                    @media (min-width: 1280px) {
                        :root {
                            --panel-width: 400px;
                        }
                    }
                    @media (max-width: 1279px) {
                        :root {
                            --panel-width: 0px;
                        }
                    }
                `}</style>

                <ThreadSummarizer threadId={thread.id} initialSummary={thread.aiSummary} postCount={thread.postCount} />
                {thread.posts.length === 0 ? (
                    <p className={styles.empty}>まだ投稿がありません。</p>
                ) : (
                    thread.posts.map((post, index) => (
                        <article key={post.id} className={styles.post} id={`post-${index + 1}`}>
                            <div className={styles.postHeader}>
                                <span className={styles.postIndex}>{index + 1}</span>
                                <span className={styles.author}>{post.author}</span>
                                <span className={styles.date} suppressHydrationWarning>{new Date(post.createdAt).toLocaleString()}</span>
                                <span className={styles.id}>ID: {post.userId || '???'}</span>

                                {/* Reply Button */}
                                {thread.postCount < 1000 && thread.status !== 'filled' && (
                                    <button
                                        onClick={() => handleReply(index + 1)}
                                        className="ml-auto text-muted-foreground hover:text-foreground flex items-center gap-1 text-xs transition-colors"
                                        title={`>>${index + 1} に返信`}
                                        style={{
                                            marginLeft: 'auto',
                                            background: 'transparent',
                                            border: 'none',
                                            cursor: 'pointer',
                                            color: 'var(--muted-foreground)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.25rem',
                                            fontSize: '0.8rem',
                                            padding: '0.25rem 0.5rem',
                                            borderRadius: '0.25rem'
                                        }}
                                    >
                                        <MessageSquareReply size={14} />
                                        <span>返信</span>
                                    </button>
                                )}
                                <ReportButton postId={post.id} />
                            </div>
                            <div className={styles.postContent}>
                                <PostContent content={post.content} posts={thread.posts} />
                            </div>
                        </article>
                    ))
                )}
            </div>

            {thread.postCount >= 1000 || thread.status === 'filled' ? (
                <div style={{
                    position: 'fixed',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    padding: '1rem',
                    backgroundColor: 'var(--card)',
                    borderTop: '1px solid rgba(var(--border-rgb), 0.1)',
                    textAlign: 'center',
                    color: 'var(--muted-foreground)',
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    zIndex: 50,
                    boxShadow: '0 -4px 6px -1px rgba(0, 0, 0, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem'
                }}>
                    <MessageSquareReply size={16} />
                    このスレッドは1000を超えました。新しいスレッドを立ててください。
                </div>
            ) : (
                <PostBar
                    boardId={boardId}
                    threadId={thread.id}
                    replyTarget={replyTarget}
                    onReplyHandled={() => setReplyTarget(null)}
                    isOpen={isWriteBarExpanded}
                    onClose={() => setIsWriteBarExpanded(false)}
                    onOpen={() => setIsWriteBarExpanded(true)}
                />
            )}
        </>
    );
}
