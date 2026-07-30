import type { Metadata } from "next";
import Link from "next/link";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Privacy policy for Tashi Thangka. How we collect, use, and protect your personal information in compliance with US privacy standards.",
  alternates: {
    canonical: `${siteConfig.url}/policies/privacy`,
  },
};

export default function PrivacyPolicyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="section-title">Privacy Policy</h1>
      <p className="mt-2 text-sm text-stone">Last updated: July 2026</p>

      <div className="prose-content mt-10">
        <h2>Information We Collect</h2>
        <p>
          When you visit Tashi Thangka or make a purchase, we may collect:
        </p>
        <ul>
          <li>Contact information (name, email, phone, shipping address)</li>
          <li>Order and payment details (processed securely via Stripe)</li>
          <li>Website usage data via Google Analytics (anonymized)</li>
          <li>Communications you send us via email or contact form</li>
        </ul>

        <h2>How We Use Your Information</h2>
        <ul>
          <li>Process and fulfill orders</li>
          <li>Communicate about your purchase or inquiries</li>
          <li>Improve our website and customer experience</li>
          <li>Send marketing emails (only with your consent; unsubscribe anytime)</li>
        </ul>

        <h2>Cookies</h2>
        <p>
          We use essential cookies for site functionality and analytics cookies
          (Google Analytics) to understand how visitors use our site. You can
          disable cookies in your browser settings.
        </p>

        <h2>Data Sharing</h2>
        <p>
          We do not sell your personal information. We share data only with
          service providers necessary to operate our business (payment processors,
          shipping carriers, email services) under strict confidentiality
          agreements.
        </p>

        <h2>Your Rights</h2>
        <p>
          You may request access to, correction of, or deletion of your personal
          data by contacting{" "}
          <a href={`mailto:${siteConfig.email}`} className="text-burgundy hover:underline">
            {siteConfig.email}
          </a>
          . California residents have additional rights under the CCPA.
        </p>

        <h2>Contact</h2>
        <p>
          Questions about this policy? Visit our{" "}
          <Link href="/contact" className="text-burgundy hover:underline">
            contact page
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
