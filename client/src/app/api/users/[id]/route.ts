import { prisma } from "@/services/users";
import { NextRequest, NextResponse } from "next/server";
import { createClerkClient } from "@clerk/backend";

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

        const userId: string = params.id;

        const clerkUser = await clerkClient.users.getUser(userId);
        const ledstripUser = await prisma.user.findUnique({
            where: { id: userId },
            include: { ledstrips: true },
        });

        return NextResponse.json({
            clerkData: clerkUser,
            ledstripData: ledstripUser,
        });
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { error: "An error occurred while deleting the saved state" },
            { status: 500 }
        );
    }
}
