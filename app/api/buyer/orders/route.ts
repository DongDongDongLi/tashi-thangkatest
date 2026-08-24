import { NextResponse } from "next/server";
import { requireBuyer } from "@/lib/buyer-auth";
import { getOrdersByUserId, isOrderStoreConfigured } from "@/lib/order-store";

export const dynamic = "force-dynamic";

export async function GET() {
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

  const orders = await getOrdersByUserId(auth.user.id);
  return NextResponse.json({ orders });
}
