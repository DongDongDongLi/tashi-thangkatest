import type { Metadata } from "next";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Get in touch with Tashi Thangka for inquiries about our collection, custom commissions, or shipping questions. We respond within 24 hours.",
  alternates: {
    canonical: `${siteConfig.url}/contact`,
  },
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="section-title">Contact Us</h1>
        <p className="mt-4 text-stone">
          Have a question about a specific Thangka, custom sizing, or brocade
          mounting? Send us a message — we typically respond within 24 hours.
        </p>
      </div>

      <div className="mx-auto mt-12 grid max-w-4xl gap-12 md:grid-cols-2">
        <form className="space-y-6 rounded-sm border border-gold/20 bg-white p-8">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-charcoal">
              Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              required
              className="mt-1 w-full rounded-sm border border-gold/30 px-4 py-3 text-sm outline-none focus:border-burgundy"
              placeholder="Your name"
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-charcoal">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              required
              className="mt-1 w-full rounded-sm border border-gold/30 px-4 py-3 text-sm outline-none focus:border-burgundy"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label htmlFor="subject" className="block text-sm font-medium text-charcoal">
              Subject
            </label>
            <select
              id="subject"
              name="subject"
              className="mt-1 w-full rounded-sm border border-gold/30 px-4 py-3 text-sm outline-none focus:border-burgundy"
            >
              <option>Product Inquiry</option>
              <option>Custom Commission</option>
              <option>Shipping Question</option>
              <option>Other</option>
            </select>
          </div>
          <div>
            <label htmlFor="message" className="block text-sm font-medium text-charcoal">
              Message
            </label>
            <textarea
              id="message"
              name="message"
              rows={5}
              required
              className="mt-1 w-full rounded-sm border border-gold/30 px-4 py-3 text-sm outline-none focus:border-burgundy"
              placeholder="Tell us about the Thangka you're interested in..."
            />
          </div>
          <button type="submit" className="btn-primary w-full">
            Send Message
          </button>
          <p className="text-xs text-stone">
            Note: Form submission requires backend integration (e.g. Formspree,
            Resend, or API route). For now, email us directly.
          </p>
        </form>

        <div className="space-y-8">
          <div>
            <h2 className="font-serif text-xl text-burgundy">Email</h2>
            <a
              href={`mailto:${siteConfig.email}`}
              className="mt-2 block text-stone hover:text-burgundy"
            >
              {siteConfig.email}
            </a>
          </div>
          <div>
            <h2 className="font-serif text-xl text-burgundy">Studio</h2>
            <address className="mt-2 not-italic leading-relaxed text-stone">
              {siteConfig.address.street}
              <br />
              {siteConfig.address.city}, {siteConfig.address.state}{" "}
              {siteConfig.address.zip}
              <br />
              {siteConfig.address.country}
            </address>
          </div>
        </div>
      </div>
    </div>
  );
}
