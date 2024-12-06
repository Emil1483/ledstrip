import { prisma } from "@/services/prismaService";
import { NextRequest, NextResponse } from "next/server";
import { PushSubscription as WebPushSubscription } from "web-push";
import webpush from "web-push";

export async function POST(request: NextRequest, { params }: any) {
    webpush.setVapidDetails(
        "mailto:emil@djupvik.dev",
        process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
        process.env.VAPID_PRIVATE_KEY!
    );

    try {
        const ledstripId = params.id;

        const { title, message } = await request.json();

        if (!message) {
            return NextResponse.json(
                { error: "message is required" },
                { status: 400 }
            );
        }

        if (!title) {
            return NextResponse.json(
                { error: "title is required" },
                { status: 400 }
            );
        }

        const ledstrip = await prisma.ledstrip.findUnique({
            where: {
                id: ledstripId,
            },
            include: {
                owners: {
                    include: {
                        notificationSubscriptions: true,
                    },
                },
            },
        });

        if (!ledstrip) {
            return NextResponse.json(
                { error: "LED strip not found" },
                { status: 404 }
            );
        }

        const result: { [userId: string]: boolean } = {};

        for (const owner of ledstrip.owners) {
            result[owner.id] = false;
            const subscriptions = owner.notificationSubscriptions;
            if (subscriptions.length == 0) {
                console.warn(
                    `Owner ${owner.id} has no notification subscriptions`
                );
            }

            for (const subscription of subscriptions) {
                const sub: WebPushSubscription = {
                    endpoint: subscription.endpoint,
                    keys: {
                        auth: subscription.auth,
                        p256dh: subscription.p256dh,
                    },
                };

                console.log("Sending notification to", sub);

                try {
                    await webpush.sendNotification(
                        sub,
                        JSON.stringify({
                            title: title,
                            body: message,
                            icon: "/icon-192x192.png",
                        })
                    );
                    result[owner.id] = true;
                } catch (error) {
                    console.error(
                        `Failed to send notification to ${owner.id}`,
                        error
                    );
                }
            }
        }

        return NextResponse.json(result);
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { error: "An error occurred" },
            { status: 500 }
        );
    }
}
