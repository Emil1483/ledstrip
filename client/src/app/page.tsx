import React from "react";
import { auth } from "@clerk/nextjs/server";
import { fetchSavedStates } from "@/services/users";
import { HomeComponent } from '@/components/HomeComponent';
import { ModesProvider } from "@/contexts/ModesContext";
import { MQTTProvider } from "@/contexts/MQTTContext";


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

    return {
        initialSavedStates: await fetchSavedStates(userId),
    };
}



export default async function Page() {
    const { initialSavedStates } = await fetchData();

    return <MQTTProvider>
        <ModesProvider>
            <HomeComponent initialSavedStates={initialSavedStates!} />
        </ModesProvider>
    </MQTTProvider>
}