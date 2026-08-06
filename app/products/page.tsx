import type { Metadata } from "next";
import { Breadcrumb } from "@/components/Breadcrumb";
import { ProductCard } from "@/components/ProductCard";
import { getDictionary, getLocale } from "@/lib/i18n";
import { getProducts } from "@/lib/products";
import { siteConfig } from "@/lib/site";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Collection — Hand-Painted Tibetan Thangkas",
  description:
    "Browse our full collection of authentic hand-painted Tibetan Thangkas. Deity paintings, mandalas, and teaching scrolls shipped across the USA.",
  alternates: {
    canonical: `${siteConfig.url}/products`,
  },
};

export default async function ProductsPage() {
  const locale = await getLocale();
  const dict = getDictionary(locale);
  const t = dict.products;
  const products = await getProducts();

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <Breadcrumb
        items={[
          { label: t.breadcrumbHome, href: "/" },
          { label: t.breadcrumbCollection },
        ]}
      />

      <div className="mb-12">
        <h1 className="section-title">{t.title}</h1>
        <p className="mt-4 max-w-2xl text-stone">{t.desc}</p>
      </div>

      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => (
          <ProductCard key={product.slug} product={product} locale={locale} />
        ))}
      </div>
    </div>
  );
}
