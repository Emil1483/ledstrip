'use client'

import React, { createContext, useState, ReactNode, useEffect } from 'react';
import useWebSocket, { ReadyState } from 'react-use-websocket';
import { v4 as uuidV4 } from 'uuid';
import { toast } from 'react-toastify';

import { MessageQueue } from '@/services/MessageQueue';


const CurrentModesContext = createContext<Modes>({});
const ChangeModeContext = createContext<(mode: string, kwargs: ModeState) => void>(() => { });
const WebsocketReadyStateContext = createContext<ReadyState>(ReadyState.UNINSTANTIATED);

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
    const [messageQueue, _] = useState<MessageQueue<MQTTMessage>>(new MessageQueue<MQTTMessage>());

    const [currentModes, setCurrentModes] = useState<Modes>({});
    const { sendMessage, lastMessage, readyState } = useWebSocket("/api/mqtt", {
        shouldReconnect: (_) => true,
        reconnectAttempts: 500,
        reconnectInterval: 500,
    })

    useEffect(() => {
        if (typeof lastMessage?.data === "string") {
            try {
                const json: MQTTMessage = JSON.parse(lastMessage?.data);
                console.log("Decoded message:", json);
                messageQueue.enqueue(json);

                if (json.topic === "lights/0/status") {
                    setCurrentModes(json.message);
                }
            } catch (e) {
                console.error("Could not decode message:", lastMessage?.data, e)
            }
        }
    }, [lastMessage]);

    async function changeMode(mode: string, kwargs: ModeState) {
        const replyId = uuidV4();
        const replyTopic = `lights/0/replies/${replyId}`;

        messageQueue.clear();

        sendMessage(JSON.stringify({
            topic: "lights/0/set_mode",
            message: JSON.stringify({
                reply_topic: replyTopic,
                kwargs: {
                    mode: mode,
                    kwargs: kwargs,
                }
            }),
        }));

        async function waitForResponse() {
            while (true) {
                const response = await messageQueue.dequeue();
                if (response.topic === replyTopic) {
                    return response.message;
                }
            }
        }

        const timeout = 1000;

        const timeoutPromise = new Promise<void>((_, reject) => {
            setTimeout(() => {
                reject(new TimeoutError(`Timeout: No response found for topic "${replyTopic}" within ${timeout}ms`))
            }, timeout);
        });

        const response = await Promise.race([waitForResponse(), timeoutPromise]).catch((error) => {
            if (error instanceof TimeoutError) {
                toast.error(error.message);
            }
        })

        console.log("Received response:", response);
    };

    return <WebsocketReadyStateContext.Provider value={readyState}>
        <CurrentModesContext.Provider value={currentModes}>
            <ChangeModeContext.Provider value={changeMode}>
                {children}
            </ChangeModeContext.Provider>
        </CurrentModesContext.Provider>
    </WebsocketReadyStateContext.Provider>
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

export function useWebsocketReadyState() {
    return React.useContext(WebsocketReadyStateContext);
}