import { prisma } from "@/services/prismaService";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest, { params }: any) {
    try {
        const userId = params.id;

        const data = await request.json();

        await prisma.notificationSubscription.upsert({
            where: {
                userId: userId,
            },
            update: {},
            create: {
                user: {
                    connect: {
                        id: userId,
                    },
                },
                endpoint: data.endpoint,
                p256dh: data.keys.p256dh,
                auth: data.keys.auth,
            },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error(error);

        return NextResponse.json(
            { error: "An error occurred while assigning ownership" },
            { status: 500 }
        );
    }
}
