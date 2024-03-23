import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    res.status(405).end("Method Not Allowed");
    return;
  }

  try {
    const response = await fetch(`${process.env.API_URL}/modes`, {
      method: "POST",
      body: req.body,
    });

    const responseContentType = response.headers.get("Content-Type");
    if (responseContentType) {
      res.setHeader("Content-Type", responseContentType);
    }

    res.status(response.status).send(await response.text());
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
