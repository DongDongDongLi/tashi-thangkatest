import "server-only";

import { put, list } from "@vercel/blob";
import { promises as fs } from "fs";
import path from "path";
import type { Product } from "@/lib/product-types";
import { normalizeProduct } from "@/lib/product-types";
import seed from "@/data/products.json";

const BLOB_PATHNAME = "catalog/products.json";
const BLOB_BACKUP_PREFIX = "catalog/backups/";
const LOCAL_FILE = path.join(process.cwd(), "data", "products.json");
const MAX_BLOB_BACKUPS = 20;

function isBlobConfigured() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

export function canPersistProducts() {
  return !process.env.VERCEL || isBlobConfigured();
}

function seedProducts(): Product[] {
  return (seed as Product[]).map(normalizeProduct);
}

function seedSlugSet() {
  return new Set(seedProducts().map((p) => p.slug));
}

/** True when catalog looks like the bundled seed (risk of wiping real products). */
export function looksLikeSeedCatalog(products: Product[]): boolean {
  const seedSlugs = seedSlugSet();
  if (products.length === 0) return false;
  if (products.length !== seedSlugs.size) return false;
  return products.every((p) => seedSlugs.has(p.slug));
}

type CatalogRead =
  | { ok: true; products: Product[]; source: "blob" | "local" }
  | { ok: false; reason: string };

async function fetchJsonProducts(url: string): Promise<Product[] | null> {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) return null;
  const data = (await res.json()) as unknown;
  if (!Array.isArray(data)) return null;
  return data.map((item) => normalizeProduct(item as Product));
}

async function listCatalogBlobs() {
  const { blobs } = await list({ prefix: "catalog/", limit: 200 });
  return blobs;
}

function isPrimaryCatalogPath(pathname: string) {
  return (
    pathname === BLOB_PATHNAME ||
    (pathname.endsWith("/products.json") &&
      !pathname.includes("/backups/") &&
      !pathname.includes("/backup"))
  );
}

type BlobCatalogResult =
  | { status: "ok"; products: Product[] }
  | { status: "missing" }
  | { status: "error"; message: string };

async function readProductsFromBlobDetailed(): Promise<BlobCatalogResult> {
  if (!isBlobConfigured()) return { status: "missing" };

  try {
    const blobs = await listCatalogBlobs();
    const candidates = blobs
      .filter((b) => isPrimaryCatalogPath(b.pathname))
      .sort((a, b) => {
        const primary = (p: string) => (p === BLOB_PATHNAME ? 0 : 1);
        const byPath = primary(a.pathname) - primary(b.pathname);
        if (byPath !== 0) return byPath;
        const at = a.uploadedAt ? new Date(a.uploadedAt).getTime() : 0;
        const bt = b.uploadedAt ? new Date(b.uploadedAt).getTime() : 0;
        return bt - at;
      });

    if (candidates.length === 0) {
      return { status: "missing" };
    }

    for (const blob of candidates) {
      if (!blob.url) continue;
      const products = await fetchJsonProducts(blob.url);
      if (products) return { status: "ok", products };
    }

    return {
      status: "error",
      message: "Blob 中存在商品目录文件，但内容无法解析。",
    };
  } catch (error) {
    console.error("Blob product read failed:", error);
    return {
      status: "error",
      message: error instanceof Error ? error.message : "Blob 读取失败",
    };
  }
}

async function readProductsFromBlob(): Promise<Product[] | null> {
  const result = await readProductsFromBlobDetailed();
  return result.status === "ok" ? result.products : null;
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

/**
 * Storefront read: Blob → local file → seed.
 * Mutations must use loadCatalogForWrite() instead.
 */
export async function getProducts(): Promise<Product[]> {
  const fromBlob = await readProductsFromBlob();
  if (fromBlob) return fromBlob;

  const fromLocal = await readProductsFromLocal();
  if (fromLocal) return fromLocal;

  return seedProducts();
}

/**
 * Load catalog for create/update/delete.
 * When Blob is configured, never fall back to seed — that path previously
 * overwrote real uploads with the bundled demo catalog.
 */
async function loadCatalogForWrite(): Promise<CatalogRead> {
  if (isBlobConfigured()) {
    const result = await readProductsFromBlobDetailed();
    if (result.status === "ok") {
      return { ok: true, products: result.products, source: "blob" };
    }
    if (result.status === "missing") {
      // First save on a new Blob store — start empty, never silently use seed.
      return { ok: true, products: [], source: "blob" };
    }
    return {
      ok: false,
      reason: `${result.message} 已阻止保存，以免用默认种子数据覆盖真实商品。请稍后重试，或检查 BLOB_READ_WRITE_TOKEN / Blob 中的 catalog/products.json。`,
    };
  }

  const fromLocal = await readProductsFromLocal();
  if (fromLocal) {
    return { ok: true, products: fromLocal, source: "local" };
  }

  // Local/dev only: allow starting from seed when no catalog exists yet
  if (!process.env.VERCEL) {
    return { ok: true, products: seedProducts(), source: "local" };
  }

  return {
    ok: false,
    reason:
      "在 Vercel 上保存商品需要配置 BLOB_READ_WRITE_TOKEN，且必须能读到 Blob 目录。",
  };
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

async function backupBlobCatalog(existing: Product[]): Promise<void> {
  if (!isBlobConfigured() || existing.length === 0) return;

  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const pathname = `${BLOB_BACKUP_PREFIX}${stamp}.json`;
  try {
    await put(pathname, JSON.stringify(existing, null, 2), {
      access: "public",
      addRandomSuffix: false,
      contentType: "application/json",
    });
  } catch (error) {
    console.error("Blob catalog backup failed:", error);
    throw new Error(
      "保存前备份商品目录失败，已取消写入以防数据丢失。请稍后重试。"
    );
  }

  // Best-effort prune: keep newest backups only (list + skip delete if API unavailable)
  try {
    const blobs = await listCatalogBlobs();
    const backups = blobs
      .filter((b) => b.pathname.startsWith(BLOB_BACKUP_PREFIX))
      .sort((a, b) => {
        const at = a.uploadedAt ? new Date(a.uploadedAt).getTime() : 0;
        const bt = b.uploadedAt ? new Date(b.uploadedAt).getTime() : 0;
        return bt - at;
      });
    const { del } = await import("@vercel/blob");
    for (const old of backups.slice(MAX_BLOB_BACKUPS)) {
      try {
        await del(old.url);
      } catch {
        // ignore prune errors
      }
    }
  } catch {
    // ignore prune errors
  }
}

export async function saveProducts(products: Product[]): Promise<void> {
  const normalized = products.map(normalizeProduct);
  const body = JSON.stringify(normalized, null, 2);

  if (isBlobConfigured()) {
    const currentResult = await readProductsFromBlobDetailed();
    if (currentResult.status === "error") {
      throw new Error(
        `${currentResult.message} 已取消保存，以免覆盖真实数据。`
      );
    }

    const current =
      currentResult.status === "ok" ? currentResult.products : [];

    // Block accidental wipe: replacing a non-seed catalog with seed-looking data
    if (
      current.length > 0 &&
      !looksLikeSeedCatalog(current) &&
      looksLikeSeedCatalog(normalized)
    ) {
      throw new Error(
        "检测到即将用默认种子商品覆盖现有目录，已阻止保存。若确需重置，请先在 Blob 中手动处理。"
      );
    }

    if (current.length > 0) {
      await backupBlobCatalog(current);
    }

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
  const loaded = await loadCatalogForWrite();
  if (!loaded.ok) {
    throw new Error(loaded.reason);
  }

  const products = [...loaded.products];
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
  const loaded = await loadCatalogForWrite();
  if (!loaded.ok) {
    throw new Error(loaded.reason);
  }

  const next = loaded.products.filter((p) => p.slug !== slug);
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
