import { PortainerEnvironment } from "@/models/portainerModels";

export class InvalidPortainerToken extends Error {}

export async function fetchEnvironments(
    token: string
): Promise<PortainerEnvironment[]> {
    const PORTAINER_URL = process.env.PORTAINER_URL;
    const response = await fetch(`${PORTAINER_URL}/api/endpoints`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
    });

    if (response.status == 401) {
        throw new InvalidPortainerToken();
    }

    return response.json();
}

export async function getContainers(token: string, environmentId: string) {
    const PORTAINER_URL = process.env.PORTAINER_URL;
    const response = await fetch(
        `${PORTAINER_URL}/api/endpoints/${environmentId}/docker/containers/json?all=true`,
        {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
        }
    );

    if (response.status == 401) {
        throw new InvalidPortainerToken();
    }
}
