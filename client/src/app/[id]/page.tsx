import React from "react";
import { auth } from "@clerk/nextjs/server";
import { fetchSavedStates } from "@/services/users";
import { MQTTProvider } from "@/contexts/MQTTContext";
import { LedStripsProvider } from "@/contexts/LedStripsContext";
import ModesComponent from "@/components/ModesComponent";


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



export default async function Page(context: any) {
    const { initialSavedStates } = await fetchData();
    return <MQTTProvider>
        <LedStripsProvider id={context.params.id}>
            <ModesComponent initialSavedStates={initialSavedStates!} />
        </LedStripsProvider>
    </MQTTProvider>
}