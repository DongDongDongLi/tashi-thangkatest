import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { buildProductFromBody } from "@/lib/admin-product";
import {
  deleteProduct,
  getProductBySlug,
  upsertProduct,
} from "@/lib/products";
import type { Product } from "@/lib/products";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ slug: string }> };

export async function GET(_request: Request, context: Ctx) {
  const auth = await requireAdmin();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  const { slug } = await context.params;
  const product = await getProductBySlug(slug);
  if (!product) {
    return NextResponse.json({ error: "未找到商品" }, { status: 404 });
  }
  return NextResponse.json({ product });
}

export async function PUT(request: Request, context: Ctx) {
  const auth = await requireAdmin();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const { slug } = await context.params;
    const existing = await getProductBySlug(slug);
    if (!existing) {
      return NextResponse.json({ error: "未找到商品" }, { status: 404 });
    }

    const body = (await request.json()) as Partial<Product>;
    const product = buildProductFromBody(body, existing);

    if (!product.name) {
      return NextResponse.json({ error: "商品名称必填" }, { status: 400 });
    }
    if (!Number.isFinite(product.price) || product.price < 0) {
      return NextResponse.json({ error: "价格无效" }, { status: 400 });
    }
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

export async function DELETE(_request: Request, context: Ctx) {
  const auth = await requireAdmin();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const { slug } = await context.params;
    const products = await deleteProduct(slug);
    return NextResponse.json({ products });
  } catch (error) {
    const message = error instanceof Error ? error.message : "删除失败";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
