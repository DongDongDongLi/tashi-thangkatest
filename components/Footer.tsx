import Link from "next/link";
import type { Dictionary } from "@/lib/i18n/dictionaries/en";
import { siteConfig } from "@/lib/site";

type FooterProps = {
  dict: Dictionary["footer"];
  tagline: string;
};

export function Footer({ dict, tagline }: FooterProps) {
  const policyLinks = [
    { label: dict.shipping, href: "/policies/shipping" },
    { label: dict.returns, href: "/policies/returns" },
    { label: dict.privacy, href: "/policies/privacy" },
  ];

  return (
    <footer className="border-t border-gold/20 bg-charcoal text-cream/80">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 md:grid-cols-3 lg:px-8">
        <div>
          <p className="font-serif text-2xl text-cream">{siteConfig.name}</p>
          <p className="mt-3 text-sm leading-relaxed">{tagline}</p>
          <p className="mt-4 text-sm">{siteConfig.email}</p>
        </div>

        <div>
          <p className="text-xs uppercase tracking-widest text-gold">{dict.explore}</p>
          <ul className="mt-4 space-y-2 text-sm">
            <li>
              <Link href="/products" className="hover:text-gold">
                {dict.collection}
              </Link>
            </li>
            <li>
              <Link href="/about" className="hover:text-gold">
                {dict.ourStory}
              </Link>
            </li>
            <li>
              <Link href="/contact" className="hover:text-gold">
                {dict.contact}
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="text-xs uppercase tracking-widest text-gold">{dict.policies}</p>
          <ul className="mt-4 space-y-2 text-sm">
            {policyLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="hover:text-gold">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10 py-6 text-center text-xs text-cream/50">
        © {new Date().getFullYear()} {siteConfig.name}. {dict.rights}
      </div>
    </footer>
  );
}
