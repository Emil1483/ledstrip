function getApiBaseUrl(): string {
    if (process.env.API_URL) {
        return `${process.env.API_URL}`;
    } else {
        return "/api";
    }
}

export async function getModes(): Promise<Modes> {
    const response = await fetch(`${getApiBaseUrl()}/modes`);
    if (!response.ok) {
        throw new Error("Failed to fetch modes");
    }

    return await response.json();
}

export async function setMode(params: {
    mode: string;
    kwargs: ModeState;
}): Promise<string> {
    const { mode, kwargs } = params;

    const response = await fetch(`${getApiBaseUrl()}/modes`, {
        method: "POST",
        body: JSON.stringify({
            mode: mode,
            kwargs: kwargs,
        }),
    });

    if (!response.ok) {
        throw new Error(await response.text());
    }

    return await response.text();
}
