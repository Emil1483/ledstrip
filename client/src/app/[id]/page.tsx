import React from "react";
import { auth } from "@clerk/nextjs/server";
import { fetchSavedStates } from "@/services/users";
import { ModesProvider } from "@/contexts/ModesContext";
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
    return <ModesProvider id={context.params.id}>
        <ModesComponent initialSavedStates={initialSavedStates!} />
    </ModesProvider>

}