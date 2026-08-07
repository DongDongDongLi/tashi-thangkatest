"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import type { Product, ProductVariant } from "@/lib/product-types";
import { createVariantId } from "@/lib/product-types";

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
  variants: [],
};

const fieldClass =
  "mt-1 w-full rounded-sm border border-gold/30 px-3 py-2 text-sm outline-none focus:border-burgundy";

export function AdminProductForm({ mode, slug }: AdminProductFormProps) {
  const router = useRouter();
  const [form, setForm] = useState<Product>(empty);
  const [tagsText, setTagsText] = useState("");
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(mode === "edit");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

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
        setForm({ ...data.product, variants: data.product.variants || [] });
        setTagsText((data.product.tags || []).join(", "));
        setVariants(data.product.variants || []);
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

  function updateVariant(id: string, patch: Partial<ProductVariant>) {
    setVariants((prev) =>
      prev.map((v) => (v.id === id ? { ...v, ...patch } : v))
    );
  }

  function addVariant() {
    setVariants((prev) => [
      ...prev,
      {
        id: createVariantId(),
        name: "",
        price: form.price || 0,
        inStock: true,
      },
    ]);
  }

  function removeVariant(id: string) {
    setVariants((prev) => prev.filter((v) => v.id !== id));
  }

  async function uploadFiles(files: FileList | null, target: "gallery" | "variant", variantId?: string) {
    if (!files || files.length === 0) return;
    setUploading(true);
    setError(null);
    try {
      const urls: string[] = [];
      for (const file of Array.from(files)) {
        const body = new FormData();
        body.append("file", file);
        const res = await fetch("/api/admin/upload", { method: "POST", body });
        const data = (await res.json()) as { url?: string; error?: string };
        if (!res.ok || !data.url) {
          throw new Error(data.error || "上传失败");
        }
        urls.push(data.url);
      }

      if (target === "gallery") {
        setForm((prev) => {
          const images = [...(prev.images || []), ...urls];
          return {
            ...prev,
            images,
            image: prev.image || images[0] || "",
          };
        });
      } else if (variantId && urls[0]) {
        updateVariant(variantId, { image: urls[0] });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "上传失败");
    } finally {
      setUploading(false);
    }
  }

  function removeGalleryImage(url: string) {
    setForm((prev) => {
      const images = (prev.images || []).filter((u) => u !== url);
      const image = prev.image === url ? images[0] || "" : prev.image;
      return { ...prev, images, image };
    });
  }

  function setAsCover(url: string) {
    setForm((prev) => ({
      ...prev,
      image: url,
      images: [url, ...(prev.images || []).filter((u) => u !== url)],
    }));
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
        variants,
        compareAtPrice:
          form.compareAtPrice === undefined ||
          Number.isNaN(Number(form.compareAtPrice))
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
      const data = (await res.json()) as { error?: string };
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

  const gallery = form.images?.length
    ? form.images
    : form.image
      ? [form.image]
      : [];

  return (
    <form
      onSubmit={onSubmit}
      className="mx-auto max-w-3xl space-y-5 rounded-sm border border-gold/20 bg-white p-6"
    >
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
          className={fieldClass}
          value={form.name}
          onChange={(e) => update("name", e.target.value)}
          required
        />
      </Field>

      {mode === "create" && (
        <Field label="Slug（可选）">
          <input
            className={fieldClass}
            value={form.slug}
            onChange={(e) => update("slug", e.target.value)}
            placeholder="auto-from-name"
          />
        </Field>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="默认价格 USD *（无款式时使用）">
          <input
            className={fieldClass}
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
            className={fieldClass}
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
          className={fieldClass}
          rows={2}
          value={form.shortDescription}
          onChange={(e) => update("shortDescription", e.target.value)}
        />
      </Field>

      <Field label="详细描述">
        <textarea
          className={fieldClass}
          rows={5}
          value={form.description}
          onChange={(e) => update("description", e.target.value)}
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="分类">
          <input
            className={fieldClass}
            value={form.category}
            onChange={(e) => update("category", e.target.value)}
          />
        </Field>
        <Field label="本尊 / Deity">
          <input
            className={fieldClass}
            value={form.deity}
            onChange={(e) => update("deity", e.target.value)}
          />
        </Field>
        <Field label="默认尺寸说明">
          <input
            className={fieldClass}
            value={form.size}
            onChange={(e) => update("size", e.target.value)}
          />
        </Field>
        <Field label="材质">
          <input
            className={fieldClass}
            value={form.material}
            onChange={(e) => update("material", e.target.value)}
          />
        </Field>
        <Field label="产地">
          <input
            className={fieldClass}
            value={form.origin}
            onChange={(e) => update("origin", e.target.value)}
          />
        </Field>
        <Field label="标签（逗号分隔）">
          <input
            className={fieldClass}
            value={tagsText}
            onChange={(e) => setTagsText(e.target.value)}
          />
        </Field>
      </div>

      <section className="space-y-3 rounded-sm border border-gold/20 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-serif text-xl text-burgundy">商品图片</h2>
          <label className="btn-outline cursor-pointer">
            {uploading ? "上传中…" : "上传多张图片"}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              multiple
              className="hidden"
              disabled={uploading}
              onChange={(e) => {
                void uploadFiles(e.target.files, "gallery");
                e.target.value = "";
              }}
            />
          </label>
        </div>
        <p className="text-xs text-stone">
          支持 JPG/PNG/WEBP/GIF，单张不超过 8MB。也可手动粘贴图片 URL。
        </p>
        <Field label="或粘贴图片 URL（回车分隔）">
          <textarea
            className={fieldClass}
            rows={3}
            value={(form.images || []).join("\n")}
            onChange={(e) => {
              const images = e.target.value
                .split("\n")
                .map((s) => s.trim())
                .filter(Boolean);
              update("images", images);
              if (!form.image && images[0]) update("image", images[0]);
            }}
          />
        </Field>
        {gallery.length > 0 && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {gallery.map((url) => (
              <div key={url} className="relative overflow-hidden rounded-sm border border-gold/20">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt="" className="aspect-square w-full object-cover" />
                <div className="flex gap-1 p-1 text-[10px]">
                  <button
                    type="button"
                    className="flex-1 bg-cream px-1 py-0.5"
                    onClick={() => setAsCover(url)}
                  >
                    {form.image === url ? "封面" : "设封面"}
                  </button>
                  <button
                    type="button"
                    className="bg-burgundy/10 px-1 py-0.5 text-burgundy"
                    onClick={() => removeGalleryImage(url)}
                  >
                    删
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-3 rounded-sm border border-gold/20 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-serif text-xl text-burgundy">款式 / 规格</h2>
            <p className="text-xs text-stone">
              例如不同尺寸、装裱。有款式时，前台按所选款式价格付款。
            </p>
          </div>
          <button type="button" className="btn-outline" onClick={addVariant}>
            添加款式
          </button>
        </div>

        {variants.length === 0 && (
          <p className="text-sm text-stone">暂无款式，将使用上方默认价格。</p>
        )}

        <div className="space-y-4">
          {variants.map((variant, index) => (
            <div
              key={variant.id}
              className="space-y-3 rounded-sm border border-gold/15 bg-cream/40 p-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-charcoal">
                  款式 {index + 1}
                </span>
                <button
                  type="button"
                  className="text-xs text-burgundy underline"
                  onClick={() => removeVariant(variant.id)}
                >
                  删除
                </button>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="款式名称 *">
                  <input
                    className={fieldClass}
                    value={variant.name}
                    onChange={(e) =>
                      updateVariant(variant.id, { name: e.target.value })
                    }
                    placeholder="例如 24寸 / 金边装裱"
                    required={variants.length > 0}
                  />
                </Field>
                <Field label="价格 USD *">
                  <input
                    className={fieldClass}
                    type="number"
                    min="0"
                    step="0.01"
                    value={variant.price}
                    onChange={(e) =>
                      updateVariant(variant.id, {
                        price: Number(e.target.value),
                      })
                    }
                    required={variants.length > 0}
                  />
                </Field>
                <Field label="对比价">
                  <input
                    className={fieldClass}
                    type="number"
                    min="0"
                    step="0.01"
                    value={variant.compareAtPrice ?? ""}
                    onChange={(e) =>
                      updateVariant(variant.id, {
                        compareAtPrice:
                          e.target.value === ""
                            ? undefined
                            : Number(e.target.value),
                      })
                    }
                  />
                </Field>
                <Field label="款式图片 URL">
                  <input
                    className={fieldClass}
                    value={variant.image || ""}
                    onChange={(e) =>
                      updateVariant(variant.id, { image: e.target.value })
                    }
                    placeholder="可上传或粘贴链接"
                  />
                </Field>
              </div>
              <div className="flex flex-wrap items-center gap-4">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={variant.inStock}
                    onChange={(e) =>
                      updateVariant(variant.id, { inStock: e.target.checked })
                    }
                  />
                  有货
                </label>
                <label className="btn-outline cursor-pointer text-xs">
                  上传款式图
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    className="hidden"
                    disabled={uploading}
                    onChange={(e) => {
                      void uploadFiles(e.target.files, "variant", variant.id);
                      e.target.value = "";
                    }}
                  />
                </label>
                {variant.image && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={variant.image}
                    alt=""
                    className="h-12 w-12 rounded-sm object-cover"
                  />
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="flex flex-wrap gap-6 text-sm">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={form.inStock}
            onChange={(e) => update("inStock", e.target.checked)}
          />
          商品上架
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

      <button type="submit" className="btn-primary" disabled={saving || uploading}>
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
