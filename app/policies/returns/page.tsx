import type { Metadata } from "next";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "Returns & Refunds Policy",
  description:
    "Return and refund policy for Tashi Thangka purchases. 14-day return window, condition requirements, and refund process.",
  alternates: {
    canonical: `${siteConfig.url}/policies/returns`,
  },
};

export default function ReturnsPolicyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="section-title">Returns & Refunds</h1>
      <p className="mt-2 text-sm text-stone">Last updated: July 2026</p>

      <div className="prose-content mt-10">
        <h2>14-Day Return Window</h2>
        <p>
          We want you to be completely satisfied with your Thangka. If you are
          not happy with your purchase, you may return it within 14 days of
          delivery for a full refund of the product price.
        </p>

        <h2>Return Conditions</h2>
        <ul>
          <li>Item must be in original, undamaged condition</li>
          <li>Original packaging and certificate of authenticity must be included</li>
          <li>Buyer is responsible for return shipping costs unless item is defective</li>
          <li>Custom commissions and brocade-mounted pieces are final sale</li>
        </ul>

        <h2>How to Initiate a Return</h2>
        <p>
          Email us at{" "}
          <a href={`mailto:${siteConfig.email}`} className="text-burgundy hover:underline">
            {siteConfig.email}
          </a>{" "}
          with your order number and reason for return. We will provide a return
          authorization and shipping instructions within 24 hours.
        </p>

        <h2>Refund Processing</h2>
        <p>
          Refunds are processed within 5–7 business days after we receive and
          inspect the returned item. Refunds are issued to the original payment
          method.
        </p>

        <h2>Damaged in Transit</h2>
        <p>
          If your Thangka arrives damaged, please photograph the packaging and
          artwork immediately and contact us within 48 hours. We will arrange a
          replacement or full refund at no cost to you.
        </p>
      </div>
    </div>
  );
}
