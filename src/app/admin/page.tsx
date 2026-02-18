import { getReports, getBoards } from '@/data/db-actions';
import ReportBoard from '@/components/ReportBoard';
import BoardStatusManager from '@/components/BoardStatusManager';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import styles from './page.module.css';

interface AdminPageProps {
    searchParams: Promise<{
        admin?: string;
    }>;
}

export default async function AdminPage({ searchParams }: AdminPageProps) {
    const { admin: adminSecret } = await searchParams;
    const SECRET = process.env.ADMIN_SECRET || 'nwww-admin-2024';

    if (adminSecret !== SECRET) {
        notFound();
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
                <BoardStatusManager initialBoards={allBoards as any} adminSecret={adminSecret || ''} />
            </section>

            <section className={styles.section}>
                <ReportBoard initialReports={reports} adminSecret={adminSecret || ''} />
            </section>
        </div>
    );
}
