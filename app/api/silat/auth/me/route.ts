import { NextRequest, NextResponse } from 'next/server';
import { supabaseServerClient as supabase } from '@/lib/supabaseClient';
import { getSilatSessionFromRequest, clearSilatSessionCookie } from '@/lib/silatAuth';

export async function GET(request: NextRequest) {
  try {
    const session = await getSilatSessionFromRequest(request);

    if (!session) {
      return NextResponse.json({
        authenticated: false,
        user: null,
      });
    }

    // Ambil data profil kontingen terbaru
    const { data: kontingen, error } = await supabase
      .from('silat_kontingen')
      .select('id, nama_kontingen, asal_sekolah, kota, pic_name, pic_phone, pic_email, status, created_at')
      .eq('id', session.kontingenId)
      .maybeSingle();

    if (error || !kontingen) {
      // Akun tidak valid lagi atau sudah dihapus
      const response = NextResponse.json({
        authenticated: false,
        user: null,
      });
      clearSilatSessionCookie(response);
      return response;
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        accountId: session.accountId,
        kontingenId: kontingen.id,
        email: session.email,
        namaKontingen: kontingen.nama_kontingen,
        asalSekolah: kontingen.asal_sekolah || '',
        kota: kontingen.kota || 'Mojokerto',
        picName: kontingen.pic_name || '',
        picPhone: kontingen.pic_phone || '',
        status: kontingen.status || 'pending',
      },
    });
  } catch (err: any) {
    console.error('Error fetching silat auth session:', err);
    return NextResponse.json(
      { authenticated: false, user: null, error: err?.message },
      { status: 500 }
    );
  }
}

