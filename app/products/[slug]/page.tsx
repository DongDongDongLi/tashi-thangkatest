import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumb } from "@/components/Breadcrumb";
import { JsonLd } from "@/components/JsonLd";
import { ProductPurchasePanel } from "@/components/ProductPurchasePanel";
import { getProductBySlug } from "@/lib/products";
import { getProductImages } from "@/lib/product-types";
import { breadcrumbJsonLd, productJsonLd } from "@/lib/seo";
import { siteConfig } from "@/lib/site";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return {};

  const images = getProductImages(product);

  return {
    title: product.name,
    description: product.shortDescription,
    alternates: {
      canonical: `${siteConfig.url}/products/${product.slug}`,
    },
    openGraph: {
      title: product.name,
      description: product.shortDescription,
      images: images[0] ? [{ url: images[0] }] : undefined,
    },
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const images = getProductImages(product);
  const imageSrc =
    images[0] ||
    "https://images.unsplash.com/photo-1547981609-4c099a484c24?w=800&q=80";

  const breadcrumbs = [
    { label: "Home", href: "/" },
    { label: "Collection", href: "/products" },
    { label: product.name },
  ];

  return (
    <>
      <JsonLd
        data={productJsonLd({
          ...product,
          image: imageSrc,
          images: images.length ? images : [imageSrc],
        })}
      />
      <JsonLd
        data={breadcrumbJsonLd(
          breadcrumbs.map((b) => ({
            name: b.label,
            url: b.href ?? `${siteConfig.url}/products/${product.slug}`,
          }))
        )}
      />

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <Breadcrumb items={breadcrumbs} />
        <ProductPurchasePanel product={product} />

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
