export const siteConfig = {
  name: "Tashi Thangka",
  tagline: "Authentic Hand-Painted Tibetan Thangka Art",
  description:
    "Discover museum-quality, hand-painted Tibetan Thangka scrolls. Authentic Buddhist sacred art, ethically sourced from master artists in Tibet and Nepal. Ships worldwide from the USA.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://tashithangka.com",
  locale: "en_US",
  email: "hello@tashithangka.com",
  phone: "+1 (888) 555-0142",
  address: {
    street: "1288 Art District Blvd",
    city: "Los Angeles",
    state: "CA",
    zip: "90012",
    country: "United States",
  },
  social: {
    instagram: "https://instagram.com/tashithangka",
    facebook: "https://facebook.com/tashithangka",
  },
};

export type NavItem = {
  label: string;
  href: string;
};

export const navItems: NavItem[] = [
  { label: "Home", href: "/" },
  { label: "Collection", href: "/products" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

export const policyLinks: NavItem[] = [
  { label: "Shipping", href: "/policies/shipping" },
  { label: "Returns", href: "/policies/returns" },
  { label: "Privacy", href: "/policies/privacy" },
];
