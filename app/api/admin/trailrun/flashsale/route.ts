import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServiceClient } from '@/lib/supabaseClient';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/trailrun/flashsale
 * Mengambil konfigurasi aktif Flash Sale & statistik kuota terpakai
 */
export async function GET() {
  try {
    const supabase = getSupabaseServiceClient();

    // 1. Ambil tier flashsale & pricing kategori
    const [tierRes, pricingRes] = await Promise.all([
      supabase
        .from('trailrun_pricing_tiers')
        .select('*')
        .eq('id', 'flashsale')
        .maybeSingle(),
      supabase
        .from('trailrun_category_pricing')
        .select('*')
        .eq('tier_id', 'flashsale'),
    ]);

    const flashTier = tierRes.data || {
      id: 'flashsale',
      name: 'Flash Sale',
      is_active: true,
      start_date: '2026-11-07T17:00:00+07:00',
      end_date: '2026-11-07T17:30:00+07:00',
      access_password: 'FLASHSALE2026',
    };

    const categoryPricing = pricingRes.data || [];
    const pricing7k = categoryPricing.find((cp) => cp.category_key === '7k');
    const pricing12k = categoryPricing.find((cp) => cp.category_key === '12k');

    const quota7k = pricing7k?.quota_limit ?? 10;
    const quota12k = pricing12k?.quota_limit ?? 10;

    // 2. Hitung pendaftar paid yang masuk dalam jendela waktu flash sale
    const flashStart = flashTier.start_date || '2026-11-07T17:00:00+07:00';
    const flashEnd = flashTier.end_date || '2026-11-07T17:30:00+07:00';

    const [res7k, res12k] = await Promise.all([
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

    const used7k = res7k.count || 0;
    const used12k = res12k.count || 0;

    return NextResponse.json({
      success: true,
      data: {
        is_active: Boolean(flashTier.is_active ?? true),
        start_date: flashTier.start_date,
        end_date: flashTier.end_date,
        access_password: flashTier.access_password || 'FLASHSALE2026',
        quota_7k: quota7k,
        used_7k: used7k,
        quota_12k: quota12k,
        used_12k: used12k,
      },
    });
  } catch (error: any) {
    console.error('[Admin API FlashSale GET Error]:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/trailrun/flashsale
 * Memperbarui status, jadwal waktu, password, dan kuota 7K/12K khusus Flash Sale
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseServiceClient();
    const body = await request.json();

    const {
      is_active,
      start_date,
      end_date,
      access_password,
      quota_7k,
      quota_12k,
    } = body;

    if (!start_date || !end_date) {
      return NextResponse.json(
        { success: false, message: 'Waktu mulai dan selesai wajib diisi.' },
        { status: 400 }
      );
    }

    const cleanQuota7k = Math.max(1, parseInt(quota_7k, 10) || 10);
    const cleanQuota12k = Math.max(1, parseInt(quota_12k, 10) || 10);
    const cleanPassword = (access_password || 'FLASHSALE2026').toString().trim().toUpperCase();

    // 1. Update tabel trailrun_pricing_tiers untuk tier flashsale
    const { error: tierError } = await supabase
      .from('trailrun_pricing_tiers')
      .update({
        is_active: Boolean(is_active),
        start_date: new Date(start_date).toISOString(),
        end_date: new Date(end_date).toISOString(),
        access_password: cleanPassword,
        updated_at: new Date().toISOString(),
      })
      .eq('id', 'flashsale');

    if (tierError) {
      console.error('[Admin API FlashSale] Error updating tier:', tierError.message);
      return NextResponse.json(
        { success: false, message: `Gagal update tier: ${tierError.message}` },
        { status: 500 }
      );
    }

    // 2. Update kuota 7K pada trailrun_category_pricing
    const { error: err7k } = await supabase
      .from('trailrun_category_pricing')
      .update({
        quota_limit: cleanQuota7k,
        updated_at: new Date().toISOString(),
      })
      .eq('category_key', '7k')
      .eq('tier_id', 'flashsale');

    if (err7k) {
      console.error('[Admin API FlashSale] Error updating 7K quota:', err7k.message);
    }

    // 3. Update kuota 12K pada trailrun_category_pricing
    const { error: err12k } = await supabase
      .from('trailrun_category_pricing')
      .update({
        quota_limit: cleanQuota12k,
        updated_at: new Date().toISOString(),
      })
      .eq('category_key', '12k')
      .eq('tier_id', 'flashsale');

    if (err12k) {
      console.error('[Admin API FlashSale] Error updating 12K quota:', err12k.message);
    }

    return NextResponse.json({
      success: true,
      message: 'Pengaturan Flash Sale & kuota berhasil diperbarui.',
    });
  } catch (error: any) {
    console.error('[Admin API FlashSale POST Error]:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

