export type OrderStatus =
  | "pending_payment"
  | "paid"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

export type ShippingAddress = {
  name: string;
  phone?: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postal: string;
  country: string;
};

export type Order = {
  id: string;
  orderNumber: string;
  userId: string;
  status: OrderStatus;
  productSlug: string;
  productName: string;
  variantId?: string;
  variantName?: string;
  productImage?: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  currency: string;
  shipping: ShippingAddress;
  paypalOrderId?: string;
  paypalCaptureId?: string;
  carrierSlug?: string;
  trackingNumber?: string;
  aftershipId?: string;
  trackingStatus?: string;
  trackingTag?: string;
  shippedAt?: string;
  deliveredAt?: string;
  createdAt: string;
  updatedAt: string;
};

export type TrackingCheckpoint = {
  time: string;
  status: string;
  message: string;
  location?: string;
};

export type TrackingInfo = {
  carrierSlug: string;
  trackingNumber: string;
  status: string;
  tag: string;
  checkpoints: TrackingCheckpoint[];
  expectedDelivery?: string;
};

export const ORDER_STATUS_LABELS: Record<
  OrderStatus,
  { en: string; zh: string }
> = {
  pending_payment: { en: "Awaiting payment", zh: "待付款" },
  paid: { en: "Paid", zh: "已付款" },
  processing: { en: "Processing", zh: "处理中" },
  shipped: { en: "Shipped", zh: "已发货" },
  delivered: { en: "Delivered", zh: "已送达" },
  cancelled: { en: "Cancelled", zh: "已取消" },
};

/** Carriers common for China → USA shipments */
export const SHIPPING_CARRIERS = [
  { slug: "china-post", label: "China Post" },
  { slug: "china-ems", label: "China EMS" },
  { slug: "4px", label: "4PX" },
  { slug: "yanwen", label: "Yanwen" },
  { slug: "sf-express", label: "SF Express" },
  { slug: "usps", label: "USPS" },
  { slug: "fedex", label: "FedEx" },
  { slug: "ups", label: "UPS" },
  { slug: "dhl", label: "DHL" },
] as const;

export function formatShippingAddress(shipping: ShippingAddress): string {
  const parts = [
    shipping.name,
    shipping.line1,
    shipping.line2,
    `${shipping.city}, ${shipping.state} ${shipping.postal}`,
    shipping.country,
  ].filter(Boolean);
  return parts.join("\n");
}
