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

function urlBase64ToUint8Array(base64String: string) {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
    const base64 = (base64String + padding)
        .replace(/\\-/g, '+')
        .replace(/_/g, '/')

    const rawData = window.atob(base64)
    const outputArray = new Uint8Array(rawData.length)

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i)
    }
    return outputArray
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
        const sub = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(
                publicKey
            ),
        })


        const response = await fetch(`/api/users/${userId}/notifications/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(sub.toJSON()),
        })

        if (!response.ok) {
            throw new Error('Failed to register for notifications')
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