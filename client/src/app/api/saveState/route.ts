import { ensureUser, saveState } from "@/services/users";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    try {
        const { userId } = auth();

        if (!userId) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const { mode, state } = await request.json();

        await ensureUser(userId);
        const savedStates = await saveState(userId, mode, state);

        return NextResponse.json(savedStates);
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            {
                error: "An error occurred while saving the state",
            },
            {
                status: 500,
            }
        );
    }
}
