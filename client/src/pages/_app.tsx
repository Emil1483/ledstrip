import Head from 'next/head';
import { AppProps } from "next/app";
import { ClerkProvider } from "@clerk/nextjs";
import { Global } from '@emotion/react';


export default function home({ Component, pageProps }: AppProps) {
    return (<>
        <Global styles={"body {margin: 0;}"} />

        <Head>
            <title>Led Strip</title>
            <link rel="manifest" href="/manifest.json" />
            <link rel="icon" href="/favicon.ico" />
        </Head>

        <ClerkProvider>
            <Component {...pageProps} />
        </ClerkProvider>
    </>);
}