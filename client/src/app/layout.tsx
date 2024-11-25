"use client";

import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';
import { ThemeProvider } from '@emotion/react';
import { ClerkProvider } from "@clerk/nextjs";
import { Global } from '@emotion/react';
import { ToastContainer } from "react-toastify";
import { MQTTProvider } from "@/contexts/MQTTContext";
import 'react-toastify/dist/ReactToastify.css';
import theme from '@/theme';
import { Roboto } from 'next/font/google';

const roboto = Roboto({
  weight: ['300', '400', '500', '700'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-roboto',
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <Global styles={"body {margin: 0;}"} />
        <body className={roboto.variable}>
          <ThemeProvider theme={theme}>
            <AppRouterCacheProvider>
              <MQTTProvider>
                {children}
              </MQTTProvider>
            </AppRouterCacheProvider>
          </ThemeProvider>
          <ToastContainer />
        </body>
      </html>
    </ClerkProvider>
  )
}