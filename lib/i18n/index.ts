import { cookies } from "next/headers";
import { defaultLocale, isLocale, LOCALE_COOKIE, type Locale } from "./config";
import { en } from "./dictionaries/en";
import { zh } from "./dictionaries/zh";

const dictionaries = { en, zh } as const;

export function getDictionary(locale: Locale) {
  return dictionaries[locale];
}

export async function getLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  const value = cookieStore.get(LOCALE_COOKIE)?.value;
  if (value && isLocale(value)) return value;
  return defaultLocale;
}

export { type Locale, locales, defaultLocale, LOCALE_COOKIE } from "./config";
