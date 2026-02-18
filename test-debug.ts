import { checkRateLimit } from './src/lib/rate-limit';

async function test() {
    try {
        console.log("Checking rate limit for 'test-key'...");
        const result1 = await checkRateLimit("test-key", 1, 5000);
        console.log("Result 1 (expect true):", result1);

        const result2 = await checkRateLimit("test-key", 1, 5000);
        console.log("Result 2 (expect false):", result2);
    } catch (error) {
        console.error("Error during rate limit check:", error);
    }
}

test();
