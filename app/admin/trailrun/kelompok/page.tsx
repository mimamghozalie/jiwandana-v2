'use client';

import React, { useState, useMemo } from 'react';
import { Users, FileSpreadsheet } from 'lucide-react';

import {
  TrailrunRow,
  useTrailrunData,
  exportKelompokToExcel,
  TrailrunDetailModal,
  EditHasilLariModal,
  TrailrunSubNav,
  KelompokBatchTable,
} from '@/components/admin/trailrun';
import { GroupRegistrationBatch } from '@/components/admin/trailrun/trailrunExport';

export default function PesertaKelompokPage() {
  const {
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
  } = useTrailrunData();

  // Selected row for detail modal
  const [selectedRow, setSelectedRow] = useState<TrailrunRow | null>(null);

  // Hasil Lari edit modal
  const [editingHasilLariRow, setEditingHasilLariRow] = useState<TrailrunRow | null>(null);
  const [isSavingHasilLari, setIsSavingHasilLari] = useState(false);

  // Pisahkan data transaksi kelompok per batch / per pendaftaran PIC
  const { batches, individuCount, totalKelompokPeserta } = useMemo(() => {
    let individuTotal = 0;
    const orderBatchMap: Record<string, TrailrunRow[]> = {};
    const communityBatchMap: Record<string, TrailrunRow[]> = {};

    data.forEach((r) => {
      // Kelompok jika registration_type === 'bulk', ada data PIC, atau berelasi dengan order TR-BULK
      const isKelompok = Boolean(
        r.registration_type === 'bulk' ||
        (r.pic_name && r.pic_name.trim() !== '') ||
        (r.pic_phone && r.pic_phone.trim() !== '') ||
        (r.payment?.pic_name && r.payment.pic_name.trim() !== '') ||
        (r.payment?.pic_phone && r.payment.pic_phone.trim() !== '') ||
        (r.payment?.order_id && r.payment.order_id.startsWith('TR-BULK'))
      );

      if (!isKelompok) {
        individuTotal += 1;
        return;
      }

      // Group per Order ID Transaksi (Setiap pendaftaran PIC mendapatkan Order ID terpisah)
      let resolvedOrderId = r.order_id || r.payment?.order_id || r.payment?.txn_id;

      // Jika peserta ini belum memiliki orderId langsung, tautkan ke transaksi kelompok yang dibuat pada rentang waktu yang sama (batch yang sama)
      if (!resolvedOrderId) {
        const existingOrderKeys = Object.keys(orderBatchMap);
        const matched = existingOrderKeys.find((k) => {
          const firstInBatch = orderBatchMap[k][0];
          if (!firstInBatch) return false;
          const timeDiff = Math.abs(
            new Date(r.created_at).getTime() - new Date(firstInBatch.created_at).getTime()
          );
          return timeDiff < 180000; // Selisih di bawah 3 menit adalah 1 rombongan pendaftaran yang sama
        });
        if (matched) {
          resolvedOrderId = matched;
        }
      }

      if (resolvedOrderId) {
        if (!orderBatchMap[resolvedOrderId]) {
          orderBatchMap[resolvedOrderId] = [];
        }
        orderBatchMap[resolvedOrderId].push(r);
      } else {
        const picIdentifier = r.pic_name || r.payment?.pic_name || r.nama_komunitas || 'PIC Rombongan';
        const cKey = `BATCH-${picIdentifier.trim()}`;
        if (!communityBatchMap[cKey]) {
          communityBatchMap[cKey] = [];
        }
        communityBatchMap[cKey].push(r);
      }
    });

    // Jika communityBatchMap dan orderBatchMap ternyata memiliki peserta dengan komunitas/PIC yang sama, satukan ke orderBatchMap
    Object.entries(communityBatchMap).forEach(([cKey, communityParticipants]) => {
      const targetOrderId = Object.keys(orderBatchMap)[0];
      if (targetOrderId && Object.keys(orderBatchMap).length === 1) {
        // Jika hanya ada 1 orderId kelompok di sistem, satukan langsung
        orderBatchMap[targetOrderId].push(...communityParticipants);
      } else {
        orderBatchMap[cKey] = communityParticipants;
      }
    });

    const allBatchEntries = Object.entries(orderBatchMap);

    let kelompokPesertaTotal = 0;
    const resultBatches: GroupRegistrationBatch[] = [];

    allBatchEntries.forEach(([orderIdKey, participants]) => {
      const count = participants.length;
      kelompokPesertaTotal += count;

      const first = participants[0];
      const paidCount = participants.filter((p) => p.status === 'paid').length;
      const pendingCount = count - paidCount;
      const isFullyPaid = paidCount > 0 && paidCount === count;

      // Logika Diskon Promo 10 Orang per Pendaftaran Rombongan:
      // Setiap kelipatan 10 orang mendapatkan diskon Rp 320.000
      const hasDiscount = count >= 10;
      const discountMultiplier = Math.floor(count / 10);
      const discountAmount = hasDiscount ? discountMultiplier * 320000 : 0;

      // Hitung subtotal harga normal tiket
      let rawTicketTotal = 0;
      participants.forEach((p) => {
        const is12k = (p.kategori || '').toLowerCase().includes('12');
        rawTicketTotal += is12k ? 320000 : 270000;
      });

      const finalTicketTotal = Math.max(0, rawTicketTotal - discountAmount);
      const adminFeeTotal = count * 3000; // Rp 3.000 / orang
      const calculatedTotalPayment = finalTicketTotal + adminFeeTotal;

      resultBatches.push({
        orderId: first.payment?.order_id || orderIdKey,
        namaKomunitas: first.nama_komunitas || 'Komunitas Lari',
        picName: first.pic_name || first.payment?.pic_name || first.nama,
        picPhone: first.pic_phone || first.payment?.pic_phone || first.no_hp,
        picEmail: first.pic_email || first.payment?.pic_email || first.email,
        totalParticipants: count,
        paidParticipants: paidCount,
        pendingParticipants: pendingCount,
        isFullyPaid,
        rawTicketTotal,
        discountAmount,
        hasDiscount,
        finalTicketTotal,
        adminFeeTotal,
        totalPayment: first.payment?.total_payment || calculatedTotalPayment,
        paymentMethod: first.payment?.payment_method?.toUpperCase() || 'QRIS',
        paymentStatus: isFullyPaid ? 'paid' : 'pending',
        participants,
        createdAt: first.created_at,
      });
    });

    // Urutkan transaksi kelompok dari yang terbaru
    resultBatches.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return {
      batches: resultBatches,
      individuCount: individuTotal,
      totalKelompokPeserta: kelompokPesertaTotal,
    };
  }, [data]);

  const onSaveHasil = async (id: string, hasil: string) => {
    setIsSavingHasilLari(true);
    try {
      await handleSaveHasilLari(id, hasil);
      if (selectedRow?.id === id) {
        setSelectedRow((prev) => (prev ? { ...prev, hasil_lari: hasil } : null));
      }
      setEditingHasilLariRow(null);
    } finally {
      setIsSavingHasilLari(false);
    }
  };

  // Batalkan transaksi kelompok & hapus peserta terkait
  const handleCancelBatch = async (
    orderId: string,
    groupName: string,
    participantCount: number,
    registrationIds?: string[],
    picPhone?: string
  ) => {
    const confirmed = window.confirm(
      `Apakah Anda yakin ingin membatalkan transaksi "${orderId}"?\n\n` +
      `Komunitas: ${groupName}\n` +
      `Jumlah Peserta: ${participantCount} orang\n\n` +
      `Semua data peserta yang didaftarkan pada transaksi ini akan dihapus dari sistem.`
    );
    if (!confirmed) return;

    try {
      const res = await fetch('/api/payment/cancel-bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order_id: orderId,
          registration_ids: registrationIds || [],
          pic_phone: picPhone || null,
        }),
      });
      const result = await res.json();
      if (!res.ok || !result.success) {
        throw new Error(result.message || 'Gagal membatalkan transaksi kelompok.');
      }

      alert(result.message || 'Transaksi berhasil dibatalkan.');
      await fetchData();
    } catch (err: any) {
      alert(`Terjadi kesalahan: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Bar */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-400">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                Peserta Kelompok & Penanggung Jawab (PIC)
              </h1>
              <p className="text-xs sm:text-sm text-slate-400">
                Data pendaftaran rombongan dikelompokkan per transaksi pendaftaran PIC. Setiap order tercatat mandiri lengkap dengan status diskon promo.
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 self-start md:self-auto flex-wrap">
          <button
            type="button"
            onClick={() => exportKelompokToExcel(batches)}
            disabled={batches.length === 0}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md transition-all cursor-pointer border border-emerald-500/30 disabled:opacity-50"
            title="Download file Excel (.xlsx)"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-100" />
            <span>Export Rekap (.xlsx)</span>
          </button>
        </div>
      </div>

      {/* 2. Sub-Navigation Tabs */}
      <TrailrunSubNav
        individuCount={individuCount}
        kelompokBatchCount={batches.length}
        totalKelompokPeserta={totalKelompokPeserta}
        onRefresh={fetchData}
        isRefreshing={isRefreshing}
        onCleanup={handleCleanupUnpaid}
        isCleaningUp={isCleaningUp}
      />

      {/* 3. Tabel Transaksi Pendaftaran Kelompok */}
      <KelompokBatchTable
        batches={batches}
        loading={loading}
        onSelectParticipant={(row) => setSelectedRow(row)}
        onCancelBatch={handleCancelBatch}
      />

      {/* 4. Detail Modal */}
      <TrailrunDetailModal
        selectedRow={selectedRow}
        onClose={() => setSelectedRow(null)}
        onUpdateStatus={handleUpdateStatus}
        updatingId={updatingId}
        onDeleteRow={handleDeleteRow}
        isDeleting={isDeleting}
        onEditHasilLari={(row) => setEditingHasilLariRow(row)}
      />

      {/* 5. Edit Hasil Lari Modal */}
      <EditHasilLariModal
        isOpen={Boolean(editingHasilLariRow)}
        participant={editingHasilLariRow}
        onClose={() => setEditingHasilLariRow(null)}
        onSave={onSaveHasil}
        isSaving={isSavingHasilLari}
      />
    </div>
  );
}
