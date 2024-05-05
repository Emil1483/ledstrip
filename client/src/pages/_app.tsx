import { unstable_noStore as noStore } from 'next/cache'
import Head from 'next/head';
import { AppProps } from "next/app";
import { ClerkProvider } from "@clerk/nextjs";
import { Global } from '@emotion/react';


export default function home({ Component, pageProps }: AppProps) {
    noStore();
    const hasClerkVariables = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

    return (<>
        <Global styles={"body {margin: 0;}"} />

        <Head>
            <title>Led Strip</title>
            <link rel="manifest" href="/manifest.json" />
            <link rel="icon" href="/favicon.ico" />
        </Head>
        {hasClerkVariables
            ? <ClerkProvider>
                <Component {...pageProps} />
            </ClerkProvider>
            : <p>Missing environment variables</p>}
    </>);
}