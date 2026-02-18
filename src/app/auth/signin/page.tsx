'use client';

import { signIn } from 'next-auth/react';
import { useSearchParams } from 'next-auth/react'; // Actually it's from next/navigation for query params
import { useSearchParams as useNextSearchParams } from 'next/navigation';
import Image from 'next/image';
import { Github } from 'lucide-react';
import styles from './page.module.css';

export default function SiginInPage() {
    const searchParams = useNextSearchParams();
    const callbackUrl = searchParams.get('callbackUrl') || '/admin';
    const error = searchParams.get('error');

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <div className={styles.logoSection}>
                    <Image
                        src="/nwww_logo_w.png"
                        alt="NWWW"
                        width={180}
                        height={60}
                        style={{ objectFit: 'contain' }}
                    />
                    <p className={styles.subtitle}>ADMINISTRATION LOGIN</p>
                </div>

                {error && (
                    <div className={styles.error}>
                        認証に失敗しました。正しいアカウントでログインしてください。
                    </div>
                )}

                <div className={styles.info}>
                    このページは管理者専用です。GitHub アカウントで本人確認を行ってください。
                </div>

                <button
                    onClick={() => signIn('github', { callbackUrl })}
                    className={styles.button}
                >
                    <Github size={20} />
                    <span>GitHub でログイン</span>
                </button>

                <div className={styles.footer}>
                    <a href="/" className={styles.backLink}>トップページに戻る</a>
                </div>
            </div>
        </div>
    );
}
