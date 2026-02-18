'use client';

import { Suspense } from 'react';
import { signIn } from 'next-auth/react';
import { useSearchParams as useNextSearchParams } from 'next/navigation';
import { useState } from 'react';
import { Github } from 'lucide-react';
import styles from './page.module.css';

function SignInContent() {
    const searchParams = useNextSearchParams();
    const callbackUrl = searchParams.get('callbackUrl') || '/admin';
    const [isLoading, setIsLoading] = useState(false);

    const handleSignIn = async () => {
        setIsLoading(true);
        await signIn('github', { callbackUrl });
    };

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <div className={styles.header}>
                    <div className={styles.logo}>
                        NWWW
                    </div>
                    <h1 className={styles.title}>管理画面ログイン</h1>
                    <p className={styles.description}>
                        管理者権限を持つGitHubアカウントで<br />
                        ログインしてください。
                    </p>
                </div>

                <div className={styles.content}>
                    <button
                        onClick={handleSignIn}
                        disabled={isLoading}
                        className={styles.githubButton}
                    >
                        {isLoading ? (
                            <div className={styles.spinner} />
                        ) : (
                            <Github size={20} />
                        )}
                        GitHub でログイン
                    </button>

                    <p className={styles.note}>
                        ※許可されたユーザー以外はアクセスできません
                    </p>
                </div>
            </div>
        </div>
    );
}

export default function SiginInPage() {
    return (
        <Suspense fallback={<div className={styles.container}><div className={styles.spinner} /></div>}>
            <SignInContent />
        </Suspense>
    );
}
