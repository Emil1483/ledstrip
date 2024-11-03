import { MessageFromWS, MessageToWS } from "@/models/mqtt";
import { assert } from "console";
import cookie from "cookie";
import jwt, { JsonWebTokenError } from "jsonwebtoken";
import mqtt from "mqtt";

const publicKey = process.env.CLERK_PEM_PUBLIC_KEY!;
const mqttUrl = process.env.MQTT_URL!;
const mqttUsername = process.env.MQTT_USERNAME;
const mqttPassword = process.env.MQTT_PASSWORD;

function sendFromWS(client: import("ws").WebSocket, message: MessageFromWS) {
    client.send(JSON.stringify(message));
}

export async function SOCKET(
    client: import("ws").WebSocket,
    request: import("http").IncomingMessage,
    server: import("ws").WebSocketServer
) {
    if (!publicKey) {
        console.error("Missing environment variable CLERK_PEM_PUBLIC_KEY");
        sendFromWS(client, {
            type: "error",
            error: "Server is misconfigured!",
        });
        client.close(1011);
    }

    if (!mqttUrl) {
        console.error("Missing environment variable MQTT_URL");
        sendFromWS(client, {
            type: "error",
            error: "Server is misconfigured!",
        });
        client.close(1011);
    }

    if (!request.headers.cookie) {
        sendFromWS(client, {
            type: "error",
            error: "No cookie found!",
        });
        client.close(3000);
        return;
    }

    const c = cookie.parse(request.headers.cookie);
    const token = c.__session;

    if (!token) {
        sendFromWS(client, {
            type: "error",
            error: "No __session found in cookie!",
        });
        client.close(3000);
        return;
    }

    try {
        const decoded = jwt.verify(token, publicKey) as jwt.JwtPayload;

        if (!decoded.exp) {
            sendFromWS(client, {
                type: "error",
                error: "No expiration found in token!",
            });
            client.close(3000);
            return;
        }

        if (decoded.exp * 1000 < Date.now()) {
            sendFromWS(client, {
                type: "error",
                error: "Token expired!",
            });
            client.close(3000);
            return;
        }

        console.log(`Connecting to MQTT broker at ${mqttUrl}`);

        const mqttClient = mqtt.connect(mqttUrl, {
            username: mqttUsername,
            password: mqttPassword,
        });

        mqttClient.on("connect", () => {
            client.on("close", () => {
                console.log("A client disconnected!");
                mqttClient.end();
            });

            client.on("message", async (message) => {
                const wsMessage: MessageToWS = JSON.parse(message.toString());
                if (wsMessage.method == "subscribe") {
                    mqttClient.subscribe(wsMessage.topic, (err) => {
                        if (!wsMessage.requestId) return;
                        if (err) {
                            sendFromWS(client, {
                                type: "response",
                                requestId: wsMessage.requestId,
                                response: `Failed to subscribe to topic ${wsMessage.topic}: ${err.message}`,
                                statusCode: 500,
                            });
                        } else {
                            sendFromWS(client, {
                                type: "response",
                                requestId: wsMessage.requestId,
                                response: "OK",
                                statusCode: 200,
                            });
                        }
                    });
                } else if (wsMessage.method == "unsubscribe") {
                    mqttClient.unsubscribe(wsMessage.topic, (err) => {
                        if (!wsMessage.requestId) return;
                        if (err) {
                            sendFromWS(client, {
                                type: "response",
                                requestId: wsMessage.requestId,
                                response: `Failed to unsubscribe to topic ${wsMessage.topic}: ${err.message}`,
                                statusCode: 500,
                            });
                        } else {
                            sendFromWS(client, {
                                type: "response",
                                requestId: wsMessage.requestId,
                                response: "OK",
                                statusCode: 200,
                            });
                        }
                    });
                } else if (wsMessage.method == "publish") {
                    mqttClient.publish(
                        wsMessage.topic,
                        wsMessage.message,
                        (err) => {
                            if (!wsMessage.requestId) return;
                            if (err) {
                                sendFromWS(client, {
                                    type: "response",
                                    requestId: wsMessage.requestId,
                                    response: `Failed to publish to topic ${wsMessage.topic}: ${err.message}`,
                                    statusCode: 500,
                                });
                            } else {
                                sendFromWS(client, {
                                    type: "response",
                                    requestId: wsMessage.requestId,
                                    response: "OK",
                                    statusCode: 200,
                                });
                            }
                        }
                    );
                }
            });

            sendFromWS(client, {
                type: "MQTTReady",
            });
        });

        mqttClient.on("error", (error) => {
            console.error("Connection error: ", error);
            client.close(1014);
        });

        mqttClient.on("message", (topic, message) => {
            let m = message.toString();
            try {
                m = JSON.parse(m);
            } catch (e) {}

            sendFromWS(client, {
                type: "MQTTMessage",
                message: m,
                topic: topic,
            });
        });
    } catch (e) {
        if (e instanceof JsonWebTokenError) {
            sendFromWS(client, {
                type: "error",
                error: "Invalid token!",
            });
            client.close(3000);
            return;
        }

        console.error(e);
    }
}
