import { Container, PortainerEnvironment } from "@/models/portainerModels";
import * as cookie from "cookie";
import { GetServerSidePropsContext, PreviewData } from "next";
import { ParsedUrlQuery } from "querystring";

export class InvalidPortainerToken extends Error {}

export function getPortainerJwtTokenFromCookie(
    context: GetServerSidePropsContext<ParsedUrlQuery, PreviewData>
) {
    const { req } = context;
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
