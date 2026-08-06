import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
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
    const price = Number(body.price ?? existing.price);
    if (!Number.isFinite(price) || price < 0) {
      return NextResponse.json({ error: "价格无效" }, { status: 400 });
    }

    const product: Product = {
      ...existing,
      ...body,
      slug: existing.slug,
      name: (body.name ?? existing.name).trim(),
      shortDescription: (body.shortDescription ?? existing.shortDescription).trim(),
      description: (body.description ?? existing.description).trim(),
      price,
      compareAtPrice:
        body.compareAtPrice === undefined
          ? existing.compareAtPrice
          : body.compareAtPrice === null || body.compareAtPrice === ("" as unknown)
            ? undefined
            : Number(body.compareAtPrice),
      category: (body.category ?? existing.category).trim(),
      deity: (body.deity ?? existing.deity).trim(),
      size: (body.size ?? existing.size).trim(),
      material: (body.material ?? existing.material).trim(),
      origin: (body.origin ?? existing.origin).trim(),
      inStock: body.inStock ?? existing.inStock,
      featured: body.featured ?? existing.featured,
      image: (body.image ?? existing.image).trim(),
      images: Array.isArray(body.images)
        ? body.images.filter(Boolean)
        : existing.images,
      tags: Array.isArray(body.tags) ? body.tags.filter(Boolean) : existing.tags,
    };

    if (
      product.compareAtPrice !== undefined &&
      !Number.isFinite(product.compareAtPrice)
    ) {
      return NextResponse.json({ error: "对比价无效" }, { status: 400 });
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
