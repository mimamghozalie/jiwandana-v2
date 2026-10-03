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

  const earlyQuota = tiers.early.quotaPerCategory || 50;
  const isEarlyQuotaFull = registeredCount >= earlyQuota;
  const isEarlyDateActive = now >= earlyStart && now <= earlyEnd;
  const isEarlyDatePassed = now > earlyEnd;

  let activeTierId: PricingTierId = 'regular';
  let isEarlyBirdSoldOut = false;
  let statusNote = '';

  // 1. Check if eligible for Early Bird
  if (!isEarlyDatePassed && !isEarlyQuotaFull) {
    activeTierId = 'early';
    const remaining = Math.max(0, earlyQuota - registeredCount);
    statusNote = `Sesi Early Bird aktif (Tersisa ${remaining} dari ${earlyQuota} kuota)`;
  } 
  // 2. Early Bird Sold Out or Date Expired -> Presale
  else if (now <= presaleEnd) {
    activeTierId = 'presale';
    isEarlyBirdSoldOut = isEarlyQuotaFull || isEarlyDatePassed;
    statusNote = isEarlyQuotaFull
      ? 'Kuota Early Bird (50 slot) telah penuh! Masuk sesi Presale.'
      : 'Sesi Early Bird telah berakhir. Sesi Presale aktif.';
  } 
  // 3. Past Presale -> Regular
  else {
    activeTierId = 'regular';
    isEarlyBirdSoldOut = true;
    statusNote = 'Sesi Reguler aktif hingga pendaftaran ditutup.';
  }

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
      activeTierId === 'early'
        ? Math.max(0, earlyQuota - registeredCount)
        : null,
    isEarlyBirdSoldOut,
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
 * Converts a numeric price amount to a short display string (e.g. 320000 -> "320k", 250000 -> "250k", 1500000 -> "1.5M").
 * Menghilangkan keharusan input ganda antara "amount" dan "display".
 */
export function formatAmountToDisplay(amount: number): string {
  if (!amount || isNaN(amount)) return '0';
  if (amount >= 1000000) {
    const m = amount / 1000000;
    return `${Number.isInteger(m) ? m : m.toFixed(1).replace(/\.0$/, '')}M`;
  }
  if (amount >= 1000) {
    const k = amount / 1000;
    return `${Number.isInteger(k) ? k : k.toFixed(1).replace(/\.0$/, '')}k`;
  }
  return String(amount);
}

/**
 * Alias fungsi untuk konversi amount ke display (contoh: 320000 -> "320k")
 */
export const convertAmountToDisplay = formatAmountToDisplay;

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
