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
        const { username, password } = req.body;
        const response = await fetch("https://portainer.djupvik.dev/api/auth", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ Username: username, Password: password }),
        });

        if (response.ok) {
            res.status(200).json(await response.json());
        } else {
            res.status(401).json({
                success: false,
                message: "Invalid username or password",
            });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "An error occurred" });
    }
}
