"use client";

import { ClerkProvider } from "@clerk/nextjs";
import { Global } from '@emotion/react';
import { Metadata } from 'next'

// export const metadata: Metadata = {
//   title: 'Led Strip',
//   icons: '/favicon.ico',
//   manifest: '/manifest.json',
// }

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <Global styles={"body {margin: 0;}"} />
        <body>
          {children}
        </body>
      </html>
    </ClerkProvider>
  )
}




