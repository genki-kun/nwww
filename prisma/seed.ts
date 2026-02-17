
import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { MOCK_BOARDS } from '../src/data/mockBBS'

const prisma = new PrismaClient()

async function main() {
    console.log('Start seeding ...')

    for (const board of MOCK_BOARDS) {
        console.log(`Creating board: ${board.name}`)

        // Create Board
        await prisma.board.upsert({
            where: { id: board.id },
            update: {},
            create: {
                id: board.id,
                name: board.name,
                description: board.description,
                category: board.category,
            },
        })

        // Create Threads
        for (const thread of board.threads) {
            console.log(`  Creating thread: ${thread.title}`)

            const createdThread = await prisma.thread.upsert({
                where: { id: thread.id },
                update: {},
                create: {
                    id: thread.id,
                    title: thread.title,
                    views: thread.views,
                    postCount: thread.postCount,
                    momentum: thread.momentum,
                    status: thread.status,
                    lastUpdated: new Date(thread.lastUpdated),
                    createdAt: new Date(thread.createdAt),
                    tags: JSON.stringify(thread.tags),
                    // AI fields default to false/null
                    boardId: board.id,
                }
            })

            // Create Posts
            // Check if post exists to avoid error on re-run (or just ignore unique constraint error)
            for (const post of thread.posts) {
                const existingPost = await prisma.post.findUnique({
                    where: { id: post.id }
                })

                if (!existingPost) {
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
                    })
                }
            }
        }
    }

    console.log('Seeding finished.')
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
