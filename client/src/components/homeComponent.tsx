'use client'

import React, { useEffect } from "react";
import { AppBar, Toolbar, Box } from '@mui/material';
import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { WebSocketProvider } from "next-ws/client";

import { ModesProvider } from "@/contexts/ModesContext";
import { useSavedStatesStore } from "@/hooks/useSavedStatesStore";
import ModesComponent from "@/components/ModesComponent";

interface PageProps {
    initialSavedStates: SavedStates;
}

export const HomeComponent: React.FC<PageProps> = ({ initialSavedStates }) => {
    const setSavedStates = useSavedStatesStore((state) => state.setSavedStates);

    useEffect(() => {
        setSavedStates(initialSavedStates)
    }, [initialSavedStates, setSavedStates])


    return <WebSocketProvider url="/api/mqtt">
        <ModesProvider>
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
    </WebSocketProvider>
};