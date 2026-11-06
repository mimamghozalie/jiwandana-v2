import { NextRequest, NextResponse } from 'next/server';
import { getActivePricingTier, getPricingConfig } from '@/lib/pricing';
import { supabaseServerClient as supabase } from '@/lib/supabaseClient';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // 1. Ambil data tier dan kategori harga dari Supabase jika tabel sudah dibuat
    let dbTiers: any[] = [];
    let dbCategoryPricing: any[] = [];

    try {
      const [tiersRes, pricingRes] = await Promise.all([
        supabase.from('trailrun_pricing_tiers').select('*').order('created_at'),
        supabase.from('trailrun_category_pricing').select('*'),
      ]);

      if (!tiersRes.error && tiersRes.data) {
        dbTiers = tiersRes.data;
      }
      if (!pricingRes.error && pricingRes.data) {
        dbCategoryPricing = pricingRes.data;
      }
    } catch (dbErr) {
      console.warn('[Pricing API] Supabase custom tables not yet initialized, using JSON config fallback:', dbErr);
    }

    // 2. Ambil waktu flash sale untuk menghitung pendaftar paid dalam jendela waktu flash sale
    const flashTier = dbTiers.find((t) => t.id === 'flashsale') || getPricingConfig().tiers.flashsale;
    const flashStart = flashTier?.start_date || flashTier?.startDate || '2026-11-07T17:00:00+07:00';
    const flashEnd = flashTier?.end_date || flashTier?.endDate || '2026-11-07T17:30:00+07:00';

    // 3. Count paid registrations per category & paid registrations during flash sale
    const [res3k, res7k, res12k, flashRes7k, flashRes12k] = await Promise.all([
      supabase
        .from('trailrun_registrations')
        .select('*', { count: 'exact', head: true })
        .ilike('kategori', '%3k%')
        .eq('status', 'paid'),
      supabase
        .from('trailrun_registrations')
        .select('*', { count: 'exact', head: true })
        .ilike('kategori', '%7k%')
        .eq('status', 'paid'),
      supabase
        .from('trailrun_registrations')
        .select('*', { count: 'exact', head: true })
        .ilike('kategori', '%12k%')
        .eq('status', 'paid'),
      supabase
        .from('trailrun_registrations')
        .select('*', { count: 'exact', head: true })
        .ilike('kategori', '%7k%')
        .eq('status', 'paid')
        .gte('created_at', flashStart)
        .lte('created_at', flashEnd),
      supabase
        .from('trailrun_registrations')
        .select('*', { count: 'exact', head: true })
        .ilike('kategori', '%12k%')
        .eq('status', 'paid')
        .gte('created_at', flashStart)
        .lte('created_at', flashEnd),
    ]);

    const count3k = res3k.count || 0;
    const count7k = res7k.count || 0;
    const count12k = res12k.count || 0;
    const countFlash7k = flashRes7k.count || 0;
    const countFlash12k = flashRes12k.count || 0;

    const dbConfig = dbTiers.length > 0 ? { tiers: dbTiers, categoryPricing: dbCategoryPricing } : undefined;

    const tier3k = getActivePricingTier('3k', count3k, new Date(), 0, dbConfig);
    const tier7k = getActivePricingTier('7k', count7k, new Date(), countFlash7k, dbConfig);
    const tier12k = getActivePricingTier('12k', count12k, new Date(), countFlash12k, dbConfig);

    return NextResponse.json({
      '3k': tier3k,
      '7k': tier7k,
      '12k': tier12k,
      '3K': tier3k,
      '7K': tier7k,
      '12K': tier12k,
      tiersConfig: tier7k.tiersConfig,
      source: dbTiers.length > 0 ? 'supabase' : 'local_json',
      currentCounts: {
        '3k': count3k,
        '7k': count7k,
        '12k': count12k,
        flash_7k: countFlash7k,
        flash_12k: countFlash12k,
      },
    });
  } catch (err: any) {
    console.error('Error in /api/trailrun/pricing:', err);
    // Graceful fallback
    const tier3k = getActivePricingTier('3k', 0);
    const tier7k = getActivePricingTier('7k', 0);
    const tier12k = getActivePricingTier('12k', 0);

    return NextResponse.json({
      '3k': tier3k,
      '7k': tier7k,
      '12k': tier12k,
      '3K': tier3k,
      '7K': tier7k,
      '12K': tier12k,
      tiersConfig: getPricingConfig().tiers,
      source: 'fallback',
      currentCounts: {
        '3k': 0,
        '7k': 0,
        '12k': 0,
        flash_7k: 0,
        flash_12k: 0,
      },
    });
  }
}
