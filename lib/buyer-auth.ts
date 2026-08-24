import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import {
  generateId,
  getSql,
  isDatabaseConfigured,
  withDb,
} from "@/lib/db";

export const BUYER_COOKIE = "tashi_buyer_session";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30 days

export type BuyerUser = {
  id: string;
  email: string;
  name: string;
  phone?: string;
  createdAt: string;
};

function getSecret() {
  return (
    process.env.BUYER_SESSION_SECRET ||
    process.env.ADMIN_SESSION_SECRET ||
    process.env.ADMIN_PASSWORD ||
    "dev-only-buyer-secret"
  );
}

function sign(payload: string) {
  return createHmac("sha256", getSecret()).update(payload).digest("hex");
}

export function createBuyerSessionValue(userId: string) {
  const exp = Date.now() + MAX_AGE_SECONDS * 1000;
  const payload = `${userId}:${exp}`;
  return `${payload}.${sign(payload)}`;
}

export function parseBuyerSession(value?: string | null): string | null {
  if (!value) return null;
  const lastDot = value.lastIndexOf(".");
  if (lastDot <= 0) return null;
  const payload = value.slice(0, lastDot);
  const sig = value.slice(lastDot + 1);
  const [userId, expStr] = payload.split(":");
  const exp = Number(expStr);
  if (!userId || !expStr || !sig || !Number.isFinite(exp) || Date.now() > exp) {
    return null;
  }
  const expected = sign(payload);
  try {
    if (!timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
  } catch {
    return null;
  }
  return userId;
}

export async function getBuyerSessionUserId(): Promise<string | null> {
  const jar = await cookies();
  return parseBuyerSession(jar.get(BUYER_COOKIE)?.value);
}

export async function getBuyerUser(): Promise<BuyerUser | null> {
  const userId = await getBuyerSessionUserId();
  if (!userId || !isDatabaseConfigured()) return null;
  return getUserById(userId);
}

export async function requireBuyer() {
  if (!isDatabaseConfigured()) {
    return {
      ok: false as const,
      status: 503,
      error: "DATABASE_URL is not configured",
    };
  }
  const userId = await getBuyerSessionUserId();
  if (!userId) {
    return { ok: false as const, status: 401, error: "Please sign in" };
  }
  const user = await getUserById(userId);
  if (!user) {
    return { ok: false as const, status: 401, error: "Session expired" };
  }
  return { ok: true as const, user };
}

function rowToUser(row: {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  created_at: string | Date;
}): BuyerUser {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    phone: row.phone || undefined,
    createdAt: new Date(row.created_at).toISOString(),
  };
}

export async function getUserById(id: string): Promise<BuyerUser | null> {
  return withDb(async () => {
    const sql = getSql();
    const rows = await sql`
      SELECT id, email, name, phone, created_at
      FROM users WHERE id = ${id} LIMIT 1
    `;
    const row = rows[0] as
      | {
          id: string;
          email: string;
          name: string;
          phone: string | null;
          created_at: string | Date;
        }
      | undefined;
    return row ? rowToUser(row) : null;
  });
}

export async function getUserByEmail(email: string): Promise<
  (BuyerUser & { passwordHash: string }) | null
> {
  return withDb(async () => {
    const sql = getSql();
    const rows = await sql`
      SELECT id, email, name, phone, password_hash, created_at
      FROM users WHERE email = ${email.toLowerCase().trim()} LIMIT 1
    `;
    const row = rows[0] as
      | {
          id: string;
          email: string;
          name: string;
          phone: string | null;
          password_hash: string;
          created_at: string | Date;
        }
      | undefined;
    if (!row) return null;
    return {
      ...rowToUser(row),
      passwordHash: row.password_hash,
    };
  });
}

export async function registerBuyer(input: {
  email: string;
  password: string;
  name: string;
  phone?: string;
}): Promise<{ ok: true; user: BuyerUser } | { ok: false; error: string }> {
  if (!isDatabaseConfigured()) {
    return { ok: false, error: "Database is not configured" };
  }

  const email = input.email.toLowerCase().trim();
  const name = input.name.trim();
  const password = input.password;

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false, error: "Invalid email address" };
  }
  if (!name || name.length < 2) {
    return { ok: false, error: "Name is required" };
  }
  if (password.length < 8) {
    return { ok: false, error: "Password must be at least 8 characters" };
  }

  const existing = await getUserByEmail(email);
  if (existing) {
    return { ok: false, error: "An account with this email already exists" };
  }

  const id = generateId();
  const passwordHash = await bcrypt.hash(password, 10);

  return withDb(async () => {
    const sql = getSql();
    await sql`
      INSERT INTO users (id, email, password_hash, name, phone)
      VALUES (${id}, ${email}, ${passwordHash}, ${name}, ${input.phone?.trim() || null})
    `;
    const user = await getUserById(id);
    if (!user) throw new Error("Failed to create user");
    return { ok: true, user };
  });
}

export async function loginBuyer(
  email: string,
  password: string
): Promise<{ ok: true; user: BuyerUser } | { ok: false; error: string }> {
  if (!isDatabaseConfigured()) {
    return { ok: false, error: "Database is not configured" };
  }

  const user = await getUserByEmail(email);
  if (!user) {
    return { ok: false, error: "Invalid email or password" };
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    return { ok: false, error: "Invalid email or password" };
  }

  const { passwordHash: _hash, ...buyer } = user;
  void _hash;
  return { ok: true, user: buyer };
}

export { MAX_AGE_SECONDS as BUYER_SESSION_MAX_AGE };
