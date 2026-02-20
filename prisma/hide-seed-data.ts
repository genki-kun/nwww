
import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { MOCK_BOARDS } from '../src/data/mockBBS'

const prisma = new PrismaClient()

async function main() {
    // Collect all seed thread IDs from mock data
    const seedThreadIds = MOCK_BOARDS.flatMap(board =>
        board.threads.map(thread => thread.id)
    );

    console.log(`Found ${seedThreadIds.length} seed thread IDs to hide:`);
    seedThreadIds.forEach(id => console.log(`  - ${id}`));

    // Update all seed threads to 'hidden' status
    const result = await prisma.thread.updateMany({
        where: {
            id: { in: seedThreadIds }
        },
        data: {
            status: 'hidden'
        }
    });

    console.log(`\nUpdated ${result.count} threads to 'hidden' status.`);
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
