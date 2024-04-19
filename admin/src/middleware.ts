import { fetchEnvironments } from "@/services/portainer";
import { NextRequest, NextResponse } from "next/server";

async function isAuthorized(req: NextRequest) {
    const cookies = req.cookies;
    const token = cookies.get("portainerJwtToken")?.value;

    if (!token) {
        console.log("No Token");
        return false;
    }

    try {
        await fetchEnvironments(token);
        return true;
    } catch (error) {
        console.log("Invalid Token");
        return false;
    }
}

export default async function middleware(req: NextRequest) {
    if (!req.url) {
        return NextResponse.next();
    }

    const url = new URL(req.url);
    const path = url.pathname;

    if (path.startsWith("/login")) {
        return NextResponse.next();
    }

    if (path.startsWith("/api/login")) {
        return NextResponse.next();
    }

    if (await isAuthorized(req)) {
        return NextResponse.next();
    }

    if (path.startsWith("/api")) {
        return new NextResponse(JSON.stringify({ message: "Unauthorized" }), {
            status: 401,
            headers: { "Content-Type": "application/json" },
        });
    }

    url.pathname = "/login";
    return NextResponse.redirect(url);
}

export const config = {
    matcher: "/([^_]*$)",
};
