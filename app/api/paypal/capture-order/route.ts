import { NextResponse } from "next/server";
import { requireBuyer } from "@/lib/buyer-auth";
import {
  getOrderByPayPalId,
  markOrderPaid,
} from "@/lib/order-store";
import { capturePayPalOrder, isPayPalConfigured } from "@/lib/paypal";

export async function POST(request: Request) {
  try {
    const auth = await requireBuyer();
    if (!auth.ok) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    if (!isPayPalConfigured()) {
      return NextResponse.json(
        { error: "PayPal is not configured" },
        { status: 503 }
      );
    }

    const body = (await request.json()) as {
      orderID?: string;
      internalOrderId?: string;
    };

    if (!body.orderID) {
      return NextResponse.json({ error: "Missing orderID" }, { status: 400 });
    }

    const existing = await getOrderByPayPalId(body.orderID);
    if (existing && existing.userId !== auth.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    if (existing?.status === "paid") {
      return NextResponse.json({
        id: existing.paypalOrderId,
        status: "COMPLETED",
        captureId: existing.paypalCaptureId,
        internalOrderId: existing.id,
        orderNumber: existing.orderNumber,
      });
    }

    const capture = await capturePayPalOrder(body.orderID);
    const captureId =
      capture.purchase_units?.[0]?.payments?.captures?.[0]?.id ?? capture.id;

    const orderId =
      body.internalOrderId || existing?.id || capture.purchase_units?.[0]?.reference_id;

    if (!orderId) {
      return NextResponse.json(
        { error: "Could not match internal order" },
        { status: 400 }
      );
    }

    const order = await markOrderPaid({
      orderId,
      paypalOrderId: body.orderID,
      paypalCaptureId: captureId,
    });

    if (order.userId !== auth.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    return NextResponse.json({
      id: capture.id,
      status: capture.status,
      captureId,
      internalOrderId: order.id,
      orderNumber: order.orderNumber,
    });
  } catch (error) {
    console.error("PayPal capture-order error:", error);
    return NextResponse.json(
      { error: "Failed to capture PayPal payment" },
      { status: 500 }
    );
  }
}
