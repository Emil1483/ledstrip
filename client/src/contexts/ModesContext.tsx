'use client'

import React, { createContext, useState, ReactNode, useEffect, useCallback } from 'react';
import mqtt, { MqttClient } from "mqtt";
import { useWebSocket } from 'next-ws/client';


const CurrentModesContext = createContext<Modes>({});
const ChangeModeContext = createContext<(mode: string, kwargs: ModeState) => void>(() => { });
const SetMqttUrlContext = createContext<(mqttUrl: string) => void>(() => { });

interface ModesProviderProps {
    children: ReactNode;
}

export const ModesProvider: React.FC<ModesProviderProps> = ({ children }) => {
    const [currentModes, setCurrentModes] = useState<Modes>({});

    const ws = useWebSocket();

    const onMessage = useCallback(
        async (event: MessageEvent<Blob>) => {
            console.log("Received message:", event.data);
            if (event.data instanceof Blob) {
                const data = await event.data.text()
                const json = JSON.parse(data);
                console.log("Decoded message:", json);
                setCurrentModes(json);
            }
        },
        [],
    );

    useEffect(() => {
        ws?.addEventListener('message', onMessage);
        return () => ws?.removeEventListener('message', onMessage);
    }, [onMessage, ws]);

    function changeMode(mode: string, kwargs: ModeState) {
        if (!ws) {
            console.error("WebSocket not connected!");
            return;
        }

        ws.send(JSON.stringify({
            topic: "lights/rpc/request/set_mode/a",
            message: JSON.stringify({
                mode: mode,
                kwargs: kwargs,
            }),
        }));
    };

    return (
        <CurrentModesContext.Provider value={currentModes}>
            <ChangeModeContext.Provider value={changeMode}>
                {children}
            </ChangeModeContext.Provider>
        </CurrentModesContext.Provider>
    );
};

export function useCurrentModes() {
    const context = React.useContext(CurrentModesContext);
    if (!context) {
        throw new Error('useCurrentModes must be used within a ModeProvider');
    }
    return context;
}

export function useChangeMode() {
    const context = React.useContext(ChangeModeContext);
    if (!context) {
        throw new Error('useChangeMode must be used within a ModeProvider');
    }
    return context;
}

export function useSetMqttUrl() {
    const context = React.useContext(SetMqttUrlContext);
    if (!context) {
        throw new Error('useSetMqttUrl must be used within a ModeProvider');
    }
    return context;
}