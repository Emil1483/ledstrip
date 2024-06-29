import { GetServerSideProps } from "next";
import { useEffect } from "react";
import { AppBar, Toolbar, Box } from '@mui/material';
import React from "react";
import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { getAuth } from "@clerk/nextjs/server";
import { fetchSavedStates } from "@/services/users";
import { useSavedStatesStore } from "@/hooks/useSavedStatesStore";
import { ModesProvider } from "@/contexts/ModesContext";
import ModesComponent from "@/components/ModesComponent";
import assert from "assert";


interface PageProps {
    initialSavedStates: SavedStates;
    mqttUrl: string;
}


const Home: React.FC<PageProps> = ({ initialSavedStates, mqttUrl }) => {
    const setSavedStates = useSavedStatesStore((state) => state.setSavedStates);

    useEffect(() => {
        setSavedStates(initialSavedStates);
    }, [setSavedStates, initialSavedStates]);


    return <ModesProvider>
        <AppBar sx={{ backgroundColor: "#1835F2" }}>
            < Toolbar >
                <Box sx={{ flexGrow: 1 }}></Box>
                <SignedOut>
                    <SignInButton />
                </SignedOut>
                <SignedIn>
                    <UserButton />
                </SignedIn>
            </ Toolbar>
        </AppBar >
        <ModesComponent mqttUrl={mqttUrl} />
    </ModesProvider>

};

export const getServerSideProps: GetServerSideProps<PageProps> = async (context) => {
    const { userId } = getAuth(context.req);

    if (!userId) {
        return {
            redirect: {
                destination: "/sign-in",
                permanent: false,
            },
        };
    }

    const mqttUrl = process.env.MQTT_URL;

    assert(mqttUrl, `environment variable MQTT_URL not set`)

    return {
        props: {
            initialSavedStates: await fetchSavedStates(userId),
            mqttUrl: mqttUrl,
        }
    };
};

export default Home;
