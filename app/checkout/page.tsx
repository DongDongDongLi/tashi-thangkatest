import { redirect } from "next/navigation";
import { CheckoutClient } from "@/components/checkout/CheckoutClient";
import { getBuyerUser } from "@/lib/buyer-auth";
import { getProductBySlug } from "@/lib/products";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{ slug?: string; variantId?: string }>;
};

export default async function CheckoutPage({ searchParams }: Props) {
  const params = await searchParams;
  const slug = params.slug;

  if (!slug) {
    redirect("/products");
  }

  const user = await getBuyerUser();
  if (!user) {
    const q = new URLSearchParams({ slug });
    if (params.variantId) q.set("variantId", params.variantId);
    redirect(`/account/login?redirect=${encodeURIComponent(`/checkout?${q.toString()}`)}`);
  }

  const product = await getProductBySlug(slug);
  if (!product) {
    redirect("/products");
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="font-serif text-3xl text-burgundy">Checkout</h1>
      <p className="mt-2 text-stone">
        Complete your US delivery details, then pay with PayPal.
      </p>
      <div className="mt-10">
        <CheckoutClient
          product={product}
          variantId={params.variantId}
          user={user}
        />
      </div>
    </div>
  );
}
