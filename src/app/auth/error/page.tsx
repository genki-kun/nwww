'use client';

import Link from 'next/link';

export default function ErrorPage() {
    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            textAlign: 'center',
            backgroundColor: '#030303',
            color: '#fff',
            fontFamily: 'sans-serif'
        }}>
            <h1 style={{ color: '#ef4444' }}>認証エラー</h1>
            <p>管理者権限がないか、ログインに失敗しました。</p>
            <Link href="/auth/signin" style={{ color: '#fff', marginTop: '1rem' }}>再試行する</Link>
        </div>
    );
}
