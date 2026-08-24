import { NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";
import {
  getAllOrders,
  updateOrderTracking,
} from "@/lib/order-store";
import { mapAfterShipTagToOrderStatus } from "@/lib/aftership";

export const dynamic = "force-dynamic";

function verifyWebhookSignature(rawBody: string, signature: string | null) {
  const secret = process.env.AFTERSHIP_WEBHOOK_SECRET;
  if (!secret || !signature) return !secret;
  const expected = createHmac("sha256", secret).update(rawBody).digest("base64");
  try {
    return timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const signature =
      request.headers.get("aftership-hmac-sha256") ||
      request.headers.get("x-aftership-hmac-sha256");

    if (process.env.AFTERSHIP_WEBHOOK_SECRET && !verifyWebhookSignature(rawBody, signature)) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const payload = JSON.parse(rawBody) as {
      event?: string;
      msg?: {
        id?: string;
        tag?: string;
        subtag_message?: string;
        order_id?: string;
        tracking_number?: string;
        slug?: string;
      };
    };

    const msg = payload.msg;
    if (!msg?.order_id) {
      return NextResponse.json({ ok: true });
    }

    const orders = await getAllOrders();
    const order = orders.find((o) => o.orderNumber === msg.order_id);
    if (!order) {
      return NextResponse.json({ ok: true });
    }

    const tag = msg.tag || "";
    const statusMessage = msg.subtag_message || tag;
    const mappedStatus = mapAfterShipTagToOrderStatus(tag);

    await updateOrderTracking({
      orderId: order.id,
      trackingStatus: statusMessage,
      trackingTag: tag,
      status: mappedStatus,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("AfterShip webhook error:", error);
    return NextResponse.json({ error: "Webhook failed" }, { status: 500 });
  }
}
