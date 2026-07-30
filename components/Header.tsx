import Link from "next/link";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import type { Dictionary } from "@/lib/i18n/dictionaries/en";
import type { Locale } from "@/lib/i18n/config";
import { siteConfig } from "@/lib/site";

type HeaderProps = {
  locale: Locale;
  dict: Dictionary["nav"];
};

export function Header({ locale, dict }: HeaderProps) {
  const navItems = [
    { label: dict.home, href: "/" },
    { label: dict.collection, href: "/products" },
    { label: dict.about, href: "/about" },
    { label: dict.contact, href: "/contact" },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-gold/20 bg-cream/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="group flex shrink-0 flex-col">
          <span className="font-serif text-2xl tracking-wide text-burgundy transition-colors group-hover:text-gold-dark">
            {siteConfig.name}
          </span>
          <span className="text-xs uppercase tracking-[0.25em] text-stone">
            {dict.tagline}
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex" aria-label="Main">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm uppercase tracking-widest text-charcoal transition-colors hover:text-burgundy"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-3">
          <LanguageSwitcher locale={locale} />
          <Link
            href="/products"
            className="hidden rounded-sm bg-burgundy px-4 py-2 text-xs uppercase tracking-widest text-cream transition-colors hover:bg-burgundy-dark sm:inline-block"
          >
            {dict.shopNow}
          </Link>
        </div>
      </div>

      <nav
        className="flex gap-6 overflow-x-auto border-t border-gold/10 px-4 py-3 md:hidden"
        aria-label="Mobile"
      >
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="whitespace-nowrap text-xs uppercase tracking-widest text-charcoal"
          >
            {item.label}
          </Link>
        ))}
        <Link
          href="/products"
          className="whitespace-nowrap text-xs uppercase tracking-widest text-burgundy"
        >
          {dict.shopNow}
        </Link>
      </nav>
    </header>
  );
}
