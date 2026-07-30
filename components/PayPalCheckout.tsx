"use client";

import {
  PayPalButtons,
  PayPalScriptProvider,
  type ReactPayPalScriptOptions,
} from "@paypal/react-paypal-js";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

type PayPalCheckoutProps = {
  slug: string;
  productName: string;
  configured: boolean;
  clientId: string;
};

export function PayPalCheckout({
  slug,
  productName,
  configured,
  clientId,
}: PayPalCheckoutProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [paying, setPaying] = useState(false);

  if (!configured || !clientId) {
    return (
      <div className="w-full max-w-sm space-y-3 rounded-sm border border-gold/30 bg-white p-4">
        <p className="text-sm text-stone">
          PayPal checkout is almost ready. Add your PayPal Client ID and Secret
          to <code className="text-burgundy">.env.local</code>, then restart the
          server.
        </p>
        <Link href="/contact" className="btn-outline w-full">
          Inquire instead
        </Link>
      </div>
    );
  }

  const options: ReactPayPalScriptOptions = {
    clientId,
    currency: "USD",
    intent: "capture",
  };

  return (
    <div className="w-full max-w-sm space-y-3">
      <p className="text-xs uppercase tracking-widest text-gold-dark">
        Pay securely with PayPal
      </p>

      <PayPalScriptProvider options={options}>
        <PayPalButtons
          style={{
            layout: "vertical",
            color: "gold",
            shape: "rect",
            label: "paypal",
          }}
          disabled={paying}
          createOrder={async () => {
            setError(null);
            setPaying(true);
            try {
              const response = await fetch("/api/paypal/create-order", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ slug }),
              });
              const data = (await response.json()) as {
                id?: string;
                error?: string;
              };
              if (!response.ok || !data.id) {
                throw new Error(data.error || "Could not create order");
              }
              return data.id;
            } catch (err) {
              setPaying(false);
              const message =
                err instanceof Error ? err.message : "Order creation failed";
              setError(message);
              throw err;
            }
          }}
          onApprove={async (data) => {
            try {
              const response = await fetch("/api/paypal/capture-order", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ orderID: data.orderID }),
              });
              const result = (await response.json()) as {
                status?: string;
                captureId?: string;
                error?: string;
              };
              if (!response.ok) {
                throw new Error(result.error || "Payment capture failed");
              }
              const params = new URLSearchParams({
                order: data.orderID,
                product: productName,
              });
              if (result.captureId) params.set("capture", result.captureId);
              router.push(`/checkout/success?${params.toString()}`);
            } catch (err) {
              const message =
                err instanceof Error ? err.message : "Payment failed";
              setError(message);
              setPaying(false);
            }
          }}
          onCancel={() => {
            setPaying(false);
            router.push(`/checkout/cancel?product=${encodeURIComponent(slug)}`);
          }}
          onError={() => {
            setPaying(false);
            setError("PayPal reported an error. Please try again.");
          }}
        />
      </PayPalScriptProvider>

      {error && (
        <p className="text-sm text-burgundy" role="alert">
          {error}
        </p>
      )}

      <p className="text-xs leading-relaxed text-stone">
        You will complete payment on PayPal. Free insured US shipping is included
        in the listed price.
      </p>
    </div>
  );
}
