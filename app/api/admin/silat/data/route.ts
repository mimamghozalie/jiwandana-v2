import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServiceClient } from '@/lib/supabaseClient';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/silat/data
 * Mengambil data silat (kontingen, akun kontingen, atlet, official, pembayaran)
 * secara lengkap menggunakan Supabase Service Client (bypass RLS).
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseServiceClient();

    const [kontingenRes, accountsRes, atletsRes, officialsRes, paymentsRes] = await Promise.all([
      supabase.from('silat_kontingen').select('*').order('created_at', { ascending: false }),
      supabase.from('silat_kontingen_accounts').select('id, kontingen_id, email, last_login, created_at'),
      supabase.from('silat_atlets').select('*').order('created_at', { ascending: false }),
      supabase.from('silat_officials').select('*').order('created_at', { ascending: false }),
      supabase.from('silat_payments').select('*').order('created_at', { ascending: false }),
    ]);

    if (kontingenRes.error) console.error('[Silat Admin API] Kontingen error:', kontingenRes.error.message);
    if (accountsRes.error) console.error('[Silat Admin API] Accounts error:', accountsRes.error.message);
    if (atletsRes.error) console.error('[Silat Admin API] Atlets error:', atletsRes.error.message);
    if (officialsRes.error) console.error('[Silat Admin API] Officials error:', officialsRes.error.message);
    if (paymentsRes.error) console.error('[Silat Admin API] Payments error:', paymentsRes.error.message);

    const kontingenList = kontingenRes.data || [];
    const accountsList = accountsRes.data || [];
    const atletsList = atletsRes.data || [];
    const officialsList = officialsRes.data || [];
    const paymentsList = paymentsRes.data || [];

    // Map account by kontingen_id
    const accountByKontingenId = new Map<string, any>();
    accountsList.forEach((acc: any) => {
      if (acc.kontingen_id) {
        accountByKontingenId.set(acc.kontingen_id, acc);
      }
    });

    // Count atlets & officials per kontingen
    const atletCountByKontingen = new Map<string, number>();
    atletsList.forEach((a: any) => {
      if (a.kontingen_id) {
        atletCountByKontingen.set(a.kontingen_id, (atletCountByKontingen.get(a.kontingen_id) || 0) + 1);
      }
    });

    const officialCountByKontingen = new Map<string, number>();
    officialsList.forEach((o: any) => {
      if (o.kontingen_id) {
        officialCountByKontingen.set(o.kontingen_id, (officialCountByKontingen.get(o.kontingen_id) || 0) + 1);
      }
    });

    // Kontingen map by ID for atlet enrichment
    const kontingenById = new Map<string, any>();
    const enrichedKontingen = kontingenList.map((k: any) => {
      const acc = accountByKontingenId.get(k.id);
      const row = {
        ...k,
        account_email: acc?.email || null,
        account_last_login: acc?.last_login || null,
        total_atlets: atletCountByKontingen.get(k.id) || 0,
        total_officials: officialCountByKontingen.get(k.id) || 0,
      };
      kontingenById.set(k.id, row);
      return row;
    });

    // Enrich atlets with kontingen_name & account_email
    const enrichedAtlets = atletsList.map((a: any) => {
      const parentKontingen = a.kontingen_id ? kontingenById.get(a.kontingen_id) : undefined;
      return {
        ...a,
        kontingen_name: parentKontingen?.nama_kontingen || a.asal_sekolah,
        account_email: parentKontingen?.account_email || null,
      };
    });

    // Enrich officials with kontingen_name & account_email
    const enrichedOfficials = officialsList.map((o: any) => {
      const parentKontingen = o.kontingen_id ? kontingenById.get(o.kontingen_id) : undefined;
      return {
        ...o,
        kontingen_name: parentKontingen?.nama_kontingen,
        account_email: parentKontingen?.account_email || null,
      };
    });

    return NextResponse.json({
      success: true,
      kontingen: enrichedKontingen,
      accounts: accountsList,
      atlets: enrichedAtlets,
      officials: enrichedOfficials,
      payments: paymentsList,
    });
  } catch (error: any) {
    console.error('[Silat Admin API] Server error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

