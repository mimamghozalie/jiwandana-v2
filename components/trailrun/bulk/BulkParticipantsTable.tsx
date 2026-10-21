import React from 'react';
import { Users, RefreshCw, AlertTriangle, CheckCircle2, Trash2 } from 'lucide-react';
import { BulkParticipant, RouteCalculations } from './types';

interface BulkParticipantsTableProps {
  participants: BulkParticipant[];
  validCount: number;
  invalidCount: number;
  regeneratingBibs: boolean;
  routeCalculations: RouteCalculations;
  onRegenerateBibs: () => void;
  onRemoveParticipant: (index: number) => void;
}

export function BulkParticipantsTable({
  participants,
  validCount,
  invalidCount,
  regeneratingBibs,
  routeCalculations,
  onRegenerateBibs,
  onRemoveParticipant,
}: BulkParticipantsTableProps) {
  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(val);

  return (
    <div className="bg-white border border-black/10 rounded-2xl p-6 sm:p-7 shadow-xs space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-black/5">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-[#C9A227]" />
          <h4 className="text-sm font-bold uppercase tracking-wider text-slate-900">
            Pratinjau Data Peserta ({participants.length} Orang)
          </h4>
          {regeneratingBibs && (
            <span className="text-xs text-amber-600 font-semibold flex items-center gap-1 animate-pulse">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              Memvalidasi BIB...
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 text-xs flex-wrap">
          <button
            type="button"
            onClick={onRegenerateBibs}
            disabled={regeneratingBibs}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#C9A227]/40 bg-[#C9A227]/10 hover:bg-[#C9A227]/20 text-[#0d1c32] font-bold text-xs transition-all cursor-pointer disabled:opacity-50"
            title="Generate ulang nomor BIB urut unik untuk seluruh peserta"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${regeneratingBibs ? 'animate-spin' : ''}`} />
            <span>Generate Ulang BIB</span>
          </button>

          <span
            className={`px-2.5 py-1 rounded-full border font-bold ${
              validCount >= 5 && validCount <= 20
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-amber-50 text-amber-700 border-amber-200'
            }`}
          >
            {validCount >= 5 && validCount <= 20
              ? `✓ ${validCount} Peserta Valid (Siap Checkout)`
              : validCount > 20
                ? `⚠ ${validCount} Peserta (Maks. 20)`
                : `⚠ ${validCount}/5 Peserta (Min. 5)`}
          </span>
          {invalidCount > 0 && (
            <span className="px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200 font-bold">
              ⚠ {invalidCount} Perlu Perbaikan
            </span>
          )}
        </div>
      </div>

      {/* Warning jika kurang dari 5 */}
      {validCount < 5 && (
        <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
          <span>
            Pendaftaran kolektif membutuhkan minimal <strong>5 orang peserta valid</strong>. Saat ini baru terdapat <strong>{validCount} peserta valid</strong>. Silakan tambahkan minimal {5 - validCount} peserta lagi pada file Excel Anda.
          </span>
        </div>
      )}

      {/* Warning jika lebih dari 20 */}
      {validCount > 20 && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>
            Pendaftaran kolektif dibatasi <strong>maksimal 20 orang peserta per transaksi</strong> (saat ini {validCount} peserta). Silakan hapus {validCount - 20} peserta atau bagi menjadi transaksi terpisah.
          </span>
        </div>
      )}

      {/* Banner Interaktif Promo Kelipatan 10 Peserta */}
      {routeCalculations.isPromoActive ? (
        <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-500/10 via-amber-500/10 to-emerald-500/10 border border-emerald-500/30 text-xs flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
            🎉
          </div>
          <div className="flex-1">
            <strong className="text-emerald-800 font-bold block text-sm">
              Selamat! Promo Spesial {routeCalculations.discountMultiplier * 10} Peserta Aktif
            </strong>
            <span className="text-slate-600">
              Rombongan Anda berjumlah {validCount} orang. Otomatis mendapatkan potongan diskon {routeCalculations.discountMultiplier}x Rp 320.000 senilai{' '}
              <strong>{formatCurrency(routeCalculations.discountAmount)}</strong>!
            </span>
          </div>
          <span className="px-3 py-1 rounded-full bg-emerald-600 text-white font-mono font-bold text-xs shrink-0">
            -{formatCurrency(routeCalculations.discountAmount)}
          </span>
        </div>
      ) : validCount >= 7 && validCount < 10 ? (
        <div className="p-3.5 rounded-xl bg-amber-50 border border-[#C9A227]/40 text-xs flex items-center gap-2.5">
          <span className="text-lg shrink-0">💡</span>
          <span className="text-slate-700">
            <strong>Tinggal {10 - validCount} peserta lagi!</strong> Lengkapi rombongan menjadi 10 orang untuk otomatis mendapatkan <strong>potongan diskon Rp 320.000</strong>.
          </span>
        </div>
      ) : validCount >= 17 && validCount < 20 ? (
        <div className="p-3.5 rounded-xl bg-amber-50 border border-[#C9A227]/40 text-xs flex items-center gap-2.5">
          <span className="text-lg shrink-0">💡</span>
          <span className="text-slate-700">
            <strong>Tinggal {20 - validCount} peserta lagi!</strong> Lengkapi rombongan menjadi 20 orang untuk mendapatkan <strong>potongan diskon 2x Rp 320.000 = Rp 640.000</strong>!
          </span>
        </div>
      ) : null}

      {/* Category Breakdown & Calculated Route Pricing Cards (Hanya 7K & 12K) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* 7K Card */}
        <div className="p-4 rounded-xl bg-slate-50 border border-black/10 flex flex-col justify-between gap-2 shadow-2xs">
          <div className="flex items-center justify-between">
            <div>
              <span className="font-bold text-slate-900 text-sm block">7K Junior Pawitra</span>
              <span className="text-[10px] text-slate-500">Tarif Pre-Sale Terkunci Kelompok</span>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#C9A227]/15 text-[#C9A227] border border-[#C9A227]/30">
              {routeCalculations.tierName7k}
            </span>
          </div>
          <div className="flex items-baseline justify-between pt-2 border-t border-black/5">
            <span className="text-xs text-slate-500">
              {routeCalculations.count7k} Peserta × {formatCurrency(routeCalculations.unitPrice7k)}
            </span>
            <strong className="text-base font-mono text-slate-900">
              {formatCurrency(routeCalculations.subtotal7k)}
            </strong>
          </div>
        </div>

        {/* 12K Card */}
        <div className="p-4 rounded-xl bg-slate-50 border border-black/10 flex flex-col justify-between gap-2 shadow-2xs">
          <div className="flex items-center justify-between">
            <div>
              <span className="font-bold text-slate-900 text-sm block">12K Senior Pawitra</span>
              <span className="text-[10px] text-slate-500">Tarif Pre-Sale Terkunci Kelompok</span>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#C9A227]/15 text-[#C9A227] border border-[#C9A227]/30">
              {routeCalculations.tierName12k}
            </span>
          </div>
          <div className="flex items-baseline justify-between pt-2 border-t border-black/5">
            <span className="text-xs text-slate-500">
              {routeCalculations.count12k} Peserta × {formatCurrency(routeCalculations.unitPrice12k)}
            </span>
            <strong className="text-base font-mono text-slate-900">
              {formatCurrency(routeCalculations.subtotal12k)}
            </strong>
          </div>
        </div>
      </div>

      {/* Scrollable Table */}
      <div className="border border-black/10 rounded-xl overflow-x-auto max-h-[380px] overflow-y-auto">
        <table className="w-full text-left text-xs text-slate-800 border-collapse">
          <thead className="bg-[#f8f8f8] sticky top-0 z-10 text-[11px] uppercase tracking-wider text-slate-600 border-b border-black/10">
            <tr>
              <th className="py-2.5 px-3 font-bold">No</th>
              <th className="py-2.5 px-3 font-bold whitespace-nowrap">Nama Lengkap</th>
              <th className="py-2.5 px-3 font-bold whitespace-nowrap min-w-[120px]">No. BIB</th>
              <th className="py-2.5 px-3 font-bold whitespace-nowrap">Kategori &amp; Biaya</th>
              <th className="py-2.5 px-3 font-bold">Email</th>
              <th className="py-2.5 px-3 font-bold">WhatsApp</th>
              <th className="py-2.5 px-3 font-bold whitespace-nowrap">Kota / Prov</th>
              <th className="py-2.5 px-3 font-bold">Status</th>
              <th className="py-2.5 px-3 font-bold text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/5">
            {participants.map((p, idx) => (
              <tr
                key={idx}
                className={`transition-colors ${
                  p.isValid ? 'hover:bg-slate-50' : 'bg-rose-50/60 hover:bg-rose-50'
                }`}
              >
                <td className="py-2.5 px-3 font-mono font-medium">{idx + 1}</td>
                <td className="py-2.5 px-3 font-semibold text-slate-900">{p.nama || '—'}</td>
                <td className="py-2.5 px-3 whitespace-nowrap">
                  {p.no_bib ? (
                    <div className="inline-flex items-center gap-1.5 whitespace-nowrap">
                      <span className="font-mono font-bold text-slate-900 bg-slate-100 border border-black/10 px-2.5 py-0.5 rounded text-xs whitespace-nowrap tracking-wide">
                        {p.no_bib}
                      </span>
                      <span
                        className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-700 font-semibold border border-emerald-500/20 whitespace-nowrap"
                        title="Nomor BIB unik diatur otomatis oleh sistem berdasarkan jenis kelamin (F-/M-)"
                      >
                        Auto
                      </span>
                    </div>
                  ) : (
                    <span className="text-slate-400 italic text-[11px]">—</span>
                  )}
                </td>
                <td className="py-2.5 px-3">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-bold text-[#C9A227]">{p.kategori.toUpperCase()}</span>
                    {p.isValid ? (
                      <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-mono">
                        {formatCurrency(routeCalculations.participantPriceMap[idx]?.amount || 0)}
                      </span>
                    ) : null}
                  </div>
                </td>
                <td className="py-2.5 px-3 text-slate-600">{p.email || '—'}</td>
                <td className="py-2.5 px-3 text-slate-600">{p.no_hp || '—'}</td>
                <td className="py-2.5 px-3 text-slate-600">
                  {p.kota ? `${p.kota}, ${p.provinsi}` : '—'}
                </td>
                <td className="py-2.5 px-3">
                  {p.isValid ? (
                    <span className="inline-flex items-center gap-1 text-emerald-600 text-[10px] font-bold">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Valid
                    </span>
                  ) : (
                    <span
                      className="inline-flex items-center gap-1 text-rose-600 text-[10px] font-bold"
                      title={p.errors?.join(', ')}
                    >
                      <AlertTriangle className="w-3.5 h-3.5" />
                      {p.errors?.[0] || 'Invalid'}
                    </span>
                  )}
                </td>
                <td className="py-2.5 px-3 text-center">
                  <button
                    type="button"
                    onClick={() => onRemoveParticipant(idx)}
                    className="p-1 rounded text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                    title="Hapus baris"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
