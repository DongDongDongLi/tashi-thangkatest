import type { Product, ProductVariant } from "@/lib/product-types";
import { createVariantId, normalizeProduct } from "@/lib/product-types";

export function parseVariants(input: unknown): ProductVariant[] {
  if (!Array.isArray(input)) return [];
  return input
    .filter((v) => v && typeof v === "object")
    .map((raw) => {
      const v = raw as Partial<ProductVariant>;
      return {
        id: (v.id && String(v.id)) || createVariantId(),
        name: String(v.name || "").trim(),
        price: Number(v.price) || 0,
        compareAtPrice:
          v.compareAtPrice === undefined ||
          v.compareAtPrice === null ||
          (v.compareAtPrice as unknown) === ""
            ? undefined
            : Number(v.compareAtPrice),
        inStock: v.inStock !== false,
        image: v.image ? String(v.image).trim() : undefined,
      };
    })
    .filter((v) => v.name);
}

export function buildProductFromBody(
  body: Partial<Product>,
  existing?: Product
): Product {
  const name = (body.name ?? existing?.name ?? "").trim();
  const price = Number(body.price ?? existing?.price ?? 0);
  const images = Array.isArray(body.images)
    ? body.images.filter(Boolean)
    : existing?.images || [];
  const image =
    (body.image ?? existing?.image ?? "").trim() || images[0] || "";

  const product = normalizeProduct({
    slug: (body.slug ?? existing?.slug ?? "").trim(),
    name,
    shortDescription: (
      body.shortDescription ??
      existing?.shortDescription ??
      ""
    ).trim(),
    description: (body.description ?? existing?.description ?? "").trim(),
    price,
    compareAtPrice:
      body.compareAtPrice === undefined
        ? existing?.compareAtPrice
        : body.compareAtPrice === null ||
            (body.compareAtPrice as unknown) === ""
          ? undefined
          : Number(body.compareAtPrice),
    category: (body.category ?? existing?.category ?? "Uncategorized").trim(),
    deity: (body.deity ?? existing?.deity ?? "").trim(),
    size: (body.size ?? existing?.size ?? "").trim(),
    material: (body.material ?? existing?.material ?? "").trim(),
    origin: (body.origin ?? existing?.origin ?? "").trim(),
    inStock: body.inStock ?? existing?.inStock ?? true,
    featured: body.featured ?? existing?.featured ?? false,
    image,
    images,
    tags: Array.isArray(body.tags)
      ? body.tags.filter(Boolean)
      : existing?.tags || [],
    variants:
      body.variants !== undefined
        ? parseVariants(body.variants)
        : existing?.variants || [],
  });

  return product;
}
