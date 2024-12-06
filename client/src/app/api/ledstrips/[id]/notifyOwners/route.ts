import { NextRequest, NextResponse } from "next/server";
import { PushSubscription as WebPushSubscription } from "web-push";

export async function POST(request: NextRequest, { params }: any) {
    try {
        const ledstripId = params.id;

        // const sub: WebPushSubscription = {
        //     endpoint: data.endpoint,
        //     keys: {
        //         auth: data.keys.auth,
        //         p256dh: data.keys.p256dh,
        //     },
        // };

        // TODO: notify all owners of ledstrip with payload in request

        return NextResponse.json({});
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { error: "An error occurred while fetching ledstrip" },
            { status: 500 }
        );
    }
}
