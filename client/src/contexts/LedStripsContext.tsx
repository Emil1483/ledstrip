'use client'

import React, { createContext, useState, ReactNode, useEffect } from 'react';
import { useMQTTPublishFast, useMQTTRPCCall, useMQTTSubscribe } from '@/contexts/MQTTContext';
import { MQTTMessage } from '@/models/mqtt';


const CurrentModesContext = createContext<Modes>({});
const ChangeModeContext = createContext<(mode: string, kwargs: ModeState) => void>(() => { });
const ChangeModeFastContext = createContext<(mode: string, kwargs: ModeState) => void>(() => { });

interface LedStripsProviderProps {
    children: ReactNode;
    id: number;
}



export const LedStripsProvider: React.FC<LedStripsProviderProps> = ({ children, id }) => {
    const [currentModes, setCurrentModes] = useState<Modes>({});
    const subscribe = useMQTTSubscribe();
    const publishFast = useMQTTPublishFast();
    const rpcCall = useMQTTRPCCall();

    useEffect(() => {
        subscribe(`lights/${id}/status`, (message: MQTTMessage<Modes>) => {
            setCurrentModes(message.message)
        })
    }, []);

    async function changeMode(mode: string, kwargs: ModeState) {
        await rpcCall(`lights/${id}/set_mode`, { mode: mode, kwargs: kwargs })
    };

    async function changeModeFast(mode: string, kwargs: ModeState) {
        await publishFast(`lights/${id}/set_mode`, JSON.stringify({
            reply_topic: null,
            kwargs: { mode: mode, kwargs: kwargs }
        }))
    }

    return <CurrentModesContext.Provider value={currentModes}>
        <ChangeModeContext.Provider value={changeMode}>
            <ChangeModeFastContext.Provider value={changeModeFast}>
                {children}
            </ChangeModeFastContext.Provider>
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

export function useChangeModeFast() {
    const context = React.useContext(ChangeModeFastContext);
    if (!context) {
        throw new Error('useChangeMode must be used within a ModesProvider');
    }
    return context;
}
