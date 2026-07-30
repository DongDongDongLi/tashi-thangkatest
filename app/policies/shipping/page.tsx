import type { Metadata } from "next";
import Link from "next/link";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "Shipping Policy",
  description:
    "Shipping information for Tashi Thangka orders within the United States and internationally. Insured delivery, packaging details, and delivery times.",
  alternates: {
    canonical: `${siteConfig.url}/policies/shipping`,
  },
};

export default function ShippingPolicyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="section-title">Shipping Policy</h1>
      <p className="mt-2 text-sm text-stone">Last updated: July 2026</p>

      <div className="prose-content mt-10">
        <h2>United States Shipping</h2>
        <p>
          We offer complimentary insured shipping on all orders within the
          contiguous United States. Thangkas are carefully rolled in acid-free
          tissue, placed in protective tubes or flat-pack crates (for brocade-mounted
          pieces), and shipped via FedEx or UPS.
        </p>
        <ul>
          <li>Standard delivery: 5–10 business days</li>
          <li>Express delivery: 2–3 business days (available at checkout)</li>
          <li>All shipments include tracking and full insurance</li>
        </ul>

        <h2>Alaska, Hawaii & International</h2>
        <p>
          Shipping to Alaska, Hawaii, and international destinations is
          calculated at checkout. International orders may be subject to customs
          duties and import taxes, which are the responsibility of the buyer.
        </p>

        <h2>Packaging & Handling</h2>
        <p>
          Each Thangka is inspected before shipping. We use museum-quality
          packaging materials to ensure your artwork arrives in perfect
          condition. Mounting hardware and care instructions are included with
          every order.
        </p>

        <h2>Questions?</h2>
        <p>
          Contact us at{" "}
          <a href={`mailto:${siteConfig.email}`} className="text-burgundy hover:underline">
            {siteConfig.email}
          </a>{" "}
          or visit our{" "}
          <Link href="/contact" className="text-burgundy hover:underline">
            contact page
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
