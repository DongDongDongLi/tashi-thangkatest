import "server-only";

import type { TrackingCheckpoint, TrackingInfo } from "@/lib/order-types";

const AFTERSHIP_API = "https://api.aftership.com/tracking/2025-01";

export function isAfterShipConfigured() {
  return Boolean(process.env.AFTERSHIP_API_KEY);
}

function getApiKey() {
  const key = process.env.AFTERSHIP_API_KEY;
  if (!key) throw new Error("AFTERSHIP_API_KEY is not configured");
  return key;
}

async function afterShipFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(`${AFTERSHIP_API}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "aftership-api-key": getApiKey(),
      ...(options.headers || {}),
    },
  });

  const data = (await response.json()) as {
    meta?: { code?: number; message?: string };
    data?: T;
  };

  if (!response.ok || (data.meta?.code && data.meta.code !== 200)) {
    throw new Error(data.meta?.message || `AfterShip API error (${response.status})`);
  }

  return data.data as T;
}

export async function createAfterShipTracking(input: {
  slug: string;
  trackingNumber: string;
  orderNumber: string;
  customerEmail?: string;
  customerName?: string;
}) {
  if (!isAfterShipConfigured()) {
    return null;
  }

  const body = {
    tracking: {
      slug: input.slug,
      tracking_number: input.trackingNumber,
      title: `Order ${input.orderNumber}`,
      order_id: input.orderNumber,
      customer_name: input.customerName,
      emails: input.customerEmail ? [input.customerEmail] : undefined,
      language: "en",
    },
  };

  const data = await afterShipFetch<{
    tracking: {
      id: string;
      slug: string;
      tracking_number: string;
      tag: string;
    };
  }>("/trackings", {
    method: "POST",
    body: JSON.stringify(body),
  });

  return data.tracking;
}

export async function getAfterShipTracking(
  slug: string,
  trackingNumber: string
): Promise<TrackingInfo | null> {
  if (!isAfterShipConfigured()) return null;

  try {
    const encodedSlug = encodeURIComponent(slug);
    const encodedNumber = encodeURIComponent(trackingNumber);
    const data = await afterShipFetch<{
      tracking: {
        slug: string;
        tracking_number: string;
        tag: string;
        subtag_message?: string;
        expected_delivery?: string | null;
        checkpoints?: Array<{
          checkpoint_time?: string;
          tag?: string;
          message?: string;
          location?: string;
          city?: string;
          state?: string;
          country_name?: string;
        }>;
      };
    }>(`/trackings/${encodedSlug}/${encodedNumber}`);

    const t = data.tracking;
    const checkpoints: TrackingCheckpoint[] = (t.checkpoints || [])
      .map((cp) => ({
        time: cp.checkpoint_time || "",
        status: cp.tag || "",
        message: cp.message || "",
        location: [cp.location, cp.city, cp.state, cp.country_name]
          .filter(Boolean)
          .join(", "),
      }))
      .filter((cp) => cp.time)
      .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());

    return {
      carrierSlug: t.slug,
      trackingNumber: t.tracking_number,
      status: t.subtag_message || t.tag,
      tag: t.tag,
      checkpoints,
      expectedDelivery: t.expected_delivery || undefined,
    };
  } catch (error) {
    console.error("AfterShip get tracking failed:", error);
    return null;
  }
}

export function mapAfterShipTagToOrderStatus(
  tag: string
): "shipped" | "delivered" | undefined {
  const normalized = tag.toLowerCase();
  if (normalized === "delivered") return "delivered";
  if (
    ["intransit", "outfordelivery", "availableforpickup", "attemptfail"].includes(
      normalized
    )
  ) {
    return "shipped";
  }
  return undefined;
}
