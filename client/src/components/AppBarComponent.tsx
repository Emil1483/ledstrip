'use client'

import React from "react";
import { AppBar, Toolbar, Box, Typography } from '@mui/material';
import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";

import { ReadyState } from "react-use-websocket";
import { useMQTTWebsocketReadyState } from "@/contexts/MQTTContext";

interface AppBarComponentProps {
    title?: string;
}

export const AppBarComponent: React.FC<AppBarComponentProps> = ({ title }) => {
    const readyState = useMQTTWebsocketReadyState();

    function appbarColor() {
        switch (readyState) {
            case ReadyState.UNINSTANTIATED:
                return "warning";
            case ReadyState.CONNECTING:
                return "secondary";
            case ReadyState.OPEN:
                return "primary";
            case ReadyState.CLOSING:
                return "warning";
            case ReadyState.CLOSED:
                return "error";
        }
    }


    return (
        <AppBar color={appbarColor()} position="static"  >
            <Toolbar>
                {title && (<Typography variant="h6" component="div">
                    {title}
                </Typography>
                )}
                <Box sx={{ flexGrow: 1 }}></Box>
                <SignedOut>
                    <SignInButton />
                </SignedOut>
                <SignedIn>
                    <UserButton />
                </SignedIn>
            </Toolbar>
        </AppBar>
    );
};