import { LedstripResponse } from "@/app/api/ledstrips/[id]/route";
import { prisma } from "@/services/prismaService";
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isUserRoute = createRouteMatcher(["/api/users/:id/:path*"]);
const isLedstripRoute = createRouteMatcher(["/api/ledstrips/:id/:path*"]);
const isAdminRoute = createRouteMatcher(["/api/ledstrips/:id"]);

const isApiRoute = createRouteMatcher(["/api/:path*"]);
const isAuthRoute = createRouteMatcher(["/sign-in", "/sign-up"]);

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

    const { userId, redirectToSignIn } = await auth();

    if (isUserRoute(req)) {
        const parts = req.nextUrl.pathname.split("/");
        const paramsId = parts[3];
        if (userId !== paramsId) {
            return new Response("Unauthorized", { status: 401 });
        }
        return;
    }

    if (isLedstripRoute(req)) {
        const parts = req.nextUrl.pathname.split("/");
        const paramsId = parts[3];

        const response = await fetch(
            `${req.nextUrl.origin}/api/ledstrips/${paramsId}`,
            {
                headers: {
                    "X-API-Key": process.env.API_KEY,
                },
            }
        );
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
