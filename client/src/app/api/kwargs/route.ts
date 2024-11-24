import { currentUser } from "@clerk/nextjs/server";
import { Mode } from "@mui/icons-material";
import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
    const user = await currentUser();

    if (!user) {
        return NextResponse.json({ error: "Invalid API Key" }, { status: 401 });
    }

    const { name, iconId, kwargs, mode } = await request.json();

    if (!name) {
        return NextResponse.json(
            { error: "Missing required fields: name" },
            { status: 400 }
        );
    }

    if (iconId === undefined || iconId === null) {
        return NextResponse.json(
            { error: "Missing required fields: iconId" },
            { status: 400 }
        );
    }

    if (!kwargs) {
        return NextResponse.json(
            { error: "Missing required fields: kwargs" },
            { status: 400 }
        );
    }

    if (!mode) {
        return NextResponse.json(
            { error: "Missing required fields: mode" },
            { status: 400 }
        );
    }

    try {
        await prisma.savedKwargs.create({
            data: {
                mode: mode,
                name: name as string,
                iconId: iconId as number,
                kwargs: JSON.stringify(kwargs),
                user: {
                    connect: {
                        id: user.id,
                    },
                },
            },
        });

        const savedKwargs = await prisma.savedKwargs.findMany({
            where: {
                userId: user.id,
            },
        });

        return NextResponse.json(
            savedKwargs.map((s) => ({ ...s, kwargs: JSON.parse(s.kwargs) })),
            { status: 201 }
        );
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { error: "An error occurred while saving state" },
            { status: 500 }
        );
    }
}
