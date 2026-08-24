import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { TrackingTimeline } from "@/components/orders/TrackingTimeline";
import { getBuyerUser } from "@/lib/buyer-auth";
import { getAfterShipTracking } from "@/lib/aftership";
import { getOrderForUser, isOrderStoreConfigured } from "@/lib/order-store";
import {
  ORDER_STATUS_LABELS,
  SHIPPING_CARRIERS,
  formatShippingAddress,
} from "@/lib/order-types";
import { formatPrice } from "@/lib/product-types";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  return {
    title: `Order ${id.slice(0, 8)}…`,
    robots: { index: false, follow: false },
  };
}

export default async function BuyerOrderDetailPage({ params }: Props) {
  const user = await getBuyerUser();
  if (!user) {
    redirect(`/account/login?redirect=/account/orders/${(await params).id}`);
  }

  if (!isOrderStoreConfigured()) notFound();

  const { id } = await params;
  const order = await getOrderForUser(id, user.id);
  if (!order) notFound();

  let tracking = null;
  if (order.carrierSlug && order.trackingNumber) {
    tracking = await getAfterShipTracking(
      order.carrierSlug,
      order.trackingNumber
    );
  }

  const carrierLabel =
    SHIPPING_CARRIERS.find((c) => c.slug === order.carrierSlug)?.label ||
    order.carrierSlug;

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <Link href="/account/orders" className="text-sm text-burgundy hover:underline">
        ← Back to orders
      </Link>

      <h1 className="mt-4 font-serif text-3xl text-burgundy">{order.orderNumber}</h1>
      <p className="mt-2 text-stone">
        Status: {ORDER_STATUS_LABELS[order.status].en}
      </p>

      <section className="mt-8 rounded-sm border border-gold/20 bg-white p-6">
        <h2 className="font-serif text-xl text-burgundy">Items</h2>
        <div className="mt-4 flex gap-4">
          {order.productImage && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={order.productImage}
              alt=""
              className="h-28 w-24 rounded-sm object-cover"
            />
          )}
          <div>
            <p className="font-medium text-charcoal">{order.productName}</p>
            {order.variantName && (
              <p className="text-sm text-stone">Variant: {order.variantName}</p>
            )}
            <p className="mt-2 text-lg text-burgundy">
              {formatPrice(order.totalAmount)}
            </p>
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-sm border border-gold/20 bg-white p-6">
        <h2 className="font-serif text-xl text-burgundy">Shipping to</h2>
        <pre className="mt-4 whitespace-pre-wrap font-sans text-sm text-stone">
          {formatShippingAddress(order.shipping)}
        </pre>
      </section>

      {order.trackingNumber && (
        <section className="mt-6 rounded-sm border border-gold/20 bg-white p-6">
          <h2 className="font-serif text-xl text-burgundy">Tracking</h2>
          <p className="mt-2 text-sm text-stone">
            {carrierLabel} · {order.trackingNumber}
          </p>
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
  );
}
