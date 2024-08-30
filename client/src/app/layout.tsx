"use client";

import { ClerkProvider } from "@clerk/nextjs";
import { Global } from '@emotion/react';
import { ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';


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
          <ToastContainer />
        </body>
      </html>
    </ClerkProvider>
  )
}




