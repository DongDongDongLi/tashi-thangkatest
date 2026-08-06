"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { Product } from "@/lib/product-types";
import { formatPrice } from "@/lib/product-types";

export function AdminProductList() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [canPersist, setCanPersist] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/products", { cache: "no-store" });
      if (res.status === 401) {
        router.replace("/admin/login");
        return;
      }
      const data = (await res.json()) as {
        products?: Product[];
        canPersist?: boolean;
        error?: string;
      };
      if (!res.ok) throw new Error(data.error || "加载失败");
      setProducts(data.products || []);
      setCanPersist(data.canPersist !== false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "加载失败");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.replace("/admin/login");
  }

  async function toggleStock(product: Product) {
    const res = await fetch(`/api/admin/products/${product.slug}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ inStock: !product.inStock }),
    });
    const data = (await res.json()) as { error?: string; products?: Product[] };
    if (!res.ok) {
      alert(data.error || "更新失败");
      return;
    }
    if (data.products) setProducts(data.products);
  }

  async function remove(slug: string) {
    if (!confirm(`确定删除商品「${slug}」？`)) return;
    const res = await fetch(`/api/admin/products/${slug}`, { method: "DELETE" });
    const data = (await res.json()) as { error?: string; products?: Product[] };
    if (!res.ok) {
      alert(data.error || "删除失败");
      return;
    }
    if (data.products) setProducts(data.products);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-serif text-3xl text-burgundy">商品管理</h1>
          <p className="mt-1 text-sm text-stone">上架、编辑、下架与删除</p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/products/new" className="btn-primary">
            新增商品
          </Link>
          <button type="button" onClick={() => void logout()} className="btn-outline">
            退出
          </button>
        </div>
      </div>

      {!canPersist && (
        <div className="rounded-sm border border-burgundy/30 bg-burgundy/5 p-4 text-sm text-burgundy">
          当前环境无法持久保存。请在 Vercel → Storage 创建 Blob，添加环境变量
          <code className="mx-1">BLOB_READ_WRITE_TOKEN</code>
          后重新部署。
        </div>
      )}

      {loading && <p className="text-sm text-stone">加载中…</p>}
      {error && <p className="text-sm text-burgundy">{error}</p>}

      {!loading && !error && (
        <div className="overflow-x-auto rounded-sm border border-gold/20 bg-white">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-gold/20 bg-cream text-xs uppercase tracking-wider text-stone">
              <tr>
                <th className="px-4 py-3">商品</th>
                <th className="px-4 py-3">价格</th>
                <th className="px-4 py-3">状态</th>
                <th className="px-4 py-3">操作</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.slug} className="border-b border-gold/10">
                  <td className="px-4 py-3">
                    <div className="font-medium text-charcoal">{product.name}</div>
                    <div className="text-xs text-stone">{product.slug}</div>
                  </td>
                  <td className="px-4 py-3">{formatPrice(product.price)}</td>
                  <td className="px-4 py-3">
                    <span
                      className={
                        product.inStock ? "text-green-700" : "text-stone"
                      }
                    >
                      {product.inStock ? "上架中" : "已下架"}
                    </span>
                    {product.featured ? (
                      <span className="ml-2 text-xs text-gold-dark">精选</span>
                    ) : null}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      <Link
                        href={`/admin/products/${product.slug}`}
                        className="text-burgundy underline"
                      >
                        编辑
                      </Link>
                      <button
                        type="button"
                        className="text-charcoal underline"
                        onClick={() => void toggleStock(product)}
                      >
                        {product.inStock ? "下架" : "上架"}
                      </button>
                      <Link
                        href={`/products/${product.slug}`}
                        className="text-stone underline"
                        target="_blank"
                      >
                        预览
                      </Link>
                      <button
                        type="button"
                        className="text-burgundy underline"
                        onClick={() => void remove(product.slug)}
                      >
                        删除
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
