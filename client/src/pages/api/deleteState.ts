import { ensureUser, deleteState } from "@/services/users";
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

            const { mode, index } = req.body;

            await ensureUser(userId);
            const savedStates = await deleteState(userId, mode, index);

            return res.status(200).json(savedStates);
        } catch (error) {
            console.error(error);
            return res.status(500).json({
                error: "An error occurred while deleting the saved state",
            });
        }
    } else {
        return res.status(405).json({ error: "Method not allowed" });
    }
}
