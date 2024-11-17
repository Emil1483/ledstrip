import { AppBarComponent } from "@/components/AppBarComponent";
import { LedStripsComponent } from "@/components/LedStripsComponent";
import { LedStripProvider } from "@/contexts/LedStripsContext";
import { auth } from "@clerk/nextjs/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function Page() {
    const { userId } = auth();

    const user = await prisma.user.findUnique({
        where: { id: userId! },
        include: { ledstrips: true },
    });

    // TODO: handle uninitialized user

    return <LedStripProvider ledstrips={user!.ledstrips!}>
        <AppBarComponent />
        <LedStripsComponent />
    </LedStripProvider>
}