"use client";

import {
  PayPalButtons,
  PayPalScriptProvider,
  type ReactPayPalScriptOptions,
} from "@paypal/react-paypal-js";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { ShippingAddress } from "@/lib/order-types";

type PayPalCheckoutProps = {
  slug: string;
  productName: string;
  variantId?: string;
  shipping: ShippingAddress;
  disabled?: boolean;
};

type PayPalConfig = {
  clientId: string;
  configured: boolean;
  mode: string;
};

export function PayPalCheckout({
  slug,
  productName,
  variantId,
  shipping,
  disabled,
}: PayPalCheckoutProps) {
  const router = useRouter();
  const [config, setConfig] = useState<PayPalConfig | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [paying, setPaying] = useState(false);
  const [internalOrderId, setInternalOrderId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/paypal/config")
      .then((res) => res.json())
      .then((data: PayPalConfig) => {
        if (!cancelled) setConfig(data);
      })
      .catch(() => {
        if (!cancelled) {
          setConfig({ clientId: "", configured: false, mode: "sandbox" });
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!config) {
    return (
      <div className="rounded-sm border border-gold/30 bg-white p-4 text-sm text-stone">
        Loading PayPal…
      </div>
    );
  }

  if (!config.configured || !config.clientId) {
    return (
      <div className="rounded-sm border border-gold/30 bg-white p-4 text-sm text-stone">
        PayPal is not configured yet.
      </div>
    );
  }

  const options: ReactPayPalScriptOptions = {
    clientId: config.clientId,
    currency: "USD",
    intent: "capture",
  };

  const shippingKey = JSON.stringify(shipping);

  return (
    <div className="space-y-3">
      <p className="text-xs uppercase tracking-widest text-gold-dark">
        Pay securely with PayPal
        {config.mode === "live" ? "" : " (Sandbox)"}
      </p>

      <PayPalScriptProvider options={options}>
        <PayPalButtons
          style={{
            layout: "vertical",
            color: "gold",
            shape: "rect",
            label: "paypal",
          }}
          disabled={disabled || paying}
          forceReRender={[slug, variantId || "", productName, shippingKey]}
          createOrder={async () => {
            setError(null);
            setPaying(true);
            try {
              const response = await fetch("/api/paypal/create-order", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ slug, variantId, shipping }),
              });
              const data = (await response.json()) as {
                id?: string;
                internalOrderId?: string;
                error?: string;
              };
              if (!response.ok || !data.id) {
                throw new Error(data.error || "Could not create order");
              }
              if (data.internalOrderId) {
                setInternalOrderId(data.internalOrderId);
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
                body: JSON.stringify({
                  orderID: data.orderID,
                  internalOrderId,
                }),
              });
              const result = (await response.json()) as {
                internalOrderId?: string;
                orderNumber?: string;
                error?: string;
              };
              if (!response.ok) {
                throw new Error(result.error || "Payment capture failed");
              }
              const orderId = result.internalOrderId || internalOrderId;
              if (orderId) {
                router.push(`/account/orders/${orderId}`);
              } else {
                router.push("/account/orders");
              }
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
    </div>
  );
}
