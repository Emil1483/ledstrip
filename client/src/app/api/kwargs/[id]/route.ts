import { currentUser } from "@clerk/nextjs/server";
import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function DELETE(request: NextRequest, { params }: any) {
    const user = await currentUser();

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const id = parseInt(params.id);

    try {
        await prisma.savedKwargs.delete({
            where: { id },
        });

        const savedKwargs = await prisma.savedKwargs.findMany({
            where: {
                userId: user.id,
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
