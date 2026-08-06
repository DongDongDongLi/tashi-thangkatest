import "server-only";

import { put, list } from "@vercel/blob";
import { promises as fs } from "fs";
import path from "path";
import type { Product } from "@/lib/product-types";
import seed from "@/data/products.json";

const BLOB_PATHNAME = "catalog/products.json";
const LOCAL_FILE = path.join(process.cwd(), "data", "products.json");

function isBlobConfigured() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

export function canPersistProducts() {
  return !process.env.VERCEL || isBlobConfigured();
}

export async function getProducts(): Promise<Product[]> {
  if (isBlobConfigured()) {
    try {
      const { blobs } = await list({ prefix: "catalog/", limit: 20 });
      const blob = blobs.find((b) => b.pathname === BLOB_PATHNAME);
      if (blob?.url) {
        const res = await fetch(blob.url, { cache: "no-store" });
        if (res.ok) {
          const data = (await res.json()) as Product[];
          if (Array.isArray(data)) return data;
        }
      }
    } catch (error) {
      console.error("Blob product read failed, falling back:", error);
    }
  }

  try {
    const raw = await fs.readFile(LOCAL_FILE, "utf8");
    const data = JSON.parse(raw) as Product[];
    if (Array.isArray(data)) return data;
  } catch {
    // ignore
  }

  return seed as Product[];
}

export async function getProductBySlug(
  slug: string
): Promise<Product | undefined> {
  const products = await getProducts();
  return products.find((p) => p.slug === slug);
}

export async function getFeaturedProducts(): Promise<Product[]> {
  const products = await getProducts();
  return products.filter((p) => p.featured);
}

export async function saveProducts(products: Product[]): Promise<void> {
  const body = JSON.stringify(products, null, 2);

  if (isBlobConfigured()) {
    await put(BLOB_PATHNAME, body, {
      access: "public",
      addRandomSuffix: false,
      allowOverwrite: true,
      contentType: "application/json",
    });
  } else if (process.env.VERCEL) {
    throw new Error(
      "在 Vercel 上保存商品需要配置 BLOB_READ_WRITE_TOKEN。请到 Vercel → Storage 创建 Blob，并把 Token 加到环境变量后 Redeploy。"
    );
  }

  try {
    await fs.mkdir(path.dirname(LOCAL_FILE), { recursive: true });
    await fs.writeFile(LOCAL_FILE, body, "utf8");
  } catch (error) {
    if (!isBlobConfigured()) throw error;
  }
}

export async function upsertProduct(product: Product): Promise<Product[]> {
  const products = await getProducts();
  const index = products.findIndex((p) => p.slug === product.slug);
  if (index >= 0) {
    products[index] = product;
  } else {
    products.unshift(product);
  }
  await saveProducts(products);
  return products;
}

export async function deleteProduct(slug: string): Promise<Product[]> {
  const products = await getProducts();
  const next = products.filter((p) => p.slug !== slug);
  await saveProducts(next);
  return next;
}

export function slugify(input: string): string {
  return (
    input
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\u4e00-\u9fff]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 80) || `product-${Date.now()}`
  );
}
