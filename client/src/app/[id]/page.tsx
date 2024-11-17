import React from "react";
import { ModesProvider } from "@/contexts/ModesContext";
import ModesComponent from "@/components/ModesComponent";
import { PrismaClient } from "@prisma/client";
import { AppBarComponent } from "@/components/AppBarComponent";
import { Box } from "@mui/material";

const prisma = new PrismaClient();

export default async function Page(context: any) {
    const ledstrip = await prisma.ledstrip.findUnique({
        where: { id: context.params.id },
    });

    if (!ledstrip) {
        return <div>404</div>;
    }

    return <ModesProvider ledstrip={ledstrip}>
        <Box sx={{ height: "100vh", display: "flex", flexDirection: "column" }}>
            <AppBarComponent title={ledstrip.name} />
            <ModesComponent />
        </Box>
    </ModesProvider>

}