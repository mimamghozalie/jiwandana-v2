import pricingConfig from '@/data/trailrun-pricing.json';

export type PricingTierId = 'early' | 'presale' | 'regular' | 'flashsale';

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
  isFlashSaleSoldOut: boolean;
  isCategorySoldOut: boolean;
  isCurrentTierSoldOut: boolean;
  isSoldOut: boolean;
  statusNote: string;
  prices: {
    early: CategoryPrice;
    presale: CategoryPrice;
    regular: CategoryPrice;
    flashsale?: CategoryPrice;
  };
  tiersConfig: any;
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
 * 2. Flash Sale period & quota (10 slot / kategori)
 * 3. 3K closure status
 */
export function getActivePricingTier(
  categoryInput: string,
  registeredCount: number = 0,
  currentDate: Date = new Date(),
  flashSaleCount: number = 0,
  customDbConfig?: { tiers?: any[]; categoryPricing?: any[] }
): ActiveTierResult {
  const catKey = normalizeCategoryKey(categoryInput);

  // If custom DB config is passed, construct dynamically or merge with JSON fallback
  let tiers: Record<string, any> = { ...pricingConfig.tiers };
  let catData: any = { ...pricingConfig.categories[catKey] };

  if (customDbConfig?.tiers && customDbConfig.tiers.length > 0) {
    customDbConfig.tiers.forEach((t: any) => {
      tiers[t.id] = {
        id: t.id,
        name: t.name,
        badge: t.badge || '',
        dateDisplay: t.date_display || (pricingConfig.tiers as any)[t.id]?.dateDisplay || '',
        startDate: t.start_date,
        endDate: t.end_date,
        quotaPerCategory: t.quota_limit ?? (pricingConfig.tiers as any)[t.id]?.quotaPerCategory ?? 10,
        description: t.description || '',
        isActive: t.is_active ?? true,
      };
    });
  }

  if (customDbConfig?.categoryPricing && customDbConfig.categoryPricing.length > 0) {
    const cpForCat = customDbConfig.categoryPricing.filter((cp: any) => cp.category_key === catKey);
    if (!catData.prices) catData.prices = {};
    cpForCat.forEach((cp: any) => {
      catData.prices[cp.tier_id] = {
        amount: Number(cp.amount),
        display: cp.display || formatAmountToDisplay(Number(cp.amount)),
        isSoldOut: Boolean(cp.is_sold_out),
        quotaLimit: cp.quota_limit,
      };
      if (cp.category_closed) {
        catData.isSoldOut = true;
      }
    });
  }

  const now = currentDate.getTime();
  const earlyStart = new Date(tiers.early.startDate).getTime();
  const earlyEnd = new Date(tiers.early.endDate).getTime();
  const presaleEnd = new Date(tiers.presale.endDate).getTime();
  const regularEnd = new Date(tiers.regular.endDate).getTime();

  // Flash Sale Dates & Quota
  const flashTier = tiers.flashsale;
  const flashStart = flashTier ? new Date(flashTier.startDate).getTime() : 0;
  const flashEnd = flashTier ? new Date(flashTier.endDate).getTime() : 0;
  const isFlashDateActive = Boolean(
    flashTier &&
    (flashTier.isActive ?? true) &&
    now >= flashStart &&
    now <= flashEnd
  );
  const flashQuota = catData.prices?.flashsale?.quotaLimit ?? flashTier?.quotaPerCategory ?? 10;
  const isFlashQuotaFull = flashSaleCount >= flashQuota;
  const isFlashSaleSoldOut = (flashEnd > 0 && now > flashEnd) || isFlashQuotaFull || Boolean(catData.prices?.flashsale?.isSoldOut);

  // 1. Kategori 3K Ditutup Total
  const isCategoryConfigSoldOut = Boolean(
    catKey === '3k' ||
    catData.isSoldOut ||
    catData.soldOut ||
    catData.category_closed
  );

  const earlyQuota = tiers.early.quotaPerCategory || 50;
  const isEarlyQuotaFull = registeredCount >= earlyQuota;
  const isEarlyDatePassed = now > earlyEnd;

  const presaleQuota = tiers.presale.quotaPerCategory || 150;
  const isPresaleQuotaFull = registeredCount >= earlyQuota + presaleQuota;

  const isEarlyConfigSoldOut = Boolean(
    tiers.early.isSoldOut ||
    catData?.prices?.early?.isSoldOut
  );
  const isPresaleConfigSoldOut = Boolean(
    tiers.presale.isSoldOut ||
    catData?.prices?.presale?.isSoldOut
  );
  const isRegularConfigSoldOut = Boolean(
    tiers.regular.isSoldOut ||
    catData?.prices?.regular?.isSoldOut
  );

  let activeTierId: PricingTierId = 'regular';
  let isEarlyBirdSoldOut = isEarlyQuotaFull || isEarlyDatePassed || isEarlyConfigSoldOut;
  let isPresaleSoldOut = isPresaleQuotaFull || (now > presaleEnd) || isPresaleConfigSoldOut;
  let isRegularSoldOut = isRegularConfigSoldOut || (now > regularEnd);
  let statusNote = '';

  // EVALUATION PRIORITY:
  // Jika 3K ditutup
  if (isCategoryConfigSoldOut) {
    activeTierId = 'regular';
    statusNote = 'Pendaftaran Kategori 3K Hallo Pawitra Resmi Ditutup (Sold Out).';
  }
  // Cek apakah masuk Sesi Flash Sale (7 Nov, 17:00 - 17:30 WIB & kuota < 10)
  else if (isFlashDateActive && !isFlashQuotaFull && !catData.prices?.flashsale?.isSoldOut) {
    activeTierId = 'flashsale';
    const remaining = Math.max(0, flashQuota - flashSaleCount);
    statusNote = `Sesi Flash Sale aktif hingga 17:30 WIB! Tersisa ${remaining} dari ${flashQuota} slot.`;
  }
  // Early Bird
  else if (!isEarlyDatePassed && !isEarlyQuotaFull && !isEarlyConfigSoldOut) {
    activeTierId = 'early';
    const remaining = Math.max(0, earlyQuota - registeredCount);
    statusNote = `Sesi Early Bird aktif (Tersisa ${remaining} dari ${earlyQuota} kuota)`;
  }
  // Presale
  else if (now <= presaleEnd && !isPresaleQuotaFull && !isPresaleConfigSoldOut) {
    activeTierId = 'presale';
    isEarlyBirdSoldOut = true;
    statusNote = isEarlyQuotaFull || isEarlyConfigSoldOut
      ? 'Kuota Early Bird telah penuh! Masuk sesi Presale.'
      : 'Sesi Early Bird telah berakhir. Sesi Presale aktif.';
  }
  // Regular
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
    (activeTierId === 'flashsale' && isFlashSaleSoldOut) ||
    (activeTierId === 'early' && isEarlyBirdSoldOut) ||
    (activeTierId === 'presale' && isPresaleSoldOut) ||
    (activeTierId === 'regular' && isRegularSoldOut);

  const activeTierConfig = tiers[activeTierId] || tiers.regular;
  const rawActivePrice = (catData.prices?.[activeTierId] || catData.prices?.regular) as { amount: number; display?: string };
  const amount = rawActivePrice?.amount ?? 0;
  const display = rawActivePrice?.display || formatAmountToDisplay(amount);

  const getTierPriceObj = (tier: PricingTierId): CategoryPrice => {
    const p = (catData.prices?.[tier] || catData.prices?.regular) as { amount: number; display?: string };
    return {
      amount: p?.amount ?? 0,
      display: p?.display || formatAmountToDisplay(p?.amount ?? 0),
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
    quotaLimit: activeTierId === 'flashsale'
      ? flashQuota
      : activeTierId === 'early'
      ? earlyQuota
      : activeTierConfig.quotaPerCategory,
    quotaRemaining:
      activeTierId === 'flashsale' && !isFlashQuotaFull
        ? Math.max(0, flashQuota - flashSaleCount)
        : activeTierId === 'early' && !isEarlyBirdSoldOut
        ? Math.max(0, earlyQuota - registeredCount)
        : null,
    isEarlyBirdSoldOut,
    isPresaleSoldOut,
    isRegularSoldOut,
    isFlashSaleSoldOut,
    isCategorySoldOut: isCategoryConfigSoldOut,
    isCurrentTierSoldOut,
    isSoldOut: isCurrentTierSoldOut || isCategoryConfigSoldOut,
    statusNote,
    prices: {
      early: getTierPriceObj('early'),
      presale: getTierPriceObj('presale'),
      regular: getTierPriceObj('regular'),
      flashsale: getTierPriceObj('flashsale'),
    },
    tiersConfig: tiers,
  };
}

/**
 * Converts a numeric price amount to a short display string (e.g. 240000 -> "240k", 320000 -> "320k", 1500000 -> "1.5M").
 */
export function formatAmountToDisplay(amount: number): string {
  if (!amount || isNaN(amount)) return '0';
  let val = amount;
  if (val >= 100 && val < 1000) {
    val = val * 1000;
  } else if (val >= 1000 && val < 10000 && val % 100 === 0) {
    val = val * 100;
  }
  if (val >= 1000000) {
    const m = val / 1000000;
    return `${m % 1 === 0 ? m : m.toFixed(1)}M`;
  }
  if (val >= 1000) {
    const k = val / 1000;
    return `${k % 1 === 0 ? k : k.toFixed(0)}k`;
  }
  return val.toString();
}

/**
 * Helper to get category prices from config for static/fallback renders
 */
export function getCategoryPricesFromConfig(categoryInput: string) {
  const catKey = normalizeCategoryKey(categoryInput);
  const catData = pricingConfig.categories[catKey];
  const p = catData.prices as Record<string, { amount: number; display?: string }>;
  return {
    early: p.early?.display || formatAmountToDisplay(p.early.amount),
    presale: p.presale?.display || formatAmountToDisplay(p.presale.amount),
    regular: p.regular?.display || formatAmountToDisplay(p.regular.amount),
    flashsale: p.flashsale?.display || formatAmountToDisplay(p.flashsale?.amount || 0),
  };
}

/**
 * Returns formatted starting/active price for a category in category selection steps
 */
export function getCategoryStartingPrice(
  categoryId: string,
  pricingResult?: ActiveTierResult | null
): string {
  if (pricingResult?.display) {
    return `Rp ${pricingResult.display}`;
  }
  const configPrices = getCategoryPricesFromConfig(categoryId);
  return `Rp ${configPrices.early}`;
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
