import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function fetchSavedStates(userId: string): Promise<SavedStates> {
    const user = await prisma.user.findUnique({
        where: {
            id: userId,
        },
    });

    if (!user) {
        return {};
    }

    return JSON.parse(user.savedStates) as SavedStates;
}

export async function ensureUser(userId: string) {
    const user = await prisma.user.findUnique({
        where: {
            id: userId,
        },
    });

    if (!user) {
        await prisma.user.create({
            data: {
                id: userId,
                savedStates: JSON.stringify({}),
            },
        });
    }
}

export async function saveState(
    userId: string,
    mode: string,
    state: ModeState
) {
    const savedStates = await fetchSavedStates(userId);

    if (mode in savedStates) {
        savedStates[mode].push(state);
    } else {
        savedStates[mode] = [state];
    }

    await prisma.user.update({
        where: {
            id: userId,
        },
        data: {
            savedStates: JSON.stringify(savedStates),
        },
    });

    return savedStates;
}

export async function deleteState(userId: string, mode: string, index: number) {
    const savedStates = await fetchSavedStates(userId);

    if (mode in savedStates) {
        savedStates[mode].splice(index, 1);
    }

    await prisma.user.update({
        where: {
            id: userId,
        },
        data: {
            savedStates: JSON.stringify(savedStates),
        },
    });

    return savedStates;
}
