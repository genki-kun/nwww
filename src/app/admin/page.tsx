import { getReports, getBoards } from '@/data/db-actions';
import ReportBoard from '@/components/ReportBoard';
import BoardStatusManager from '@/components/BoardStatusManager';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import styles from './page.module.css';

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function AdminPage() {
    const session = await getServerSession(authOptions);

    // Middleware already protects this path, but double-check for safety
    if (!session) {
        redirect("/api/auth/signin");
    }

    const reports = await getReports();
    const allBoards = await getBoards(true); // Include locked boards for admin

    return (
        <div className={styles.container}>
            <div className={styles.nav}>
                <Link href="/" className={styles.backLink}>← 掲示板に戻る</Link>
            </div>

            <header className={styles.header}>
                <div className={styles.adminBadge}>ADMIN DASHBOARD</div>
                <h1>通報・モデレーション管理</h1>
            </header>

            <section className={styles.section}>
                <BoardStatusManager initialBoards={allBoards as any} />
            </section>

            <section className={styles.section}>
                <ReportBoard initialReports={reports} />
            </section>
        </div>
    );
}
