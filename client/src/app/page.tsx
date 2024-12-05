import { AppBarComponent } from "@/components/AppBarComponent";
import { LedStripsComponent } from "@/components/LedStripsComponent";
import { LedStripProvider } from "@/contexts/LedStripsContext";
import { auth } from "@clerk/nextjs/server";
import { Box, Typography } from "@mui/material";
import { PrismaClient } from "@prisma/client";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";

const prisma = new PrismaClient();

export default async function Page() {
    const { userId } = await auth();

    const user = await prisma.user.findUnique({
        where: { id: userId! },
        include: { ledstrips: true },
    });

    if (!user) {
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
                <ErrorOutlineIcon sx={{ fontSize: 80, color: "error.main", mb: 2 }} />
                <Typography variant="h4" component="h1" gutterBottom>
                    Oops! 😢
                </Typography>
                <Typography variant="h6" component="p" color="text.secondary" gutterBottom>
                    Your account is not initialized! 🚧
                </Typography>
                <Typography variant="body1" color="text.secondary" mb={3}>
                    Please ask an admin to initialize your account and assign LED strips to you. 💡✨
                </Typography>
            </Box>
        </>
    }

    if (user.ledstrips.length == 0) {
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
                <ErrorOutlineIcon sx={{ fontSize: 80, color: "error.main", mb: 2 }} />
                <Typography variant="h4" component="h1" gutterBottom>
                    Oops! 😢
                </Typography>
                <Typography variant="h6" component="p" color="text.secondary" gutterBottom>
                    You don&apos;t have any LED strips assigned! 🚧
                </Typography>
                <Typography variant="body1" color="text.secondary" mb={3}>
                    Please ask an admin to assign LED strips to you. 💡✨
                </Typography>
            </Box>
        </>
    }

    return <LedStripProvider ledstrips={user!.ledstrips}>
        <AppBarComponent />
        <LedStripsComponent />
    </LedStripProvider>
}