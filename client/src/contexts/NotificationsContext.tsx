'use client'

import { useAuth } from '@clerk/nextjs';
import React, { createContext, useState, ReactNode, useEffect } from 'react';
import { toast } from 'react-toastify';

export enum NotificationsReadyState {
    NOT_SUPPORTED = 1,
    UNSUBSCRIBED = 2,
    SUBSCRIBED = 3,
}

const ReadyStateContext = createContext<NotificationsReadyState>(NotificationsReadyState.NOT_SUPPORTED);
const SubscribeContext = createContext<() => void>(() => { });
const UnsubscribeContext = createContext<() => void>(() => { });

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
            register()
        }
    }, [isLoaded, userId])

    async function register() {
        const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
        if (!publicKey) {
            throw new Error('NEXT_PUBLIC_VAPID_PUBLIC_KEY is not set')
        }

        const registration = await navigator.serviceWorker.register('/sw.js', {
            scope: '/',
            updateViaCache: 'none',
        })

        const existing = await registration.pushManager.getSubscription()

        if (existing) {
            setReadyState(NotificationsReadyState.SUBSCRIBED)
        } else {
            setReadyState(NotificationsReadyState.UNSUBSCRIBED)
        }
    }

    async function unsubscribe() {
        if (readyState !== NotificationsReadyState.SUBSCRIBED) {
            throw new Error('Not subscribed for notifications')
        }

        const registration = await navigator.serviceWorker.getRegistration()
        if (!registration) {
            throw new Error('Service worker not registered')
        }

        if (!registration.active) {
            toast.error('Service worker not active')
            return
        }

        const existing = await registration.pushManager.getSubscription()
        if (!existing) {
            console.warn('Subscription not found')
            return
        }

        await existing.unsubscribe()

        setReadyState(NotificationsReadyState.UNSUBSCRIBED)
        toast.success('Unsubscribed from notifications')
    }

    async function subscribe() {
        if (readyState === NotificationsReadyState.NOT_SUPPORTED) {
            toast.error('Notifications are not supported')
            return
        }

        const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
        if (!publicKey) {
            throw new Error('NEXT_PUBLIC_VAPID_PUBLIC_KEY is not set')
        }

        const registration = await navigator.serviceWorker.getRegistration()
        if (!registration) {
            throw new Error('Service worker not registered')
        }

        if (!registration.active) {
            toast.error('Service worker not active')
            return
        }

        const existing = await registration.pushManager.getSubscription()
        if (existing) {
            throw new Error('Already subscribed for notifications')
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
            toast.error('Failed to upload subscription details')
            return
        }

        setReadyState(NotificationsReadyState.SUBSCRIBED)
        toast.success('Registered for notifications')
    }


    return <ReadyStateContext.Provider value={readyState}>
        <SubscribeContext.Provider value={subscribe}>
            <UnsubscribeContext.Provider value={unsubscribe}>
                {children}
            </UnsubscribeContext.Provider>
        </SubscribeContext.Provider>
    </ReadyStateContext.Provider>

};

export function useNotificationsReadyState() {
    const context = React.useContext(ReadyStateContext);
    if (!context) {
        throw new Error('useNotificationsReadyState must be used within a NotificationsProvider');
    }
    return context;
}

export function useSubscribe() {
    const context = React.useContext(SubscribeContext);
    if (!context) {
        throw new Error('useResubscribe must be used within a NotificationsProvider');
    }
    return context;
}

export function useUnsubscribe() {
    const context = React.useContext(UnsubscribeContext);
    if (!context) {
        throw new Error('useUnsubscribe must be used within a NotificationsProvider');
    }
    return context;
}