import React from "react";
import { auth } from "@clerk/nextjs/server";
import { fetchSavedStates } from "@/services/users";
import { HomeComponent } from '@/components/HomeComponent';


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

    return <HomeComponent initialSavedStates={initialSavedStates!} />;
}