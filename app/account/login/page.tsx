import { Suspense } from "react";
import { BuyerLoginForm } from "@/components/account/BuyerLoginForm";

export const metadata = {
  title: "Sign in",
  robots: { index: false, follow: false },
};

export default function AccountLoginPage() {
  return (
    <div className="mx-auto max-w-xl px-4 py-16">
      <Suspense fallback={<p className="text-center text-stone">Loading…</p>}>
        <BuyerLoginForm />
      </Suspense>
    </div>
  );
}
