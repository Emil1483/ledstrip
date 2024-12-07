'use client'

import React, { createContext, useState, ReactNode, useEffect } from 'react';
import { useMQTTPublishFast, useMQTTRPCCall, useMQTTSubscribe } from '@/contexts/MQTTContext';
import { MQTTMessage } from '@/models/mqtt';
import { toast } from 'react-toastify';
import { useAuth, useUser } from '@clerk/nextjs';
import { useNotifyOwners } from '@/contexts/NotificationsContext';
import { isColor } from '@/models/typeCheckers';
import { closest } from 'color-2-name';


interface SavedKwargs {
    kwargs: ModeState,
    name: string,
    iconId: number,
    mode: string,
    id: number,
}

const CurrentModesContext = createContext<Modes>({});
const ChangeModeContext = createContext<(mode: string, kwargs: ModeState) => void>(() => { });
const ChangeModeFastContext = createContext<(mode: string, kwargs: ModeState) => void>(() => { });
const SaveCurrentStateContext = createContext<(name: string, iconId: number) => void>(() => { });
const SavedKwargsContext = createContext<SavedKwargs[]>([]);
const DeleteSavedKwargsContext = createContext<(id: number) => void>(() => { });

interface ModesProviderProps {
    children: ReactNode;
    ledstrip: Ledstrip;
    savedKwargs: SavedKwargs[];
}



export const ModesProvider: React.FC<ModesProviderProps> = ({ children, ledstrip, savedKwargs }) => {
    const [currentSavedKwargs, setCurrentSavedKwargs] = useState(savedKwargs);
    const [currentModes, setCurrentModes] = useState<Modes>({});

    const subscribe = useMQTTSubscribe();
    const publishFast = useMQTTPublishFast();
    const rpcCall = useMQTTRPCCall();
    const notifyOwners = useNotifyOwners();
    const auth = useAuth();
    const user = useUser();

    useEffect(() => {
        subscribe(`lights/${ledstrip.id}/status`, (message: MQTTMessage<Modes>) => {
            setCurrentModes(message.message)
        })
    }, []);

    async function saveCurrentState(name: string, iconId: number) {
        const userId = auth.userId
        for (const mode in currentModes) {
            if (currentModes[mode].on) {
                const result = await fetch(`/api/users/${userId}/kwargs`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        kwargs: currentModes[mode].state,
                        name: name,
                        iconId: iconId,
                        mode: mode,
                    })
                })
                if (!result.ok) {
                    throw new Error("Failed to save state")
                }

                setCurrentSavedKwargs(await result.json())

                toast.success("Saved successfully!")

                return
            }
        }
        throw new Error("No mode is currently on")

    }

    async function changeMode(mode: string, kwargs: ModeState) {
        await rpcCall(`lights/${ledstrip.id}/set_mode`, { mode: mode, kwargs: kwargs })

        const userName = user.user?.firstName
        if (!userName) {
            throw new Error("User is not logged in")
        }

        const kwargsString = Object.entries(kwargs).map(([key, value]) => {
            if (isColor(value)) {
                const valueString = closest(`rgb(${value.r},${value.g},${value.b})`).name
                return `${key}: ${valueString}`
            }

            if (typeof value === "object") {
                if (Object.keys(value).length === 1) {
                    const valueString = Object.values(value)[0].toString()
                    return `${key}: ${valueString}`
                } else {
                    const valueString = Object.entries(value).map(([key, value]) => {
                        return `${key}: ${value}`
                    }).join(", ")
                    return `${key}: (${valueString})`
                }
            }

            return `${key}: ${value}`;
        }).join(", ")

        const savedKwargs = currentSavedKwargs
            .find(savedKwargs => {
                const a = JSON.stringify({ mode: savedKwargs.mode, kwargs: savedKwargs.kwargs })
                const b = JSON.stringify({ mode: mode, kwargs: kwargs })
                console.log(a, b)
                return a === b
            })

        let message = `${userName} set ${ledstrip.name} to ${mode}(${kwargsString})`
        if (savedKwargs) {
            message = `${userName} set ${ledstrip.name} to ${savedKwargs.name} | ${mode}(${kwargsString})`
        }

        await notifyOwners(ledstrip.id, `${ledstrip.name} set to ${mode}`, message)
    };

    async function changeModeFast(mode: string, kwargs: ModeState) {
        await publishFast(`lights/${ledstrip.id}/set_mode`, JSON.stringify({
            reply_topic: null,
            kwargs: { mode: mode, kwargs: kwargs }
        }))
    }

    async function deleteSavedKwargs(id: number) {
        const result = await fetch(`/api/users/${auth.userId}/kwargs/${id}`, {
            method: "DELETE"
        })
        if (!result.ok) {
            throw new Error("Failed to delete saved kwargs")
        }
        toast.success("Deleted successfully")
        setCurrentSavedKwargs(await result.json())
    }

    return <CurrentModesContext.Provider value={currentModes}>
        <ChangeModeContext.Provider value={changeMode}>
            <ChangeModeFastContext.Provider value={changeModeFast}>
                <SaveCurrentStateContext.Provider value={saveCurrentState}>
                    <SavedKwargsContext.Provider value={currentSavedKwargs}>
                        <DeleteSavedKwargsContext.Provider value={deleteSavedKwargs}>
                            {children}
                        </DeleteSavedKwargsContext.Provider>
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

export function useDeleteSavedKwargs() {
    const context = React.useContext(DeleteSavedKwargsContext);
    if (!context) {
        throw new Error('useDeleteSavedKwargs must be used within a ModesProvider');
    }
    return context;
}