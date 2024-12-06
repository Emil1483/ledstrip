import { NextRequest, NextResponse } from "next/server";
import { createClerkClient } from "@clerk/backend";

import { prisma } from "@/services/prismaService";

const clerkClient = createClerkClient({
    secretKey: process.env.CLERK_SECRET_KEY,
});

export async function GET(request: NextRequest, { params }: any) {
    try {
        const userId: string = params.id;

        const clerkUser = await clerkClient.users.getUser(userId);
        const ledstripUser = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                ledstrips: true,
                savedKwargs: true,
            },
        });

        return NextResponse.json({
            clerkData: clerkUser,
            ledstripData: ledstripUser,
        });
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { error: "An error occurred while fetching user" },
            { status: 500 }
        );
    }
}
