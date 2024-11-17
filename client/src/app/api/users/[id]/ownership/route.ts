import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function POST(request: NextRequest, { params }: any) {
    try {
        const apiKey = request.headers.get("X-API-Key");

        if (process.env.API_KEY != apiKey) {
            return NextResponse.json(
                { error: "Invalid API Key" },
                { status: 401 }
            );
        }

        const userId = params.id;

        const data = await request.json();

        const result = await prisma.user.update({
            where: { id: userId },
            data: {
                ledstrips: {
                    connect: { id: data.ledstripId },
                },
            },
        });

        return NextResponse.json(result);
    } catch (error) {
        console.error(error);

        return NextResponse.json(
            { error: "An error occurred while assigning ownership" },
            { status: 500 }
        );
    }
}

export async function DELETE(request: NextRequest, { params }: any) {
    try {
        const apiKey = request.headers.get("X-API-Key");

        if (process.env.API_KEY != apiKey) {
            return NextResponse.json(
                { error: "Invalid API Key" },
                { status: 401 }
            );
        }

        const userId = params.id;
        const data = await request.json();

        const result = await prisma.user.update({
            where: { id: userId },
            data: {
                ledstrips: {
                    disconnect: { id: data.ledstripId },
                },
            },
        });

        return NextResponse.json(result);
    } catch (error) {
        console.error(error);

        return NextResponse.json(
            { error: "An error occurred while removing ownership" },
            { status: 500 }
        );
    }
}
