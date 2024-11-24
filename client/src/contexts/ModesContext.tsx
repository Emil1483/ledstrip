'use client'

import React, { createContext, useState, ReactNode, useEffect } from 'react';
import { useMQTTPublishFast, useMQTTRPCCall, useMQTTSubscribe } from '@/contexts/MQTTContext';
import { MQTTMessage } from '@/models/mqtt';
import { toast } from 'react-toastify';


const CurrentModesContext = createContext<Modes>({});
const ChangeModeContext = createContext<(mode: string, kwargs: ModeState) => void>(() => { });
const ChangeModeFastContext = createContext<(mode: string, kwargs: ModeState) => void>(() => { });
const SaveCurrentStateContext = createContext<(name: string, iconId: number) => void>(() => { });
const SavedKwargsContext = createContext<{ kwargs: ModeKwargs, name: string, iconId: number }[]>([]);

interface ModesProviderProps {
    children: ReactNode;
    ledstrip: Ledstrip;
    savedKwargs: { kwargs: ModeKwargs, name: string, iconId: number }[];
}



export const ModesProvider: React.FC<ModesProviderProps> = ({ children, ledstrip, savedKwargs }) => {
    const [currentSavedKwargs, setCurrentSavedKwargs] = useState(savedKwargs);
    const [currentModes, setCurrentModes] = useState<Modes>({});

    const subscribe = useMQTTSubscribe();
    const publishFast = useMQTTPublishFast();
    const rpcCall = useMQTTRPCCall();

    useEffect(() => {
        subscribe(`lights/${ledstrip.id}/status`, (message: MQTTMessage<Modes>) => {
            setCurrentModes(message.message)
        })
    }, []);

    async function saveCurrentState(name: string, iconId: number) {
        for (const mode in currentModes) {
            if (currentModes[mode].on) {
                const result = await fetch("api/kwargs", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        kwargs: currentModes[mode].kwargs,
                        name: name,
                        iconId: iconId,
                    })
                })
                if (!result.ok) {
                    throw new Error("Failed to save state")
                }

                setCurrentSavedKwargs((currentSavedKwargs) => [
                    ...currentSavedKwargs,
                    {
                        kwargs: currentModes[mode].kwargs,
                        name: name,
                        iconId: iconId,
                    }])

                toast.success("Saved successfully!")

                return
            }
        }
        throw new Error("No mode is currently on")

    }

    async function changeMode(mode: string, kwargs: ModeState) {
        await rpcCall(`lights/${ledstrip.id}/set_mode`, { mode: mode, kwargs: kwargs })
    };

    async function changeModeFast(mode: string, kwargs: ModeState) {
        await publishFast(`lights/${ledstrip.id}/set_mode`, JSON.stringify({
            reply_topic: null,
            kwargs: { mode: mode, kwargs: kwargs }
        }))
    }

    return <CurrentModesContext.Provider value={currentModes}>
        <ChangeModeContext.Provider value={changeMode}>
            <ChangeModeFastContext.Provider value={changeModeFast}>
                <SaveCurrentStateContext.Provider value={saveCurrentState}>
                    <SavedKwargsContext.Provider value={currentSavedKwargs}>
                        {children}
                    </SavedKwargsContext.Provider>
                </SaveCurrentStateContext.Provider>
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

export function useSaveCurrentState() {
    const context = React.useContext(SaveCurrentStateContext);
    if (!context) {
        throw new Error('useSaveMode must be used within a ModesProvider');
    }
    return context;
}

export function useSavedKwargs() {
    const context = React.useContext(SavedKwargsContext);
    if (!context) {
        throw new Error('useSavedKwargs must be used within a ModesProvider');
    }
    return context;
}