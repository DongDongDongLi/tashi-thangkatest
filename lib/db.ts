import "server-only";

import { neon } from "@neondatabase/serverless";

let schemaReady: Promise<void> | null = null;

export function isDatabaseConfigured() {
  return Boolean(process.env.DATABASE_URL);
}

export function getSql() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "DATABASE_URL is not set. Create a Neon Postgres database and add the connection string to Vercel."
    );
  }
  return neon(url);
}

async function ensureSchema() {
  const sql = getSql();
  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      name TEXT NOT NULL,
      phone TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      order_number TEXT UNIQUE NOT NULL,
      user_id TEXT NOT NULL REFERENCES users(id),
      status TEXT NOT NULL DEFAULT 'pending_payment',
      product_slug TEXT NOT NULL,
      product_name TEXT NOT NULL,
      variant_id TEXT,
      variant_name TEXT,
      product_image TEXT,
      quantity INTEGER NOT NULL DEFAULT 1,
      unit_price NUMERIC(10, 2) NOT NULL,
      total_amount NUMERIC(10, 2) NOT NULL,
      currency TEXT NOT NULL DEFAULT 'USD',
      shipping_name TEXT NOT NULL,
      shipping_phone TEXT,
      shipping_line1 TEXT NOT NULL,
      shipping_line2 TEXT,
      shipping_city TEXT NOT NULL,
      shipping_state TEXT NOT NULL,
      shipping_postal TEXT NOT NULL,
      shipping_country TEXT NOT NULL DEFAULT 'US',
      paypal_order_id TEXT,
      paypal_capture_id TEXT,
      carrier_slug TEXT,
      tracking_number TEXT,
      aftership_id TEXT,
      tracking_status TEXT,
      tracking_tag TEXT,
      shipped_at TIMESTAMPTZ,
      delivered_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  await sql`CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_orders_paypal_order_id ON orders(paypal_order_id)`;
}

export async function withDb<T>(fn: () => Promise<T>): Promise<T> {
  if (!schemaReady) {
    schemaReady = ensureSchema();
  }
  await schemaReady;
  return fn();
}

export function generateId() {
  return crypto.randomUUID();
}

export function generateOrderNumber() {
  const date = new Date();
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  const d = String(date.getUTCDate()).padStart(2, "0");
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `TT-${y}${m}${d}-${rand}`;
}
