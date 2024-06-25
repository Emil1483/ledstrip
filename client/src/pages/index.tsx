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


interface PageProps {
    initialSavedStates: SavedStates;
}


const Home: React.FC<PageProps> = ({ initialSavedStates }) => {
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
        <ModesComponent />
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

    return {
        props: {
            initialSavedStates: await fetchSavedStates(userId),
        }
    };
};

export default Home;
