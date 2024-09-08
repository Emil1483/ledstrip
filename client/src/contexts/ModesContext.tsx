'use client'

import React, { createContext, useState, ReactNode, useEffect } from 'react';
import useWebSocket, { ReadyState } from 'react-use-websocket';
import { v4 as uuidV4 } from 'uuid';
import { toast } from 'react-toastify';

import { MessageQueue } from '@/services/MessageQueue';
import { useMQTTSubscribe } from '@/contexts/MQTTContext';


const CurrentModesContext = createContext<Modes>({});
const ChangeModeContext = createContext<(mode: string, kwargs: ModeState) => void>(() => { });

interface ModesProviderProps {
    children: ReactNode;
}

interface MQTTMessage {
    topic: string;
    message: any;
}

class TimeoutError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "TimeoutError";
    }
}

export const ModesProvider: React.FC<ModesProviderProps> = ({ children }) => {
    const [currentModes, setCurrentModes] = useState<Modes>({});
    const subscribe = useMQTTSubscribe();

    useEffect(() => {
        subscribe("lights/0/status", console.log)
    }, []);

    async function changeMode(mode: string, kwargs: ModeState) {

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
