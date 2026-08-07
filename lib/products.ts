export type { Product, ProductVariant } from "@/lib/product-types";
export {
  formatPrice,
  getProductImages,
  getProductVariants,
  hasVariants,
  resolvePurchaseOption,
  createVariantId,
  normalizeProduct,
} from "@/lib/product-types";

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
