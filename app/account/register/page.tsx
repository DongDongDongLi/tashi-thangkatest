import { Suspense } from "react";
import { BuyerRegisterForm } from "@/components/account/BuyerRegisterForm";

export const metadata = {
  title: "Create account",
  robots: { index: false, follow: false },
};

export default function AccountRegisterPage() {
  return (
    <div className="mx-auto max-w-xl px-4 py-16">
      <Suspense fallback={<p className="text-center text-stone">Loading…</p>}>
        <BuyerRegisterForm />
      </Suspense>
    </div>
  );
}
