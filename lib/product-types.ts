export type Product = {
  slug: string;
  name: string;
  shortDescription: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  category: string;
  deity: string;
  size: string;
  material: string;
  origin: string;
  inStock: boolean;
  featured: boolean;
  image: string;
  images: string[];
  tags: string[];
};

export function formatPrice(price: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(price);
}
