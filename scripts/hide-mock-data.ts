
import { PrismaClient } from '@prisma/client';
import { MOCK_BOARDS } from '../src/data/mockBBS';

const prisma = new PrismaClient();

async function main() {
    console.log('🔒 Hiding mock data...');

    const mockThreadIds: string[] = [];

    // Collect all mock thread IDs
    MOCK_BOARDS.forEach(board => {
        board.threads.forEach(thread => {
            mockThreadIds.push(thread.id);
        });
    });

    console.log(`Found ${mockThreadIds.length} mock threads to hide.`);

    // Update status to 'deleted'
    // using updateMany for efficiency
    const result = await prisma.thread.updateMany({
        where: {
            id: {
                in: mockThreadIds
            }
        },
        data: {
            status: 'deleted'
        }
    });

    console.log(`✅ Successfully updated ${result.count} threads to status 'deleted'.`);
    console.log('To restore them, run a script to set status back to "active".');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
