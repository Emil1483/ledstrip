'use client'

import React, { useEffect } from "react";
import { AppBar, Toolbar, Box, Button } from '@mui/material';
import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";

import { useSavedStatesStore } from "@/hooks/useSavedStatesStore";
import ModesComponent from "@/components/ModesComponent";
import { ReadyState } from "react-use-websocket";
import { useMQTTSubscribe, useMQTTWebsocketReadyState } from "@/contexts/MQTTContext";

interface PageProps {
    initialSavedStates: SavedStates;
}

export const HomeComponent: React.FC<PageProps> = ({ initialSavedStates }) => {
    const setSavedStates = useSavedStatesStore((state) => state.setSavedStates);
    const readyState = useMQTTWebsocketReadyState();
    const subscribe = useMQTTSubscribe()

    useEffect(() => {
        setSavedStates(initialSavedStates)
    }, [initialSavedStates, setSavedStates])

    function appbarColor() {
        switch (readyState) {
            case ReadyState.UNINSTANTIATED:
                return "#a0a0a0";
            case ReadyState.CONNECTING:
                return "#6e7feb";
            case ReadyState.OPEN:
                return "#1835F2";
            case ReadyState.CLOSING:
                return "#FFA500";
            case ReadyState.CLOSED:
                return "#FF0000";
        }
    }


    return <>
        <AppBar sx={{ backgroundColor: appbarColor() }}>
            < Toolbar >
                <Box sx={{ flexGrow: 1 }}></Box>
                <SignedOut>
                    <SignInButton />
                </SignedOut>
                <SignedIn>
                    <UserButton />
                </SignedIn>
                <Button onClick={() => {
                    subscribe("test", console.log)
                }}>Test</Button>
            </ Toolbar>
        </AppBar >
        <ModesComponent />
    </>
};