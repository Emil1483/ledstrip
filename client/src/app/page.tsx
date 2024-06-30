import React from "react";
import { auth } from "@clerk/nextjs/server";
import { fetchSavedStates } from "@/services/users";
import assert from "assert";
import { HomeComponent } from '@/components/homeComponent';


async function fetchData() {
    const { userId } = auth();


    if (!userId) {
        return {
            redirect: {
                destination: "/sign-in",
                permanent: false,
            },
        };
    }

    const mqttUrl = process.env.MQTT_URL;

    assert(mqttUrl, `environment variable MQTT_URL not set`)

    return {
        initialSavedStates: await fetchSavedStates(userId),
        mqttUrl: mqttUrl,
    };
}



export default async function Page() {
    const { initialSavedStates, mqttUrl } = await fetchData();

    return <HomeComponent initialSavedStates={initialSavedStates!} mqttUrl={mqttUrl!} />;
}