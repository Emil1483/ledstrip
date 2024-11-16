import { prisma } from "@/services/users";
import { createClerkClient } from "@clerk/backend";
import { NextRequest, NextResponse } from "next/server";

const clerkClient = createClerkClient({
    secretKey: process.env.CLERK_SECRET_KEY,
});

export async function GET(request: NextRequest, { params }: any) {
    try {
        const apiKey = request.headers.get("X-API-Key");

        if (process.env.API_KEY != apiKey) {
            return NextResponse.json(
                { error: "Invalid API Key" },
                { status: 401 }
            );
        }

        const id = params.id;

        const ledstrip = await prisma.ledstrip.findUnique({
            where: { id },
            include: { users: true },
        });

        const users = await Promise.all(
            ledstrip!.users.map(async (user) => {
                return {
                    ledstripData: user,
                    clerkData: await clerkClient.users.getUser(user.id),
                };
            })
        );

        const result = { ...ledstrip, users };

        return NextResponse.json(result);
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { error: "An error occurred while deleting the saved state" },
            { status: 500 }
        );
    }
}
