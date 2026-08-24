"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";

const inputClass =
  "mt-1 w-full rounded-sm border border-gold/30 px-3 py-2 text-sm outline-none focus:border-burgundy";

export function BuyerRegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/account/orders";
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/buyer/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, password }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error || "Registration failed");
      router.push(redirect);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="mx-auto max-w-sm space-y-4 rounded-sm border border-gold/20 bg-white p-6">
      <h1 className="font-serif text-2xl text-burgundy">Create account</h1>
      <p className="text-sm text-stone">
        Register to place orders and track shipments to the US.
      </p>

      {[
        { id: "name", label: "Full name", type: "text", value: name, set: setName, auto: "name" },
        { id: "email", label: "Email", type: "email", value: email, set: setEmail, auto: "email" },
        { id: "phone", label: "Phone (optional)", type: "tel", value: phone, set: setPhone, auto: "tel" },
      ].map((field) => (
        <div key={field.id}>
          <label className="text-sm text-charcoal" htmlFor={field.id}>
            {field.label}
          </label>
          <input
            id={field.id}
            type={field.type}
            required={field.id !== "phone"}
            autoComplete={field.auto}
            className={inputClass}
            value={field.value}
            onChange={(e) => field.set(e.target.value)}
          />
        </div>
      ))}

      <div>
        <label className="text-sm text-charcoal" htmlFor="password">
          Password (min. 8 characters)
        </label>
        <input
          id="password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          className={inputClass}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>

      {error && (
        <p className="text-sm text-burgundy" role="alert">
          {error}
        </p>
      )}

      <button type="submit" disabled={loading} className="btn-primary w-full">
        {loading ? "Creating account…" : "Create account"}
      </button>

      <p className="text-center text-sm text-stone">
        Already have an account?{" "}
        <Link
          href={`/account/login?redirect=${encodeURIComponent(redirect)}`}
          className="text-burgundy hover:underline"
        >
          Sign in
        </Link>
      </p>
    </form>
  );
}
