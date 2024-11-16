import { prisma } from "@/services/users";
import {
    PrismaClientKnownRequestError,
    PrismaClientValidationError,
} from "@prisma/client/runtime/library";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    try {
        const apiKey = request.headers.get("X-API-Key");

        if (process.env.API_KEY != apiKey) {
            return NextResponse.json(
                { error: "Invalid API Key" },
                { status: 401 }
            );
        }

        return NextResponse.json(
            await prisma.ledstrip.findMany({
                include: {
                    users: true,
                },
            })
        );
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { error: "An error occurred while deleting the saved state" },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const apiKey = request.headers.get("X-API-Key");

        if (process.env.API_KEY != apiKey) {
            return NextResponse.json(
                { error: "Invalid API Key" },
                { status: 401 }
            );
        }

        const data = await request.json();

        const result = await prisma.ledstrip.create({
            data: {
                id: data.id,
                name: data.name,
            },
        });

        return NextResponse.json(result);
    } catch (error) {
        console.error(error);

        if (error instanceof PrismaClientKnownRequestError) {
            if (error.code == "P2002") {
                return NextResponse.json(
                    { error: "ID already exists" },
                    { status: 400 }
                );
            }
        }

        if (error instanceof PrismaClientValidationError) {
            const lines = error.message.split("\n");
            return NextResponse.json(
                { error: "Invalid input: " + lines[lines.length - 1] },
                { status: 400 }
            );
        }
    }
}
