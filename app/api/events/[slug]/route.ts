import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://gnbyrvileybbqfuzgbty.supabase.co';
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  'sb_publishable_8p4hyisKhyQaYNJWa6G48Q_DILEiCO7';
const supabase = createClient(supabaseUrl, supabaseKey);

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await context.params;

    if (!slug || !slug.trim()) {
      return NextResponse.json(
        { success: false, message: 'Parameter slug event wajib diisi.' },
        { status: 400 }
      );
    }

    const cleanSlug = slug.replace(/\.html$/, '').toLowerCase().trim();

    // Query event langsung dari tabel events di Supabase
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .ilike('slug', cleanSlug)
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error('Supabase query error for event slug:', cleanSlug, error);
      return NextResponse.json(
        { success: false, message: 'Gagal mengambil data event dari database.' },
        { status: 500 }
      );
    }

    if (data) {
      // Normalisasi nama kolom dokumen jika ada variasi nama kolom di tabel
      const normalizedData = {
        ...data,
        juknis_url: data.juknis_url || data.juknis || null,
        guide_book_url: data.guide_book_url || data.pedoman || data.guidebook_url || null,
        rules_url: data.rules_url || data.peraturan || null,
      };

      return NextResponse.json({
        success: true,
        data: normalizedData,
      });
    }

    // Alias fallback untuk variasi slug umum (contoh: koni-championship-1 <-> koni-1)
    if (cleanSlug === 'koni-championship-1' || cleanSlug === 'koni-1') {
      const aliasTarget = cleanSlug === 'koni-championship-1' ? 'koni-1' : 'koni-championship-1';
      const { data: aliasData } = await supabase
        .from('events')
        .select('*')
        .ilike('slug', aliasTarget)
        .limit(1)
        .maybeSingle();

      if (aliasData) {
        return NextResponse.json({
          success: true,
          data: {
            ...aliasData,
            juknis_url: aliasData.juknis_url || aliasData.juknis || null,
            guide_book_url: aliasData.guide_book_url || aliasData.pedoman || aliasData.guidebook_url || null,
            rules_url: aliasData.rules_url || aliasData.peraturan || null,
          },
        });
      }
    }

    return NextResponse.json(
      {
        success: false,
        message: `Event dengan slug "${cleanSlug}" tidak ditemukan di database.`,
      },
      { status: 404 }
    );
  } catch (err: any) {
    console.error('Error in GET /api/events/[slug]:', err);
    return NextResponse.json(
      { success: false, message: err.message || 'Terjadi kesalahan sistem saat mengambil data event.' },
      { status: 500 }
    );
  }
}
