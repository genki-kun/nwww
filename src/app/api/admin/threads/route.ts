import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { getThreadsForAdmin } from '@/data/db-actions';

export async function GET(request: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email || session.user.email !== process.env.ADMIN_EMAIL) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const boardId = request.nextUrl.searchParams.get('boardId');
    if (!boardId) {
        return NextResponse.json({ error: 'boardId is required' }, { status: 400 });
    }

    const threads = await getThreadsForAdmin(boardId);
    return NextResponse.json(threads);
}
