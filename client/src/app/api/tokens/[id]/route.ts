import { prisma } from "@/services/prismaService";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest, { params }: any) {
    const tokenId = params.id;

    try {
        const token = await prisma.accessToken.findFirstOrThrow({
            where: { token: tokenId },
        });

        return NextResponse.json(token);
    } catch (e) {
        console.error(e);
        return NextResponse.json(
            { error: `Could not get token ${tokenId}` },
            { status: 500 }
        );
    }
}
