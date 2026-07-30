import type { Metadata } from "next";
import Link from "next/link";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "Payment Successful",
  robots: { index: false, follow: false },
};

type Props = {
  searchParams: Promise<{ order?: string; capture?: string; product?: string }>;
};

export default async function CheckoutSuccessPage({ searchParams }: Props) {
  const params = await searchParams;

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center px-4 py-20 text-center">
      <p className="text-xs uppercase tracking-[0.3em] text-gold-dark">
        Thank you
      </p>
      <h1 className="mt-4 font-serif text-4xl text-burgundy">
        Payment received
      </h1>
      <p className="mt-4 text-stone">
        {params.product
          ? `Your order for ${params.product} has been confirmed.`
          : "Your PayPal payment has been confirmed."}{" "}
        We will email shipping details shortly.
      </p>

      {(params.order || params.capture) && (
        <dl className="mt-8 w-full max-w-md space-y-2 rounded-sm border border-gold/20 bg-white p-6 text-left text-sm">
          {params.order && (
            <div className="flex justify-between gap-4">
              <dt className="text-stone">PayPal Order</dt>
              <dd className="font-mono text-charcoal">{params.order}</dd>
            </div>
          )}
          {params.capture && (
            <div className="flex justify-between gap-4">
              <dt className="text-stone">Capture ID</dt>
              <dd className="font-mono text-charcoal">{params.capture}</dd>
            </div>
          )}
        </dl>
      )}

      <p className="mt-6 text-sm text-stone">
        Questions? Email{" "}
        <a href={`mailto:${siteConfig.email}`} className="text-burgundy hover:underline">
          {siteConfig.email}
        </a>
      </p>

      <div className="mt-10 flex flex-wrap justify-center gap-4">
        <Link href="/products" className="btn-primary">
          Continue shopping
        </Link>
        <Link href="/" className="btn-outline">
          Back to home
        </Link>
      </div>
    </div>
  );
}
