export type { Product } from "@/lib/product-types";
export { formatPrice } from "@/lib/product-types";

export {
  getProducts,
  getProductBySlug,
  getFeaturedProducts,
  saveProducts,
  upsertProduct,
  deleteProduct,
  canPersistProducts,
  slugify,
} from "@/lib/product-store";
