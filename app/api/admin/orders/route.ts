import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { getAllOrders, isOrderStoreConfigured } from "@/lib/order-store";

export const dynamic = "force-dynamic";

export async function GET() {
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

  const orders = await getAllOrders();
  return NextResponse.json({ orders });
}
