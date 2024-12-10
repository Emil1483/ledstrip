import { LedstripResponse } from "@/app/api/ledstrips/[id]/route";
import {
    clerkMiddleware,
    ClerkMiddlewareAuth,
    createRouteMatcher,
} from "@clerk/nextjs/server";
import { NextRequest } from "next/server";

const isUserRoute = createRouteMatcher(["/api/users/:id/:path*"]);
const isLedstripRoute = createRouteMatcher(["/api/ledstrips/:id/:path*"]);
const isAdminRoute = createRouteMatcher(["/api/ledstrips/:id"]);

const isApiRoute = createRouteMatcher(["/api/:path*"]);
const isAuthRoute = createRouteMatcher(["/sign-in", "/sign-up"]);

async function getUserId(auth: ClerkMiddlewareAuth, req: NextRequest) {
    const accessToken = req.headers.get("X-Access-Token");
    if (accessToken) {
        const host = process.env.CONTAINER_HOST || "localhost";
        const port = process.env.PORT || 3000;
        const baseUrl = `http://${host}:${port}`;

        const response = await fetch(`${baseUrl}/api/tokens/${accessToken}`, {
            headers: {
                Authorization: process.env.API_KEY!,
            },
        });

        if (response.ok) {
            const { userId } = await response.json();
            return userId;
        } else {
            console.error(await response.json(), response.status);
        }
    }

    const { userId } = await auth();
    return userId;
}

export default clerkMiddleware(async (auth, req) => {
    if (!process.env.API_KEY) {
        console.error("Missing environment variable API_KEY");
        return new Response("Server is misconfigured!", { status: 500 });
    }

    const apiKey = req.headers.get("X-API-Key");
    if (process.env.API_KEY == apiKey) {
        return;
    }

    if (isAuthRoute(req)) {
        return;
    }

    if (isAdminRoute(req)) {
        return new Response("Invalid API Key", { status: 401 });
    }

    const { redirectToSignIn } = await auth();
    const userId = await getUserId(auth, req);

    if (isUserRoute(req)) {
        const parts = req.nextUrl.pathname.split("/");
        const paramsId = parts[3];
        if (userId !== paramsId) {
            return new Response("Unauthorized", { status: 401 });
        }
        return;
    }

    if (isLedstripRoute(req)) {
        if (!userId) {
            return new Response("Unauthorized", { status: 401 });
        }

        const parts = req.nextUrl.pathname.split("/");
        const paramsId = parts[3];

        const host = process.env.CONTAINER_HOST || "localhost";
        const port = process.env.PORT || 3000;
        const baseUrl = `http://${host}:${port}`;

        const response = await fetch(`${baseUrl}/api/ledstrips/${paramsId}`, {
            headers: {
                "X-API-Key": process.env.API_KEY,
            },
        });

        const ledstripData: LedstripResponse = await response.json();

        const user = ledstripData.users.find(
            (user) => user.ledstripData.id == userId
        );

        if (!user) {
            return new Response("Unauthorized: Not an owner", { status: 401 });
        }

        return;
    }

    if (!userId) {
        if (isApiRoute(req)) {
            return new Response("Unauthorized", { status: 401 });
        } else {
            return redirectToSignIn();
        }
    }
});

export const config = {
    matcher: ["/((?!.*\\..*|_next|api/mqtt).*)", "/"],
};
