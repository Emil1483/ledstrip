import { ensureUser, saveState } from "@/services/users";
import { getAuth } from "@clerk/nextjs/server";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method === "POST") {
        try {
            const { userId } = getAuth(req);

            if (!userId) {
                return res.status(401).json({ error: "Unauthorized" });
            }

            const { mode, state } = req.body;

            await ensureUser(userId);
            const savedStates = await saveState(userId, mode, state);

            return res.status(200).json(savedStates);
        } catch (error) {
            console.error(error);
            return res.status(500).json({
                error: "An error occurred while saving the state",
            });
        }
    } else {
        return res.status(405).json({ error: "Method not allowed" });
    }
}
