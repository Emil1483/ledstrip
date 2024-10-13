import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher(["/"]);

export default clerkMiddleware((auth, req) => {
    auth().getToken().then(console.log)
    if (!auth().userId && isProtectedRoute(req)) {
        return auth().redirectToSignIn();
    }
});

export const config = {
    matcher: ["/((?!.*\\..*|_next|api/mqtt).*)", "/"],
};
