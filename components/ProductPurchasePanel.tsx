"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { Product } from "@/lib/product-types";
import {
  formatPrice,
  getProductImages,
  getProductVariants,
  resolvePurchaseOption,
} from "@/lib/product-types";

type ProductPurchasePanelProps = {
  product: Product;
};

export function ProductPurchasePanel({ product }: ProductPurchasePanelProps) {
  const variants = getProductVariants(product);
  const images = getProductImages(product);
  const [activeImage, setActiveImage] = useState(images[0] || "");
  const [variantId, setVariantId] = useState(
    variants.find((v) => v.inStock)?.id || variants[0]?.id || ""
  );

  const purchase = useMemo(
    () => resolvePurchaseOption(product, variantId || undefined),
    [product, variantId]
  );

  const displayImages = useMemo(() => {
    const list = [...images];
    if (purchase.image && !list.includes(purchase.image)) {
      list.unshift(purchase.image);
    }
    return list.length ? list : [activeImage].filter(Boolean);
  }, [images, purchase.image, activeImage]);

  const mainImage = displayImages.includes(activeImage)
    ? activeImage
    : displayImages[0] || "";

  return (
    <div className="grid gap-12 lg:grid-cols-2">
      <div>
        <div className="relative aspect-[4/5] overflow-hidden rounded-sm border border-gold/20 bg-cream">
          {mainImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={mainImage}
              alt={product.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-stone">
              No image
            </div>
          )}
        </div>
        {displayImages.length > 1 && (
          <div className="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-5">
            {displayImages.map((url) => (
              <button
                key={url}
                type="button"
                onClick={() => setActiveImage(url)}
                className={`overflow-hidden rounded-sm border ${
                  mainImage === url ? "border-burgundy" : "border-gold/20"
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt="" className="aspect-square w-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      <div>
        <p className="text-xs uppercase tracking-widest text-gold-dark">
          {product.category}
        </p>
        <h1 className="mt-2 font-serif text-4xl text-burgundy md:text-5xl">
          {product.name}
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-stone">
          {product.shortDescription}
        </p>

        {variants.length > 0 && (
          <div className="mt-6">
            <p className="text-sm font-medium text-charcoal">选择款式</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {variants.map((variant) => {
                const selected = variant.id === purchase.variantId;
                return (
                  <button
                    key={variant.id}
                    type="button"
                    disabled={!variant.inStock}
                    onClick={() => {
                      setVariantId(variant.id);
                      if (variant.image) setActiveImage(variant.image);
                    }}
                    className={`rounded-sm border px-3 py-2 text-sm transition-colors ${
                      selected
                        ? "border-burgundy bg-burgundy text-cream"
                        : "border-gold/30 bg-white text-charcoal hover:border-burgundy"
                    } ${!variant.inStock ? "cursor-not-allowed opacity-40" : ""}`}
                  >
                    {variant.name}
                    {!variant.inStock ? " (售罄)" : ""}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div className="mt-6 flex items-baseline gap-3">
          <span className="text-3xl font-medium text-charcoal">
            {formatPrice(purchase.price)}
          </span>
          {purchase.compareAtPrice && (
            <span className="text-lg text-stone line-through">
              {formatPrice(purchase.compareAtPrice)}
            </span>
          )}
        </div>

        <p className="mt-2 text-sm text-stone">
          Free insured shipping within the contiguous United States
        </p>

        <div className="mt-8 space-y-4">
          {purchase.inStock ? (
            <Link
              href={`/checkout?slug=${encodeURIComponent(product.slug)}${purchase.variantId ? `&variantId=${encodeURIComponent(purchase.variantId)}` : ""}`}
              className="btn-primary inline-flex w-full max-w-sm justify-center"
            >
              Buy now — checkout
            </Link>
          ) : (
            <button disabled className="btn-primary">
              Sold Out
            </button>
          )}
          <Link href="/policies/shipping" className="btn-outline inline-flex">
            Shipping Info
          </Link>
        </div>

        <dl className="mt-10 space-y-4 border-t border-gold/20 pt-8 text-sm">
          {[
            ["Deity", product.deity],
            ["Size", product.size],
            ["Material", product.material],
            ["Origin", product.origin],
            [
              "Availability",
              purchase.inStock ? "In Stock" : "Sold Out",
            ],
          ].map(([label, value]) => (
            <div key={label} className="grid grid-cols-3 gap-4">
              <dt className="font-medium text-charcoal">{label}</dt>
              <dd className="col-span-2 text-stone">{value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}
