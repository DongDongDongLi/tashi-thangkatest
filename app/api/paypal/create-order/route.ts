import { NextResponse } from "next/server";
import { requireBuyer } from "@/lib/buyer-auth";
import {
  createPendingOrder,
  setOrderPayPalId,
} from "@/lib/order-store";
import { createPayPalOrder, isPayPalConfigured } from "@/lib/paypal";
import { getProductBySlug } from "@/lib/products";
import { resolvePurchaseOption } from "@/lib/product-types";
import type { ShippingAddress } from "@/lib/order-types";

function parseShipping(body: Record<string, unknown>): ShippingAddress | null {
  const shipping = body.shipping as Record<string, unknown> | undefined;
  if (!shipping) return null;

  const name = String(shipping.name || "").trim();
  const line1 = String(shipping.line1 || "").trim();
  const city = String(shipping.city || "").trim();
  const state = String(shipping.state || "").trim();
  const postal = String(shipping.postal || "").trim();
  const country = String(shipping.country || "US").trim().toUpperCase();

  if (!name || !line1 || !city || !state || !postal || !country) {
    return null;
  }

  return {
    name,
    phone: String(shipping.phone || "").trim() || undefined,
    line1,
    line2: String(shipping.line2 || "").trim() || undefined,
    city,
    state,
    postal,
    country,
  };
}

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
      slug?: string;
      variantId?: string;
      shipping?: Record<string, unknown>;
    };

    if (!body.slug) {
      return NextResponse.json({ error: "Missing product slug" }, { status: 400 });
    }

    const shipping = parseShipping(body);
    if (!shipping) {
      return NextResponse.json(
        { error: "Complete US shipping address is required" },
        { status: 400 }
      );
    }

    if (shipping.country !== "US") {
      return NextResponse.json(
        { error: "We currently ship to the United States only" },
        { status: 400 }
      );
    }

    const product = await getProductBySlug(body.slug);
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const purchase = resolvePurchaseOption(product, body.variantId);
    if (!purchase.inStock) {
      return NextResponse.json({ error: "Product is sold out" }, { status: 400 });
    }

    const variant = product.variants?.find((v) => v.id === purchase.variantId);

    const internalOrder = await createPendingOrder({
      userId: auth.user.id,
      productSlug: product.slug,
      productName: purchase.label,
      variantId: purchase.variantId,
      variantName: variant?.name,
      productImage: purchase.image || product.image,
      unitPrice: purchase.price,
      shipping,
    });

    const paypalOrder = await createPayPalOrder({
      slug: product.slug,
      name: purchase.label,
      price: purchase.price,
      internalOrderId: internalOrder.id,
      shipping: {
        name: shipping.name,
        line1: shipping.line1,
        line2: shipping.line2,
        city: shipping.city,
        state: shipping.state,
        postal: shipping.postal,
        country: shipping.country,
      },
    });

    await setOrderPayPalId(internalOrder.id, paypalOrder.id);

    return NextResponse.json({
      id: paypalOrder.id,
      internalOrderId: internalOrder.id,
      orderNumber: internalOrder.orderNumber,
      variantId: purchase.variantId,
      price: purchase.price,
    });
  } catch (error) {
    console.error("PayPal create-order error:", error);
    return NextResponse.json(
      { error: "Failed to create PayPal order" },
      { status: 500 }
    );
  }
}
