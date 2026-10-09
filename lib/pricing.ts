import pricingConfig from '@/data/trailrun-pricing.json';

export type PricingTierId = 'early' | 'presale' | 'regular';

export interface TierInfo {
  id: PricingTierId;
  name: string;
  badge: string;
  dateDisplay?: string;
  startDate: string;
  endDate: string;
  quotaPerCategory: number | null;
  description: string;
}

export interface CategoryPrice {
  amount: number;
  display: string;
}

export interface ActiveTierResult {
  categoryKey: '3k' | '7k' | '12k';
  categoryName: string;
  categoryCode: string;
  tierId: PricingTierId;
  tierName: string;
  amount: number;
  display: string;
  badge: string;
  quotaLimit: number | null;
  quotaRemaining: number | null;
  isEarlyBirdSoldOut: boolean;
  isPresaleSoldOut: boolean;
  isRegularSoldOut: boolean;
  isCategorySoldOut: boolean;
  isCurrentTierSoldOut: boolean;
  isSoldOut: boolean;
  statusNote: string;
  prices: {
    early: CategoryPrice;
    presale: CategoryPrice;
    regular: CategoryPrice;
  };
  tiersConfig: typeof pricingConfig.tiers;
}

export type ActivePricingResult = ActiveTierResult;

/**
 * Normalizes category string to '3k' | '7k' | '12k'
 */
export function normalizeCategoryKey(category: string): '3k' | '7k' | '12k' {
  const clean = (category || '').toLowerCase().trim();
  if (clean.includes('12')) return '12k';
  if (clean.includes('7')) return '7k';
  return '3k';
}

/**
 * Evaluates the active pricing tier for a category based on:
 * 1. Current Date (session start & end date)
 * 2. Quota count (specifically for Early Bird limit of 50 per category)
 */
export function getActivePricingTier(
  categoryInput: string,
  registeredCount: number = 0,
  currentDate: Date = new Date()
): ActiveTierResult {
  const catKey = normalizeCategoryKey(categoryInput);
  const catData = pricingConfig.categories[catKey];
  const { tiers } = pricingConfig;

  const now = currentDate.getTime();
  const earlyStart = new Date(tiers.early.startDate).getTime();
  const earlyEnd = new Date(tiers.early.endDate).getTime();
  const presaleEnd = new Date(tiers.presale.endDate).getTime();
  const regularEnd = new Date(tiers.regular.endDate).getTime();

  const isEarlyConfigSoldOut = Boolean(
    (tiers.early as any).isSoldOut ||
    (tiers.early as any).soldOut ||
    (catData as any)?.prices?.early?.isSoldOut ||
    (catData as any)?.prices?.early?.soldOut
  );
  const isPresaleConfigSoldOut = Boolean(
    (tiers.presale as any).isSoldOut ||
    (tiers.presale as any).soldOut ||
    (catData as any)?.prices?.presale?.isSoldOut ||
    (catData as any)?.prices?.presale?.soldOut
  );
  const isRegularConfigSoldOut = Boolean(
    (tiers.regular as any).isSoldOut ||
    (tiers.regular as any).soldOut ||
    (catData as any)?.prices?.regular?.isSoldOut ||
    (catData as any)?.prices?.regular?.soldOut
  );
  const isCategoryConfigSoldOut = Boolean(
    (catData as any).isSoldOut ||
    (catData as any).soldOut
  );

  const earlyQuota = tiers.early.quotaPerCategory || 50;
  const isEarlyQuotaFull = registeredCount >= earlyQuota;
  const isEarlyDateActive = now >= earlyStart && now <= earlyEnd;
  const isEarlyDatePassed = now > earlyEnd;

  const presaleQuota = tiers.presale.quotaPerCategory || 150;
  const isPresaleQuotaFull = registeredCount >= earlyQuota + presaleQuota;
  const isPresaleDatePassed = now > presaleEnd;

  let activeTierId: PricingTierId = 'regular';
  let isEarlyBirdSoldOut = isEarlyQuotaFull || isEarlyDatePassed || isEarlyConfigSoldOut;
  let isPresaleSoldOut = isPresaleQuotaFull || isPresaleDatePassed || isPresaleConfigSoldOut;
  let isRegularSoldOut = isRegularConfigSoldOut || now > regularEnd;
  let statusNote = '';

  // 1. Check if eligible for Early Bird
  if (!isEarlyDatePassed && !isEarlyQuotaFull && !isEarlyConfigSoldOut) {
    activeTierId = 'early';
    const remaining = Math.max(0, earlyQuota - registeredCount);
    statusNote = `Sesi Early Bird aktif (Tersisa ${remaining} dari ${earlyQuota} kuota)`;
  } 
  // 2. Early Bird Sold Out or Date Expired -> Presale
  else if (now <= presaleEnd && !isPresaleQuotaFull && !isPresaleConfigSoldOut) {
    activeTierId = 'presale';
    isEarlyBirdSoldOut = true;
    statusNote = isEarlyQuotaFull || isEarlyConfigSoldOut
      ? 'Kuota Early Bird telah penuh! Masuk sesi Presale.'
      : 'Sesi Early Bird telah berakhir. Sesi Presale aktif.';
  } 
  // 3. Past Presale or Presale Sold Out -> Regular
  else {
    activeTierId = 'regular';
    isEarlyBirdSoldOut = true;
    isPresaleSoldOut = true;
    statusNote = isRegularSoldOut
      ? 'Pendaftaran telah ditutup (Sold Out).'
      : 'Sesi Reguler aktif hingga pendaftaran ditutup.';
  }

  const isCurrentTierSoldOut =
    isCategoryConfigSoldOut ||
    (activeTierId === 'early' && isEarlyBirdSoldOut) ||
    (activeTierId === 'presale' && isPresaleSoldOut) ||
    (activeTierId === 'regular' && isRegularSoldOut);

  const activeTierConfig = tiers[activeTierId];
  const rawActivePrice = catData.prices[activeTierId] as { amount: number; display?: string };
  const amount = rawActivePrice?.amount ?? 0;
  const display = rawActivePrice?.display || formatAmountToDisplay(amount);

  const getTierPriceObj = (tier: PricingTierId): CategoryPrice => {
    const p = catData.prices[tier] as { amount: number; display?: string };
    return {
      amount: p.amount,
      display: p.display || formatAmountToDisplay(p.amount),
    };
  };

  return {
    categoryKey: catKey,
    categoryName: catData.categoryName,
    categoryCode: catData.categoryCode,
    tierId: activeTierId,
    tierName: activeTierConfig.name,
    amount,
    display,
    badge: activeTierConfig.badge,
    quotaLimit: activeTierConfig.quotaPerCategory,
    quotaRemaining:
      activeTierId === 'early' && !isEarlyBirdSoldOut
        ? Math.max(0, earlyQuota - registeredCount)
        : null,
    isEarlyBirdSoldOut,
    isPresaleSoldOut,
    isRegularSoldOut,
    isCategorySoldOut: isCategoryConfigSoldOut,
    isCurrentTierSoldOut,
    isSoldOut: isCurrentTierSoldOut || isCategoryConfigSoldOut,
    statusNote,
    prices: {
      early: getTierPriceObj('early'),
      presale: getTierPriceObj('presale'),
      regular: getTierPriceObj('regular'),
    },
    tiersConfig: tiers,
  };
}

/**
 * Converts a numeric price amount to a short display string (e.g. 240000 -> "240k", 320000 -> "320k", 1500000 -> "1.5M").
 * Menghilangkan keharusan input ganda antara "amount" dan "display".
 */
export function formatAmountToDisplay(amount: number): string {
  if (!amount || isNaN(amount)) return '0';
  let val = amount;
  // Fallback pengaman jika tidak sengaja terinput angka dalam skala ratusan/ribuan (misal 2400):
  if (val >= 100 && val < 1000) {
    val = val * 1000;
  } else if (val >= 1000 && val < 10000 && val % 100 === 0) {
    val = val * 100;
  }

  if (val >= 1000000) {
    const m = val / 1000000;
    return `${Number.isInteger(m) ? m : m.toFixed(1).replace(/\.0$/, '')}M`;
  }
  if (val >= 1000) {
    const k = val / 1000;
    return `${Number.isInteger(k) ? k : k.toFixed(1).replace(/\.0$/, '')}k`;
  }
  return String(val);
}

/**
 * Alias fungsi untuk konversi amount ke display (contoh: 240000 -> "240k")
 */
export const convertAmountToDisplay = formatAmountToDisplay;

/**
 * Mengambil harga awal (Mulai / Starting price) untuk kategori dari data/trailrun-pricing.json
 * Mengonversi amount (misal 240000) ke format ringkas (misal "240k").
 */
export function getCategoryStartingPrice(categoryInput: string, pricingInfo?: any): string {
  // Jika ada data sesi aktif dari pricingInfoMap
  if (pricingInfo?.display) {
    return pricingInfo.display;
  }
  if (pricingInfo?.amount) {
    return formatAmountToDisplay(pricingInfo.amount);
  }

  const catKey = normalizeCategoryKey(categoryInput);
  const catData = pricingConfig.categories[catKey];
  if (!catData?.prices) return '240k';

  // Mengambil harga early bird sebagai acuan harga mulai
  const earlyAmount = (catData.prices.early as any)?.amount;
  if (earlyAmount) {
    return formatAmountToDisplay(earlyAmount);
  }

  return '240k';
}

/**
 * Mengambil seluruh tier prices untuk kategori langsung dari data/trailrun-pricing.json
 * Output: { early: "240k", presale: "270k", regular: "330k" }
 */
export function getCategoryPricesFromConfig(categoryInput: string): {
  early: string;
  presale: string;
  regular: string;
} {
  const catKey = normalizeCategoryKey(categoryInput);
  const catData = pricingConfig.categories[catKey];
  if (!catData?.prices) {
    return { early: '240k', presale: '270k', regular: '330k' };
  }

  return {
    early: formatAmountToDisplay((catData.prices.early as any)?.amount ?? 0),
    presale: formatAmountToDisplay((catData.prices.presale as any)?.amount ?? 0),
    regular: formatAmountToDisplay((catData.prices.regular as any)?.amount ?? 0),
  };
}

/**
 * Formats a numeric price amount into standard Rupiah currency (e.g. 320000 -> "Rp 320.000")
 */
export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Returns CategoryPrice with guaranteed display (auto-computed from amount if display is missing)
 */
export function getCategoryTierPrice(categoryInput: string, tierId: PricingTierId): CategoryPrice {
  const catKey = normalizeCategoryKey(categoryInput);
  const catData = pricingConfig.categories[catKey];
  const priceObj = catData?.prices?.[tierId] as { amount: number; display?: string } | undefined;
  const amount = priceObj?.amount ?? 0;
  const display = priceObj?.display || formatAmountToDisplay(amount);
  return { amount, display };
}

/**
 * Returns raw pricing config
 */
export function getPricingConfig() {
  return pricingConfig;
}

/**
 * Calculates extra fee for jersey sizes above XL (+Rp 5.000 per extra 'X')
 */
export function getJerseyExtraFee(size?: string, customText?: string): number {
  if (!size) return 0;
  const upper = size.toUpperCase().trim();

  if (upper === 'XXL' || upper === '2XL') return 5000;
  if (upper === 'XXXL' || upper === '3XL') return 10000;
  if (upper === 'XXXXL' || upper === '4XL') return 15000;
  if (upper === 'XXXXXL' || upper === '5XL') return 20000;

  if (upper.startsWith('CUSTOM')) {
    const textToCheck = customText ? customText.toUpperCase() : upper;
    const matchNXL = textToCheck.match(/(\d+)\s*XL/);
    if (matchNXL) {
      const n = parseInt(matchNXL[1], 10);
      if (n > 1) return Math.max(0, (n - 1) * 5000);
    }
    const xCount = (textToCheck.match(/X/g) || []).length;
    if (xCount > 1) {
      return (xCount - 1) * 5000;
    }
    return 0;
  }

  const matchN = upper.match(/^(\d+)XL$/);
  if (matchN) {
    const n = parseInt(matchN[1], 10);
    if (n > 1) return (n - 1) * 5000;
  }
  const xMatches = upper.match(/X/g);
  if (xMatches && xMatches.length > 1) {
    return (xMatches.length - 1) * 5000;
  }

  return 0;
}

