import Image from "next/image";
import Link from "next/link";
import type { Locale } from "@/lib/i18n/config";
import { commonLabels, getProductLabels } from "@/lib/i18n/product-translations";
import type { Product } from "@/lib/product-types";
import { formatPrice } from "@/lib/product-types";

type ProductCardProps = {
  product: Product;
  locale?: Locale;
};

export function ProductCard({ product, locale = "en" }: ProductCardProps) {
  const zh = getProductLabels(locale, product.slug);
  const name = zh?.name ?? product.name;
  const shortDescription = zh?.shortDescription ?? product.shortDescription;
  const category = zh?.category ?? product.category;
  const soldOutLabel = commonLabels[locale].soldOut;

  return (
    <article className="group flex flex-col overflow-hidden rounded-sm border border-gold/20 bg-white shadow-sm transition-shadow hover:shadow-lg">
      <Link href={`/products/${product.slug}`} className="relative aspect-[4/5] overflow-hidden">
        <Image
          src={product.image}
          alt={`${name} — hand-painted Tibetan Thangka`}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        {!product.inStock && (
          <span className="absolute left-3 top-3 rounded-sm bg-charcoal/80 px-2 py-1 text-xs uppercase tracking-wider text-cream">
            {soldOutLabel}
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col p-5">
        <p className="text-xs uppercase tracking-widest text-gold-dark">
          {category}
        </p>
        <Link href={`/products/${product.slug}`}>
          <h3 className="mt-1 font-serif text-xl text-burgundy transition-colors group-hover:text-gold-dark">
            {name}
          </h3>
        </Link>
        <p className="mt-2 flex-1 text-sm leading-relaxed text-stone">
          {shortDescription}
        </p>
        <div className="mt-4 flex items-baseline gap-2">
          <span className="font-medium text-charcoal">{formatPrice(product.price)}</span>
          {product.compareAtPrice && (
            <span className="text-sm text-stone line-through">
              {formatPrice(product.compareAtPrice)}
            </span>
          )}
        </div>
      </div>
    </article>
  );
}
