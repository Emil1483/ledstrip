'use client'

import { useAuth } from '@clerk/nextjs';
import React, { createContext, useState, ReactNode, useEffect } from 'react';

export enum NotificationsReadyState {
    NOT_SUPPORTED = 1,
    SUPPORTED = 2,
    REGISTERED = 3,
}

const ReadyStateContext = createContext<NotificationsReadyState>(NotificationsReadyState.NOT_SUPPORTED);

interface NotificationsProviderProps {
    children: ReactNode;
}


export const NotificationsProvider: React.FC<NotificationsProviderProps> = ({ children }) => {
    const [readyState, setReadyState] = useState<NotificationsReadyState>(NotificationsReadyState.NOT_SUPPORTED);

    const { isLoaded, userId } = useAuth();

    useEffect(() => {
        if (!isLoaded) {
            return
        }

        if (!userId) {
            setReadyState(NotificationsReadyState.NOT_SUPPORTED)
            return
        }

        if ('serviceWorker' in navigator && 'PushManager' in window) {
            setReadyState(NotificationsReadyState.SUPPORTED)
            register(userId)
        }
    }, [isLoaded, userId])

    async function register(userId: string) {
        const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
        if (!publicKey) {
            throw new Error('NEXT_PUBLIC_VAPID_PUBLIC_KEY is not set')
        }

        const registration = await navigator.serviceWorker.register('/sw.js', {
            scope: '/',
            updateViaCache: 'none',
        })

        if (!registration.active) {
            console.error('Service worker not active')
            setReadyState(NotificationsReadyState.NOT_SUPPORTED)
            return
        }

        const existing = await registration.pushManager.getSubscription()

        if (existing) {
            console.log('Already registered for notifications')
            setReadyState(NotificationsReadyState.REGISTERED)
            return
        }

        const sub = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: publicKey
        })

        const response = await fetch(`/api/users/${userId}/notifications/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(sub.toJSON()),
        })

        if (!response.ok) {
            console.error('Failed to register for notifications')
            setReadyState(NotificationsReadyState.NOT_SUPPORTED)
        }

        setReadyState(NotificationsReadyState.REGISTERED)
    }


    return <ReadyStateContext.Provider value={readyState}>
        {children}
    </ReadyStateContext.Provider>

};

export function useNotificationsReadyState() {
    const context = React.useContext(ReadyStateContext);
    if (!context) {
        throw new Error('useNotificationsReadyState must be used within a NotificationsProvider');
    }
    return context;
}