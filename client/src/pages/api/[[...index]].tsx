import { NextApiRequest, NextApiResponse } from "next";
import httpProxy from "http-proxy";
import { getAuth } from "@clerk/nextjs/server";

const proxy = httpProxy.createProxyServer();

export const config = {
    api: {
        bodyParser: false,
        externalResolver: true,
    },
};

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const { userId } = getAuth(req);

    if (!userId) {
        return res.status(401).json({ error: "Not authenticated" });
    }

    try {
        await proxy.web(req, res, {
            target: process.env.API_URL,
            changeOrigin: true,
        });
    } catch (err) {
        res.status(500).end(err);
    }
}