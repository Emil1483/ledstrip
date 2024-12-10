import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/services/prismaService";

function getRandomSequence(length: number): string {
    const characters =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";

    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        result += characters[randomIndex];
    }

    return result;
}

export async function GET(request: NextRequest, { params }: any) {
    try {
        const userId: string = params.id;
        const accessTokens = await prisma.accessToken.findMany({
            where: { userId },
        });

        return NextResponse.json(accessTokens);
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { error: "An error occurred while fetching users" },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest, { params }: any) {
    try {
        const userId: string = params.id;

        const user = await prisma.user.update({
            where: { id: userId },
            data: {
                accessTokens: {
                    create: {
                        token: getRandomSequence(12),
                    },
                },
            },
            include: { accessTokens: true },
        });

        return NextResponse.json(user.accessTokens);
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { error: "An error occurred while creating access token" },
            { status: 500 }
        );
    }
}
