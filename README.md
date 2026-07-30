# Tashi Thangka — Overseas Independent Store

Authentic hand-painted Tibetan Thangka e-commerce site built with **Next.js 15**, targeting the **US market** with full **Google SEO** support.

## Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Build & Deploy

```bash
npm run build
npm start
```

### Deploy to Vercel (Recommended)

1. Push this folder to GitHub
2. Import project at [vercel.com](https://vercel.com)
3. Set environment variables:
   ```
   NEXT_PUBLIC_SITE_URL=https://yourdomain.com
   PAYPAL_MODE=live
   NEXT_PUBLIC_PAYPAL_CLIENT_ID=...
   PAYPAL_CLIENT_SECRET=...
   ```
4. Connect your domain (e.g. `tashithangka.com`)

## PayPal Checkout

Product pages include PayPal buttons. Payment amount is always taken from the server (`lib/products.ts`), never from the browser.

### 1. Create a PayPal app (Sandbox first)

1. Open [PayPal Developer Dashboard](https://developer.paypal.com/dashboard/applications)
2. Create an app under **Sandbox**
3. Copy **Client ID** and **Secret**

### 2. Local env file

```bash
cp .env.example .env.local
```

Fill in:

```
NEXT_PUBLIC_SITE_URL=http://localhost:3000
PAYPAL_MODE=sandbox
NEXT_PUBLIC_PAYPAL_CLIENT_ID=...
PAYPAL_CLIENT_SECRET=...
```

Restart `npm run dev`, open any in-stock product, and pay with a [Sandbox test buyer account](https://developer.paypal.com/dashboard/accounts).

### 3. Go live

1. Create a **Live** app in the same dashboard  
2. Switch env to `PAYPAL_MODE=live` and use Live Client ID / Secret  
3. Redeploy  

Flow: Product page → PayPal → `/checkout/success` or `/checkout/cancel`

## Project Structure

```
app/                  # Pages (App Router)
  products/           # Collection + product detail
  policies/           # Shipping, returns, privacy
  sitemap.ts          # Auto sitemap for Google
  robots.ts           # Crawler rules
components/           # Header, Footer, ProductCard
lib/
  products.ts         # Product data — edit here
  site.ts             # Brand info, contact, nav
  seo.ts              # JSON-LD structured data
public/               # Static assets (replace logo, add real photos)
```

## Customize

| What | File |
|------|------|
| Brand name, email, address | `lib/site.ts` |
| Products (name, price, images) | `lib/products.ts` |
| Colors & fonts | `app/globals.css` |
| Homepage content | `app/page.tsx` |

### Replace Placeholder Images

Current product images are temporary Unsplash placeholders. Replace URLs in `lib/products.ts` with your real Thangka photos:

```ts
image: "/images/green-tara.jpg",  // put files in public/images/
```

## Google Indexing Checklist

After deploying with your real domain:

1. Register at [Google Search Console](https://search.google.com/search-console)
2. Verify ownership (DNS or HTML tag)
3. Submit sitemap: `https://yourdomain.com/sitemap.xml`
4. Add Google Analytics 4 (optional, via `next/script` in layout)

SEO is already configured:
- Page titles & meta descriptions
- Open Graph tags
- `sitemap.xml` & `robots.txt`
- Product structured data (JSON-LD)
- Semantic HTML & alt text

## Next Steps (Not Yet Implemented)

- [x] PayPal Checkout
- [ ] Order email notifications (Resend / SMTP)
- [ ] Google Analytics 4
- [ ] Real product photography
- [ ] Blog for SEO content

## Tech Stack

- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS 4
- Deploy: Vercel / Cloudflare Pages
