import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumb } from "@/components/Breadcrumb";
import { JsonLd } from "@/components/JsonLd";
import { PayPalCheckout } from "@/components/PayPalCheckout";
import {
  getProductBySlug,
  products,
  formatPrice,
} from "@/lib/products";
import { breadcrumbJsonLd, productJsonLd } from "@/lib/seo";
import { siteConfig } from "@/lib/site";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) return {};

  return {
    title: product.name,
    description: product.shortDescription,
    alternates: {
      canonical: `${siteConfig.url}/products/${product.slug}`,
    },
    openGraph: {
      title: product.name,
      description: product.shortDescription,
      images: [{ url: product.image }],
    },
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) notFound();

  const breadcrumbs = [
    { label: "Home", href: "/" },
    { label: "Collection", href: "/products" },
    { label: product.name },
  ];

  return (
    <>
      <JsonLd data={productJsonLd(product)} />
      <JsonLd
        data={breadcrumbJsonLd(
          breadcrumbs.map((b) => ({
            name: b.label,
            url:
              b.href ??
              `${siteConfig.url}/products/${product.slug}`,
          }))
        )}
      />

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <Breadcrumb items={breadcrumbs} />

        <div className="grid gap-12 lg:grid-cols-2">
          <div className="relative aspect-[4/5] overflow-hidden rounded-sm border border-gold/20">
            <Image
              src={product.image}
              alt={`${product.name} — authentic Tibetan Thangka painting`}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
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

            <div className="mt-6 flex items-baseline gap-3">
              <span className="text-3xl font-medium text-charcoal">
                {formatPrice(product.price)}
              </span>
              {product.compareAtPrice && (
                <span className="text-lg text-stone line-through">
                  {formatPrice(product.compareAtPrice)}
                </span>
              )}
            </div>

            <p className="mt-2 text-sm text-stone">
              Free insured shipping within the contiguous United States
            </p>

            <div className="mt-8 space-y-4">
              {product.inStock ? (
                <PayPalCheckout
                  slug={product.slug}
                  productName={product.name}
                />
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
                ["Availability", product.inStock ? "In Stock" : "Sold Out"],
              ].map(([label, value]) => (
                <div key={label} className="grid grid-cols-3 gap-4">
                  <dt className="font-medium text-charcoal">{label}</dt>
                  <dd className="col-span-2 text-stone">{value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        <div className="prose-content mt-16 max-w-3xl">
          <h2>About This Thangka</h2>
          <p>{product.description}</p>
          <h2>Authenticity Guarantee</h2>
          <p>
            Every Tashi Thangka comes with a signed certificate of authenticity
            detailing the artist, origin workshop, materials used, and date of
            completion. We work exclusively with vetted artists who follow
            traditional iconographic standards.
          </p>
        </div>
      </div>
    </>
  );
}
