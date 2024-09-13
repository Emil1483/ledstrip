'use client'

import React, { createContext, useState, ReactNode, useEffect, useContext } from 'react';
import useWebSocket, { ReadyState } from 'react-use-websocket';
import { v4 as uuidV4 } from 'uuid';
import pTimeout, { TimeoutError } from 'p-timeout';

import assert from 'assert';
import { MessageFromWS, MessageToWS, MQTTMessage } from '@/models/mqtt';

const MQTTSubscribeContext = createContext<(topic: string, callback: (message: MQTTMessage<any>) => void) => Promise<void>>(async (_, __) => { });
const MQTTUnsubscribeContext = createContext<(topic: string) => Promise<void>>(async (_) => { });
const MQTTWebsocketReadyStateContext = createContext<ReadyState>(ReadyState.UNINSTANTIATED);
const MQTTPublishContext = createContext<(topic: string, message: string) => Promise<void>>(async (_, __) => { });
const MQTTRPCCallContext = createContext<(topic: string, kwargs: { [key: string]: any }) => Promise<void>>(async (_, __) => { });

interface MQTTProviderProps {
    children: ReactNode;
}


class AlreadySubscribed extends Error {
    constructor(public topic: string) {
        super(topic);
        this.name = "AlreadySubscribed";
    }
}

type ResponseResolver = (value: {
    statusCode: number,
    response: string
}) => void

export const MQTTProvider: React.FC<MQTTProviderProps> = ({ children }) => {
    const [MQTTReady, setMQTTReady] = useState<boolean>(false)

    const [promises, setPromises] = useState<{
        [requestId: string]: {
            resolve: ResponseResolver
        },
    }>({});

    const [callbacks, setCallbacks] = useState<{ [topic: string]: (message: MQTTMessage<any>) => void }>({})

    function addPromise(requestId: string, resolve: ResponseResolver) {
        setPromises((promises) => {
            assert(!(requestId in promises))
            return { ...promises, [requestId]: { resolve: resolve } }
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

    function addCallback<T>(topic: string, callback: (message: MQTTMessage<T>) => void): Promise<void> {
        return new Promise((resolve: (_: any) => void, reject: (reason: any) => void) => {
            setCallbacks((callbacks) => {
                if (topic in callbacks) {
                    reject(new AlreadySubscribed(topic))
                } else {
                    resolve(null)
                }
                return { ...callbacks, [topic]: callback }
            })
        })
    }

    function removeCallback(topic: string) {
        setCallbacks((callbacks) => {
            assert(topic in callbacks)
            const newCallbacks = { ...callbacks }
            delete newCallbacks[topic]
            return newCallbacks
        })
    }


    const { sendMessage, lastMessage, readyState } = useWebSocket("/api/mqtt", {
        shouldReconnect: (_) => true,
        reconnectAttempts: 500,
        reconnectInterval: 500,
    })

    useEffect(() => {
        if (typeof lastMessage?.data === "string") {
            const wsMessage: MessageFromWS = JSON.parse(lastMessage?.data);
            console.log("Decoded wsMessage:", wsMessage);

            if (wsMessage.type == "MQTTMessage") {
                if (!(wsMessage.topic in callbacks)) {
                    throw Error(`Topic callback not found: ${wsMessage.topic}`)
                }
                callbacks[wsMessage.topic](wsMessage)
            } else if (wsMessage.type == "response") {
                if (!(wsMessage.requestId in promises)) {
                    console.warn(`no promise with requestId ${wsMessage.requestId}. Perhaps the promise timed out?`)
                    return
                }
                promises[wsMessage.requestId].resolve({
                    statusCode: wsMessage.statusCode,
                    response: wsMessage.response,
                })
                removePromise(wsMessage.requestId)
            } else if (wsMessage.type == "MQTTReady") {
                setMQTTReady(true)
                for (const promiseId in promises) {
                    if (promiseId.startsWith("MQTTReady")) {
                        promises[promiseId].resolve({
                            statusCode: 200,
                            response: "Ready",
                        })
                        removePromise(promiseId)
                    }
                }
            }
        }
    }, [lastMessage]);

    async function waitUntilMQTTReady() {
        if (MQTTReady) {
            return
        }
        const promiseId = "MQTTReady" + uuidV4();
        await new Promise((resolve: ResponseResolver, _) => {
            addPromise(promiseId, resolve)
        })
    }

    async function makeRequest(message: MessageToWS) {
        const mainPromise = new Promise((resolve: ResponseResolver) => {
            addPromise(message.requestId, resolve)
            sendMessage(JSON.stringify(message))
        })

        try {
            return await pTimeout(mainPromise, { milliseconds: 5000 })
        } catch (e) {
            if (e instanceof TimeoutError) {
                removePromise(message.requestId)
            }
            throw e
        }
    }

    async function subscribe<T>(topic: string, callback: (message: MQTTMessage<T>) => void) {
        await waitUntilMQTTReady()

        try {
            await addCallback(topic, callback)
        } catch (e) {
            if (e instanceof AlreadySubscribed) {
                console.warn(`Already subscribed to topic ${e.topic}`)
                return
            }
        }
        const result = await makeRequest({
            method: 'subscribe',
            requestId: uuidV4(),
            topic: topic,
        })

        if (result.statusCode != 200) {
            throw Error(`Could not subscribe: ${result.response} (${result.statusCode})`)
        }
    }

    async function unsubscribe(topic: string) {
        await waitUntilMQTTReady()

        const result = await makeRequest({
            method: 'unsubscribe',
            requestId: uuidV4(),
            topic: topic,
        })

        removeCallback(topic)

        // TODO: implement unsubscribe in the ws server

        if (result.statusCode != 200) {
            throw Error(`Could not unsubscribe: ${result.response} (${result.statusCode})`)
        }
    }

    async function publish(topic: string, message: string) {
        await waitUntilMQTTReady()

        const result = await makeRequest({
            method: 'publish',
            requestId: uuidV4(),
            topic: topic,
            message: message
        })

        // TODO: implement publish in the ws server

        if (result.statusCode != 200) {
            throw Error(`Could not unsubscribe: ${result.response} (${result.statusCode})`)
        }
    }

    async function rpcCall(topic: string, kwargs: { [key: string]: any }): Promise<any> {
        const replyTopic = uuidV4()
        const mainPromise = new Promise(async (resolve) => {
            await subscribe<any>(replyTopic, (message) => {
                unsubscribe(replyTopic)
                resolve(message.message)
            })
            await publish(topic, JSON.stringify({
                kwargs: kwargs,
                reply_topic: replyTopic,
            }))
        })

        try {
            return await pTimeout(mainPromise, { milliseconds: 25000 })
        } catch (e) {
            await unsubscribe(replyTopic)
            throw e
        }
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