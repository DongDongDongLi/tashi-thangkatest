import { NextResponse } from "next/server";
import { getBuyerUser } from "@/lib/buyer-auth";

export async function GET() {
  const user = await getBuyerUser();
  return NextResponse.json({ user });
}
