import { NextResponse } from "next/server";
import { createPayPalOrder, isPayPalConfigured } from "@/lib/paypal";
import { getProductBySlug } from "@/lib/products";
import { resolvePurchaseOption } from "@/lib/product-types";

export async function POST(request: Request) {
  try {
    if (!isPayPalConfigured()) {
      return NextResponse.json(
        { error: "PayPal is not configured" },
        { status: 503 }
      );
    }

    const body = (await request.json()) as {
      slug?: string;
      variantId?: string;
    };
    if (!body.slug) {
      return NextResponse.json({ error: "Missing product slug" }, { status: 400 });
    }

    const product = await getProductBySlug(body.slug);
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const purchase = resolvePurchaseOption(product, body.variantId);
    if (!purchase.inStock) {
      return NextResponse.json({ error: "Product is sold out" }, { status: 400 });
    }

    const order = await createPayPalOrder({
      slug: product.slug,
      name: purchase.label,
      price: purchase.price,
    });

    return NextResponse.json({
      id: order.id,
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
