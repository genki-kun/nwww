
import type { Metadata } from "next";
import Link from 'next/link';
import Image from 'next/image';
import { Search } from 'lucide-react';
import { Noto_Sans_JP } from 'next/font/google';
import { getBoards } from '@/data/mockBBS';
import BoardList from '@/components/BoardList';
import AIInsights from '@/components/AIInsights';
import SparkAdmin from '@/components/SparkAdmin';
import ThemeToggle from '@/components/ThemeToggle';
import MobileHeader from '@/components/MobileHeader';
import "./globals.css";
import styles from './layout.module.css';

const notoSansJP = Noto_Sans_JP({
  subsets: ['latin'],
  weight: ['400', '500', '700', '900'],
  variable: '--font-noto',
  display: 'swap',
});

export const metadata: Metadata = {
  title: "NWWW - The New World Wide Web (Beta)",
  description: "AI時代の現代版BBS",
};

// Inline script to prevent flash of wrong theme
const themeScript = `
  (function() {
    var t = localStorage.getItem('theme');
    if (t === 'dark' || (!t && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.setAttribute('data-theme', 'dark');
    }
  })();
`;

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const boards = await getBoards();

  return (
    <html lang="ja" className={notoSansJP.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <MobileHeader boards={boards} />
        <div className={styles.container}>
          <main className={styles.main}>
            <aside className={styles.sidebar}>
              <div className={styles.sidebarLogo}>
                <Link href="/" className={styles.logo}>
                  <Image
                    src="/nwww_logo.png?v=2"
                    alt="NWWW (β)"
                    width={112}
                    height={37}
                    className={styles.logoLight}
                    style={{ objectFit: 'contain', width: 'auto', height: 'auto', maxWidth: '100%' }}
                    priority
                    unoptimized
                  />
                  <Image
                    src="/nwww_logo_w.png"
                    alt="NWWW (β)"
                    width={112}
                    height={37}
                    className={styles.logoDark}
                    style={{ objectFit: 'contain', width: 'auto', height: 'auto', maxWidth: '100%' }}
                    priority
                    unoptimized
                  />
                </Link>
              </div>
              <div className={styles.sidebarNav}>
                <BoardList boards={boards} />
              </div>
              <div className={styles.sidebarFooter}>
                <ThemeToggle />
              </div>
            </aside>
            <div className={styles.content}>
              <div className={styles.topBar}>
                <form action="/search" method="get" className={styles.searchWrapper}>
                  <Search className={styles.searchIcon} size={18} />
                  <input
                    type="text"
                    name="q"
                    placeholder="スレッドを検索"
                    className={styles.searchInput}
                  />
                </form>
              </div>
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  );
}
