
import type { Metadata } from "next";
import Link from 'next/link';
import Image from 'next/image';
import { Search } from 'lucide-react';
import { Noto_Sans_JP } from 'next/font/google';
import { getBoards } from '@/data/db-actions';
import BoardList from '@/components/BoardList';
import AIInsights from '@/components/AIInsights';
import ThemeToggle from '@/components/ThemeToggle';
import MobileHeader from '@/components/MobileHeader';
import Providers from '@/components/Providers';
import GoogleAnalytics from '@/components/GoogleAnalytics';
import "./globals.css";
import styles from './layout.module.css';

const notoSansJP = Noto_Sans_JP({
  subsets: ['latin'],
  weight: ['400', '500', '700', '900'],
  variable: '--font-noto',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    template: '%s | NWWW ｜ ニュ〜',
    default: 'NWWW ｜ ニュ〜',
  },
  description: "もっと話したいことをここで、新しいみんなの匿名掲示板",
  metadataBase: new URL(process.env.NEXTAUTH_URL || 'http://localhost:3000'),
  openGraph: {
    title: 'NWWW ｜ ニュ〜',
    description: "もっと話したいことをここで、新しいみんなの匿名掲示板",
    siteName: 'NWWW',
    locale: 'ja_JP',
    type: 'website',
    images: [{ url: '/ogp.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'NWWW ｜ ニュ〜',
    description: "もっと話したいことをここで、新しいみんなの匿名掲示板",
    images: ['/ogp.png'],
  },
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
        <GoogleAnalytics />
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
                <div className={styles.legalLinks}>
                  <Link href="/tos" className={styles.legalLink}>利用規約</Link>
                  <Link href="/privacy" className={styles.legalLink}>プライバシー</Link>
                </div>
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
              <Providers>{children}</Providers>
            </div>
          </main>
        </div>
      </body>
    </html>
  );
}
