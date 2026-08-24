const PAYPAL_API_BASE =
  process.env.PAYPAL_MODE === "live"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";

export function isPayPalConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID && process.env.PAYPAL_CLIENT_SECRET
  );
}

async function getAccessToken(): Promise<string> {
  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("PayPal credentials are not configured");
  }

  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
  const response = await fetch(`${PAYPAL_API_BASE}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`PayPal auth failed: ${text}`);
  }

  const data = (await response.json()) as { access_token: string };
  return data.access_token;
}

export type PayPalShippingInput = {
  name: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postal: string;
  country: string;
};

export async function createPayPalOrder(input: {
  slug: string;
  name: string;
  price: number;
  currency?: string;
  internalOrderId?: string;
  shipping?: PayPalShippingInput;
}) {
  const accessToken = await getAccessToken();
  const currency = input.currency ?? "USD";
  const value = input.price.toFixed(2);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  const purchaseUnit: Record<string, unknown> = {
    reference_id: input.internalOrderId || input.slug,
    description: input.name.slice(0, 127),
    amount: {
      currency_code: currency,
      value,
    },
  };

  if (input.shipping) {
    purchaseUnit.shipping = {
      name: { full_name: input.shipping.name.slice(0, 300) },
      address: {
        address_line_1: input.shipping.line1.slice(0, 300),
        address_line_2: input.shipping.line2?.slice(0, 300) || undefined,
        admin_area_2: input.shipping.city.slice(0, 120),
        admin_area_1: input.shipping.state.slice(0, 120),
        postal_code: input.shipping.postal.slice(0, 60),
        country_code: input.shipping.country.slice(0, 2).toUpperCase(),
      },
    };
  }

  const response = await fetch(`${PAYPAL_API_BASE}/v2/checkout/orders`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [purchaseUnit],
      application_context: {
        brand_name: "Tashi Thangka",
        shipping_preference: input.shipping
          ? "SET_PROVIDED_ADDRESS"
          : "NO_SHIPPING",
        user_action: "PAY_NOW",
        return_url: `${siteUrl}/checkout/success`,
        cancel_url: `${siteUrl}/checkout/cancel`,
      },
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`PayPal create order failed: ${text}`);
  }

  return response.json() as Promise<{ id: string; status: string }>;
}

export async function capturePayPalOrder(orderId: string) {
  const accessToken = await getAccessToken();

  const response = await fetch(
    `${PAYPAL_API_BASE}/v2/checkout/orders/${orderId}/capture`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`PayPal capture failed: ${text}`);
  }

  return response.json() as Promise<{
    id: string;
    status: string;
    purchase_units?: Array<{
      reference_id?: string;
      payments?: {
        captures?: Array<{ id: string; status: string }>;
      };
    }>;
  }>;
}
