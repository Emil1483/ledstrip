'use client'

import React, { createContext, useState, ReactNode, useEffect } from 'react';
import useWebSocket, { ReadyState } from 'react-use-websocket';
import { v4 as uuidV4 } from 'uuid';
import { toast } from 'react-toastify';

import { MessageQueue } from '@/services/MessageQueue';
import assert from 'assert';


const MQTTSubscribeContext = createContext<(topic: string, callback: (message: MessageEvent) => void) => Promise<void>>(async (_, __) => { });
const MQTTUnsubscribeContext = createContext<(topic: string) => Promise<void>>(async (_) => { });
const MQTTWebsocketReadyStateContext = createContext<ReadyState>(ReadyState.UNINSTANTIATED);
const MQTTPublishContext = createContext<(topic: string, message: string) => Promise<void>>(async (_, __) => { });
const MQTTRPCCallContext = createContext<(topic: string, kwargs: { [key: string]: any }) => Promise<void>>(async (_, __) => { });

interface MQTTProviderProps {
    children: ReactNode;
}

interface MQTTMessage {
    topic: string;
    message: any;
}

type MessageToWS = {
    method: "subscribe",
    topic: string,
    requestId: string,
} | {
    method: "unsubscribe",
    topic: string,
    requestId: string,
} | {
    method: "publish",
    topic: string,
    message: string,
    requestId: string,
}

type MessageFromWS = {
    type: "mqttMessage",
    mqttMessage: MQTTMessage,
} | {
    type: "response",
    requestId: string,
    statusCode: number,
    response: string,
}

class TimeoutError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "TimeoutError";
    }
}

export const MQTTProvider: React.FC<MQTTProviderProps> = ({ children }) => {
    const [messageQueue, _] = useState<MessageQueue<MQTTMessage>>(new MessageQueue<MQTTMessage>());

    const [promises, setPromises] = useState<{
        [requestId: string]: {
            resolve: (value: {
                statusCode: number,
                response: string
            }) => void
        },
    }>({});

    function addPromise(requestId: string, resolve: (value: {
        statusCode: number,
        response: string
    }) => void) {
        setPromises((promises) => {
            assert(!(requestId in promises))
            return { ...promises, requestId: { resolve: resolve } }
        })
    }

    function removePromise(requestId: string) {
        setPromises((promises) => {
            assert(requestId in promises)
            const newPromises = { ...promises }
            delete newPromises[requestId]
            return newPromises
        })
    }

    const { sendMessage, lastMessage, readyState } = useWebSocket("/api/mqtt", {
        shouldReconnect: (_) => true,
        reconnectAttempts: 500,
        reconnectInterval: 500,
    })

    function sendWsMessage(message: MessageToWS) {
        sendMessage(JSON.stringify(message))
    }

    useEffect(() => {
        if (typeof lastMessage?.data === "string") {
            const wsMessage: MessageFromWS = JSON.parse(lastMessage?.data);
            console.log("Decoded wsMessage:", wsMessage);

            if (wsMessage.type == "mqttMessage") {
                messageQueue.enqueue(wsMessage.mqttMessage);
            } else if (wsMessage.type == "response") {
                promises[wsMessage.requestId].resolve({
                    statusCode: wsMessage.statusCode,
                    response: wsMessage.response,
                })
            }
        }
    }, [lastMessage]);

    async function subscribe(topic: string, callback: (message: MessageEvent) => void) {
        const requestId = uuidV4();
        const promise = new Promise((resolve: (value: {
            statusCode: number,
            response: string
        }) => void, _) => {
            sendWsMessage({
                method: 'subscribe',
                requestId: requestId,
                topic: topic,
            })
            addPromise(requestId, resolve)
        })

        const result = await promise;

        console.log("subscribed!", result.response, result.statusCode)
    }

    async function unsubscribe(topic: string) {

    }

    async function publish(topic: string, message: string) {

    }

    async function rpcCall(topic: string, kwargs: { [key: string]: any }) {

    }

    return <MQTTSubscribeContext.Provider value={subscribe}>
        <MQTTUnsubscribeContext.Provider value={unsubscribe}>
            <MQTTWebsocketReadyStateContext.Provider value={readyState}>
                <MQTTPublishContext.Provider value={publish}>
                    <MQTTRPCCallContext.Provider value={rpcCall}>
                        {children}
                    </MQTTRPCCallContext.Provider>
                </MQTTPublishContext.Provider>
            </MQTTWebsocketReadyStateContext.Provider>
        </MQTTUnsubscribeContext.Provider>
    </MQTTSubscribeContext.Provider>
};

export function useMQTTSubscribe() {
    const context = React.useContext(MQTTSubscribeContext);
    if (!context) {
        throw new Error('useCurrentModes must be used within a ModesProvider');
    }
    return context;
}

export function useMQTTUnsubscribe() {
    const context = React.useContext(MQTTUnsubscribeContext);
    if (!context) {
        throw new Error('useCurrentModes must be used within a ModesProvider');
    }
    return context;
}

export function useMQTTWebsocketReadyState() {
    return React.useContext(MQTTWebsocketReadyStateContext);
}

export function useMQTTPublish() {
    const context = React.useContext(MQTTPublishContext);
    if (!context) {
        throw new Error('useCurrentModes must be used within a ModesProvider');
    }
    return context;
}

export function useMQTTRPCCall() {
    const context = React.useContext(MQTTRPCCallContext);
    if (!context) {
        throw new Error('useCurrentModes must be used within a ModesProvider');
    }
    return context;
}