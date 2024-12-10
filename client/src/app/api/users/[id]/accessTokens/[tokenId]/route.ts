import { prisma } from "@/services/prismaService";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(request: NextRequest, { params }: any) {
    const id = parseInt(params.tokenId);
    const userId = params.id;

    try {
        const user = await prisma.user.update({
            where: { id: userId },
            data: {
                accessTokens: {
                    delete: { id },
                },
            },
            include: { accessTokens: true },
        });

        return NextResponse.json(user.accessTokens, { status: 200 });
    } catch (e) {
        console.error(e);
        return NextResponse.json(
            { error: "Could not delete kwargs" },
            { status: 500 }
        );
    }
}
