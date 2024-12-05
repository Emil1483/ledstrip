"use server";

// TODO: move this to /api so we can send notifications from adimin panel

import webpush from "web-push";

webpush.setVapidDetails(
    "mailto:emil@djupvik.dev",
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!
);

export async function registerUser(sub: PushSubscription) {
    console.log(sub);
    return { success: true };
}

// export async function sendNotification(message: string) {
//     try {
//         await webpush.sendNotification(
//             subscription,
//             JSON.stringify({
//                 title: "Test Notification",
//                 body: message,
//                 icon: "/icon.png",
//             })
//         );
//         return { success: true };
//     } catch (error) {
//         console.error("Error sending push notification:", error);
//         return { success: false, error: "Failed to send notification" };
//     }
// }
