'use server';

import { headers } from 'next/headers';
import crypto from 'crypto';
import { addPost, createThread } from '@/data/db-actions';
import { revalidatePath } from 'next/cache';

function generateDailyId(ip: string): string {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const salt = "NWWW_SECRET_SALT_V1"; // In real app, env var
    const raw = `${ip}-${today}-${salt}`;

    // Create SHA-256 hash
    const hash = crypto.createHash('sha256').update(raw).digest('base64');

    // Take first 9 chars and make it URL safe-ish or just alphanumeric
    // Base64 can have +, /, =. Let's just take substring.
    return hash.substring(0, 9);
}

export async function submitPost(formData: FormData) {
    const boardId = formData.get('boardId') as string;
    const threadId = formData.get('threadId') as string;
    const content = formData.get('content') as string;
    const author = (formData.get('author') as string) || "名無しさん@ニュ〜";

    if (!boardId || !threadId || !content) {
        return { success: false, message: 'Missing required fields' };
    }

    // Get IP
    const headersList = await headers();
    const forwardedFor = headersList.get('x-forwarded-for');
    const ip = forwardedFor ? forwardedFor.split(',')[0] : '127.0.0.1';

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

    if (!boardId || !title || !content) {
        return { success: false, message: 'Missing required fields' };
    }

    // Get IP for thread creator too
    const headersList = await headers();
    const forwardedFor = headersList.get('x-forwarded-for');
    const ip = forwardedFor ? forwardedFor.split(',')[0] : '127.0.0.1';
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
