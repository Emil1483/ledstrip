'use client'

import React, { use } from "react";
import { AppBar, Toolbar, Box, Typography, IconButton } from '@mui/material';
import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";

import { ReadyState } from "react-use-websocket";
import { useMQTTWebsocketReadyState } from "@/contexts/MQTTContext";
import { NotificationsReadyState, useNotificationsReadyState, useSubscribe, useUnsubscribe } from "@/contexts/NotificationsContext";

import { Notifications, NotificationsOff, NotificationImportant } from "@mui/icons-material";
import { toast } from "react-toastify";

interface AppBarComponentProps {
    title?: string;
}

export const AppBarComponent: React.FC<AppBarComponentProps> = ({ title }) => {
    const mqttReadyState = useMQTTWebsocketReadyState();
    const notificationsReadyState = useNotificationsReadyState();
    const subscribe = useSubscribe();
    const unsubscribe = useUnsubscribe();

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
            case NotificationsReadyState.UNSUBSCRIBED:
                return <NotificationsOff />;
            case NotificationsReadyState.SUBSCRIBED:
                return <Notifications />;
        }
    }

    function toggleSubscribe() {
        switch (notificationsReadyState) {
            case NotificationsReadyState.NOT_SUPPORTED:
                toast.error("Notifications are not supported on this device");
                return;
            case NotificationsReadyState.UNSUBSCRIBED:
                return subscribe();
            case NotificationsReadyState.SUBSCRIBED:
                return unsubscribe();
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
                <IconButton onClick={toggleSubscribe} color="inherit">
                    {notificationsStatus()}
                </IconButton>
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