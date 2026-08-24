import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  BUYER_COOKIE,
  BUYER_SESSION_MAX_AGE,
  createBuyerSessionValue,
  loginBuyer,
} from "@/lib/buyer-auth";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      email?: string;
      password?: string;
    };

    if (!body.email || !body.password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const result = await loginBuyer(body.email, body.password);
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 401 });
    }

    const session = createBuyerSessionValue(result.user.id);
    const jar = await cookies();
    jar.set(BUYER_COOKIE, session, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: BUYER_SESSION_MAX_AGE,
    });

    return NextResponse.json({ user: result.user });
  } catch (error) {
    console.error("Buyer login error:", error);
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}
