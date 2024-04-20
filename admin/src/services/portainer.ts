import { Container, PortainerEnvironment } from "@/models/portainerModels";
import * as cookie from "cookie";
import { IncomingMessage } from "http";

export class InvalidPortainerToken extends Error {}

export function getPortainerJwtTokenFromCookie(
    req: IncomingMessage & {
        cookies: Partial<{
            [key: string]: string;
        }>;
    }
) {
    const unparsedCookies = req.headers.cookie!;
    const parsedCookies = cookie.parse(unparsedCookies);
    return parsedCookies.portainerJwtToken;
}

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

export async function fetchContainers(
    token: string,
    environmentId: string
): Promise<Container[]> {
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

    return response.json();
}

export async function stopContainer(
    token: string,
    environmentId: string,
    containerId: string
): Promise<void> {
    const PORTAINER_URL = process.env.PORTAINER_URL;
    const response = await fetch(
        `${PORTAINER_URL}/api/endpoints/${environmentId}/docker/containers/${containerId}/stop`,
        {
            method: "POST",
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

export async function startContainer(
    token: string,
    environmentId: string,
    containerId: string
): Promise<void> {
    const PORTAINER_URL = process.env.PORTAINER_URL;
    const response = await fetch(
        `${PORTAINER_URL}/api/endpoints/${environmentId}/docker/containers/${containerId}/start`,
        {
            method: "POST",
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
