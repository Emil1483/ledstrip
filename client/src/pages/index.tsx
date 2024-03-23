import { GetServerSideProps } from "next";
import { useState } from "react";
import Head from 'next/head';
import { getModes, setMode } from "@/services/modes";


interface HomeProps {
    modes: Modes;
}

interface ModeForm {
    [key: string]: string | number;
}

const Home: React.FC<HomeProps> = ({ modes }) => {
    const handleSubmit = async (mode: string) => {
        await setMode({
            mode: mode,
            kwargs: {},
        }).catch(console.error)
            .then(() => console.log('Mode set successfully'));
    };

    return <>
        <Head>
            <link rel="manifest" href="/manifest.json" />
            <link rel="icon" href="/favicon.ico" />
        </Head>
        <div>
            {Object.entries(modes).map(([key, mode]) => (
                <div key={key}>
                    <button onClick={() => handleSubmit(key)}>
                        {key}
                    </button>
                    {mode.on ? "On" : "Off"}
                </div>
            ))}
        </div>
    </>;
};

export const getServerSideProps: GetServerSideProps<HomeProps> = async () => {
    return {
        props: {
            modes: await getModes()
        }
    };
};

export default Home;
