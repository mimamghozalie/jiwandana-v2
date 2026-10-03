import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://gnbyrvileybbqfuzgbty.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_8p4hyisKhyQaYNJWa6G48Q_DILEiCO7';
const supabase = createClient(supabaseUrl, supabaseKey);

export const dynamic = 'force-dynamic';

function getGenderPrefix(gender?: string | null): string {
  const g = (gender || '').toLowerCase().trim();
  if (g.startsWith('p') || g.startsWith('f') || g.includes('wanita') || g.includes('female')) {
    return 'F-';
  }
  return 'M-'; // 'M-' for Male / Laki-laki
}

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
    const genderParam = searchParams.get('gender') || searchParams.get('jenis_kelamin');
    const categoryParam = searchParams.get('kategori') || searchParams.get('category');
    const currentParam = searchParams.get('current')?.trim() || '';

    // Prefix based on gender: 'M-' (Male / Laki-laki) or 'F-' (Female / Perempuan)
    const prefix = getGenderPrefix(genderParam);

    // Fetch existing registrations matching prefix
    const queryPromise = supabase
      .from('trailrun_registrations')
      .select('no_bib')
      .ilike('no_bib', `${prefix}%`);

    const { data } = await withTimeout(queryPromise, 3500).catch(() => ({ data: null }));

    const existingBibs = new Set<string>();
    let maxNumber = 0;

    if (data && Array.isArray(data)) {
      for (const item of data) {
        if (!item.no_bib) continue;
        const clean = item.no_bib.trim().toUpperCase();
        existingBibs.add(clean);

        if (clean.startsWith(prefix)) {
          const numPart = clean.slice(prefix.length).replace(/\D/g, '');
          const num = parseInt(numPart, 10);
          if (!isNaN(num) && num > maxNumber && num < 100000) {
            maxNumber = num;
          }
        }
      }
    }

    // Determine start number
    let startNumber = 1;
    if (currentParam && currentParam.toUpperCase().startsWith(prefix)) {
      const currentNumPart = currentParam.slice(prefix.length).replace(/\D/g, '');
      const parsedCurrent = parseInt(currentNumPart, 10);
      if (!isNaN(parsedCurrent) && parsedCurrent >= 1) {
        startNumber = parsedCurrent + 1;
      }
    } else {
      startNumber = maxNumber + 1;
    }

    // Find first available number (5 digits with '-' separator, e.g. F-00001, M-00001)
    let candidateNum = startNumber;
    let candidateBib = `${prefix}${String(candidateNum).padStart(5, '0')}`;

    // Loop until we find a non-existing bib (up to 99999, then wrap to 1)
    let attempts = 0;
    while (existingBibs.has(candidateBib.toUpperCase()) && attempts < 99999) {
      candidateNum++;
      if (candidateNum > 99999) candidateNum = 1;
      candidateBib = `${prefix}${String(candidateNum).padStart(5, '0')}`;
      attempts++;
    }

    return NextResponse.json({
      success: true,
      bib: candidateBib,
      prefix,
      number: candidateNum,
      category: categoryParam || '',
      gender: genderParam || (prefix.startsWith('F') ? 'Perempuan' : 'Laki-laki'),
    });
  } catch (err: any) {
    console.error('Error generating BIB in route:', err);
    return NextResponse.json({
      success: true,
      bib: 'M-00001',
      prefix: 'M-',
      number: 1,
    });
  }
}
