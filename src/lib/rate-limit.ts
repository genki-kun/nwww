import prisma from './prisma';

/**
 * Check and record a rate limit hit in the database.
 * 
 * @param key Unique key for the rate limit (e.g. "post:hashed_ip")
 * @param limit Maximum number of hits allowed in the window
 * @param windowMs Time window in milliseconds
 * @returns {Promise<boolean>} True if allowed, false if rate limited
 */
export async function checkRateLimit(key: string, limit: number, windowMs: number): Promise<boolean> {
    const now = new Date();
    const windowStart = new Date(now.getTime() - windowMs);

    // Find the record
    const record = await prisma.rateLimit.findUnique({
        where: { key }
    });

    if (!record) {
        // First hit
        await prisma.rateLimit.create({
            data: {
                key,
                count: 1,
                lastHit: now
            }
        });
        return true;
    }

    // Check if window has expired since last hit
    if (record.lastHit < windowStart) {
        // Reset window
        await prisma.rateLimit.update({
            where: { key },
            data: {
                count: 1,
                lastHit: now
            }
        });
        return true;
    }

    // Still in window, check count
    if (record.count >= limit) {
        return false;
    }

    // Increment count
    await prisma.rateLimit.update({
        where: { key },
        data: {
            count: record.count + 1,
            lastHit: now
        }
    });

    return true;
}
