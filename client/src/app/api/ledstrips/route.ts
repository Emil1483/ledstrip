import { PrismaClient } from "@prisma/client";
import {
    PrismaClientKnownRequestError,
    PrismaClientValidationError,
} from "@prisma/client/runtime/library";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
    try {
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
            { error: "An error occurred while fetching ledstrips" },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const data = await request.json();

        if (!data.id || !data.name) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

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
