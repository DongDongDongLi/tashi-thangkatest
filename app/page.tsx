import Image from "next/image";
import Link from "next/link";
import { ProductCard } from "@/components/ProductCard";
import { getDictionary, getLocale } from "@/lib/i18n";
import { getFeaturedProducts } from "@/lib/products";

export default async function HomePage() {
  const locale = await getLocale();
  const dict = getDictionary(locale);
  const t = dict.home;
  const featured = getFeaturedProducts();

  const trustItems = [
    { title: t.trust1Title, desc: t.trust1Desc },
    { title: t.trust2Title, desc: t.trust2Desc },
    { title: t.trust3Title, desc: t.trust3Desc },
  ];

  return (
    <>
      <section className="relative overflow-hidden bg-charcoal text-cream">
        <div className="absolute inset-0 opacity-40">
          <Image
            src="https://images.unsplash.com/photo-1547981609-4c099a484c24?w=1920&q=80"
            alt=""
            fill
            className="object-cover"
            priority
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-charcoal via-charcoal/90 to-charcoal/60" />

        <div className="relative mx-auto flex min-h-[85vh] max-w-7xl flex-col justify-center px-4 py-24 sm:px-6 lg:px-8">
          <p className="text-xs uppercase tracking-[0.35em] text-gold">
            {t.heroEyebrow}
          </p>
          <h1 className="mt-4 max-w-3xl font-serif text-5xl leading-tight md:text-7xl">
            {t.heroTitle}
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-cream/80">
            {t.heroDesc}
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Link href="/products" className="btn-primary">
              {t.viewCollection}
            </Link>
            <Link
              href="/about"
              className="btn-outline border-cream/30 text-cream hover:border-cream hover:bg-cream hover:text-charcoal"
            >
              {t.ourStory}
            </Link>
          </div>
        </div>
      </section>

      <section className="border-b border-gold/20 bg-white py-12">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:grid-cols-3 sm:px-6 lg:px-8">
          {trustItems.map((item) => (
            <div key={item.title} className="text-center">
              <div className="decorative-line mx-auto" />
              <h3 className="mt-4 font-serif text-xl text-burgundy">
                {item.title}
              </h3>
              <p className="mt-2 text-sm text-stone">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-xs uppercase tracking-[0.3em] text-gold-dark">
              {t.featuredEyebrow}
            </p>
            <h2 className="section-title mt-2">{t.featuredTitle}</h2>
            <p className="mx-auto mt-4 max-w-2xl text-stone">{t.featuredDesc}</p>
          </div>

          <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((product) => (
              <ProductCard key={product.slug} product={product} locale={locale} />
            ))}
          </div>

          <div className="mt-12 text-center">
            <Link href="/products" className="btn-outline">
              {t.viewAll}
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-burgundy py-20 text-cream">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-gold">
              {t.aboutEyebrow}
            </p>
            <h2 className="mt-3 font-serif text-4xl leading-tight">
              {t.aboutTitle}
            </h2>
            <p className="mt-6 leading-relaxed text-cream/80">{t.aboutDesc}</p>
            <Link
              href="/about"
              className="mt-8 inline-block text-sm uppercase tracking-widest text-gold hover:text-cream"
            >
              {t.learnStory}
            </Link>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-sm">
            <Image
              src="https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=800&q=80"
              alt="Traditional Thangka painting process"
              fill
              className="object-cover"
            />
          </div>
        </div>
      </section>

      <section className="py-20 text-center">
        <div className="mx-auto max-w-2xl px-4">
          <h2 className="section-title">{t.ctaTitle}</h2>
          <p className="mt-4 text-stone">{t.ctaDesc}</p>
          <Link href="/contact" className="btn-primary mt-8">
            {t.contactUs}
          </Link>
        </div>
      </section>
    </>
  );
}
