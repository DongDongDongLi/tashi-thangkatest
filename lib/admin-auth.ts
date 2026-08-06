import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

export const ADMIN_COOKIE = "tashi_admin_session";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 days

function getAdminPassword() {
  return process.env.ADMIN_PASSWORD || "";
}

function getSecret() {
  return (
    process.env.ADMIN_SESSION_SECRET ||
    process.env.ADMIN_PASSWORD ||
    "dev-only-change-me"
  );
}

function sign(payload: string) {
  return createHmac("sha256", getSecret()).update(payload).digest("hex");
}

export function isAdminConfigured() {
  return Boolean(getAdminPassword());
}

export function verifyAdminPassword(password: string) {
  const expected = getAdminPassword();
  if (!expected) return false;
  const a = Buffer.from(password);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export function createAdminSessionValue() {
  const exp = Date.now() + MAX_AGE_SECONDS * 1000;
  const payload = `admin:${exp}`;
  return `${exp}.${sign(payload)}`;
}

export function isValidAdminSession(value?: string | null) {
  if (!value) return false;
  const [expStr, sig] = value.split(".");
  const exp = Number(expStr);
  if (!expStr || !sig || !Number.isFinite(exp) || Date.now() > exp) return false;
  const expected = sign(`admin:${exp}`);
  try {
    return timingSafeEqual(Buffer.from(sig), Buffer.from(expected));
  } catch {
    return false;
  }
}

export async function requireAdmin() {
  if (!isAdminConfigured()) {
    return { ok: false as const, status: 503, error: "ADMIN_PASSWORD is not set" };
  }
  const jar = await cookies();
  const session = jar.get(ADMIN_COOKIE)?.value;
  if (!isValidAdminSession(session)) {
    return { ok: false as const, status: 401, error: "Unauthorized" };
  }
  return { ok: true as const };
}

export { MAX_AGE_SECONDS };
