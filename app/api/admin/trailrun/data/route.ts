import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServiceClient } from '@/lib/supabaseClient';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/trailrun/data
 * Mengambil data registrasi dan pembayaran trailrun secara lengkap menggunakan Supabase Service Client.
 * Bypass RLS sehingga admin selalu mendapatkan 100% data yang ada di database.
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseServiceClient();

    // Ambil registrasi dan pembayaran secara paralel
    const [regRes, payRes] = await Promise.all([
      supabase
        .from('trailrun_registrations')
        .select('*')
        .order('created_at', { ascending: false }),
      supabase
        .from('trailrun_payments')
        .select('*')
        .order('created_at', { ascending: false }),
    ]);

    if (regRes.error) {
      console.error('[Admin API] Error fetching registrations:', regRes.error.message);
    }
    if (payRes.error) {
      console.error('[Admin API] Error fetching payments:', payRes.error.message);
    }

    return NextResponse.json({
      success: true,
      registrations: regRes.data || [],
      payments: payRes.data || [],
    });
  } catch (error: any) {
    console.error('[Admin API] Server error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
