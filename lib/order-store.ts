import "server-only";

import {
  generateId,
  generateOrderNumber,
  getSql,
  isDatabaseConfigured,
  withDb,
} from "@/lib/db";
import type { Order, OrderStatus, ShippingAddress } from "@/lib/order-types";

type OrderRow = {
  id: string;
  order_number: string;
  user_id: string;
  status: string;
  product_slug: string;
  product_name: string;
  variant_id: string | null;
  variant_name: string | null;
  product_image: string | null;
  quantity: number;
  unit_price: string | number;
  total_amount: string | number;
  currency: string;
  shipping_name: string;
  shipping_phone: string | null;
  shipping_line1: string;
  shipping_line2: string | null;
  shipping_city: string;
  shipping_state: string;
  shipping_postal: string;
  shipping_country: string;
  paypal_order_id: string | null;
  paypal_capture_id: string | null;
  carrier_slug: string | null;
  tracking_number: string | null;
  aftership_id: string | null;
  tracking_status: string | null;
  tracking_tag: string | null;
  shipped_at: string | Date | null;
  delivered_at: string | Date | null;
  created_at: string | Date;
  updated_at: string | Date;
};

function rowToOrder(row: OrderRow): Order {
  return {
    id: row.id,
    orderNumber: row.order_number,
    userId: row.user_id,
    status: row.status as OrderStatus,
    productSlug: row.product_slug,
    productName: row.product_name,
    variantId: row.variant_id || undefined,
    variantName: row.variant_name || undefined,
    productImage: row.product_image || undefined,
    quantity: row.quantity,
    unitPrice: Number(row.unit_price),
    totalAmount: Number(row.total_amount),
    currency: row.currency,
    shipping: {
      name: row.shipping_name,
      phone: row.shipping_phone || undefined,
      line1: row.shipping_line1,
      line2: row.shipping_line2 || undefined,
      city: row.shipping_city,
      state: row.shipping_state,
      postal: row.shipping_postal,
      country: row.shipping_country,
    },
    paypalOrderId: row.paypal_order_id || undefined,
    paypalCaptureId: row.paypal_capture_id || undefined,
    carrierSlug: row.carrier_slug || undefined,
    trackingNumber: row.tracking_number || undefined,
    aftershipId: row.aftership_id || undefined,
    trackingStatus: row.tracking_status || undefined,
    trackingTag: row.tracking_tag || undefined,
    shippedAt: row.shipped_at
      ? new Date(row.shipped_at).toISOString()
      : undefined,
    deliveredAt: row.delivered_at
      ? new Date(row.delivered_at).toISOString()
      : undefined,
    createdAt: new Date(row.created_at).toISOString(),
    updatedAt: new Date(row.updated_at).toISOString(),
  };
}

export function isOrderStoreConfigured() {
  return isDatabaseConfigured();
}

export async function createPendingOrder(input: {
  userId: string;
  productSlug: string;
  productName: string;
  variantId?: string;
  variantName?: string;
  productImage?: string;
  unitPrice: number;
  quantity?: number;
  currency?: string;
  shipping: ShippingAddress;
}): Promise<Order> {
  const id = generateId();
  const orderNumber = generateOrderNumber();
  const quantity = input.quantity ?? 1;
  const totalAmount = input.unitPrice * quantity;
  const currency = input.currency ?? "USD";
  const s = input.shipping;

  return withDb(async () => {
    const sql = getSql();
    await sql`
      INSERT INTO orders (
        id, order_number, user_id, status,
        product_slug, product_name, variant_id, variant_name, product_image,
        quantity, unit_price, total_amount, currency,
        shipping_name, shipping_phone, shipping_line1, shipping_line2,
        shipping_city, shipping_state, shipping_postal, shipping_country
      ) VALUES (
        ${id}, ${orderNumber}, ${input.userId}, 'pending_payment',
        ${input.productSlug}, ${input.productName},
        ${input.variantId || null}, ${input.variantName || null}, ${input.productImage || null},
        ${quantity}, ${input.unitPrice}, ${totalAmount}, ${currency},
        ${s.name}, ${s.phone || null}, ${s.line1}, ${s.line2 || null},
        ${s.city}, ${s.state}, ${s.postal}, ${s.country}
      )
    `;
    const order = await getOrderById(id);
    if (!order) throw new Error("Failed to create order");
    return order;
  });
}

export async function setOrderPayPalId(orderId: string, paypalOrderId: string) {
  return withDb(async () => {
    const sql = getSql();
    await sql`
      UPDATE orders
      SET paypal_order_id = ${paypalOrderId}, updated_at = NOW()
      WHERE id = ${orderId}
    `;
  });
}

export async function markOrderPaid(input: {
  orderId: string;
  paypalOrderId: string;
  paypalCaptureId: string;
}) {
  return withDb(async () => {
    const sql = getSql();
    await sql`
      UPDATE orders
      SET
        status = 'paid',
        paypal_order_id = ${input.paypalOrderId},
        paypal_capture_id = ${input.paypalCaptureId},
        updated_at = NOW()
      WHERE id = ${input.orderId}
    `;
    const order = await getOrderById(input.orderId);
    if (!order) throw new Error("Order not found");
    return order;
  });
}

export async function markOrderShipped(input: {
  orderId: string;
  carrierSlug: string;
  trackingNumber: string;
  aftershipId?: string;
  trackingStatus?: string;
  trackingTag?: string;
}) {
  return withDb(async () => {
    const sql = getSql();
    await sql`
      UPDATE orders
      SET
        status = 'shipped',
        carrier_slug = ${input.carrierSlug},
        tracking_number = ${input.trackingNumber},
        aftership_id = ${input.aftershipId || null},
        tracking_status = ${input.trackingStatus || null},
        tracking_tag = ${input.trackingTag || null},
        shipped_at = NOW(),
        updated_at = NOW()
      WHERE id = ${input.orderId}
    `;
    const order = await getOrderById(input.orderId);
    if (!order) throw new Error("Order not found");
    return order;
  });
}

export async function updateOrderTracking(input: {
  orderId: string;
  trackingStatus: string;
  trackingTag: string;
  status?: OrderStatus;
}) {
  return withDb(async () => {
    const sql = getSql();
    const newStatus = input.status || undefined;
    if (newStatus === "delivered") {
      await sql`
        UPDATE orders
        SET
          tracking_status = ${input.trackingStatus},
          tracking_tag = ${input.trackingTag},
          status = 'delivered',
          delivered_at = NOW(),
          updated_at = NOW()
        WHERE id = ${input.orderId}
      `;
    } else if (newStatus) {
      await sql`
        UPDATE orders
        SET
          tracking_status = ${input.trackingStatus},
          tracking_tag = ${input.trackingTag},
          status = ${newStatus},
          updated_at = NOW()
        WHERE id = ${input.orderId}
      `;
    } else {
      await sql`
        UPDATE orders
        SET
          tracking_status = ${input.trackingStatus},
          tracking_tag = ${input.trackingTag},
          updated_at = NOW()
        WHERE id = ${input.orderId}
      `;
    }
    return getOrderById(input.orderId);
  });
}

export async function updateOrderStatus(orderId: string, status: OrderStatus) {
  return withDb(async () => {
    const sql = getSql();
    await sql`
      UPDATE orders SET status = ${status}, updated_at = NOW()
      WHERE id = ${orderId}
    `;
    return getOrderById(orderId);
  });
}

export async function getOrderById(id: string): Promise<Order | null> {
  return withDb(async () => {
    const sql = getSql();
    const rows = await sql`SELECT * FROM orders WHERE id = ${id} LIMIT 1`;
    const row = rows[0] as OrderRow | undefined;
    return row ? rowToOrder(row) : null;
  });
}

export async function getOrderByPayPalId(
  paypalOrderId: string
): Promise<Order | null> {
  return withDb(async () => {
    const sql = getSql();
    const rows = await sql`
      SELECT * FROM orders WHERE paypal_order_id = ${paypalOrderId} LIMIT 1
    `;
    const row = rows[0] as OrderRow | undefined;
    return row ? rowToOrder(row) : null;
  });
}

export async function getOrdersByUserId(userId: string): Promise<Order[]> {
  return withDb(async () => {
    const sql = getSql();
    const rows = await sql`
      SELECT * FROM orders
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
    `;
    return (rows as OrderRow[]).map(rowToOrder);
  });
}

export async function getAllOrders(): Promise<Order[]> {
  return withDb(async () => {
    const sql = getSql();
    const rows = await sql`
      SELECT * FROM orders ORDER BY created_at DESC
    `;
    return (rows as OrderRow[]).map(rowToOrder);
  });
}

export async function getOrderForUser(
  orderId: string,
  userId: string
): Promise<Order | null> {
  const order = await getOrderById(orderId);
  if (!order || order.userId !== userId) return null;
  return order;
}
