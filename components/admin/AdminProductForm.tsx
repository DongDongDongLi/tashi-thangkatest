"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import type { Product } from "@/lib/product-types";

type AdminProductFormProps = {
  mode: "create" | "edit";
  slug?: string;
};

const empty: Product = {
  slug: "",
  name: "",
  shortDescription: "",
  description: "",
  price: 0,
  category: "",
  deity: "",
  size: "",
  material: "",
  origin: "",
  inStock: true,
  featured: false,
  image: "",
  images: [],
  tags: [],
};

export function AdminProductForm({ mode, slug }: AdminProductFormProps) {
  const router = useRouter();
  const [form, setForm] = useState<Product>(empty);
  const [tagsText, setTagsText] = useState("");
  const [imagesText, setImagesText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(mode === "edit");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (mode !== "edit" || !slug) return;
    let cancelled = false;
    (async () => {
      const res = await fetch(`/api/admin/products/${slug}`, { cache: "no-store" });
      if (res.status === 401) {
        router.replace("/admin/login");
        return;
      }
      const data = (await res.json()) as { product?: Product; error?: string };
      if (!res.ok) {
        if (!cancelled) setError(data.error || "加载失败");
        if (!cancelled) setLoading(false);
        return;
      }
      if (data.product && !cancelled) {
        setForm(data.product);
        setTagsText((data.product.tags || []).join(", "));
        setImagesText((data.product.images || []).join("\n"));
      }
      if (!cancelled) setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [mode, slug, router]);

  function update<K extends keyof Product>(key: K, value: Product[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const payload = {
        ...form,
        tags: tagsText
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
        images: imagesText
          .split("\n")
          .map((t) => t.trim())
          .filter(Boolean),
        compareAtPrice:
          form.compareAtPrice === undefined || Number.isNaN(Number(form.compareAtPrice))
            ? undefined
            : Number(form.compareAtPrice),
      };

      const res = await fetch(
        mode === "create" ? "/api/admin/products" : `/api/admin/products/${slug}`,
        {
          method: mode === "create" ? "POST" : "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      const data = (await res.json()) as { error?: string; product?: Product };
      if (!res.ok) throw new Error(data.error || "保存失败");
      router.replace("/admin");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "保存失败");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <p className="text-sm text-stone">加载中…</p>;
  }

  return (
    <form onSubmit={onSubmit} className="mx-auto max-w-3xl space-y-5 rounded-sm border border-gold/20 bg-white p-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="font-serif text-3xl text-burgundy">
          {mode === "create" ? "新增商品" : "编辑商品"}
        </h1>
        <Link href="/admin" className="btn-outline">
          返回列表
        </Link>
      </div>

      <Field label="名称 *">
        <input
          className="mt-1 w-full rounded-sm border border-gold/30 px-3 py-2 text-sm outline-none focus:border-burgundy"
          value={form.name}
          onChange={(e) => update("name", e.target.value)}
          required
        />
      </Field>

      {mode === "create" && (
        <Field label="Slug（可选，英文短横线）">
          <input
            className="mt-1 w-full rounded-sm border border-gold/30 px-3 py-2 text-sm outline-none focus:border-burgundy"
            value={form.slug}
            onChange={(e) => update("slug", e.target.value)}
            placeholder="auto-from-name"
          />
        </Field>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="价格 USD *">
          <input
            className="mt-1 w-full rounded-sm border border-gold/30 px-3 py-2 text-sm outline-none focus:border-burgundy"
            type="number"
            min="0"
            step="0.01"
            value={form.price}
            onChange={(e) => update("price", Number(e.target.value))}
            required
          />
        </Field>
        <Field label="对比价（可选）">
          <input
            className="mt-1 w-full rounded-sm border border-gold/30 px-3 py-2 text-sm outline-none focus:border-burgundy"
            type="number"
            min="0"
            step="0.01"
            value={form.compareAtPrice ?? ""}
            onChange={(e) =>
              update(
                "compareAtPrice",
                e.target.value === "" ? undefined : Number(e.target.value)
              )
            }
          />
        </Field>
      </div>

      <Field label="短描述">
        <textarea
          className="mt-1 w-full rounded-sm border border-gold/30 px-3 py-2 text-sm outline-none focus:border-burgundy"
          rows={2}
          value={form.shortDescription}
          onChange={(e) => update("shortDescription", e.target.value)}
        />
      </Field>

      <Field label="详细描述">
        <textarea
          className="mt-1 w-full rounded-sm border border-gold/30 px-3 py-2 text-sm outline-none focus:border-burgundy"
          rows={5}
          value={form.description}
          onChange={(e) => update("description", e.target.value)}
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="分类">
          <input
            className="mt-1 w-full rounded-sm border border-gold/30 px-3 py-2 text-sm outline-none focus:border-burgundy"
            value={form.category}
            onChange={(e) => update("category", e.target.value)}
          />
        </Field>
        <Field label="本尊 / Deity">
          <input
            className="mt-1 w-full rounded-sm border border-gold/30 px-3 py-2 text-sm outline-none focus:border-burgundy"
            value={form.deity}
            onChange={(e) => update("deity", e.target.value)}
          />
        </Field>
        <Field label="尺寸">
          <input
            className="mt-1 w-full rounded-sm border border-gold/30 px-3 py-2 text-sm outline-none focus:border-burgundy"
            value={form.size}
            onChange={(e) => update("size", e.target.value)}
          />
        </Field>
        <Field label="材质">
          <input
            className="mt-1 w-full rounded-sm border border-gold/30 px-3 py-2 text-sm outline-none focus:border-burgundy"
            value={form.material}
            onChange={(e) => update("material", e.target.value)}
          />
        </Field>
        <Field label="产地">
          <input
            className="mt-1 w-full rounded-sm border border-gold/30 px-3 py-2 text-sm outline-none focus:border-burgundy"
            value={form.origin}
            onChange={(e) => update("origin", e.target.value)}
          />
        </Field>
        <Field label="主图 URL">
          <input
            className="mt-1 w-full rounded-sm border border-gold/30 px-3 py-2 text-sm outline-none focus:border-burgundy"
            value={form.image}
            onChange={(e) => update("image", e.target.value)}
            placeholder="https://..."
          />
        </Field>
      </div>

      <Field label="更多图片 URL（每行一个）">
        <textarea
          className="mt-1 w-full rounded-sm border border-gold/30 px-3 py-2 text-sm outline-none focus:border-burgundy"
          rows={3}
          value={imagesText}
          onChange={(e) => setImagesText(e.target.value)}
        />
      </Field>

      <Field label="标签（逗号分隔）">
        <input
          className="mt-1 w-full rounded-sm border border-gold/30 px-3 py-2 text-sm outline-none focus:border-burgundy"
          value={tagsText}
          onChange={(e) => setTagsText(e.target.value)}
        />
      </Field>

      <div className="flex flex-wrap gap-6 text-sm">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={form.inStock}
            onChange={(e) => update("inStock", e.target.checked)}
          />
          上架销售
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={form.featured}
            onChange={(e) => update("featured", e.target.checked)}
          />
          首页精选
        </label>
      </div>

      {error && <p className="text-sm text-burgundy">{error}</p>}

      <button type="submit" className="btn-primary" disabled={saving}>
        {saving ? "保存中…" : "保存"}
      </button>
    </form>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block text-sm font-medium text-charcoal">
      {label}
      {children}
    </label>
  );
}
