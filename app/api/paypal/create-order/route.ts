import { NextResponse } from "next/server";
import { createPayPalOrder, isPayPalConfigured } from "@/lib/paypal";
import { getProductBySlug } from "@/lib/products";

export async function POST(request: Request) {
  try {
    if (!isPayPalConfigured()) {
      return NextResponse.json(
        { error: "PayPal is not configured" },
        { status: 503 }
      );
    }

    const body = (await request.json()) as { slug?: string };
    if (!body.slug) {
      return NextResponse.json({ error: "Missing product slug" }, { status: 400 });
    }

    const product = await getProductBySlug(body.slug);
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }
    if (!product.inStock) {
      return NextResponse.json({ error: "Product is sold out" }, { status: 400 });
    }

    // Always use server-side price — never trust client amounts
    const order = await createPayPalOrder({
      slug: product.slug,
      name: product.name,
      price: product.price,
    });

    return NextResponse.json({ id: order.id });
  } catch (error) {
    console.error("PayPal create-order error:", error);
    return NextResponse.json(
      { error: "Failed to create PayPal order" },
      { status: 500 }
    );
  }
}
