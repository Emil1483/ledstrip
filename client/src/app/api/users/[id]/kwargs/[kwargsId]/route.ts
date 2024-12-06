import { prisma } from "@/services/prismaService";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(request: NextRequest, { params }: any) {
    const { name, iconId, kwargs, mode } = await request.json();
    const id = parseInt(params.kwargsId);

    if (!id) {
        return NextResponse.json(
            { error: "Could not parse kwargs id" },
            { status: 400 }
        );
    }

    const userId = params.id;

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
        await prisma.savedKwargs.update({
            where: {
                id: id,
            },
            data: {
                mode: mode,
                name: name as string,
                iconId: iconId as number,
                kwargs: JSON.stringify(kwargs),
            },
        });

        const savedKwargs = await prisma.savedKwargs.findMany({
            where: {
                userId: userId,
            },
        });

        return NextResponse.json(
            savedKwargs.map((s) => ({ ...s, kwargs: JSON.parse(s.kwargs) })),
            { status: 200 }
        );
    } catch (e) {
        console.error(e);
        return NextResponse.json(
            { error: "Could not update kwargs" },
            { status: 500 }
        );
    }
}

export async function DELETE(request: NextRequest, { params }: any) {
    const id = parseInt(params.kwargsId);
    const userId = params.id;

    try {
        await prisma.savedKwargs.delete({
            where: { id },
        });

        const savedKwargs = await prisma.savedKwargs.findMany({
            where: {
                userId: userId,
            },
        });

        return NextResponse.json(
            savedKwargs.map((s) => ({ ...s, kwargs: JSON.parse(s.kwargs) })),
            { status: 200 }
        );
    } catch (e) {
        console.error(e);
        return NextResponse.json(
            { error: "Could not delete kwargs" },
            { status: 500 }
        );
    }
}
