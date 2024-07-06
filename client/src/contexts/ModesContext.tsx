'use client'

import React, { createContext, useState, ReactNode, useEffect } from 'react';
import useWebSocket, { ReadyState } from 'react-use-websocket';


const CurrentModesContext = createContext<Modes>({});
const ChangeModeContext = createContext<(mode: string, kwargs: ModeState) => void>(() => { });
const WebsocketReadyStateContext = createContext<ReadyState>(ReadyState.UNINSTANTIATED);

interface ModesProviderProps {
    children: ReactNode;
}

export const ModesProvider: React.FC<ModesProviderProps> = ({ children }) => {
    const [currentModes, setCurrentModes] = useState<Modes>({});
    const { sendMessage, lastMessage, readyState } = useWebSocket("/api/mqtt", {
        shouldReconnect: (_) => true,
        reconnectAttempts: 100,
        reconnectInterval: 2000,
    })

    useEffect(() => {
        if (lastMessage != null && lastMessage.data instanceof Blob) {
            lastMessage.data.text().then((data) => {
                const json = JSON.parse(data);
                console.log("Decoded message:", json);
                setCurrentModes(json);
            })
        }
    }, [lastMessage]);

    function changeMode(mode: string, kwargs: ModeState) {
        sendMessage(JSON.stringify({
            topic: "lights/rpc/request/set_mode/a",
            message: JSON.stringify({
                mode: mode,
                kwargs: kwargs,
            }),
        }));
    };

    return <WebsocketReadyStateContext.Provider value={readyState}>
        <CurrentModesContext.Provider value={currentModes}>
            <ChangeModeContext.Provider value={changeMode}>
                {children}
            </ChangeModeContext.Provider>
        </CurrentModesContext.Provider>
    </WebsocketReadyStateContext.Provider>
};

export function useCurrentModes() {
    const context = React.useContext(CurrentModesContext);
    if (!context) {
        throw new Error('useCurrentModes must be used within a ModesProvider');
    }
    return context;
}

export function useChangeMode() {
    const context = React.useContext(ChangeModeContext);
    if (!context) {
        throw new Error('useChangeMode must be used within a ModesProvider');
    }
    return context;
}

export function useWebsocketReadyState() {
    return React.useContext(WebsocketReadyStateContext);
}