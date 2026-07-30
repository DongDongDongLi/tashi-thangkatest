import type { Locale } from "./config";

type ProductTranslation = {
  name: string;
  shortDescription: string;
  category: string;
  soldOut: string;
};

export const productTranslations: Record<string, ProductTranslation> = {
  "green-tara-thangka": {
    name: "绿度母唐卡",
    shortDescription: "手绘绿度母——慈悲与迅捷救度的化身。",
    category: "本尊唐卡",
    soldOut: "已售罄",
  },
  "medicine-buddha-thangka": {
    name: "药师佛唐卡",
    shortDescription: "象征疗愈、安康与心灵平衡的药师佛圣像。",
    category: "本尊唐卡",
    soldOut: "已售罄",
  },
  "avalokiteshvara-thangka": {
    name: "观世音菩萨（四臂观音）唐卡",
    shortDescription: "四臂观音——无限慈悲的菩萨化现。",
    category: "本尊唐卡",
    soldOut: "已售罄",
  },
  "kalachakra-mandala-thangka": {
    name: "时轮金刚曼荼罗唐卡",
    shortDescription: "象征时间与觉悟的精密几何曼荼罗。",
    category: "曼荼罗",
    soldOut: "已售罄",
  },
  "wheel-of-life-thangka": {
    name: "六道轮回图唐卡",
    shortDescription: "经典佛教教法唐卡，展现轮回与解脱之道。",
    category: "教法唐卡",
    soldOut: "已售罄",
  },
  "guru-rinpoche-thangka": {
    name: "莲花生大士唐卡",
    shortDescription: "莲花化生大师——将佛教带入西藏的祖师。",
    category: "本尊唐卡",
    soldOut: "已售罄",
  },
};

export function getProductLabels(locale: Locale, slug: string) {
  if (locale === "zh" && productTranslations[slug]) {
    return productTranslations[slug];
  }
  return null;
}

export const commonLabels = {
  en: { soldOut: "Sold Out" },
  zh: { soldOut: "已售罄" },
} as const;
