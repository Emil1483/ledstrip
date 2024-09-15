'use client'

import React, { useState, ReactNode, useEffect, createContext } from 'react';
import { useMQTTSubscribe } from '@/contexts/MQTTContext';
import { MQTTMessage } from '@/models/mqtt';


const LedStripsContext = createContext<Array<{ id: string, aliveFor: number }>>([]);

interface LedStripProviderProps {
    children: ReactNode;
}

export const LedStripProvider: React.FC<LedStripProviderProps> = ({ children }) => {
    const [ledStrips, setLedStrips] = useState<{
        [id: string]: {
            aliveAt: number,
            aliveFor: number,
        }
    }>({});

    const subscribe = useMQTTSubscribe();

    useEffect(() => {
        // TODO: get the ids I have access to from prisma
        ["emil", "aurora"].forEach(i => subscribe(`lights/${i}/health`, (message: MQTTMessage<{ alive_at: number }>) => {
            setLedStrips((ledStrips) => {
                const newLedStrips = { ...ledStrips }
                newLedStrips[i] = {
                    aliveAt: message.message.alive_at,
                    aliveFor: (Date.now() / 1000) - message.message.alive_at
                }
                return newLedStrips
            })
        }))
    }, []);

    useEffect(() => {
        const intervalId = setInterval(() => {
            Object.keys(ledStrips).forEach((key) => {
                setLedStrips((ledStrips) => {
                    const newLedStrips = { ...ledStrips }
                    newLedStrips[key] = {
                        aliveAt: newLedStrips[key].aliveAt,
                        aliveFor: (Date.now() / 1000) - newLedStrips[key].aliveAt
                    }
                    return newLedStrips
                })
            })
        }, 10);
        return () => clearInterval(intervalId);
    }, [ledStrips])

    function aliveForEntries() {
        return Object.entries(ledStrips).map(([key, ledStrip]) => {
            return {
                id: key,
                aliveFor: (Date.now() / 1000) - ledStrip.aliveAt
            }
        })
    }


    return <LedStripsContext.Provider value={aliveForEntries()}>
        {children}
    </LedStripsContext.Provider>
};

export function useLedStrips() {
    const context = React.useContext(LedStripsContext);
    if (!context) {
        throw new Error('useCurrentModes must be used within a ModesProvider');
    }
    return context;
}

