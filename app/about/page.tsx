import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "About Us — Our Story & Mission",
  description:
    "Learn about Tashi Thangka's mission to bring authentic, ethically sourced Tibetan Thangka art to collectors and practitioners in the United States.",
  alternates: {
    canonical: `${siteConfig.url}/about`,
  },
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-gold-dark">
          Our Story
        </p>
        <h1 className="section-title mt-2">Preserving a Living Tradition</h1>
        <p className="mt-6 text-lg leading-relaxed text-stone">
          Tashi Thangka was founded with a simple mission: connect master
          Himalayan artists with sincere collectors and practitioners in the
          West — with transparency, respect, and fair compensation at every step.
        </p>
      </div>

      <div className="mt-16 grid items-center gap-12 lg:grid-cols-2">
        <div className="relative aspect-[4/3] overflow-hidden rounded-sm">
          <Image
            src="https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=800&q=80"
            alt="Himalayan art tradition"
            fill
            className="object-cover"
          />
        </div>
        <div className="prose-content">
          <h2>What Is a Thangka?</h2>
          <p>
            A Thangka is a Tibetan Buddhist scroll painting on cotton or silk,
            depicting deities, mandalas, or scenes from Buddhist teachings.
            Created as meditation supports and teaching tools, these paintings
            follow precise iconographic traditions that have been preserved for
            over a millennium.
          </p>
          <p>
            Unlike decorative art, an authentic Thangka carries spiritual
            significance. The proportions, colors, and symbols are not arbitrary
            — they are prescribed by centuries of lineage transmission.
          </p>
        </div>
      </div>

      <div className="mt-16 grid items-center gap-12 lg:grid-cols-2">
        <div className="prose-content lg:order-1">
          <h2>Our Commitment</h2>
          <ul>
            <li>
              <strong>Direct sourcing</strong> — We work with artists and
              workshops in Tibet, Nepal, and Bhutan, cutting out unnecessary
              middlemen.
            </li>
            <li>
              <strong>Fair trade</strong> — Artists receive fair compensation
              that supports their craft and communities.
            </li>
            <li>
              <strong>Authenticity</strong> — Every piece is hand-painted using
              traditional mineral pigments, never machine-printed reproductions.
            </li>
            <li>
              <strong>Cultural respect</strong> — We educate buyers on the
              sacred nature of these works and proper display practices.
            </li>
          </ul>
        </div>
        <div className="relative aspect-[4/3] overflow-hidden rounded-sm lg:order-2">
          <Image
            src="https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?w=800&q=80"
            alt="Thangka painting detail"
            fill
            className="object-cover"
          />
        </div>
      </div>

      <div className="mt-20 rounded-sm border border-gold/20 bg-white p-8 text-center md:p-12">
        <h2 className="font-serif text-3xl text-burgundy">
          Ready to Find Your Thangka?
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-stone">
          Whether you are a seasoned collector or new to Buddhist art, we are
          happy to help you choose the right piece.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Link href="/products" className="btn-primary">
            Browse Collection
          </Link>
          <Link href="/contact" className="btn-outline">
            Get in Touch
          </Link>
        </div>
      </div>
    </div>
  );
}
