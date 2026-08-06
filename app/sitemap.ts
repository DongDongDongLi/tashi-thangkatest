import type { MetadataRoute } from "next";
import { getProducts } from "@/lib/products";
import { siteConfig } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await getProducts();
  const productUrls = products.map((product) => ({
    url: `${siteConfig.url}/products/${product.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const staticPages = [
    "",
    "/products",
    "/about",
    "/contact",
    "/policies/shipping",
    "/policies/returns",
    "/policies/privacy",
  ].map((path) => ({
    url: `${siteConfig.url}${path}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: path === "" ? 1 : 0.7,
  }));

  return [...staticPages, ...productUrls];
}
