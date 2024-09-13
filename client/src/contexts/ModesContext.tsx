'use client'

import React, { createContext, useState, ReactNode, useEffect } from 'react';
import { useMQTTRPCCall, useMQTTSubscribe } from '@/contexts/MQTTContext';
import { MQTTMessage } from '@/models/mqtt';


const CurrentModesContext = createContext<Modes>({});
const ChangeModeContext = createContext<(mode: string, kwargs: ModeState) => void>(() => { });

interface ModesProviderProps {
    children: ReactNode;
}



export const ModesProvider: React.FC<ModesProviderProps> = ({ children }) => {
    const [currentModes, setCurrentModes] = useState<Modes>({});
    const subscribe = useMQTTSubscribe();
    const rpcCall = useMQTTRPCCall();

    useEffect(() => {
        subscribe("lights/0/status", (message: MQTTMessage<Modes>) => {
            setCurrentModes(message.message)
        })
    }, []);

    async function changeMode(mode: string, kwargs: ModeState) {
        await rpcCall("lights/0/set_mode", { mode: mode, kwargs: kwargs })
    };

    return <CurrentModesContext.Provider value={currentModes}>
        <ChangeModeContext.Provider value={changeMode}>
            {children}
        </ChangeModeContext.Provider>
    </CurrentModesContext.Provider>

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
