import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isUserRoute = createRouteMatcher(["/api/users/:id/:path*"]);

const isSenseiveApiRoute = createRouteMatcher([
    "/api/users/:path*",
    "/api/ledstrips/:path*",
]);
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

    const { userId, redirectToSignIn } = await auth();

    if (isUserRoute(req)) {
        const parts = req.nextUrl.pathname.split("/");
        const paramsId = parts[3];
        if (userId !== paramsId) {
            return new Response("Unauthorized", { status: 401 });
        }
        return;
    }

    if (isSenseiveApiRoute(req)) {
        return new Response("Invalid API Key", { status: 401 });
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
