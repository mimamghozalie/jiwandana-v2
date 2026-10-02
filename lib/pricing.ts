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
  const activePrice = catData.prices[activeTierId];

  return {
    categoryKey: catKey,
    categoryName: catData.categoryName,
    categoryCode: catData.categoryCode,
    tierId: activeTierId,
    tierName: activeTierConfig.name,
    amount: activePrice.amount,
    display: activePrice.display,
    badge: activeTierConfig.badge,
    quotaLimit: activeTierConfig.quotaPerCategory,
    quotaRemaining:
      activeTierId === 'early'
        ? Math.max(0, earlyQuota - registeredCount)
        : null,
    isEarlyBirdSoldOut,
    statusNote,
    prices: catData.prices,
    tiersConfig: tiers,
  };
}

/**
 * Returns raw pricing config
 */
export function getPricingConfig() {
  return pricingConfig;
}
