import mqtt from "mqtt";
import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidV4 } from "uuid";

const mqttUrl = process.env.MQTT_URL!;
const mqttUsername = process.env.MQTT_USERNAME;
const mqttPassword = process.env.MQTT_PASSWORD;

export async function POST(request: NextRequest, { params }: any) {
    const ledstripId = params.id;

    try {
        const message = await request.json();

        const mqttClient = mqtt.connect(mqttUrl, {
            username: mqttUsername,
            password: mqttPassword,
        });

        const topic = `lights/${ledstripId}/set_mode`;
        const replyTopic = uuidV4();

        await mqttClient.subscribeAsync(replyTopic);
        let result = undefined;

        mqttClient.on("message", (_, message) => {
            result = JSON.parse(message.toString());
        });

        await mqttClient.publishAsync(
            topic,
            JSON.stringify({ reply_topic: replyTopic, kwargs: message })
        );

        const start = Date.now();
        while (result === undefined) {
            await new Promise((resolve) => setTimeout(resolve, 100));
            if (Date.now() - start > 5000) {
                return NextResponse.json(
                    { error: "Timeout while waiting for response from MQTT" },
                    { status: 500 }
                );
            }
        }

        return NextResponse.json(result);
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { error: "An error occurred while connecting to MQTT" },
            { status: 500 }
        );
    }
}
