'use client';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '50vh',
            gap: '1rem',
            padding: '2rem',
        }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>エラーが発生しました</h2>
            <p style={{ color: 'var(--muted-foreground)', fontSize: '0.9rem' }}>
                ページの読み込み中に問題が発生しました。
            </p>
            <button
                onClick={reset}
                style={{
                    padding: '0.5rem 1.5rem',
                    borderRadius: '6px',
                    border: '1px solid var(--border)',
                    background: 'var(--background)',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                }}
            >
                もう一度試す
            </button>
        </div>
    );
}
