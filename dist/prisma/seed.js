"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const client_1 = require("@prisma/client");
const mockBBS_1 = require("../src/data/mockBBS");
console.log('DATABASE_URL:', process.env.DATABASE_URL);
const prisma = new client_1.PrismaClient({
    datasources: {
        db: {
            url: process.env.DATABASE_URL,
        },
    },
});
async function main() {
    console.log('Start seeding ...');
    for (const board of mockBBS_1.MOCK_BOARDS) {
        console.log(`Creating board: ${board.name}`);
        // Create Board
        try {
            await prisma.board.upsert({
                where: { id: board.id },
                update: {},
                create: {
                    id: board.id,
                    name: board.name,
                    description: board.description,
                    category: board.category,
                },
            });
        }
        catch (e) {
            console.error(`Error creating board ${board.name}:`, e);
            throw e;
        }
        // Create Threads
        for (const thread of board.threads) {
            console.log(`  Creating thread: ${thread.title}`);
            try {
                const createdThread = await prisma.thread.upsert({
                    where: { id: thread.id },
                    update: {},
                    create: {
                        id: thread.id,
                        title: thread.title,
                        views: thread.views,
                        postCount: thread.postCount, // Using stored count
                        momentum: thread.momentum,
                        status: thread.status,
                        lastUpdated: new Date(thread.lastUpdated),
                        createdAt: new Date(thread.createdAt),
                        tags: JSON.stringify(thread.tags),
                        // AI fields default to false/null
                        boardId: board.id,
                    }
                });
                // Create Posts
                for (const post of thread.posts) {
                    await prisma.post.create({
                        data: {
                            id: post.id,
                            content: post.content,
                            author: post.author,
                            userId: post.userId,
                            likes: post.likes,
                            createdAt: new Date(post.createdAt),
                            threadId: createdThread.id,
                        }
                    });
                }
            }
            catch (e) {
                console.error(`Error creating thread ${thread.title}:`, e);
                // Optional: continue instead of throw?
                // throw e
            }
        }
    }
    console.log('Seeding finished.');
}
main()
    .then(async () => {
    await prisma.$disconnect();
})
    .catch(async (e) => {
    console.error("SEEDING FAILED:", e);
    await prisma.$disconnect();
    process.exit(1);
});
