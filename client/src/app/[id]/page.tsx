import React from "react";
import { ModesProvider } from "@/contexts/ModesContext";
import ModesComponent from "@/components/ModesComponent";
import { PrismaClient } from "@prisma/client";
import { AppBarComponent } from "@/components/AppBarComponent";
import { Box, Typography } from "@mui/material";
import SentimentDissatisfiedIcon from "@mui/icons-material/SentimentDissatisfied";
import { currentUser } from "@clerk/nextjs/server";

const prisma = new PrismaClient();

export default async function Page(context: any) {
    const user = await currentUser();

    const ledstrip = await prisma.ledstrip.findUnique({
        where: { id: context.params.id },
        include: {
            users: {
                where: { id: user!.id },
                include: { savedKwargs: true },
            },
        },
    });

    if (!ledstrip) {
        return <>
            <AppBarComponent />
            <Box
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "start",
                    height: "100vh",
                    bgcolor: "background.paper",
                    textAlign: "center",
                    padding: 3,
                }}
            >
                <SentimentDissatisfiedIcon sx={{ fontSize: 100, color: "error.main", mb: 2 }} />
                <Typography variant="h3" component="h1" gutterBottom>
                    404: Not Found 🚫
                </Typography>
                <Typography variant="h6" component="p" color="text.secondary" gutterBottom>
                    Looks like there&apos;s no LED strip with ID &quot;{context.params.id}&quot; 🆔
                </Typography>
                <Typography variant="body1" color="text.secondary" mb={3}>
                    Double-check the ID or reach out to an admin if you&apos;re not sure. 🔧💡
                </Typography>

            </Box>
        </>
    }

    if (ledstrip.users.length == 0) {
        return <>
            <AppBarComponent />
            <Box
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "start",
                    height: "100vh",
                    bgcolor: "background.paper",
                    textAlign: "center",
                    padding: 3,
                }}
            >
                <SentimentDissatisfiedIcon sx={{ fontSize: 100, color: "error.main", mb: 2 }} />
                <Typography variant="h3" component="h1" gutterBottom>
                    403: Forbidden 🔒
                </Typography>
                <Typography variant="h6" component="p" color="text.secondary" gutterBottom>
                    You don&apos;t have access to LED strip &quot;{ledstrip.name}&quot; 🚫
                </Typography>
                <Typography variant="body1" color="text.secondary" mb={3}>
                    Please reach out to an admin if you think this is a mistake. 🛠️🔧
                </Typography>
            </Box>
        </>
    }

    const ledstripUser = ledstrip.users[0];
    const savedKwargs = ledstripUser.savedKwargs.map((kwargs) => {
        return {
            name: kwargs.name,
            iconId: kwargs.iconId,
            kwargs: JSON.parse(kwargs.kwargs),
        };
    });

    return <ModesProvider ledstrip={ledstrip} savedKwargs={savedKwargs}>
        <Box sx={{ height: "100vh", display: "flex", flexDirection: "column" }}>
            <AppBarComponent title={ledstrip.name} />
            <ModesComponent />
        </Box>
    </ModesProvider>

}