import webpush from "web-push";

webpush.setVapidDetails(
    "mailto:emil@djupvik.dev",
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!
);
