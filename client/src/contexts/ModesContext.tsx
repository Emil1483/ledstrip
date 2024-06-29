import React, { createContext, useState, ReactNode, useEffect } from 'react';
import mqtt, { MqttClient } from "mqtt";


const CurrentModesContext = createContext<Modes>({});
const ChangeModeContext = createContext<(mode: string, kwargs: ModeState) => void>(() => { });
const SetMqttUrlContext = createContext<(mqttUrl: string) => void>(() => { });

interface ModesProviderProps {
    children: ReactNode;
}

export const ModesProvider: React.FC<ModesProviderProps> = ({ children }) => {
    const [currentModes, setCurrentModes] = useState<Modes>({});
    const [mqttClient, setMqttClient] = useState<MqttClient | null>(null);
    const [mqttUrl, setMqttUrl] = useState<string | null>(null);


    useEffect(() => {
        if (!mqttUrl) return
        if (mqttClient) {
            console.warn("MQTT client already initialized");
            return;
        }

        const client = mqtt.connect(mqttUrl);

        client.on("connect", () => {
            const topic = "lights/status";
            client.subscribe(topic, (err) => {
                if (err) {
                    console.error(
                        `Failed to subscribe to topic ${topic}: ${err.message}`
                    );
                }
            });
        });

        client.on('error', (error) => {
            console.error('Connection error: ', error);
        });

        client.on("message", (topic, message) => {
            const jsonMessage: Modes = JSON.parse(message.toString());
            setCurrentModes(jsonMessage);
        });

        setMqttClient(client);
    }, [mqttUrl]);

    function changeMode(mode: string, kwargs: ModeState) {
        if (!mqttClient) {
            console.error("MQTT client not initialized");
            return;
        }

        mqttClient.publish("lights/rpc/request/set_mode/a", JSON.stringify({ mode: mode, kwargs: kwargs }))
    };

    return (
        <SetMqttUrlContext.Provider value={setMqttUrl}>
            <CurrentModesContext.Provider value={currentModes}>
                <ChangeModeContext.Provider value={changeMode}>
                    {children}
                </ChangeModeContext.Provider>
            </CurrentModesContext.Provider>
        </SetMqttUrlContext.Provider>
    );
};

export function useCurrentModes() {
    const context = React.useContext(CurrentModesContext);
    if (!context) {
        throw new Error('useCurrentModes must be used within a ModeProvider');
    }
    return context;
}

export function useChangeMode() {
    const context = React.useContext(ChangeModeContext);
    if (!context) {
        throw new Error('useChangeMode must be used within a ModeProvider');
    }
    return context;
}

export function useSetMqttUrl() {
    const context = React.useContext(SetMqttUrlContext);
    if (!context) {
        throw new Error('useSetMqttUrl must be used within a ModeProvider');
    }
    return context;
}