import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://gnbyrvileybbqfuzgbty.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_8p4hyisKhyQaYNJWa6G48Q_DILEiCO7';
const supabase = createClient(supabaseUrl, supabaseKey);

export const dynamic = 'force-dynamic';

function getCategoryPrefix(category?: string | null): string {
  const cat = (category || '').toLowerCase().trim();
  if (cat.includes('12')) return '12-';
  if (cat.includes('7')) return '7-';
  if (cat.includes('3')) return '3-';
  return '7-';
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
    const categoryParam = searchParams.get('kategori') || searchParams.get('category');
    const currentParam = searchParams.get('current')?.trim() || '';
    const prefix = getCategoryPrefix(categoryParam);

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

        if (clean.startsWith(prefix.toUpperCase())) {
          const numPart = clean.slice(prefix.length).replace(/\D/g, '');
          const num = parseInt(numPart, 10);
          if (!isNaN(num) && num > maxNumber && num < 10000) {
            maxNumber = num;
          }
        }
      }
    }

    // Determine start number
    let startNumber = 1;
    if (currentParam && currentParam.toUpperCase().startsWith(prefix.toUpperCase())) {
      const currentNumPart = currentParam.slice(prefix.length).replace(/\D/g, '');
      const parsedCurrent = parseInt(currentNumPart, 10);
      if (!isNaN(parsedCurrent) && parsedCurrent >= 1) {
        startNumber = parsedCurrent + 1;
      }
    } else {
      startNumber = maxNumber + 1;
    }

    // Find first available number
    let candidateNum = startNumber;
    let candidateBib = `${prefix}${String(candidateNum).padStart(4, '0')}`;

    // Loop until we find a non-existing bib (up to 9999, then wrap to 1)
    let attempts = 0;
    while (existingBibs.has(candidateBib.toUpperCase()) && attempts < 9999) {
      candidateNum++;
      if (candidateNum > 9999) candidateNum = 1;
      candidateBib = `${prefix}${String(candidateNum).padStart(4, '0')}`;
      attempts++;
    }

    return NextResponse.json({
      success: true,
      bib: candidateBib,
      prefix,
      number: candidateNum,
      category: categoryParam || '',
    });
  } catch (err: any) {
    console.error('Error generating BIB in route:', err);
    const prefix = getCategoryPrefix(null);
    return NextResponse.json({
      success: true,
      bib: `${prefix}0001`,
      prefix,
      number: 1,
    });
  }
}
