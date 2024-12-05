'use client'

import React from "react";
import { AppBar, Toolbar, Box, Typography } from '@mui/material';
import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";

import { ReadyState } from "react-use-websocket";
import { useMQTTWebsocketReadyState } from "@/contexts/MQTTContext";
import { NotificationsReadyState, useNotificationsReadyState } from "@/contexts/NotificationsContext";

import { Notifications, NotificationsOff, NotificationImportant } from "@mui/icons-material";

interface AppBarComponentProps {
    title?: string;
}

export const AppBarComponent: React.FC<AppBarComponentProps> = ({ title }) => {
    const mqttReadyState = useMQTTWebsocketReadyState();
    const notificationsReadyState = useNotificationsReadyState();

    function appbarColor() {
        switch (mqttReadyState) {
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

    function notificationsStatus() {
        switch (notificationsReadyState) {
            case NotificationsReadyState.NOT_SUPPORTED:
                return <NotificationImportant />;
            case NotificationsReadyState.SUPPORTED:
                return <NotificationsOff />;
            case NotificationsReadyState.REGISTERED:
                return <Notifications />;
        }
    }


    return <AppBar color={appbarColor()} position="static"  >
        <Toolbar>
            {title && (<Typography variant="h6" component="div">
                {title}
            </Typography>
            )}
            <Box sx={{ flexGrow: 1 }}></Box>
            <Box sx={{ paddingRight: "12px" }}>
                {notificationsStatus()}
            </Box>
            <SignedOut>
                <SignInButton />
            </SignedOut>
            <SignedIn>
                <UserButton />
            </SignedIn>
        </Toolbar>
    </AppBar>

}