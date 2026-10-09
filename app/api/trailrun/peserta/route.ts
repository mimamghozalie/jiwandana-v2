import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://gnbyrvileybbqfuzgbty.supabase.co';
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_SECRET_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  'sb_publishable_8p4hyisKhyQaYNJWa6G48Q_DILEiCO7';
const supabase = createClient(supabaseUrl, supabaseKey);

export const dynamic = 'force-dynamic';

// Helper with timeout to prevent hung queries
async function withTimeout<T>(promise: PromiseLike<T>, timeoutMs = 3500): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('DATABASE_TIMEOUT')), timeoutMs)
    ),
  ]);
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const queryParam =
      searchParams.get('q') ||
      searchParams.get('search') ||
      searchParams.get('no_bib') ||
      searchParams.get('bib') ||
      searchParams.get('phone') ||
      searchParams.get('no_hp') ||
      searchParams.get('wa') ||
      '';

    if (!queryParam || !queryParam.trim()) {
      return NextResponse.json(
        { success: false, message: 'Nomor BIB atau Nomor WhatsApp wajib diisi.' },
        { status: 400 }
      );
    }

    const raw = queryParam.trim();
    const cleanBib = raw.toUpperCase();
    const digitsOnly = raw.replace(/\D/g, '');

    let matches: any[] = [];

    // 1. Coba cari berdasarkan no_bib (exact atau partial)
    const bibQuery = supabase
      .from('trailrun_registrations')
      .select('*')
      .or(`no_bib.ilike.${cleanBib},no_bib.ilike.%${cleanBib}%`)
      .limit(5);

    const { data: bibMatches, error: bibError } = await withTimeout(bibQuery, 3500);

    if (bibError) {
      console.error('Supabase query error searching participant by BIB:', bibError);
    }

    if (bibMatches && bibMatches.length > 0) {
      matches = bibMatches;
    } else if (digitsOnly.length >= 6) {
      // 2. Jika tidak ditemukan via no_bib, cari berdasarkan no_hp / WhatsApp
      const phoneCandidates = Array.from(
        new Set(
          [
            raw,
            digitsOnly,
            digitsOnly.startsWith('0') ? digitsOnly.slice(1) : digitsOnly,
            digitsOnly.startsWith('62') ? digitsOnly.slice(2) : digitsOnly,
            digitsOnly.startsWith('0') ? '62' + digitsOnly.slice(1) : digitsOnly,
            digitsOnly.startsWith('62') ? '0' + digitsOnly.slice(2) : digitsOnly,
          ].filter((p) => p.length >= 6)
        )
      );

      const orFilter = phoneCandidates.map((p) => `no_hp.ilike.%${p}%`).join(',');

      const phoneQuery = supabase
        .from('trailrun_registrations')
        .select('*')
        .or(orFilter)
        .order('created_at', { ascending: false })
        .limit(10);

      const { data: phoneMatches, error: phoneError } = await withTimeout(phoneQuery, 3500);

      if (phoneError) {
        console.error('Supabase query error searching participant by phone:', phoneError);
      }

      if (phoneMatches && phoneMatches.length > 0) {
        matches = phoneMatches;
      }
    }

    if (!matches || matches.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: `Tidak ada peserta yang terdaftar dengan nomor BIB atau WhatsApp "${raw}".`,
        },
        { status: 404 }
      );
    }

    // Ambil data pembayaran terkait jika ada
    const primary = matches[0];
    let paymentInfo = null;
    try {
      const payQuery = supabase
        .from('trailrun_payments')
        .select('order_id, amount, fee, total_payment, payment_method, status, completed_at')
        .eq('registration_id', primary.id)
        .limit(1)
        .maybeSingle();

      const { data: pay } = await withTimeout(payQuery, 2500);
      paymentInfo = pay || null;
    } catch {
      // ignore payment join error
    }

    return NextResponse.json({
      success: true,
      data: {
        ...primary,
        payment: paymentInfo,
      },
      multipleResults:
        matches.length > 1
          ? matches.map((m) => ({
              id: m.id,
              nama: m.nama,
              no_bib: m.no_bib,
              kategori: m.kategori,
              no_hp: m.no_hp,
              status: m.status,
            }))
          : undefined,
    });
  } catch (error: any) {
    console.error('Error fetching participant detail:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Terjadi kesalahan sistem saat mencari peserta.' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/trailrun/peserta?id=xxx
 * Menghapus satu pendaftar dan transaksi pembayarannya langsung
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'ID pendaftaran wajib diisi.' },
        { status: 400 }
      );
    }

    // 1. Hapus transaksi pembayaran terkait terlebih dahulu
    await supabase.from('trailrun_payments').delete().eq('registration_id', id);

    // 2. Hapus data pendaftaran
    const { error: delError } = await supabase
      .from('trailrun_registrations')
      .delete()
      .eq('id', id);

    if (delError) {
      throw delError;
    }

    return NextResponse.json({
      success: true,
      message: 'Pendaftar berhasil dihapus dari database.',
    });
  } catch (error: any) {
    console.error('Error deleting participant:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Gagal menghapus pendaftar.' },
      { status: 500 }
    );
  }
}
