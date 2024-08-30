import { assert } from "console";
import cookie from "cookie";
import jwt, { JsonWebTokenError } from "jsonwebtoken";
import mqtt from "mqtt";

const publicKey = process.env.CLERK_PEM_PUBLIC_KEY!;
const mqttUrl = process.env.MQTT_URL!;
const mqttUsername = process.env.MQTT_USERNAME;
const mqttPassword = process.env.MQTT_PASSWORD;

export async function SOCKET(
    client: import("ws").WebSocket,
    request: import("http").IncomingMessage,
    server: import("ws").WebSocketServer
) {
    console.log("A client connected!");

    if (!publicKey) {
        console.error("Missing environment variable CLERK_PEM_PUBLIC_KEY");
        client.send("Server is misconfigured!");
        client.close();
    }

    if (!mqttUrl) {
        console.error("Missing environment variable MQTT_URL");
        client.send("Server is misconfigured!");
        client.close();
    }

    if (!request.headers.cookie) {
        client.send("No cookie found!");
        client.close();
        return;
    }

    const c = cookie.parse(request.headers.cookie);
    const token = c.__session;

    if (!token) {
        client.send("No __session found in cookie!");
        client.close();
        return;
    }

    try {
        const decoded = jwt.verify(token, publicKey) as jwt.JwtPayload;

        if (!decoded.exp) {
            client.send("No expiration found in token!");
            client.close();
            return;
        }

        if (decoded.exp * 1000 < Date.now()) {
            client.send("Token expired!");
            client.close();
            return;
        }

        console.log(`Connecting to MQTT broker at ${mqttUrl}`);

        const mqttClient = mqtt.connect(mqttUrl, {
            username: mqttUsername,
            password: mqttPassword,
        });

        mqttClient.on("connect", () => {
            console.log("Connected to MQTT broker!");
            client.on("close", () => {
                console.log("A client disconnected!");
                mqttClient.end();
            });

            client.on("message", (message) => {
                const json = JSON.parse(message.toString());
                assert(json.topic && json.message);
                console.log(
                    `Publishing message to topic ${json.topic}: ${json.message}`
                );
                const messageBuffer = Buffer.from(json.message, "utf8");
                console.log(messageBuffer);
                mqttClient.publish(json.topic, messageBuffer);
            });

            const topic = "lights/0/#";

            mqttClient.subscribe(topic, (err) => {
                if (err) {
                    console.error(
                        `Failed to subscribe to topic ${topic}: ${err.message}`
                    );
                    client.close();
                }
            });
        });

        mqttClient.on("error", (error) => {
            console.error("Connection error: ", error);
            client.close();
        });

        mqttClient.on("message", (topic, message) => {
            console.log(`Received message from topic ${topic}: ${message}`);

            let m = message.toString();
            try {
                m = JSON.parse(m);
            } catch (e) {}

            client.send(JSON.stringify({ topic, message: m }));
        });
    } catch (e) {
        if (e instanceof JsonWebTokenError) {
            client.send("Invalid token!");
            client.close();
            return;
        }

        console.error(e);
    }
}
