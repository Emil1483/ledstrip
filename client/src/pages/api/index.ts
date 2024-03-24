import { NextApiRequest, NextApiResponse } from "next";
import httpProxy from "http-proxy";

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
    try {
        await proxy.web(req, res, {
            target: process.env.API_URL,
            changeOrigin: true,
        });
    } catch (err) {
        res.status(500).end(err);
    }
}
