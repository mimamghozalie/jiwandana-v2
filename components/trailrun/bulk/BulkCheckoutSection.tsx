import React from 'react';
import { CreditCard, Calculator, AlertTriangle, RefreshCw } from 'lucide-react';
import { RouteCalculations } from './types';

interface BulkCheckoutSectionProps {
  paymentMethod: string;
  setPaymentMethod: (method: string) => void;
  routeCalculations: RouteCalculations;
  validCount: number;
  invalidCount: number;
  submitting: boolean;
  submitError: string;
  onSubmit: () => void;
}

const PAYMENT_METHODS = [
  { id: 'qris', label: 'QRIS', desc: 'Gopay, OVO, Dana, ShopeePay, BCA, dll' },
  { id: 'bri_va', label: 'BRI Virtual Account (BRIVA)', desc: 'Transfer instan via BRImo / ATM BRI' },
  { id: 'bni_va', label: 'BNI Virtual Account', desc: 'Transfer instan via BNI Mobile / ATM' },
  { id: 'mandiri_va', label: 'Mandiri Virtual Account', desc: 'Transfer instan via Livin / ATM Mandiri' },
  { id: 'permata_va', label: 'Permata Virtual Account', desc: 'Transfer via Permata / Bank Lain' },
];

export function BulkCheckoutSection({
  paymentMethod,
  setPaymentMethod,
  routeCalculations,
  validCount,
  invalidCount,
  submitting,
  submitError,
  onSubmit,
}: BulkCheckoutSectionProps) {
  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(val);

  return (
    <div className="bg-white border border-black/10 rounded-2xl p-6 sm:p-7 shadow-xs space-y-6">
      <div className="flex items-center gap-2.5 pb-3 border-b border-black/5">
        <CreditCard className="w-5 h-5 text-[#C9A227]" />
        <h4 className="text-sm font-bold uppercase tracking-wider text-slate-900">
          Metode Pembayaran Kolektif
        </h4>
      </div>

      {/* Payment Methods Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {PAYMENT_METHODS.map((pm) => (
          <button
            key={pm.id}
            type="button"
            onClick={() => setPaymentMethod(pm.id)}
            className={`p-3.5 rounded-xl border-2 text-left transition-all flex items-center gap-3 cursor-pointer ${
              paymentMethod === pm.id
                ? 'border-[#C9A227] bg-[#C9A227]/5 shadow-xs'
                : 'border-black/10 bg-white hover:border-[#C9A227]/40'
            }`}
          >
            <div
              className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                paymentMethod === pm.id ? 'border-[#C9A227] bg-[#C9A227]' : 'border-slate-300'
              }`}
            >
              {paymentMethod === pm.id && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
            </div>
            <div>
              <h5 className={`text-xs font-bold ${paymentMethod === pm.id ? 'text-[#C9A227]' : 'text-slate-800'}`}>
                {pm.label}
              </h5>
              <span className="text-[10px] text-slate-400 block">{pm.desc}</span>
            </div>
          </button>
        ))}
      </div>

      {/* Itemized Route Cost Breakdown */}
      <div className="bg-[#f8f8f8] rounded-2xl border border-black/10 p-5 sm:p-6 space-y-4 text-xs text-slate-800 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-black/10">
          <div className="flex items-center gap-2">
            <Calculator className="w-4 h-4 text-[#C9A227]" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Rincian Biaya Rute &amp; Total Tagihan (Skema B)
            </span>
          </div>
          <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-bold">
            {validCount} Peserta Valid
          </span>
        </div>

        <div className="space-y-2.5">
          {/* 7K Route Row */}
          {routeCalculations.count7k > 0 && (
            <div className="flex justify-between items-center py-1.5 border-b border-black/5">
              <div>
                <span className="font-bold text-slate-900 text-xs">Rute 7K Junior Pawitra</span>
                <span className="text-[11px] text-slate-500 block">
                  {routeCalculations.count7k} Peserta × {formatCurrency(routeCalculations.unitPrice7k)} ({routeCalculations.tierName7k})
                </span>
              </div>
              <strong className="text-slate-900 font-mono text-sm">
                {formatCurrency(routeCalculations.subtotal7k)}
              </strong>
            </div>
          )}

          {/* 12K Route Row */}
          {routeCalculations.count12k > 0 && (
            <div className="flex justify-between items-center py-1.5 border-b border-black/5">
              <div>
                <span className="font-bold text-slate-900 text-xs">Rute 12K Senior Pawitra</span>
                <span className="text-[11px] text-slate-500 block">
                  {routeCalculations.count12k} Peserta × {formatCurrency(routeCalculations.unitPrice12k)} ({routeCalculations.tierName12k})
                </span>
              </div>
              <strong className="text-slate-900 font-mono text-sm">
                {formatCurrency(routeCalculations.subtotal12k)}
              </strong>
            </div>
          )}

          {/* Subtotal Tiket Awal */}
          <div className="flex justify-between items-center pt-1 text-slate-600">
            <span>Subtotal Tiket ({validCount} Peserta)</span>
            <strong className="text-slate-900 font-mono text-xs">
              {formatCurrency(routeCalculations.rawSubtotalTickets)}
            </strong>
          </div>

          {/* Diskon Promo Kelipatan 10 Peserta jika ada */}
          {routeCalculations.isPromoActive && (
            <>
              <div className="flex justify-between items-center py-1 px-2.5 rounded-lg bg-emerald-50 text-emerald-700 font-semibold text-xs border border-emerald-200">
                <span>
                  Promo Spesial {routeCalculations.discountMultiplier * 10} Peserta ({routeCalculations.discountMultiplier}x Rp 320.000)
                </span>
                <strong className="font-mono">
                  -{formatCurrency(routeCalculations.discountAmount)}
                </strong>
              </div>

              {/* Subtotal Tiket Setelah Diskon */}
              <div className="flex justify-between items-center py-1 text-slate-700 font-semibold border-b border-black/5">
                <span>Subtotal Tiket Setelah Diskon</span>
                <strong className="text-emerald-700 font-mono text-xs">
                  {formatCurrency(routeCalculations.subtotalTickets)}
                </strong>
              </div>
            </>
          )}

          {/* Biaya Layanan (Admin + Biaya Transaksi QRIS) */}
          <div className="flex justify-between items-center text-slate-600">
            <div>
              <span className="block text-slate-700 font-medium">Biaya Layanan</span>
              <span className="text-[10px] text-slate-400">
                Termasuk biaya admin ({validCount} peserta) dan pemrosesan QRIS
              </span>
            </div>
            <strong className="text-slate-900 font-mono text-xs">
              +{formatCurrency(routeCalculations.totalServiceFee)}
            </strong>
          </div>
        </div>

        {/* Grand Total */}
        <div className="pt-3 border-t-2 border-black/10 flex justify-between items-center">
          <div>
            <span className="text-xs text-slate-600 uppercase font-bold tracking-wider block">
              Total Tagihan Pembayaran
            </span>
            <span className="text-[10px] text-slate-400">
              Tarif tiket Pre-Sale tetap + Biaya Layanan
            </span>
          </div>
          <span className="text-2xl font-bold text-[#C9A227] font-mono">
            {formatCurrency(routeCalculations.grandTotal)}
          </span>
        </div>
      </div>

      {submitError && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0 text-rose-500" />
          <span>{submitError}</span>
        </div>
      )}

      {validCount < 5 && (
        <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
          <span>
            Jumlah peserta belum mencapai batas minimal pendaftaran kolektif (<strong>{validCount}/5 peserta valid</strong>).
          </span>
        </div>
      )}

      {validCount > 20 && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>
            Jumlah peserta melebihi batas maksimal pendaftaran kolektif (<strong>{validCount}/20 peserta valid</strong>).
          </span>
        </div>
      )}

      {/* Submit Button */}
      <button
        type="button"
        onClick={onSubmit}
        disabled={submitting || validCount < 5 || validCount > 20 || invalidCount > 0}
        className="w-full py-4 px-6 bg-[#C9A227] hover:bg-[#b08d20] disabled:opacity-50 text-[#0d1c32] font-bold text-sm uppercase tracking-wider rounded-xl transition-all transform active:scale-95 shadow-md flex items-center justify-center gap-2 cursor-pointer"
      >
        {submitting ? (
          <>
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span>Memproses Invoice Kolektif...</span>
          </>
        ) : validCount < 5 ? (
          <>
            <span>Minimal 5 Peserta ({validCount}/5 Valid)</span>
          </>
        ) : validCount > 20 ? (
          <>
            <span>Maksimal 20 Peserta ({validCount}/20 Valid)</span>
          </>
        ) : (
          <>
            <span>Proses Pembayaran Kolektif • {formatCurrency(routeCalculations.grandTotal)}</span>
            <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </>
        )}
      </button>
    </div>
  );
}
