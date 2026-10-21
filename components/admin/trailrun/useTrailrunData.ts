'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { TrailrunRow, SAMPLE_TRAILRUN_DATA } from './types';

export function useTrailrunData() {
  const [data, setData] = useState<TrailrunRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isCleaningUp, setIsCleaningUp] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setIsRefreshing(true);
    try {
      let registrations: any[] = [];
      let payments: any[] = [];

      // 1. Coba fetch dari API route admin terlebih dahulu (menggunakan Supabase Service Client / bypass RLS)
      try {
        const apiRes = await fetch('/api/admin/trailrun/data', { cache: 'no-store' });
        if (apiRes.ok) {
          const apiJson = await apiRes.json();
          if (apiJson.success) {
            registrations = apiJson.registrations || [];
            payments = apiJson.payments || [];
          }
        }
      } catch (apiErr) {
        console.warn('Gagal fetch dari /api/admin/trailrun/data, fallback ke client SDK:', apiErr);
      }

      // 2. Fallback ke Supabase Client SDK jika API belum menghasilkan data
      if (registrations.length === 0 && payments.length === 0) {
        const [regRes, payRes] = await Promise.all([
          supabase.from('trailrun_registrations').select('*').order('created_at', { ascending: false }),
          supabase.from('trailrun_payments').select('*').order('created_at', { ascending: false }),
        ]);
        registrations = regRes.data || [];
        payments = payRes.data || [];
      }

      if (registrations.length === 0) {
        setData(SAMPLE_TRAILRUN_DATA);
      } else {
        // Map payments by registration_id, order_id, pic_phone, pic_name
        const paymentsMap = new Map<string, any>();
        const orderIdPaymentsMap = new Map<string, any>();
        const picPhonePaymentsMap = new Map<string, any>();
        const picNamePaymentsMap = new Map<string, any>();

        payments.forEach((p) => {
          if (p.registration_id && !paymentsMap.has(p.registration_id)) {
            paymentsMap.set(p.registration_id, p);
          }
          if (p.order_id && !orderIdPaymentsMap.has(p.order_id)) {
            orderIdPaymentsMap.set(p.order_id, p);
          }
          if (p.pic_phone && !picPhonePaymentsMap.has(p.pic_phone.trim())) {
            picPhonePaymentsMap.set(p.pic_phone.trim(), p);
          }
          if (p.pic_name && !picNamePaymentsMap.has(p.pic_name.trim().toLowerCase())) {
            picNamePaymentsMap.set(p.pic_name.trim().toLowerCase(), p);
          }
        });

        const merged: TrailrunRow[] = registrations.map((r: any) => {
          const pay =
            paymentsMap.get(r.id) ||
            (r.order_id ? orderIdPaymentsMap.get(r.order_id) : null) ||
            (r.pic_phone ? picPhonePaymentsMap.get(r.pic_phone.trim()) : null) ||
            (r.pic_name ? picNamePaymentsMap.get(r.pic_name.trim().toLowerCase()) : null);

          // Normalisasi status pembayaran: 'paid' jika lunas di registrasi ATAU di transaksi pembayaran
          const isLunas =
            r.status === 'paid' ||
            r.status === 'completed' ||
            r.status === 'settled' ||
            pay?.status === 'completed' ||
            pay?.status === 'settled';

          const normalizedStatus = isLunas ? 'paid' : (r.status === 'confirmed' ? 'confirmed' : 'pending');

          return {
            id: r.id,
            nama: r.nama,
            nik: r.nik || '-',
            kk: r.kk || '-',
            email: r.email,
            no_bib: r.no_bib || '-',
            no_hp: r.no_hp,
            alamat: r.alamat,
            kota: r.kota,
            provinsi: r.provinsi,
            kewarganegaraan: r.kewarganegaraan,
            tanggal_lahir: r.tanggal_lahir,
            jenis_kelamin: r.jenis_kelamin,
            nama_komunitas: r.nama_komunitas,
            golongan_darah: r.golongan_darah,
            riwayat_medis: r.riwayat_medis,
            kontak_darurat: r.kontak_darurat,
            kategori: r.kategori,
            ukuran_jersey: r.ukuran_jersey || '-',
            hasil_lari: r.hasil_lari || '-',
            status: normalizedStatus,
            registration_type:
              r.registration_type ||
              (pay?.order_id?.startsWith('TR-BULK') || pay?.pic_name || r.pic_name ? 'bulk' : 'individu'),
            order_id: r.order_id || pay?.order_id || null,
            created_at: r.created_at,
            payment: pay,
            pic_name: r.pic_name || pay?.pic_name || null,
            pic_phone: r.pic_phone || pay?.pic_phone || null,
            pic_email: r.pic_email || pay?.pic_email || null,
          };
        });

        setData(merged);
      }
    } catch (err) {
      console.warn('Error fetching trailrun registrations from Supabase, using sample fallback:', err);
      setData(SAMPLE_TRAILRUN_DATA);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Update Status in Supabase & local state
  const handleUpdateStatus = async (id: string, newStatus: 'paid' | 'pending' | 'confirmed') => {
    setUpdatingId(id);
    try {
      await supabase
        .from('trailrun_registrations')
        .update({ status: newStatus })
        .eq('id', id);

      if (newStatus === 'paid') {
        await supabase
          .from('trailrun_payments')
          .update({ status: 'completed', completed_at: new Date().toISOString() })
          .eq('registration_id', id);
      } else if (newStatus === 'pending') {
        await supabase
          .from('trailrun_payments')
          .update({ status: 'pending' })
          .eq('registration_id', id);
      }

      setData((prev) =>
        prev.map((row) =>
          row.id === id
            ? {
                ...row,
                status: newStatus,
                payment: row.payment
                  ? {
                      ...row.payment,
                      status: newStatus === 'paid' ? 'completed' : 'pending',
                    }
                  : row.payment,
              }
            : row
        )
      );
    } catch (err) {
      console.error('Failed to update status:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  // Update Hasil Lari Peserta
  const handleSaveHasilLari = async (id: string, newHasil: string) => {
    try {
      const res = await fetch('/api/admin/trailrun/update-result', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, hasil_lari: newHasil }),
      });
      const result = await res.json();
      if (!res.ok || !result.success) {
        throw new Error(result.error || result.message || 'Gagal menyimpan hasil lari');
      }

      setData((prev) =>
        prev.map((row) => (row.id === id ? { ...row, hasil_lari: newHasil } : row))
      );
    } catch (err: any) {
      alert(`Terjadi kesalahan: ${err.message || 'Gagal menyimpan hasil lari'}`);
      throw err;
    }
  };

  // Hapus satu pendaftar
  const handleDeleteRow = async (id: string, nama: string) => {
    const confirmed = window.confirm(
      `Apakah Anda yakin ingin menghapus peserta "${nama}"?\nNomor BIB akan dibebaskan dan data transaksi terkait akan dihapus.`
    );
    if (!confirmed) return false;

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/trailrun/peserta?id=${id}`, {
        method: 'DELETE',
      });
      const result = await res.json();

      if (result.success) {
        alert(`Peserta "${nama}" berhasil dihapus.`);
        await fetchData();
        return true;
      } else {
        alert(result.message || 'Gagal menghapus peserta.');
        return false;
      }
    } catch (err: any) {
      alert(`Terjadi kesalahan: ${err.message || 'Gagal menghubungi server.'}`);
      return false;
    } finally {
      setIsDeleting(false);
    }
  };

  // Bersihkan data transaksi & pendaftaran yang belum bayar (> 65 menit)
  const handleCleanupUnpaid = async () => {
    const confirmed = window.confirm(
      'Apakah Anda yakin ingin membersihkan data transaksi & pendaftaran yang BELUM DIBAYAR dan sudah LEBIH DARI 1 jam 5 menit (65 menit)?\n\n' +
      'Catatan: Peserta yang sudah lunas (PAID) dan peserta yang baru mendaftar (< 65 menit) TIDAK AKAN dihapus.'
    );
    if (!confirmed) return;

    setIsCleaningUp(true);
    try {
      const res = await fetch('/api/cron/cleanup-unpaid?source=admin', {
        method: 'POST',
      });
      const result = await res.json();

      if (result.success) {
        alert(
          `Pembersihan Selesai!\n` +
          `Dihapus: ${result.deleted.payments_count} transaksi pembayaran & ${result.deleted.registrations_count} pendaftaran kadaluarsa (> 65 menit).\n` +
          (result.deleted.registrations_count === 0 ? '\n(Catatan: Belum ada data belum bayar yang usianya melebihi 65 menit.)' : '')
        );
        await fetchData();
      } else {
        alert(result.error || 'Gagal membersihkan data.');
      }
    } catch (err: any) {
      alert(`Terjadi kesalahan: ${err.message || 'Gagal memanggil API pembersihan.'}`);
    } finally {
      setIsCleaningUp(false);
    }
  };

  return {
    data,
    loading,
    isRefreshing,
    isCleaningUp,
    isDeleting,
    updatingId,
    fetchData,
    handleUpdateStatus,
    handleSaveHasilLari,
    handleDeleteRow,
    handleCleanupUnpaid,
  };
}
