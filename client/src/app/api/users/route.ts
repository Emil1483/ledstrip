import { prisma } from "@/services/users";
import { NextRequest, NextResponse } from "next/server";
import { createClerkClient } from "@clerk/backend";

const clerkClient = createClerkClient({
    secretKey: process.env.CLERK_SECRET_KEY,
});

export async function GET(request: NextRequest) {
    try {
        const apiKey = request.headers.get("X-API-Key");

        if (process.env.API_KEY != apiKey) {
            return NextResponse.json(
                { error: "Invalid API Key" },
                { status: 401 }
            );
        }

        const clerkUsers = await clerkClient.users.getUserList();

        const x = await clerkUsers.data.map(async (user) => {
            return { ...user };
        });

        console.log(await x);

        return NextResponse.json(
            await Promise.all(
                clerkUsers.data.map(async (user) => {
                    return {
                        ...user,
                        userData: await prisma.user.findUnique({
                            where: { id: user.id },
                        }),
                    };
                })
            )
        );
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { error: "An error occurred while deleting the saved state" },
            { status: 500 }
        );
    }
}
