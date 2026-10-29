'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabaseAnonClient as supabase } from '@/lib/supabaseClient';
import type {
  SilatAtletRow,
  SilatOfficialRow,
  SilatKontingenRow,
  SilatPaymentRow,
  SilatAdminMetrics,
} from './types';
import { getSilatCategoryPrice } from '@/components/silat/types';

export function useSilatAdminData() {
  const [atlets, setAtlets] = useState<SilatAtletRow[]>([]);
  const [officials, setOfficials] = useState<SilatOfficialRow[]>([]);
  const [kontingen, setKontingen] = useState<SilatKontingenRow[]>([]);
  const [payments, setPayments] = useState<SilatPaymentRow[]>([]);

  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setIsRefreshing(true);
    try {
      // 1. Coba fetch dari backend admin route (bypass RLS via Service Client)
      const res = await fetch('/api/admin/silat/data', { cache: 'no-store' });
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          // Map payments to atlets by order_id if available
          const paymentMap = new Map<string, SilatPaymentRow>();
          (json.payments || []).forEach((p: SilatPaymentRow) => {
            if (p.order_id) paymentMap.set(p.order_id, p);
          });

          const enrichedAtlets: SilatAtletRow[] = (json.atlets || []).map((a: SilatAtletRow) => {
            const pay = a.order_id ? paymentMap.get(a.order_id) : undefined;
            return {
              ...a,
              payment: pay,
            };
          });

          setAtlets(enrichedAtlets);
          setOfficials(json.officials || []);
          setKontingen(json.kontingen || []);
          setPayments(json.payments || []);
          return;
        }
      }

      // Fallback: direct anon client query
      const { data: atletsData } = await supabase
        .from('silat_atlets')
        .select('*')
        .order('created_at', { ascending: false });

      const { data: officialsData } = await supabase
        .from('silat_officials')
        .select('*')
        .order('created_at', { ascending: false });

      const { data: kontingenData } = await supabase
        .from('silat_kontingen')
        .select('*')
        .order('created_at', { ascending: false });

      const { data: paymentsData } = await supabase
        .from('silat_payments')
        .select('*')
        .order('created_at', { ascending: false });

      const paymentMap = new Map<string, SilatPaymentRow>();
      (paymentsData || []).forEach((p: SilatPaymentRow) => {
        if (p.order_id) paymentMap.set(p.order_id, p);
      });

      const enrichedAtlets: SilatAtletRow[] = (atletsData || []).map((a: SilatAtletRow) => {
        const pay = a.order_id ? paymentMap.get(a.order_id) : undefined;
        return {
          ...a,
          payment: pay,
          kontingen_name: pay?.kontingen_name || a.asal_sekolah,
        };
      });

      setAtlets(enrichedAtlets);
      setOfficials(officialsData || []);
      setKontingen(kontingenData || []);
      setPayments(paymentsData || []);
    } catch (err) {
      console.error('Error fetching silat admin data:', err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Update Status Atlet (pending <-> paid)
  const handleUpdateAtletStatus = async (id: string, newStatus: 'paid' | 'pending') => {
    setUpdatingId(id);
    try {
      const { error } = await supabase
        .from('silat_atlets')
        .update({ status: newStatus })
        .eq('id', id);

      if (!error) {
        setAtlets((prev) =>
          prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item))
        );
      } else {
        alert('Gagal memperbarui status: ' + error.message);
      }
    } catch (err: any) {
      alert('Terjadi kesalahan: ' + err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  // Hapus Atlet
  const handleDeleteAtlet = async (id: string, nama: string) => {
    if (!confirm(`Hapus atlet "${nama}" dari sistem?`)) return;
    try {
      const { error } = await supabase.from('silat_atlets').delete().eq('id', id);
      if (!error) {
        setAtlets((prev) => prev.filter((a) => a.id !== id));
      } else {
        alert('Gagal menghapus atlet: ' + error.message);
      }
    } catch (err: any) {
      alert('Terjadi kesalahan: ' + err.message);
    }
  };

  // Kalkulasi Metrics
  const metrics: SilatAdminMetrics = useMemo(() => {
    let totalPaidAtlets = 0;
    let totalPendingAtlets = 0;
    let totalRevenue = 0;
    let pendingRevenue = 0;

    atlets.forEach((a) => {
      const price = getSilatCategoryPrice(a.kategori_lomba);
      if (a.status === 'paid') {
        totalPaidAtlets++;
        totalRevenue += price;
      } else {
        totalPendingAtlets++;
        pendingRevenue += price;
      }
    });

    return {
      totalAtlets: atlets.length,
      totalPaidAtlets,
      totalPendingAtlets,
      totalKontingen: kontingen.length,
      totalOfficials: officials.length,
      totalRevenue,
      pendingRevenue,
    };
  }, [atlets, kontingen, officials]);

  return {
    atlets,
    officials,
    kontingen,
    payments,
    metrics,
    loading,
    isRefreshing,
    updatingId,
    fetchData,
    handleUpdateAtletStatus,
    handleDeleteAtlet,
  };
}
