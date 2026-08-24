import { NextResponse } from "next/server";
import { requireBuyer } from "@/lib/buyer-auth";
import { getAfterShipTracking } from "@/lib/aftership";
import { getOrderForUser, isOrderStoreConfigured } from "@/lib/order-store";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: Ctx) {
  const auth = await requireBuyer();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  if (!isOrderStoreConfigured()) {
    return NextResponse.json(
      { error: "DATABASE_URL is not configured" },
      { status: 503 }
    );
  }

  const { id } = await context.params;
  const order = await getOrderForUser(id, auth.user.id);
  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  let tracking = null;
  if (order.carrierSlug && order.trackingNumber) {
    tracking = await getAfterShipTracking(
      order.carrierSlug,
      order.trackingNumber
    );
  }

  return NextResponse.json({ order, tracking });
}
