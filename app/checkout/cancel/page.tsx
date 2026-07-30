import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Checkout Cancelled",
  robots: { index: false, follow: false },
};

type Props = {
  searchParams: Promise<{ product?: string }>;
};

export default async function CheckoutCancelPage({ searchParams }: Props) {
  const params = await searchParams;
  const productHref = params.product
    ? `/products/${params.product}`
    : "/products";

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center px-4 py-20 text-center">
      <p className="text-xs uppercase tracking-[0.3em] text-gold-dark">
        Checkout
      </p>
      <h1 className="mt-4 font-serif text-4xl text-burgundy">
        Payment cancelled
      </h1>
      <p className="mt-4 text-stone">
        No charge was made. You can return to the product and try PayPal again
        whenever you are ready.
      </p>

      <div className="mt-10 flex flex-wrap justify-center gap-4">
        <Link href={productHref} className="btn-primary">
          Return to product
        </Link>
        <Link href="/contact" className="btn-outline">
          Contact us
        </Link>
      </div>
    </div>
  );
}
