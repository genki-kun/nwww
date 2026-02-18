import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import crypto from 'crypto';

export async function POST(req: Request) {
    try {
        const { postId, reason, detail } = await req.json();

        if (!postId || !reason) {
            return NextResponse.json({ error: 'postId and reason are required' }, { status: 400 });
        }

        // Simple IP hashing for identifying reporters without storing raw IP (privacy)
        const ip = req.headers.get('x-forwarded-for') || 'unknown';
        const reporterIp = crypto.createHash('sha256').update(ip).digest('hex');

        // Check if this IP has reported this post recently (simple rate limiting)
        const recentReport = await prisma.report.findFirst({
            where: {
                postId,
                reporterIp,
                createdAt: {
                    gt: new Date(Date.now() - 1000 * 60 * 60) // within 1 hour
                }
            }
        });

        if (recentReport) {
            return NextResponse.json({ error: '既に通報済みです' }, { status: 429 });
        }

        const report = await prisma.report.create({
            data: {
                postId,
                reason,
                detail,
                reporterIp,
            }
        });

        return NextResponse.json({ success: true, reportId: report.id });
    } catch (error: any) {
        console.error('Report API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
