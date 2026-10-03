import { NextRequest, NextResponse } from 'next/server';
import { getActivePricingTier, getPricingConfig } from '@/lib/pricing';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET(request: NextRequest) {
  try {
    // Count strictly paid registrations per category (unpaid/pending does not consume quota)
    const [res3k, res7k, res12k] = await Promise.all([
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
    ]);

    const count3k = res3k.count || 0;
    const count7k = res7k.count || 0;
    const count12k = res12k.count || 0;

    const tier3k = getActivePricingTier('3k', count3k);
    const tier7k = getActivePricingTier('7k', count7k);
    const tier12k = getActivePricingTier('12k', count12k);

    return NextResponse.json({
      '3k': tier3k,
      '7k': tier7k,
      '12k': tier12k,
      '3K': tier3k,
      '7K': tier7k,
      '12K': tier12k,
      tiersConfig: getPricingConfig().tiers,
      currentCounts: {
        '3k': count3k,
        '7k': count7k,
        '12k': count12k,
      },
    });
  } catch (err: any) {
    // Graceful fallback if database is offline or initializing
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
      currentCounts: { '3k': 0, '7k': 0, '12k': 0 },
    });
  }
}
