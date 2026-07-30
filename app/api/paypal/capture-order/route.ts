import { NextResponse } from "next/server";
import { capturePayPalOrder, isPayPalConfigured } from "@/lib/paypal";

export async function POST(request: Request) {
  try {
    if (!isPayPalConfigured()) {
      return NextResponse.json(
        { error: "PayPal is not configured" },
        { status: 503 }
      );
    }

    const body = (await request.json()) as { orderID?: string };
    if (!body.orderID) {
      return NextResponse.json({ error: "Missing orderID" }, { status: 400 });
    }

    const capture = await capturePayPalOrder(body.orderID);
    const captureId =
      capture.purchase_units?.[0]?.payments?.captures?.[0]?.id ?? capture.id;

    return NextResponse.json({
      id: capture.id,
      status: capture.status,
      captureId,
    });
  } catch (error) {
    console.error("PayPal capture-order error:", error);
    return NextResponse.json(
      { error: "Failed to capture PayPal payment" },
      { status: 500 }
    );
  }
}
