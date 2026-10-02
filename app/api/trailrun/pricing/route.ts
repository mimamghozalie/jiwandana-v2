import { NextRequest, NextResponse } from 'next/server';
import { getActivePricingTier, getPricingConfig } from '@/lib/pricing';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET(request: NextRequest) {
  try {
    // Count paid or confirmed registrations per category
    const [res3k, res7k, res12k] = await Promise.all([
      supabase
        .from('trailrun_registrations')
        .select('*', { count: 'exact', head: true })
        .ilike('kategori', '%3k%')
        .in('status', ['paid', 'confirmed']),
      supabase
        .from('trailrun_registrations')
        .select('*', { count: 'exact', head: true })
        .ilike('kategori', '%7k%')
        .in('status', ['paid', 'confirmed']),
      supabase
        .from('trailrun_registrations')
        .select('*', { count: 'exact', head: true })
        .ilike('kategori', '%12k%')
        .in('status', ['paid', 'confirmed']),
    ]);

    const count3k = res3k.count || 0;
    const count7k = res7k.count || 0;
    const count12k = res12k.count || 0;

    return NextResponse.json({
      '3k': getActivePricingTier('3k', count3k),
      '7k': getActivePricingTier('7k', count7k),
      '12k': getActivePricingTier('12k', count12k),
      tiersConfig: getPricingConfig().tiers,
      currentCounts: {
        '3k': count3k,
        '7k': count7k,
        '12k': count12k,
      },
    });
  } catch (err: any) {
    // Graceful fallback if database is offline or initializing
    return NextResponse.json({
      '3k': getActivePricingTier('3k', 0),
      '7k': getActivePricingTier('7k', 0),
      '12k': getActivePricingTier('12k', 0),
      tiersConfig: getPricingConfig().tiers,
      currentCounts: { '3k': 0, '7k': 0, '12k': 0 },
    });
  }
}
