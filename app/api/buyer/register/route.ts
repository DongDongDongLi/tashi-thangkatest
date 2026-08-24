import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  BUYER_COOKIE,
  BUYER_SESSION_MAX_AGE,
  createBuyerSessionValue,
  registerBuyer,
} from "@/lib/buyer-auth";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      email?: string;
      password?: string;
      name?: string;
      phone?: string;
    };

    if (!body.email || !body.password || !body.name) {
      return NextResponse.json(
        { error: "Email, password, and name are required" },
        { status: 400 }
      );
    }

    const result = await registerBuyer({
      email: body.email,
      password: body.password,
      name: body.name,
      phone: body.phone,
    });

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 400 });
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
    console.error("Buyer register error:", error);
    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }
}
