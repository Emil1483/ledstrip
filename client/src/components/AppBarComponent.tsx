'use client'

import React from "react";
import { AppBar, Toolbar, Box } from '@mui/material';
import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";

import { ReadyState } from "react-use-websocket";
import { useMQTTWebsocketReadyState } from "@/contexts/MQTTContext";


export const AppBarComponent: React.FC = () => {
    const readyState = useMQTTWebsocketReadyState();

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


    return <AppBar sx={{ backgroundColor: appbarColor() }}>
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
};