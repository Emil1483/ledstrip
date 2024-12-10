import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';
import { ClerkProvider } from "@clerk/nextjs";
import { ToastContainer } from "react-toastify";
import { MQTTProvider } from "@/contexts/MQTTContext";
import 'react-toastify/dist/ReactToastify.css';
import { Roboto } from 'next/font/google';
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import { NotificationsProvider } from '@/contexts/NotificationsContext';
import { AccessTokensProvider } from '@/contexts/AccessTokensContext';
import { ThemeProvider } from '@/theme';
import { prisma } from '@/services/prismaService';
import { auth } from '@clerk/nextjs/server';
import { Box, Typography } from '@mui/material';

const roboto = Roboto({
  weight: ['300', '400', '500', '700'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-roboto',
});

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { userId } = await auth();

  const user = await prisma.user.findUnique({
    where: { id: userId! },
    include: { accessTokens: true },
  });

  if (!user) {
    return <Box
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
  }

  return (
    <ClerkProvider
      appearance={{
        variables: {
          fontFamily: roboto.style.fontFamily,
        },
      }}
    >
      <html lang="en">
        <body className={roboto.variable} style={{ margin: 0 }}>
          <ThemeProvider>
            <AppRouterCacheProvider>
              <NotificationsProvider>
                <AccessTokensProvider initialAccessTokens={user.accessTokens}>
                  <MQTTProvider>
                    {children}
                  </MQTTProvider>
                </AccessTokensProvider>
              </NotificationsProvider>
            </AppRouterCacheProvider>
          </ThemeProvider>
          <ToastContainer />
        </body>
      </html>
    </ClerkProvider>
  )
}