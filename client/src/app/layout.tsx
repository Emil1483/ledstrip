"use client";

import { ClerkProvider } from "@clerk/nextjs";
import { Global } from '@emotion/react';
import { ToastContainer } from "react-toastify";
import { MQTTProvider } from "@/contexts/MQTTContext";
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
          <MQTTProvider>
            {children}
          </MQTTProvider>
          <ToastContainer />
        </body>
      </html>
    </ClerkProvider>
  )
}




