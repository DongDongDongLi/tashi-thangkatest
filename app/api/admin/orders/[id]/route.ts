import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import {
  createAfterShipTracking,
  getAfterShipTracking,
} from "@/lib/aftership";
import {
  getOrderById,
  markOrderShipped,
  updateOrderStatus,
  isOrderStoreConfigured,
} from "@/lib/order-store";
import type { OrderStatus } from "@/lib/order-types";
import { getUserById } from "@/lib/buyer-auth";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: Ctx) {
  const auth = await requireAdmin();
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
  const order = await getOrderById(id);
  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  const buyer = await getUserById(order.userId);
  let tracking = null;
  if (order.carrierSlug && order.trackingNumber) {
    tracking = await getAfterShipTracking(
      order.carrierSlug,
      order.trackingNumber
    );
  }

  return NextResponse.json({ order, buyer, tracking });
}

export async function PATCH(request: Request, context: Ctx) {
  const auth = await requireAdmin();
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
  const body = (await request.json()) as {
    status?: OrderStatus;
    carrierSlug?: string;
    trackingNumber?: string;
    ship?: boolean;
  };

  const order = await getOrderById(id);
  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  if (body.status && !body.ship) {
    const updated = await updateOrderStatus(id, body.status);
    return NextResponse.json({ order: updated });
  }

  if (body.ship || (body.carrierSlug && body.trackingNumber)) {
    const carrierSlug = String(body.carrierSlug || "").trim();
    const trackingNumber = String(body.trackingNumber || "").trim();

    if (!carrierSlug || !trackingNumber) {
      return NextResponse.json(
        { error: "Carrier and tracking number are required" },
        { status: 400 }
      );
    }

    const buyer = await getUserById(order.userId);
    let aftershipId: string | undefined;
    let trackingTag: string | undefined;
    let trackingStatus: string | undefined;

    try {
      const created = await createAfterShipTracking({
        slug: carrierSlug,
        trackingNumber,
        orderNumber: order.orderNumber,
        customerEmail: buyer?.email,
        customerName: buyer?.name,
      });
      if (created) {
        aftershipId = created.id;
        trackingTag = created.tag;
        trackingStatus = created.tag;
      }
    } catch (error) {
      console.error("AfterShip create tracking:", error);
    }

    const updated = await markOrderShipped({
      orderId: id,
      carrierSlug,
      trackingNumber,
      aftershipId,
      trackingStatus,
      trackingTag,
    });

    return NextResponse.json({ order: updated });
  }

  return NextResponse.json({ error: "No valid update" }, { status: 400 });
}
