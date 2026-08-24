"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { PayPalCheckout } from "@/components/PayPalCheckout";
import type { BuyerUser } from "@/lib/buyer-auth";
import type { Product } from "@/lib/product-types";
import {
  formatPrice,
  resolvePurchaseOption,
} from "@/lib/product-types";
import type { ShippingAddress } from "@/lib/order-types";

const inputClass =
  "mt-1 w-full rounded-sm border border-gold/30 px-3 py-2 text-sm outline-none focus:border-burgundy";

type CheckoutClientProps = {
  product: Product;
  variantId?: string;
  user: BuyerUser;
};

export function CheckoutClient({
  product,
  variantId: initialVariantId,
  user,
}: CheckoutClientProps) {
  const purchase = useMemo(
    () => resolvePurchaseOption(product, initialVariantId),
    [product, initialVariantId]
  );

  const [shipping, setShipping] = useState<ShippingAddress>({
    name: user.name,
    phone: user.phone || "",
    line1: "",
    line2: "",
    city: "",
    state: "",
    postal: "",
    country: "US",
  });

  const shippingValid =
    shipping.name.trim() &&
    shipping.line1.trim() &&
    shipping.city.trim() &&
    shipping.state.trim() &&
    shipping.postal.trim() &&
    shipping.country === "US";

  return (
    <div className="grid gap-10 lg:grid-cols-2">
      <section className="rounded-sm border border-gold/20 bg-white p-6">
        <h2 className="font-serif text-xl text-burgundy">US shipping address</h2>
        <p className="mt-2 text-sm text-stone">
          Ships from China to the contiguous United States. Insured delivery is
          included in the listed price.
        </p>

        <div className="mt-6 space-y-4">
          <div>
            <label className="text-sm text-charcoal" htmlFor="ship-name">
              Full name
            </label>
            <input
              id="ship-name"
              className={inputClass}
              value={shipping.name}
              onChange={(e) => setShipping({ ...shipping, name: e.target.value })}
            />
          </div>
          <div>
            <label className="text-sm text-charcoal" htmlFor="ship-phone">
              Phone
            </label>
            <input
              id="ship-phone"
              className={inputClass}
              value={shipping.phone || ""}
              onChange={(e) => setShipping({ ...shipping, phone: e.target.value })}
            />
          </div>
          <div>
            <label className="text-sm text-charcoal" htmlFor="ship-line1">
              Address line 1
            </label>
            <input
              id="ship-line1"
              className={inputClass}
              value={shipping.line1}
              onChange={(e) => setShipping({ ...shipping, line1: e.target.value })}
            />
          </div>
          <div>
            <label className="text-sm text-charcoal" htmlFor="ship-line2">
              Address line 2 (optional)
            </label>
            <input
              id="ship-line2"
              className={inputClass}
              value={shipping.line2 || ""}
              onChange={(e) => setShipping({ ...shipping, line2: e.target.value })}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-sm text-charcoal" htmlFor="ship-city">
                City
              </label>
              <input
                id="ship-city"
                className={inputClass}
                value={shipping.city}
                onChange={(e) => setShipping({ ...shipping, city: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm text-charcoal" htmlFor="ship-state">
                State
              </label>
              <input
                id="ship-state"
                className={inputClass}
                placeholder="CA"
                value={shipping.state}
                onChange={(e) => setShipping({ ...shipping, state: e.target.value })}
              />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-sm text-charcoal" htmlFor="ship-postal">
                ZIP code
              </label>
              <input
                id="ship-postal"
                className={inputClass}
                value={shipping.postal}
                onChange={(e) => setShipping({ ...shipping, postal: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm text-charcoal" htmlFor="ship-country">
                Country
              </label>
              <input
                id="ship-country"
                className={inputClass}
                value="United States"
                disabled
              />
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-sm border border-gold/20 bg-white p-6">
        <h2 className="font-serif text-xl text-burgundy">Order summary</h2>
        <div className="mt-4 flex gap-4">
          {purchase.image && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={purchase.image}
              alt=""
              className="h-24 w-20 rounded-sm object-cover"
            />
          )}
          <div>
            <p className="font-medium text-charcoal">{purchase.label}</p>
            <p className="mt-1 text-2xl text-burgundy">
              {formatPrice(purchase.price)}
            </p>
            <p className="mt-1 text-sm text-stone">Signed in as {user.email}</p>
          </div>
        </div>

        <div className="mt-8">
          {!shippingValid ? (
            <p className="text-sm text-stone">
              Complete your US shipping address above to enable PayPal checkout.
            </p>
          ) : purchase.inStock ? (
            <PayPalCheckout
              slug={product.slug}
              productName={purchase.label}
              variantId={purchase.variantId}
              shipping={shipping}
            />
          ) : (
            <p className="text-sm text-burgundy">This item is sold out.</p>
          )}
        </div>

        <Link
          href={`/products/${encodeURIComponent(product.slug)}`}
          className="mt-6 inline-block text-sm text-burgundy hover:underline"
        >
          ← Back to product
        </Link>
      </section>
    </div>
  );
}
