import React from "react";
import { ModesProvider } from "@/contexts/ModesContext";
import ModesComponent from "@/components/ModesComponent";

export default async function Page(context: any) {
    return <ModesProvider id={context.params.id}>
        <ModesComponent />
    </ModesProvider>

}