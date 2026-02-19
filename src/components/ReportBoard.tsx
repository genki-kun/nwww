
'use client';

import { useState } from 'react';
import { updateReportStatus, deletePostAction } from '@/app/actions';
import styles from './ReportBoard.module.css';

interface Report {
    id: string;
    reason: string;
    detail: string | null;
    status: string;
    createdAt: string;
    post: {
        id: string;
        content: string;
        author: string;
        createdAt: string;
        threadTitle: string;
        boardName: string;
        threadId: string;
        boardId: string;
    };
}

interface ReportBoardProps {
    initialReports: Report[];
}

export default function ReportBoard({ initialReports }: ReportBoardProps) {
    const [reports, setReports] = useState(initialReports);

    const handleResolve = async (reportId: string, postId: string) => {
        // Soft delete post and resolve report
        const formData = new FormData();
        formData.append('postId', postId);

        // We only delete if they confirm, but for this UI we'll have separate buttons
        // This helper specifically resolves the report
        const resolveFormData = new FormData();
        resolveFormData.append('reportId', reportId);
        resolveFormData.append('status', 'resolved');

        await updateReportStatus(resolveFormData);
        setReports(reports.filter(r => r.id !== reportId));
    };

    const handleDismiss = async (reportId: string) => {
        const formData = new FormData();
        formData.append('reportId', reportId);
        formData.append('status', 'dismissed');

        await updateReportStatus(formData);
        setReports(reports.filter(r => r.id !== reportId));
    };

    const handleDeleteAndResolve = async (reportId: string, postId: string, boardId: string, threadId: string) => {
        // 1. Delete Post
        const deleteData = new FormData();
        deleteData.append('postId', postId);
        deleteData.append('boardId', boardId);
        deleteData.append('threadId', threadId);
        await deletePostAction(deleteData);

        // 2. Resolve Report
        const resolveData = new FormData();
        resolveData.append('reportId', reportId);
        resolveData.append('status', 'resolved');
        await updateReportStatus(resolveData);

        setReports(reports.filter(r => r.id !== reportId));
    };

    if (reports.length === 0) {
        return <div className={styles.empty}>未処理の通報はありません。</div>;
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h2>通報一覧 ({reports.length})</h2>
            </div>
            <div className={styles.list}>
                {reports.map(report => (
                    <div key={report.id} className={styles.reportCard}>
                        <div className={styles.reportHeader}>
                            <span className={styles.reasonTag}>{report.reason}</span>
                            <span className={styles.reportDate}>{new Date(report.createdAt).toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' })}</span>
                        </div>

                        <div className={styles.postContext}>
                            <div className={styles.contextHeader}>
                                <strong>{report.post.boardName}</strong> / {report.post.threadTitle}
                            </div>
                            <div className={styles.postBox}>
                                <div className={styles.postMeta}>
                                    {report.post.author} - {new Date(report.post.createdAt).toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' })}
                                </div>
                                <div className={styles.postContent}>
                                    {report.post.content}
                                </div>
                            </div>
                        </div>

                        {report.detail && (
                            <div className={styles.reportDetail}>
                                <strong>詳細:</strong> {report.detail}
                            </div>
                        )}

                        <div className={styles.actions}>
                            <button
                                onClick={() => handleDeleteAndResolve(report.id, report.post.id, report.post.boardId, report.post.threadId)}
                                className={styles.deleteBtn}
                            >
                                投稿を削除して解決
                            </button>
                            <button
                                onClick={() => handleDismiss(report.id)}
                                className={styles.dismissBtn}
                            >
                                却下
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
