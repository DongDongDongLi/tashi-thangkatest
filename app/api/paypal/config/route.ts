import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID ?? "";
  const hasSecret = Boolean(process.env.PAYPAL_CLIENT_SECRET);
  const mode = process.env.PAYPAL_MODE === "live" ? "live" : "sandbox";

  return NextResponse.json({
    clientId,
    configured: Boolean(clientId && hasSecret),
    mode,
  });
}
