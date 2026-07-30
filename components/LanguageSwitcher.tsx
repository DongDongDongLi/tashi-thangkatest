"use client";

import { useRouter } from "next/navigation";
import { LOCALE_COOKIE, type Locale } from "@/lib/i18n/config";

type LanguageSwitcherProps = {
  locale: Locale;
};

export function LanguageSwitcher({ locale }: LanguageSwitcherProps) {
  const router = useRouter();

  function switchLocale(next: Locale) {
    if (next === locale) return;
    document.cookie = `${LOCALE_COOKIE}=${next};path=/;max-age=31536000;SameSite=Lax`;
    router.refresh();
  }

  return (
    <div
      className="flex items-center rounded-sm border border-gold/30 bg-white/50 p-0.5"
      role="group"
      aria-label="Language"
    >
      <button
        type="button"
        onClick={() => switchLocale("en")}
        className={`rounded-sm px-2.5 py-1.5 text-xs font-medium uppercase tracking-wider transition-colors ${
          locale === "en"
            ? "bg-burgundy text-cream"
            : "text-charcoal hover:text-burgundy"
        }`}
        aria-pressed={locale === "en"}
      >
        EN
      </button>
      <button
        type="button"
        onClick={() => switchLocale("zh")}
        className={`rounded-sm px-2.5 py-1.5 text-xs font-medium tracking-wider transition-colors ${
          locale === "zh"
            ? "bg-burgundy text-cream"
            : "text-charcoal hover:text-burgundy"
        }`}
        aria-pressed={locale === "zh"}
      >
        中文
      </button>
    </div>
  );
}
