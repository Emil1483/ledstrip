import { prisma } from "@/services/prismaService";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest, { params }: any) {
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
                        id: params.id,
                    },
                },
            },
        });

        const savedKwargs = await prisma.savedKwargs.findMany({
            where: {
                userId: params.id,
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
