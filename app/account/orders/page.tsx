import Link from "next/link";
import { BuyerLogoutButton } from "@/components/account/BuyerLogoutButton";
import { redirect } from "next/navigation";
import { getBuyerUser } from "@/lib/buyer-auth";
import { getOrdersByUserId, isOrderStoreConfigured } from "@/lib/order-store";
import { ORDER_STATUS_LABELS } from "@/lib/order-types";
import { formatPrice } from "@/lib/product-types";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "My orders",
  robots: { index: false, follow: false },
};

export default async function AccountOrdersPage() {
  const user = await getBuyerUser();
  if (!user) {
    redirect("/account/login?redirect=/account/orders");
  }

  if (!isOrderStoreConfigured()) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <h1 className="font-serif text-3xl text-burgundy">My orders</h1>
        <p className="mt-4 text-stone">Order system is not configured yet.</p>
      </div>
    );
  }

  const orders = await getOrdersByUserId(user.id);

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl text-burgundy">My orders</h1>
          <p className="mt-2 text-sm text-stone">Signed in as {user.email}</p>
        </div>
        <BuyerLogoutButton />
      </div>

      {orders.length === 0 ? (
        <div className="mt-12 rounded-sm border border-gold/20 bg-white p-8 text-center">
          <p className="text-stone">You have no orders yet.</p>
          <Link href="/products" className="btn-primary mt-6 inline-flex">
            Browse collection
          </Link>
        </div>
      ) : (
        <div className="mt-8 space-y-4">
          {orders.map((order) => (
            <Link
              key={order.id}
              href={`/account/orders/${order.id}`}
              className="block rounded-sm border border-gold/20 bg-white p-5 transition-shadow hover:shadow-md"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="font-mono text-sm text-stone">{order.orderNumber}</p>
                  <p className="mt-1 font-medium text-charcoal">{order.productName}</p>
                  <p className="mt-1 text-sm text-stone">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-burgundy">
                    {formatPrice(order.totalAmount)}
                  </p>
                  <p className="mt-1 text-sm text-stone">
                    {ORDER_STATUS_LABELS[order.status].en}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
