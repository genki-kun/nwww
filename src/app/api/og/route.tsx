import { ImageResponse } from 'next/og';

export const runtime = 'edge';

// Font loading helper - using a stable subsetted WOFF font for Edge efficiency
async function loadFont() {
    const url = 'https://cdn.jsdelivr.net/npm/@fontsource/noto-sans-jp@5.0.18/files/noto-sans-jp-japanese-700-normal.woff';
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Failed to load font: ${response.status}`);
    }
    return await response.arrayBuffer();
}

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);

        // Get parameters
        const title = searchParams.get('title') || 'NWWW - The New World Wide Web';
        const boardName = searchParams.get('boardName') || '';

        // Load font
        const fontData = await loadFont();

        return new ImageResponse(
            (
                <div
                    style={{
                        height: '100%',
                        width: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: '#0a0a0b',
                        backgroundImage: 'radial-gradient(circle at 25% 25%, #1a1a1c 0%, transparent 50%), radial-gradient(circle at 75% 75%, #111113 0%, transparent 50%)',
                        padding: '40px 80px',
                        fontFamily: '"Noto Sans JP"',
                    }}
                >
                    {/* Border highlight */}
                    <div
                        style={{
                            position: 'absolute',
                            top: 20,
                            left: 20,
                            right: 20,
                            bottom: 20,
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '20px',
                        }}
                    />

                    {/* Main Content */}
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            textAlign: 'center',
                            width: '100%',
                        }}
                    >
                        {/* Title - Large and Bold */}
                        <div
                            style={{
                                fontSize: '64px',
                                fontWeight: 700,
                                color: '#ffffff',
                                marginBottom: '32px',
                                lineHeight: 1.3,
                                wordBreak: 'break-word',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                            }}
                        >
                            {title}
                        </div>

                        {/* Board Name - Subtle and Styled */}
                        {boardName && (
                            <div
                                style={{
                                    fontSize: '28px',
                                    fontWeight: 700,
                                    color: 'rgba(255, 255, 255, 0.75)',
                                    backgroundColor: 'rgba(255, 255, 255, 0.08)',
                                    padding: '12px 36px',
                                    borderRadius: '50px',
                                    border: '1px solid rgba(255, 255, 255, 0.2)',
                                    display: 'flex',
                                }}
                            >
                                {boardName}
                            </div>
                        )}
                    </div>

                    {/* Logo in bottom right */}
                    <div
                        style={{
                            position: 'absolute',
                            bottom: 52,
                            right: 75,
                            display: 'flex',
                        }}
                    >
                        <img
                            src={`${new URL(request.url).origin}/nwww_logo_w.png`}
                            width="100"
                            alt="NWWW"
                        />
                    </div>
                </div>
            ),
            {
                width: 1200,
                height: 630,
                fonts: [
                    {
                        name: 'Noto Sans JP',
                        data: fontData,
                        style: 'normal',
                        weight: 700,
                    },
                ],
            }
        );
    } catch (error: any) {
        console.error('OG Generation Error:', error.message);
        return new Response(`Failed to generate the image: ${error.message}`, {
            status: 500,
        });
    }
}
