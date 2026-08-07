export type ProductVariant = {
  id: string;
  name: string;
  price: number;
  compareAtPrice?: number;
  inStock: boolean;
  image?: string;
};

export type Product = {
  slug: string;
  name: string;
  shortDescription: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  category: string;
  deity: string;
  size: string;
  material: string;
  origin: string;
  inStock: boolean;
  featured: boolean;
  image: string;
  images: string[];
  tags: string[];
  /** Optional style/size options. If empty, use product.price */
  variants?: ProductVariant[];
};

export function formatPrice(price: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(price);
}

export function getProductImages(product: Product): string[] {
  const list = [
    product.image,
    ...(product.images || []),
    ...((product.variants || []).map((v) => v.image).filter(Boolean) as string[]),
  ].filter(Boolean);
  return Array.from(new Set(list));
}

export function getProductVariants(product: Product): ProductVariant[] {
  return Array.isArray(product.variants) ? product.variants : [];
}

export function hasVariants(product: Product): boolean {
  return getProductVariants(product).length > 0;
}

export function resolvePurchaseOption(
  product: Product,
  variantId?: string | null
): {
  price: number;
  compareAtPrice?: number;
  inStock: boolean;
  label: string;
  variantId?: string;
  image?: string;
} {
  const variants = getProductVariants(product);
  if (variants.length === 0) {
    return {
      price: product.price,
      compareAtPrice: product.compareAtPrice,
      inStock: product.inStock,
      label: product.name,
      image: product.image,
    };
  }

  const selected =
    (variantId && variants.find((v) => v.id === variantId)) ||
    variants.find((v) => v.inStock) ||
    variants[0];

  return {
    price: selected.price,
    compareAtPrice: selected.compareAtPrice,
    inStock: product.inStock && selected.inStock,
    label: `${product.name} — ${selected.name}`,
    variantId: selected.id,
    image: selected.image || product.image,
  };
}

export function createVariantId() {
  return `v_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export function normalizeProduct(input: Product): Product {
  const images = Array.isArray(input.images)
    ? input.images.filter(Boolean)
    : [];
  const variants = Array.isArray(input.variants)
    ? input.variants
        .filter((v) => v && v.name)
        .map((v) => ({
          id: v.id || createVariantId(),
          name: String(v.name).trim(),
          price: Number(v.price) || 0,
          compareAtPrice:
            v.compareAtPrice === undefined || v.compareAtPrice === null
              ? undefined
              : Number(v.compareAtPrice),
          inStock: v.inStock !== false,
          image: v.image?.trim() || undefined,
        }))
    : [];

  return {
    ...input,
    image: input.image || images[0] || "",
    images,
    variants,
    tags: Array.isArray(input.tags) ? input.tags.filter(Boolean) : [],
  };
}
