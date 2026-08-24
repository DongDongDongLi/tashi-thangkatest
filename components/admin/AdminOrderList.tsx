"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { Order } from "@/lib/order-types";
import { ORDER_STATUS_LABELS } from "@/lib/order-types";
import { formatPrice } from "@/lib/product-types";

export function AdminOrderList() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/orders")
      .then((res) => res.json())
      .then((data: { orders?: Order[]; error?: string }) => {
        if (data.error) throw new Error(data.error);
        setOrders(data.orders || []);
      })
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Failed to load orders")
      )
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl text-burgundy">Orders</h1>
          <p className="mt-2 text-sm text-stone">Manage customer orders and shipments.</p>
        </div>
        <div className="flex gap-3">
          <Link href="/admin" className="btn-outline text-sm">
            Products
          </Link>
        </div>
      </div>

      {loading && <p className="mt-8 text-stone">Loading orders…</p>}
      {error && (
        <p className="mt-8 text-sm text-burgundy" role="alert">
          {error}
        </p>
      )}

      {!loading && !error && orders.length === 0 && (
        <p className="mt-8 text-stone">No orders yet.</p>
      )}

      {!loading && orders.length > 0 && (
        <div className="mt-8 overflow-x-auto rounded-sm border border-gold/20 bg-white">
          <table className="min-w-full text-sm">
            <thead className="border-b border-gold/20 bg-cream text-xs uppercase tracking-wider text-stone">
              <tr>
                <th className="px-4 py-3 text-left">Order</th>
                <th className="px-4 py-3 text-left">Product</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-right">Total</th>
                <th className="px-4 py-3 text-left">Date</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="border-b border-gold/10">
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="font-mono text-burgundy hover:underline"
                    >
                      {order.orderNumber}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-charcoal">{order.productName}</td>
                  <td className="px-4 py-3 text-stone">
                    {ORDER_STATUS_LABELS[order.status].en}
                  </td>
                  <td className="px-4 py-3 text-right text-charcoal">
                    {formatPrice(order.totalAmount)}
                  </td>
                  <td className="px-4 py-3 text-stone">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
