import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isUserRoute = createRouteMatcher(["/api/users/:id/:path*"]);

const isSenseiveApiRoute = createRouteMatcher([
    "/api/users/:path*",
    "/api/ledstrips/:path*",
]);
const isApiRoute = createRouteMatcher(["/api/:path*"]);
const isAuthRoute = createRouteMatcher(["/sign-in", "/sign-up"]);

export default clerkMiddleware((auth, req) => {
    const apiKey = req.headers.get("X-API-Key");
    if (process.env.API_KEY == apiKey) {
        return;
    }

    if (isAuthRoute(req)) {
        return;
    }

    if (isUserRoute(req)) {
        const parts = req.nextUrl.pathname.split("/");
        const paramsId = parts[3];
        if (auth().userId !== paramsId) {
            return new Response("Unauthorized", { status: 401 });
        }
        return;
    }

    if (isSenseiveApiRoute(req)) {
        return new Response("Invalid API Key", { status: 401 });
    }

    if (!auth().userId) {
        if (isApiRoute(req)) {
            return new Response("Unauthorized", { status: 401 });
        } else {
            return auth().redirectToSignIn();
        }
    }
});

export const config = {
    matcher: ["/((?!.*\\..*|_next|api/mqtt).*)", "/"],
};
