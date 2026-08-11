import "server-only";

import { put, list } from "@vercel/blob";
import { promises as fs } from "fs";
import path from "path";
import type { Product } from "@/lib/product-types";
import { normalizeProduct } from "@/lib/product-types";
import seed from "@/data/products.json";

const BLOB_PATHNAME = "catalog/products.json";
const LOCAL_FILE = path.join(process.cwd(), "data", "products.json");

function isBlobConfigured() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

export function canPersistProducts() {
  return !process.env.VERCEL || isBlobConfigured();
}

async function readProductsFromBlob(): Promise<Product[] | null> {
  if (!isBlobConfigured()) return null;

  try {
    const { blobs } = await list({ prefix: "catalog/", limit: 100 });
    const candidates = blobs
      .filter(
        (b) =>
          b.pathname === BLOB_PATHNAME ||
          b.pathname.endsWith("/products.json") ||
          b.pathname.endsWith("products.json")
      )
      .sort((a, b) => {
        const at = a.uploadedAt ? new Date(a.uploadedAt).getTime() : 0;
        const bt = b.uploadedAt ? new Date(b.uploadedAt).getTime() : 0;
        return bt - at;
      });

    for (const blob of candidates) {
      if (!blob.url) continue;
      const res = await fetch(blob.url, { cache: "no-store" });
      if (!res.ok) continue;
      const data = (await res.json()) as Product[];
      if (Array.isArray(data)) {
        return data.map(normalizeProduct);
      }
    }
  } catch (error) {
    console.error("Blob product read failed:", error);
  }

  return null;
}

async function readProductsFromLocal(): Promise<Product[] | null> {
  try {
    const raw = await fs.readFile(LOCAL_FILE, "utf8");
    const data = JSON.parse(raw) as Product[];
    if (Array.isArray(data)) return data.map(normalizeProduct);
  } catch {
    // ignore
  }
  return null;
}

export async function getProducts(): Promise<Product[]> {
  const fromBlob = await readProductsFromBlob();
  if (fromBlob) return fromBlob;

  const fromLocal = await readProductsFromLocal();
  if (fromLocal) return fromLocal;

  return (seed as Product[]).map(normalizeProduct);
}

export async function getProductBySlug(
  slug: string
): Promise<Product | undefined> {
  const decoded = safeDecode(slug);
  const products = await getProducts();
  return products.find(
    (p) =>
      p.slug === slug ||
      p.slug === decoded ||
      encodeURIComponent(p.slug) === slug ||
      p.slug === decodeURIComponent(slug)
  );
}

function safeDecode(value: string) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

export async function getFeaturedProducts(): Promise<Product[]> {
  const products = await getProducts();
  return products.filter((p) => p.featured);
}

export async function saveProducts(products: Product[]): Promise<void> {
  const normalized = products.map(normalizeProduct);
  const body = JSON.stringify(normalized, null, 2);

  if (isBlobConfigured()) {
    // Overwrite fixed catalog file used by the storefront
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

/** Prefer ASCII slugs so product URLs never 404 due to encoding issues */
export function slugify(input: string): string {
  const ascii = input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
  return ascii || `product-${Date.now()}`;
}
