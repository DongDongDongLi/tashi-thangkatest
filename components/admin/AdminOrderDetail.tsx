"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { TrackingTimeline } from "@/components/orders/TrackingTimeline";
import type { Order, TrackingInfo } from "@/lib/order-types";
import {
  ORDER_STATUS_LABELS,
  SHIPPING_CARRIERS,
  formatShippingAddress,
} from "@/lib/order-types";
import { formatPrice } from "@/lib/product-types";

const inputClass =
  "mt-1 w-full rounded-sm border border-gold/30 px-3 py-2 text-sm outline-none focus:border-burgundy";

type BuyerInfo = { email: string; name: string; phone?: string };

export function AdminOrderDetail({ orderId }: { orderId: string }) {
  const [order, setOrder] = useState<Order | null>(null);
  const [buyer, setBuyer] = useState<BuyerInfo | null>(null);
  const [tracking, setTracking] = useState<TrackingInfo | null>(null);
  const [carrierSlug, setCarrierSlug] = useState("china-post");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`);
      const data = (await res.json()) as {
        order?: Order;
        buyer?: BuyerInfo;
        tracking?: TrackingInfo | null;
        error?: string;
      };
      if (!res.ok) throw new Error(data.error || "Failed to load order");
      setOrder(data.order || null);
      setBuyer(data.buyer || null);
      setTracking(data.tracking || null);
      if (data.order?.carrierSlug) setCarrierSlug(data.order.carrierSlug);
      if (data.order?.trackingNumber) setTrackingNumber(data.order.trackingNumber);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  async function onShip(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    setError(null);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ship: true,
          carrierSlug,
          trackingNumber,
        }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error || "Failed to ship");
      setMessage("Shipment saved and tracking registered with AfterShip.");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to ship");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="text-stone">Loading order…</p>;
  if (error && !order) {
    return <p className="text-burgundy">{error}</p>;
  }
  if (!order) return <p className="text-stone">Order not found.</p>;

  return (
    <div>
      <Link href="/admin/orders" className="text-sm text-burgundy hover:underline">
        ← Back to orders
      </Link>
      <h1 className="mt-4 font-serif text-3xl text-burgundy">{order.orderNumber}</h1>
      <p className="mt-2 text-stone">
        {ORDER_STATUS_LABELS[order.status].en} ·{" "}
        {new Date(order.createdAt).toLocaleString()}
      </p>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section className="rounded-sm border border-gold/20 bg-white p-6">
          <h2 className="font-serif text-xl text-burgundy">Customer</h2>
          {buyer && (
            <dl className="mt-4 space-y-2 text-sm">
              <div>
                <dt className="text-stone">Name</dt>
                <dd className="text-charcoal">{buyer.name}</dd>
              </div>
              <div>
                <dt className="text-stone">Email</dt>
                <dd className="text-charcoal">{buyer.email}</dd>
              </div>
              {buyer.phone && (
                <div>
                  <dt className="text-stone">Phone</dt>
                  <dd className="text-charcoal">{buyer.phone}</dd>
                </div>
              )}
            </dl>
          )}
        </section>

        <section className="rounded-sm border border-gold/20 bg-white p-6">
          <h2 className="font-serif text-xl text-burgundy">Product</h2>
          <p className="mt-4 font-medium text-charcoal">{order.productName}</p>
          {order.variantName && (
            <p className="text-sm text-stone">Variant: {order.variantName}</p>
          )}
          <p className="mt-2 text-lg text-burgundy">
            {formatPrice(order.totalAmount)}
          </p>
        </section>

        <section className="rounded-sm border border-gold/20 bg-white p-6 lg:col-span-2">
          <h2 className="font-serif text-xl text-burgundy">US shipping address</h2>
          <pre className="mt-4 whitespace-pre-wrap font-sans text-sm text-stone">
            {formatShippingAddress(order.shipping)}
          </pre>
        </section>

        <section className="rounded-sm border border-gold/20 bg-white p-6 lg:col-span-2">
          <h2 className="font-serif text-xl text-burgundy">Ship order</h2>
          <p className="mt-2 text-sm text-stone">
            Select carrier (China → US) and enter tracking number. AfterShip will
            sync tracking updates to the buyer.
          </p>
          <form onSubmit={onShip} className="mt-6 grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-sm text-charcoal" htmlFor="carrier">
                Carrier
              </label>
              <select
                id="carrier"
                className={inputClass}
                value={carrierSlug}
                onChange={(e) => setCarrierSlug(e.target.value)}
              >
                {SHIPPING_CARRIERS.map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm text-charcoal" htmlFor="tracking">
                Tracking number
              </label>
              <input
                id="tracking"
                required
                className={inputClass}
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
              />
            </div>
            <div className="sm:col-span-2">
              <button type="submit" disabled={saving} className="btn-primary">
                {saving ? "Saving…" : "Mark as shipped"}
              </button>
            </div>
          </form>
          {message && <p className="mt-4 text-sm text-green-700">{message}</p>}
          {error && (
            <p className="mt-4 text-sm text-burgundy" role="alert">
              {error}
            </p>
          )}
        </section>

        {order.trackingNumber && (
          <section className="rounded-sm border border-gold/20 bg-white p-6 lg:col-span-2">
            <h2 className="font-serif text-xl text-burgundy">Tracking timeline</h2>
            <div className="mt-6">
              <TrackingTimeline
                checkpoints={tracking?.checkpoints || []}
                status={tracking?.status || order.trackingStatus}
                expectedDelivery={tracking?.expectedDelivery}
              />
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
