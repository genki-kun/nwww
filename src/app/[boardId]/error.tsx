'use client';

export default function BoardError({
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
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>板の読み込みに失敗しました</h2>
            <p style={{ color: 'var(--muted-foreground)', fontSize: '0.9rem' }}>
                しばらく待ってからもう一度お試しください。
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
                リロード
            </button>
        </div>
    );
}
