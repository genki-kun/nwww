'use client';

import { Suspense } from 'react';
import { Tweet } from 'react-tweet';
import { ErrorBoundary } from './ErrorBoundary';

interface SourceCardProps {
    sourceUrl: string | null;
    sourceTitle: string | null;
    sourcePlatform: string | null;
}

export function SourceCard({ sourceUrl, sourceTitle, sourcePlatform }: SourceCardProps) {
    if (!sourceUrl) return null;

    // Twitter Embed logic
    if (sourcePlatform === 'twitter' || isTwitterUrl(sourceUrl)) {
        const tweetId = extractTweetId(sourceUrl);
        if (tweetId) {
            return (
                <div className="my-6 flex justify-center w-full" data-theme="dark">
                    <div className="w-full max-w-[500px]">
                        <ErrorBoundary fallback={<LinkCard url={sourceUrl} title={sourceTitle} />}>
                            <Suspense fallback={<div style={{ textAlign: 'center', padding: '1rem', color: 'var(--color-text-muted)' }}>Loading tweet...</div>}>
                                <Tweet id={tweetId} />
                            </Suspense>
                        </ErrorBoundary>
                    </div>
                </div>
            );
        }
    }

    return <LinkCard url={sourceUrl} title={sourceTitle} />;
}

// Reusable fallback link card
function LinkCard({ url, title }: { url: string; title: string | null }) {
    let hostname = '';
    try {
        hostname = new URL(url).hostname;
    } catch {
        hostname = 'External Link';
    }

    return (
        <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
                display: 'block',
                margin: '1.5rem 0',
                padding: '1rem 1.5rem',
                border: '1px solid var(--color-border)',
                borderRadius: '0',
                background: 'var(--color-bg-surface)',
                textDecoration: 'none',
                color: 'inherit',
                transition: 'background 0.2s',
            }}
        >
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '0.5rem', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Source • {hostname}
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', margin: 0, lineHeight: 1.4 }}>
                {title || url}
            </h3>
            <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '0.25rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {url}
            </div>
        </a>
    );
}

function isTwitterUrl(url: string) {
    return url.includes('twitter.com') || url.includes('x.com');
}

function extractTweetId(url: string) {
    const match = url.match(/(?:twitter|x)\.com\/[\w_]+\/status\/(\d+)/);
    return match ? match[1] : null;
}
