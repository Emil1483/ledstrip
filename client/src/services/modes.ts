import mqtt from "mqtt";

function getApiBaseUrl(): string {
    if (process.env.API_URL) {
        return `${process.env.API_URL}`;
    } else {
        return "/api";
    }
}

export async function fetchModes(): Promise<Modes> {
    return new Promise((resolve, reject) => {
        const client = mqtt.connect(
            `mqtt://${process.env.NEXT_PUBLIC_MQTT_HOST}:1883`
        );

        const topic = "lights/status";

        client.on("connect", () => {
            console.log("Connected to broker");
            client.subscribe(topic, (err) => {
                if (err) {
                    reject(
                        `Failed to subscribe to topic ${topic}: ${err.message}`
                    );
                }
            });
        });

        client.on("message", (topic, message) => {
            try {
                const jsonMessage: Modes = JSON.parse(message.toString());
                client.end(); // Close the connection after receiving the first message
                resolve(jsonMessage);
            } catch (error) {
                reject(`Failed to decode message: ${error}`);
            }
        });

        client.on("error", (err) => {
            reject(`MQTT client error: ${err.message}`);
        });
    });
}

export async function setMode(params: {
    mode: string;
    kwargs: ModeState;
}): Promise<string> {
    const { mode, kwargs } = params;

    const response = await fetch(`${getApiBaseUrl()}/modes`, {
        method: "POST",
        body: JSON.stringify({
            mode: mode,
            kwargs: kwargs,
        }),
    });

    if (!response.ok) {
        throw new Error(await response.text());
    }

    return await response.text();
}
