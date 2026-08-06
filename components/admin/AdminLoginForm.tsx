"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export function AdminLoginForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        throw new Error(data.error || "登录失败");
      }
      router.replace("/admin");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "登录失败");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="mx-auto mt-8 max-w-sm space-y-4 rounded-sm border border-gold/20 bg-white p-6">
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-charcoal">
          管理员密码
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1 w-full rounded-sm border border-gold/30 px-3 py-2 text-sm outline-none focus:border-burgundy"
          required
          autoFocus
        />
      </div>
      {error && <p className="text-sm text-burgundy">{error}</p>}
      <button type="submit" className="btn-primary w-full" disabled={loading}>
        {loading ? "登录中…" : "登录"}
      </button>
    </form>
  );
}
