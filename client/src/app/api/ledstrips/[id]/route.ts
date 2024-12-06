import { prisma } from "@/services/prismaService";
import { createClerkClient } from "@clerk/backend";

import { NextRequest, NextResponse } from "next/server";

const clerkClient = createClerkClient({
    secretKey: process.env.CLERK_SECRET_KEY,
});

export async function GET(request: NextRequest, { params }: any) {
    try {
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
            { error: "An error occurred while fetching ledstrip" },
            { status: 500 }
        );
    }
}

export async function DELETE(request: NextRequest, { params }: any) {
    try {
        const id = params.id;

        const result = await prisma.ledstrip.delete({
            where: { id },
        });

        return NextResponse.json(result);
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { error: "An error occurred while deleting ledstrip" },
            { status: 500 }
        );
    }
}

export async function PATCH(request: NextRequest, { params }: any) {
    try {
        const id = params.id;

        const data = await request.json();

        if (!data.name || !data.id) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        const result = await prisma.ledstrip.update({
            where: { id },
            data: { id: data.id, name: data.name },
        });

        return NextResponse.json(result);
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { error: "An error occurred while updating ledstrip" },
            { status: 500 }
        );
    }
}
