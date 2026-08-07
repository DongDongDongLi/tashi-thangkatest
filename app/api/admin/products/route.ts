import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { buildProductFromBody } from "@/lib/admin-product";
import {
  canPersistProducts,
  getProducts,
  upsertProduct,
  slugify,
} from "@/lib/products";
import type { Product } from "@/lib/products";

export const dynamic = "force-dynamic";

export async function GET() {
  const auth = await requireAdmin();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  const products = await getProducts();
  return NextResponse.json({
    products,
    canPersist: canPersistProducts(),
  });
}

export async function POST(request: Request) {
  const auth = await requireAdmin();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const body = (await request.json()) as Partial<Product>;
    const name = (body.name || "").trim();
    if (!name) {
      return NextResponse.json({ error: "商品名称必填" }, { status: 400 });
    }

    const slug = (body.slug || slugify(name)).trim();
    const existing = await getProducts();
    if (existing.some((p) => p.slug === slug)) {
      return NextResponse.json({ error: "slug 已存在" }, { status: 400 });
    }

    const price = Number(body.price);
    if (!Number.isFinite(price) || price < 0) {
      return NextResponse.json({ error: "价格无效" }, { status: 400 });
    }

    const product = buildProductFromBody({ ...body, slug, name, price });
    if (
      product.compareAtPrice !== undefined &&
      !Number.isFinite(product.compareAtPrice)
    ) {
      return NextResponse.json({ error: "对比价无效" }, { status: 400 });
    }

    for (const v of product.variants || []) {
      if (!Number.isFinite(v.price) || v.price < 0) {
        return NextResponse.json(
          { error: `款式「${v.name}」价格无效` },
          { status: 400 }
        );
      }
    }

    const products = await upsertProduct(product);
    return NextResponse.json({ product, products });
  } catch (error) {
    const message = error instanceof Error ? error.message : "保存失败";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
