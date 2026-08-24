"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export function AccountMenu() {
  const [email, setEmail] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch("/api/buyer/me")
      .then((res) => res.json())
      .then((data: { user?: { email: string } | null }) => {
        setEmail(data.user?.email || null);
      })
      .finally(() => setLoaded(true));
  }, []);

  if (!loaded) return null;

  return email ? (
    <Link
      href="/account/orders"
      className="hidden text-xs uppercase tracking-widest text-charcoal hover:text-burgundy sm:inline-block"
    >
      My orders
    </Link>
  ) : (
    <Link
      href="/account/login"
      className="hidden text-xs uppercase tracking-widest text-charcoal hover:text-burgundy sm:inline-block"
    >
      Sign in
    </Link>
  );
}
