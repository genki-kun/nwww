import { NextRequest, NextResponse } from 'next/server';
import { setApprovalState, getApprovalState } from '@/lib/psp-state';

export async function GET() {
    const state = getApprovalState();
    return NextResponse.json(state);
}

export async function POST(req: NextRequest) {
    try {
        // Check if it's a form submission (from PSP) or JSON (from script)
        const contentType = req.headers.get('content-type') || '';

        let action = 'Approve'; // Default action

        if (contentType.includes('application/json')) {
            const body = await req.json();
            if (body.action) action = body.action;
        } else if (contentType.includes('application/x-www-form-urlencoded')) {
            const formData = await req.formData();
            action = formData.get('action') as string || 'Approve';
        }

        if (action === 'Approve') {
            setApprovalState('APPROVED', 'Approved by User via Terminal');
        } else if (action === 'Reject') {
            setApprovalState('REJECTED', 'Rejected by User via Terminal');
        } else if (action === 'Reset') {
            setApprovalState('IDLE', '');
        }

        // specific redirect for PSP browser to refresh the page
        if (contentType.includes('application/x-www-form-urlencoded')) {
            return NextResponse.redirect(new URL('/psp', req.url));
        }

        return NextResponse.json({ success: true, state: getApprovalState() });
    } catch (error) {
        return NextResponse.json({ success: false, error: 'Failed to process request' }, { status: 500 });
    }
}
