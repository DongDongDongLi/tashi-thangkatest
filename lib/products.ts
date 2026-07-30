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

export const products: Product[] = [
  {
    slug: "green-tara-thangka",
    name: "Green Tara Thangka",
    shortDescription:
      "Hand-painted Green Tara — the embodiment of compassionate action and swift liberation.",
    description:
      "This exquisite Green Tara (Dölma) Thangka is painted by a certified master artist using traditional mineral pigments on cotton canvas. Green Tara is revered as the Mother of Liberation, offering protection and guidance on the spiritual path. Each brushstroke follows centuries-old iconographic traditions passed down through Tibetan monasteries. Ideal for meditation spaces, altars, or as a meaningful gift for practitioners and collectors alike.",
    price: 489,
    compareAtPrice: 599,
    category: "Deity Thangka",
    deity: "Green Tara",
    size: '24" × 18" (61 × 46 cm)',
    material: "Mineral pigments on cotton canvas, brocade mounting available",
    origin: "Kathmandu Valley, Nepal",
    inStock: true,
    featured: true,
    image:
      "https://images.unsplash.com/photo-1547981609-4c099a484c24?w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1547981609-4c099a484c24?w=1200&q=80",
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1200&q=80",
    ],
    tags: ["tara", "deity", "meditation", "buddhist art"],
  },
  {
    slug: "medicine-buddha-thangka",
    name: "Medicine Buddha Thangka",
    shortDescription:
      "Sacred Bhaisajyaguru depiction for healing, wellness, and spiritual balance.",
    description:
      "The Medicine Buddha (Menla) Thangka represents the healing energy of enlightened mind. Painted with lapis lazuli blues and gold leaf detailing, this piece captures the serene expression and symbolic attributes of Bhaisajyaguru. Traditionally used in healing rituals and meditation on wellness, this Thangka brings a sense of calm and restoration to any space. Certificate of authenticity included.",
    price: 549,
    category: "Deity Thangka",
    deity: "Medicine Buddha",
    size: '28" × 20" (71 × 51 cm)',
    material: "Natural mineral pigments, gold leaf accents on cotton canvas",
    origin: "Lhasa region workshop, Tibet",
    inStock: true,
    featured: true,
    image:
      "https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=1200&q=80",
    ],
    tags: ["medicine buddha", "healing", "deity", "tibetan art"],
  },
  {
    slug: "avalokiteshvara-thangka",
    name: "Avalokiteshvara (Chenrezig) Thangka",
    shortDescription:
      "Four-armed Chenrezig — the Bodhisattva of infinite compassion.",
    description:
      "Avalokiteshvara, known as Chenrezig in Tibetan, is the most beloved Bodhisattva of compassion. This four-armed form holds a lotus, mala, and wish-fulfilling jewel, symbolizing purity, prayer, and generosity. Hand-painted over 45 days by a monastery-trained artist, this Thangka features intricate facial details and vibrant traditional color symbolism. A centerpiece for dedicated practitioners.",
    price: 629,
    compareAtPrice: 749,
    category: "Deity Thangka",
    deity: "Avalokiteshvara",
    size: '30" × 22" (76 × 56 cm)',
    material: "Mineral pigments, silk brocade border optional",
    origin: "Bhaktapur, Nepal",
    inStock: true,
    featured: true,
    image:
      "https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=1200&q=80",
    ],
    tags: ["chenrezig", "compassion", "bodhisattva", "deity"],
  },
  {
    slug: "kalachakra-mandala-thangka",
    name: "Kalachakra Mandala Thangka",
    shortDescription:
      "Precise geometric mandala representing time, cycles, and enlightened mind.",
    description:
      "The Kalachakra Mandala is one of the most complex and sacred diagrams in Tibetan Buddhism. This Thangka depicts the palace of Kalachakra with mathematical precision — every line, color, and symbol carries deep tantric meaning. Created over 60 days using compass and traditional grid methods, it serves as both a meditation support and a stunning work of sacred geometry art.",
    price: 799,
    category: "Mandala",
    deity: "Kalachakra",
    size: '26" × 26" (66 × 66 cm)',
    material: "Mineral pigments on cotton, geometric grid construction",
    origin: "Kathmandu Valley, Nepal",
    inStock: true,
    featured: false,
    image:
      "https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?w=1200&q=80",
    ],
    tags: ["mandala", "kalachakra", "sacred geometry", "meditation"],
  },
  {
    slug: "wheel-of-life-thangka",
    name: "Wheel of Life (Bhavachakra) Thangka",
    shortDescription:
      "The classic Buddhist teaching thangka illustrating samsara and the path to liberation.",
    description:
      "The Wheel of Life is among the most iconic Buddhist teaching images, found at the entrance of monasteries throughout Tibet. This Thangka illustrates the six realms of existence, the twelve links of dependent origination, and the three poisons at the center. An educational masterpiece for students of Buddhism and a powerful conversation piece for any collection.",
    price: 459,
    category: "Teaching Thangka",
    deity: "Yama & Buddhas",
    size: '22" × 18" (56 × 46 cm)',
    material: "Mineral pigments on cotton canvas",
    origin: "Shigatse, Tibet",
    inStock: true,
    featured: false,
    image:
      "https://images.unsplash.com/photo-1528360982757-f77757175855?w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1528360982757-f77757175855?w=1200&q=80",
    ],
    tags: ["wheel of life", "teaching", "samsara", "buddhist art"],
  },
  {
    slug: "guru-rinpoche-thangka",
    name: "Guru Rinpoche (Padmasambhava) Thangka",
    shortDescription:
      "Padmasambhava — the lotus-born master who established Buddhism in Tibet.",
    description:
      "Guru Rinpoche, the Second Buddha, is depicted in his classic form holding a vajra and skull cup, with his consort Mandarava symbolically present. This Thangka honors the founder of the Nyingma tradition and is especially meaningful for Vajrayana practitioners. Rich crimson and gold tones, fine line work, and a luminous face expression make this a treasured addition to any shrine room.",
    price: 579,
    category: "Deity Thangka",
    deity: "Guru Rinpoche",
    size: '24" × 18" (61 × 46 cm)',
    material: "Mineral pigments, optional brocade silk mounting",
    origin: "Paro, Bhutan",
    inStock: false,
    featured: false,
    image:
      "https://images.unsplash.com/photo-1544247954-0f9790a4a909?w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1544247954-0f9790a4a909?w=1200&q=80",
    ],
    tags: ["guru rinpoche", "padmasambhava", "nyingma", "deity"],
  },
];

export function getProductBySlug(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}

export function getFeaturedProducts(): Product[] {
  return products.filter((p) => p.featured);
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(price);
}
