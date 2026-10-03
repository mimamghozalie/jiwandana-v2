'use client';

import React from 'react';
import { TrailrunCard } from '@/lib/types';
import { PaymentData, PAYMENT_METHODS } from './types';

interface StepPembayaranProps {
  selectedCategory?: TrailrunCard;
  pricingInfoMap: Record<string, any>;
  paymentMethod: string;
  onSelectPaymentMethod: (id: string) => void;
  paymentData: PaymentData | null;
  paymentStatus: 'idle' | 'pending' | 'completed' | 'error';
  checkingStatus: boolean;
  onCheckPaymentStatus: (isManual?: boolean) => void;
  onChangePaymentMethod: () => void;
  onBack?: () => void;
  formatCurrency: (amount: number) => string;
  formatExpiry: (dateStr?: string | null) => string;
}

export default function StepPembayaran({
  selectedCategory,
  pricingInfoMap,
  paymentMethod,
  onSelectPaymentMethod,
  paymentData,
  paymentStatus,
  checkingStatus,
  onCheckPaymentStatus,
  onChangePaymentMethod,
  onBack,
  formatCurrency,
  formatExpiry,
}: StepPembayaranProps) {
  return (
    <div className="p-6 sm:p-8 space-y-5 animate-[fadeIn_0.4s_ease-out]">
      <div className="flex items-center justify-between pb-4 border-b border-black/5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#C9A227]/10 border border-[#C9A227]/30 flex items-center justify-center text-[#C9A227]">
            <span className="material-symbols-outlined text-lg">payments</span>
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 font-serif">Pembayaran</h2>
            <p className="text-[11px] text-slate-500">
              {paymentData ? 'Selesaikan pembayaran transaksi Anda' : 'Pilih metode pembayaran dan selesaikan transaksi'}
            </p>
          </div>
        </div>

        {onBack && paymentStatus !== 'completed' && (
          <button
            type="button"
            onClick={onBack}
            className="px-3.5 py-1.5 rounded-xl border border-black/10 hover:border-[#C9A227] bg-white text-slate-700 hover:text-[#C9A227] text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
            title="Kembali ke langkah sebelumnya"
          >
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            <span>Kembali</span>
          </button>
        )}
      </div>

      {/* Before payment created — show method selector */}
      {!paymentData && (
        <>
          {/* Order Summary */}
          {selectedCategory && (
            <div className="bg-[#f8f8f8] rounded-xl border border-black/10 p-4 sm:p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg overflow-hidden border border-black/10 bg-slate-100">
                    <img
                      src={selectedCategory.bannerImage}
                      alt={selectedCategory.categoryName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{selectedCategory.categoryName}</h4>
                    <p className="text-[11px] text-slate-500">
                      {selectedCategory.distance} • {selectedCategory.elevationGain}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block">
                    Estimasi Total
                  </span>
                  <span className="text-lg font-bold text-[#C9A227]">
                    {(pricingInfoMap[selectedCategory.id.toLowerCase()] || pricingInfoMap[selectedCategory.id])?.amount
                      ? formatCurrency(
                          (pricingInfoMap[selectedCategory.id.toLowerCase()] || pricingInfoMap[selectedCategory.id]).amount + 5000
                        )
                      : selectedCategory.prices.early}
                  </span>
                  <span className="text-[9px] text-slate-500 block font-medium">+ Biaya Admin Rp 5.000</span>
                </div>
              </div>
            </div>
          )}

          {/* Payment Method Selector */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider block">
              Metode Pembayaran
            </span>
            <div className="space-y-2">
              {PAYMENT_METHODS.map((pm) => (
                <button
                  key={pm.id}
                  type="button"
                  onClick={() => onSelectPaymentMethod(pm.id)}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer flex items-center gap-3 ${
                    paymentMethod === pm.id ? 'border-[#C9A227] bg-[#C9A227]/5' : 'border-black/10 hover:border-[#C9A227]/40'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                      paymentMethod === pm.id ? 'border-[#C9A227] bg-[#C9A227]' : 'border-slate-300'
                    }`}
                  >
                    {paymentMethod === pm.id && <div className="w-2 h-2 rounded-full bg-white" />}
                  </div>
                  <div className="w-9 h-9 rounded-lg bg-slate-100 border border-black/5 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-slate-600 text-lg">{pm.icon}</span>
                  </div>
                  <div>
                    <h4 className={`text-sm font-bold ${paymentMethod === pm.id ? 'text-[#C9A227]' : 'text-slate-800'}`}>
                      {pm.label}
                    </h4>
                    <p className="text-[11px] text-slate-500">{pm.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {/* After payment created — show payment details */}
      {paymentData && (
        <div className="space-y-5">
          {/* Status Badge */}
          <div
            className={`p-4 rounded-xl border flex items-center gap-3 ${
              paymentStatus === 'completed' ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'
            }`}
          >
            <span
              className={`material-symbols-outlined text-xl ${
                paymentStatus === 'completed' ? 'text-emerald-500' : 'text-amber-500 animate-pulse'
              }`}
            >
              {paymentStatus === 'completed' ? 'check_circle' : 'hourglass_top'}
            </span>
            <div>
              <h4
                className={`text-sm font-bold ${
                  paymentStatus === 'completed' ? 'text-emerald-700' : 'text-amber-700'
                }`}
              >
                {paymentStatus === 'completed' ? 'Pembayaran Berhasil!' : 'Menunggu Pembayaran'}
              </h4>
              <p className="text-[11px] text-slate-500">
                {paymentStatus === 'completed'
                  ? 'Transaksi Anda telah dikonfirmasi. Informasi lengkap dikirimkan ke WhatsApp.'
                  : `Berlaku hingga: ${formatExpiry(paymentData.expired_at)}`}
              </p>
            </div>
          </div>

          {/* Payment Info - Light Theme */}
          <div className="bg-[#f8f8f8] rounded-2xl border border-black/10 p-5 sm:p-6 space-y-4 text-slate-800 shadow-xs">
            <div className="grid grid-cols-2 gap-3 sm:gap-4 text-xs">
              <PaymentSummaryRow label="Order ID" value={paymentData.order_id} />
              <PaymentSummaryRow
                label="Metode"
                value={paymentData.payment_method.toUpperCase().replace('_', ' ')}
              />
              <PaymentSummaryRow label="Subtotal" value={formatCurrency(paymentData.amount)} />
              <PaymentSummaryRow label="Biaya Admin" value={formatCurrency(paymentData.fee)} />
            </div>
            <div className="pt-3 border-t border-black/10 flex justify-between items-center">
              <span className="text-xs text-slate-600 uppercase font-bold tracking-wider">Total Bayar</span>
              <span className="text-xl sm:text-2xl font-bold text-[#C9A227]">
                {formatCurrency(paymentData.total_payment)}
              </span>
            </div>
          </div>

          {/* QR Code / VA Number / Payment Link */}
          {paymentData.va_number && (
            <div className="bg-[#f8f8f8] rounded-xl border border-black/10 p-5 text-center space-y-2">
              <span className="text-xs text-slate-500 uppercase font-semibold">Nomor Virtual Account</span>
              <div className="text-2xl sm:text-3xl font-mono font-bold text-slate-900 tracking-wider select-all">
                {paymentData.va_number}
              </div>
              <p className="text-[11px] text-slate-400">
                Salin nomor di atas dan transfer melalui ATM, Mobile Banking, atau Internet Banking.
              </p>
            </div>
          )}

          {paymentData.qr_string && (
            <div className="bg-[#f8f8f8] rounded-xl border border-black/10 p-5 text-center space-y-3">
              <span className="text-xs text-slate-500 uppercase font-semibold">Scan QRIS</span>
              <div className="mx-auto w-52 h-52 bg-white rounded-xl border border-black/10 flex items-center justify-center p-2 shadow-sm">
                <img
                  src={
                    paymentData.qr_string.startsWith('http') || paymentData.qr_string.startsWith('data:image')
                      ? paymentData.qr_string
                      : `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(
                          paymentData.qr_string
                        )}`
                  }
                  alt="QRIS Code"
                  className="w-full h-full object-contain rounded"
                />
              </div>
              <p className="text-[11px] text-slate-500 font-medium">
                Buka aplikasi e-wallet (GoPay, OVO, DANA, ShopeePay, BCA, dll) dan scan QR Code di atas.
              </p>
            </div>
          )}

          {paymentData.payment_link && (
            <a
              href={paymentData.payment_link}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full p-4 bg-[#C9A227] hover:bg-[#b08d20] text-[#0d1c32] rounded-xl font-semibold text-sm uppercase tracking-wider text-center shadow-md transition-all"
            >
              Bayar via Payment Link →
            </a>
          )}

          {/* Action buttons inside paymentData */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              type="button"
              onClick={() => onCheckPaymentStatus(true)}
              disabled={checkingStatus}
              className="flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl font-semibold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
            >
              <span className={`material-symbols-outlined text-sm ${checkingStatus ? 'animate-spin' : ''}`}>
                {checkingStatus ? 'progress_activity' : 'refresh'}
              </span>
              <span>{checkingStatus ? 'Mengecek...' : 'Cek Status Pembayaran'}</span>
            </button>

            <button
              type="button"
              onClick={onChangePaymentMethod}
              className="py-3 px-4 bg-white border border-black/10 hover:border-[#C9A227] text-slate-700 hover:text-[#C9A227] rounded-xl font-semibold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm">swap_horiz</span>
              <span>Ganti Metode</span>
            </button>

            {onBack && paymentStatus !== 'completed' && (
              <button
                type="button"
                onClick={onBack}
                className="py-3 px-4 bg-white border border-black/10 hover:border-[#C9A227] text-slate-700 hover:text-[#C9A227] rounded-xl font-semibold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                title="Batalkan tagihan ini dan kembali ke formulir pendaftaran"
              >
                <span className="material-symbols-outlined text-sm">arrow_back</span>
                <span>Kembali</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function PaymentSummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block mb-0.5">{label}</span>
      <span className="text-slate-900 font-semibold text-xs sm:text-sm">{value || '—'}</span>
    </div>
  );
}
