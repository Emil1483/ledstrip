'use client'

import React, { useState, ReactNode, useEffect, createContext } from 'react';
import { useMQTTSubscribe } from '@/contexts/MQTTContext';
import { MQTTMessage } from '@/models/mqtt';


const LedStripsContext = createContext<Array<Ledstrip & { aliveFor?: number }>>([]);

interface LedStripProviderProps {
    children: ReactNode;
    ledstrips: Ledstrip[];
}

export const LedStripProvider: React.FC<LedStripProviderProps> = ({ children, ledstrips }) => {
    const [extendedLedstrips, setLedstrips] = useState<{
        [id: string]: Ledstrip & {
            aliveAt?: number,
            aliveFor?: number,
        }
    }>(ledstrips.reduce((acc: any, ledstrip) => {
        acc[ledstrip.id] = ledstrip;
        return acc;
    }, {}));

    const subscribe = useMQTTSubscribe();

    useEffect(() => {
        ledstrips.forEach(ledstrip => {
            subscribe(`lights/${ledstrip.id}/health`, (message: MQTTMessage<{ alive_at: number }>) => {
                setLedstrips((ledstrips) => {
                    const newLedstrips = { ...ledstrips }
                    newLedstrips[ledstrip.id] = {
                        ...ledstrip,
                        aliveAt: message.message.alive_at,
                        aliveFor: (Date.now() / 1000) - message.message.alive_at
                    }
                    return newLedstrips
                })
            })
        });
    }, []);

    useEffect(() => {
        const intervalId = setInterval(() => {
            Object.keys(extendedLedstrips).forEach((key) => {
                setLedstrips((ledstrips) => {
                    const newLedstrips = { ...ledstrips }
                    const ledstrip = newLedstrips[key]
                    if (ledstrip && ledstrip.aliveAt) {
                        newLedstrips[key].aliveFor = (Date.now() / 1000) - ledstrip.aliveAt
                    }
                    return newLedstrips
                })
            })
        }, 10);
        return () => clearInterval(intervalId);
    }, [extendedLedstrips])

    return <LedStripsContext.Provider value={Object.values(extendedLedstrips)}>
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

