'use server';

import { headers } from 'next/headers';
import crypto from 'crypto';
import { addPost, createThread, updatePostStatus, updateThreadStatus } from '@/data/db-actions';
import { revalidatePath, revalidateTag } from 'next/cache';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

import { checkRateLimit } from '@/lib/rate-limit';

async function requireAdmin() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return false;
    const adminEmail = process.env.ADMIN_EMAIL;
    return adminEmail ? session.user.email === adminEmail : false;
}

function generateDailyId(ip: string): string {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const salt = process.env.DAILY_ID_SALT || "NWWW_SECRET_SALT_V1";
    const raw = `${ip}-${today}-${salt}`;

    // Create SHA-256 hash
    const hash = crypto.createHash('sha256').update(raw).digest('base64');

    // Take first 9 chars and make it URL safe-ish or just alphanumeric
    return hash.substring(0, 9);
}

export async function submitPost(formData: FormData) {
    const boardId = formData.get('boardId') as string;
    const threadId = formData.get('threadId') as string;
    const content = formData.get('content') as string;
    const author = (formData.get('author') as string) || "名無しさん@ニュ〜";
    const honeypot = formData.get('website_url_verification') as string;

    if (honeypot) {
        return { success: false, message: 'Spam detected' };
    }

    if (!boardId || !threadId || !content?.trim()) {
        return { success: false, message: 'Missing required fields' };
    }

    if (content.length > 5000) {
        return { success: false, message: '投稿は5000文字以内にしてください。' };
    }

    if (author.length > 50) {
        return { success: false, message: '名前は50文字以内にしてください。' };
    }

    // Get IP
    const headersList = await headers();
    const forwardedFor = headersList.get('x-forwarded-for');
    const ip = forwardedFor ? forwardedFor.split(',')[0] : '127.0.0.1';

    // Rate Limit Check (5 seconds per post)
    const canPost = await checkRateLimit(`post:${ip}`, 1, 5000);
    if (!canPost) {
        return { success: false, message: '投稿間隔が短すぎます。少し待ってから再度投稿してください。' };
    }

    // Generate ID
    const userId = generateDailyId(ip);

    await addPost(boardId, threadId, { author, content, userId });

    // Revalidate the thread page to show the new post
    revalidatePath(`/${boardId}/${threadId}`);
    return { success: true };
}

export async function createNewThread(formData: FormData) {
    const boardId = formData.get('boardId') as string;
    const title = formData.get('title') as string;
    const content = formData.get('content') as string;
    const honeypot = formData.get('website_url_verification') as string;

    if (honeypot) {
        return { success: false, message: 'Spam detected' };
    }

    if (!boardId || !title?.trim() || !content?.trim()) {
        return { success: false, message: 'Missing required fields' };
    }

    if (title.length > 200) {
        return { success: false, message: 'スレッドタイトルは200文字以内にしてください。' };
    }

    if (content.length > 5000) {
        return { success: false, message: '投稿は5000文字以内にしてください。' };
    }

    // Get IP for thread creator too
    const headersList = await headers();
    const forwardedFor = headersList.get('x-forwarded-for');
    const ip = forwardedFor ? forwardedFor.split(',')[0] : '127.0.0.1';

    // Rate Limit Check (60 seconds per thread)
    const canCreate = await checkRateLimit(`thread:${ip}`, 1, 60000);
    if (!canCreate) {
        return { success: false, message: '次の方のために、スレッド作成は1分間に1回までとしています。' };
    }

    const userId = generateDailyId(ip);

    const newThread = await createThread(boardId, title, content, userId);

    if (newThread) {
        revalidatePath(`/${boardId}`);
        return { success: true, threadId: newThread.id };
    }

    return { success: false, message: 'Failed to create thread' };
}

export async function reportPost(formData: FormData) {
    const postId = formData.get('postId') as string;
    const reason = formData.get('reason') as string;
    const detail = (formData.get('detail') as string) || null;

    if (!postId || !reason) {
        return { success: false, message: 'Missing required fields' };
    }

    const headersList = await headers();
    const forwardedFor = headersList.get('x-forwarded-for');
    const ip = forwardedFor ? forwardedFor.split(',')[0] : '127.0.0.1';

    // Rate Limit Check (10 seconds per report)
    const canReport = await checkRateLimit(`report:${ip}`, 1, 10000);
    if (!canReport) {
        return { success: false, message: '通報は10秒間に1回までとしています。' };
    }

    const hashedIp = crypto.createHash('sha256').update(ip).digest('hex').substring(0, 16);

    const { default: prisma } = await import('@/lib/prisma');
    await prisma.report.create({
        data: {
            postId,
            reason,
            detail,
            reporterIp: hashedIp,
        }
    });

    return { success: true, message: '通報を受け付けました' };
}

export async function deletePostAction(formData: FormData) {
    if (!await requireAdmin()) {
        return { success: false, message: 'Unauthorized' };
    }

    const postId = formData.get('postId') as string;
    const boardId = formData.get('boardId') as string;
    const threadId = formData.get('threadId') as string;

    await updatePostStatus(postId, 'deleted');
    revalidatePath(`/${boardId}/${threadId}`);
    return { success: true };
}

export async function restorePostAction(formData: FormData) {
    if (!await requireAdmin()) {
        return { success: false, message: 'Unauthorized' };
    }

    const postId = formData.get('postId') as string;
    const boardId = formData.get('boardId') as string;
    const threadId = formData.get('threadId') as string;

    await updatePostStatus(postId, 'active');
    revalidatePath(`/${boardId}/${threadId}`);
    return { success: true };
}

export async function deleteThreadAction(formData: FormData) {
    if (!await requireAdmin()) {
        return { success: false, message: 'Unauthorized' };
    }

    const threadId = formData.get('threadId') as string;
    const boardId = formData.get('boardId') as string;

    await updateThreadStatus(threadId, 'deleted');
    revalidatePath(`/${boardId}`);
    revalidatePath('/');
    revalidateTag(`board-${boardId}`, { expire: 0 });
    revalidateTag('all-threads', { expire: 0 });
    return { success: true };
}

export async function restoreThreadAction(formData: FormData) {
    if (!await requireAdmin()) {
        return { success: false, message: 'Unauthorized' };
    }

    const threadId = formData.get('threadId') as string;
    const boardId = formData.get('boardId') as string;

    await updateThreadStatus(threadId, 'active');
    revalidatePath(`/${boardId}`);
    revalidatePath('/');
    revalidateTag(`board-${boardId}`, { expire: 0 });
    revalidateTag('all-threads', { expire: 0 });
    return { success: true };
}

export async function updateReportStatus(formData: FormData) {
    if (!await requireAdmin()) {
        return { success: false, message: 'Unauthorized' };
    }

    const reportId = formData.get('reportId') as string;
    const status = formData.get('status') as 'pending' | 'resolved' | 'dismissed';

    const { updateReportStatus: dbUpdateReportStatus } = await import('@/data/db-actions');
    await dbUpdateReportStatus(reportId, status);

    revalidatePath('/admin');
    return { success: true };
}

export async function toggleBoardStatusAction(formData: FormData) {
    if (!await requireAdmin()) {
        return { success: false, message: 'Unauthorized' };
    }

    const boardId = formData.get('boardId') as string;
    const status = formData.get('status') as 'active' | 'locked';

    const { updateBoardStatus } = await import('@/data/db-actions');
    await updateBoardStatus(boardId, status);

    revalidatePath('/');
    revalidatePath('/admin');
    return { success: true };
}
