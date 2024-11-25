import { PrismaClient } from "@prisma/client";
import { createClerkClient } from "@clerk/backend";

const prisma = new PrismaClient();

const clerkClient = createClerkClient({
    secretKey: process.env.CLERK_SECRET_KEY,
});

async function main() {
    const ledstripId = process.env.LEDSTRIP_ID;
    if (!ledstripId) {
        throw new Error("LEDSTRIP_ID not set");
    }

    const ledstripName = process.env.LEDSTRIP_NAME;
    if (!ledstripName) {
        throw new Error("LEDSTRIP_NAME not set");
    }

    const userId = process.env.TEST_USER_ID;
    if (!userId) {
        throw new Error("TEST_USER_ID not set");
    }

    const clerkUser = await clerkClient.users.getUser(userId);

    if (!clerkUser) {
        throw new Error("User not found");
    }

    await prisma.user.create({
        data: {
            id: clerkUser.id,
            ledstrips: {
                create: {
                    id: ledstripId,
                    name: ledstripName,
                },
            },
        },
    });
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
