import { getPortainerJwtTokenFromCookie, startContainer } from "@/services/portainer";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== "POST") {
        res.status(405).json({ success: false, message: "Method Not Allowed" });
        return;
    }
    try {
        const { containers } = req.body;
        const { environmentId } = req.query
        const token = getPortainerJwtTokenFromCookie(req);

        if (typeof containers !== 'object') {
            res.status(400).json({ success: false, message: "Invalid request. containers must be an array of container ids" });
            return;
        }

        await Promise.all(
            (containers as string[]).map(c => startContainer(token, environmentId as string, c)),
        );
        res.status(200).json({ success: true, message: "Containers stopped" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "An error occurred" });
    }
}
