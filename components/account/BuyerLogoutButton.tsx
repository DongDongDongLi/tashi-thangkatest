"use client";

import { useRouter } from "next/navigation";

export function BuyerLogoutButton() {
  const router = useRouter();

  async function logout() {
    await fetch("/api/buyer/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  return (
    <button type="button" onClick={logout} className="btn-outline text-sm">
      Sign out
    </button>
  );
}
