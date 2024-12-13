import { NextRequest, NextResponse } from "next/server";
import { createClerkClient } from "@clerk/backend";

import { prisma } from "@/services/prismaService";

const clerkClient = createClerkClient({
    secretKey: process.env.CLERK_SECRET_KEY,
});

export async function GET(request: NextRequest) {
    try {
        const clerkUsers = await clerkClient.users.getUserList();

        return NextResponse.json(
            await Promise.all(
                clerkUsers.data.map(async (clerkUser) => {
                    return {
                        clerkData: clerkUser,
                        ledstripData: await prisma.user.findUnique({
                            where: { id: clerkUser.id },
                            include: { ledstrips: true },
                        }),
                    };
                })
            )
        );
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { error: "An error occurred while fetching users" },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const data = await request.json();

        const clerkUser = await clerkClient.users.getUser(data.id);

        if (!clerkUser) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            );
        }

        await prisma.user.create({
            data: {
                id: clerkUser.id,
            },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { error: "An error occurred while initializing user" },
            { status: 500 }
        );
    }
}
