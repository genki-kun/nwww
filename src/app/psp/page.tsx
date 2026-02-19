import { getApprovalState } from '@/lib/psp-state';

// Force dynamic rendering to ensure the latest state is always fetched
export const dynamic = 'force-dynamic';

export default async function PSPPage() {
    const state = getApprovalState();
    const isWaiting = state.status === 'WAITING';

    return (
        <html>
            <head>
                <title>COMMAND CENTER</title>
                {/* Auto-refresh every 5 seconds if not waiting for user action to keep connection alive and checking for tasks */}
                {!isWaiting && <meta httpEquiv="refresh" content="5" />}
                <style dangerouslySetInnerHTML={{
                    __html: `
          body {
            background-color: #000;
            color: #0f0;
            font-family: monospace;
            margin: 0;
            padding: 10px;
            font-size: 16px;
            /* Retro scanline effect */
            background-image: linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06));
            background-size: 100% 2px, 3px 100%;
          }
          .container {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 250px; /* Approximate PSP viewable height */
            border: 2px solid #0f0;
            padding: 10px;
          }
          h1 {
            font-size: 20px;
            margin-bottom: 10px;
            text-shadow: 0 0 5px #0f0;
          }
          .status {
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 20px;
            animation: blink 1s infinite;
          }
          .message {
            margin-bottom: 20px;
            text-align: center;
            white-space: pre-wrap;
            max-width: 400px;
          }
          .btn {
            background-color: #0f0;
            color: #000;
            border: none;
            padding: 10px 20px;
            font-size: 18px;
            font-family: monospace;
            font-weight: bold;
            cursor: pointer;
            text-decoration: none;
            display: inline-block;
          }
          .btn:active {
            background-color: #fff;
          }
          @keyframes blink {
            0% { opacity: 1; }
            50% { opacity: 0; }
            100% { opacity: 1; }
          }
        `}} />
            </head>
            <body>
                <div className="container">
                    <h1>DEV COMMANDER</h1>

                    <div className="status">
                        {state.status}
                    </div>

                    {isWaiting ? (
                        <>
                            <div className="message">
                                {state.message || 'AUTHORIZATION REQUIRED'}
                            </div>
                            <form action="/api/psp/approve" method="POST">
                                <input type="hidden" name="action" value="Approve" />
                                <button type="submit" className="btn">
                                    [ O ] APPROVE
                                </button>
                            </form>
                        </>
                    ) : (
                        <div className="message">
                            SYSTEM STANDBY...
                            <br />
                            WAITING FOR NEW TASKS
                        </div>
                    )}
                </div>
            </body>
        </html>
    );
}
