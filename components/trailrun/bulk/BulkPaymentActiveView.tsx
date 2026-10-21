import React from 'react';
import { CheckCircle2, AlertCircle, RefreshCw, Clock, Sparkles, XCircle } from 'lucide-react';
import { BulkPaymentData } from './types';

interface BulkPaymentActiveViewProps {
  paymentData: BulkPaymentData;
  paymentStatus: 'pending' | 'completed' | 'expired';
  checkingStatus: boolean;
  cancellingPayment: boolean;
  timeLeft: { minutes: number; seconds: number };
  onCheckStatus: () => void;
  onCancelPayment: () => void;
  onReset: () => void;
}

export function BulkPaymentActiveView({
  paymentData,
  paymentStatus,
  checkingStatus,
  cancellingPayment,
  timeLeft,
  onCheckStatus,
  onCancelPayment,
  onReset,
}: BulkPaymentActiveViewProps) {
  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(val);

  const formatExpiry = (isoString?: string) => {
    if (!isoString) return '-';
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' WIB';
    } catch {
      return isoString;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Status Banner dengan Countdown Timer 1 Jam */}
      <div
        className={`p-5 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
          paymentStatus === 'completed'
            ? 'bg-emerald-50 border-emerald-200'
            : paymentStatus === 'expired'
              ? 'bg-rose-50 border-rose-200'
              : 'bg-amber-50 border-amber-200'
        }`}
      >
        <div className="flex items-center gap-4">
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
              paymentStatus === 'completed'
                ? 'bg-emerald-100 text-emerald-600'
                : paymentStatus === 'expired'
                  ? 'bg-rose-100 text-rose-600'
                  : 'bg-amber-100 text-amber-600'
            }`}
          >
            {paymentStatus === 'completed' ? (
              <CheckCircle2 className="w-6 h-6" />
            ) : paymentStatus === 'expired' ? (
              <AlertCircle className="w-6 h-6 text-rose-600" />
            ) : (
              <RefreshCw className="w-6 h-6 animate-spin text-amber-600" />
            )}
          </div>
          <div>
            <h3
              className={`text-base sm:text-lg font-bold font-serif ${
                paymentStatus === 'completed'
                  ? 'text-emerald-800'
                  : paymentStatus === 'expired'
                    ? 'text-rose-800'
                    : 'text-amber-800'
              }`}
            >
              {paymentStatus === 'completed'
                ? 'Pembayaran Kolektif Berhasil Dikonfirmasi!'
                : paymentStatus === 'expired'
                  ? 'Waktu Pembayaran Telah Habis (Expired)'
                  : 'Menunggu Pembayaran Kolektif'}
            </h3>
            <p className="text-xs text-slate-600">
              {paymentStatus === 'completed'
                ? `Seluruh ${paymentData.participant_count} peserta telah resmi terdaftar pada Trailrun Lintas Candi.`
                : paymentStatus === 'expired'
                  ? 'Batas waktu 1 jam telah berakhir. Silakan batalkan atau daftar ulang rombongan.'
                  : `Batas waktu pembayaran hingga: ${formatExpiry(paymentData.expired_at)}`}
            </p>
          </div>
        </div>

        {/* Countdown Box 1 Jam */}
        {paymentStatus !== 'completed' && (
          <div className="flex items-center gap-3 bg-white/80 backdrop-blur-xs border border-black/10 px-4 py-2.5 rounded-xl self-start sm:self-center shadow-xs">
            <Clock className={`w-4 h-4 ${paymentStatus === 'expired' ? 'text-rose-600' : 'text-amber-600 animate-pulse'}`} />
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">
                Sisa Waktu Bayar
              </span>
              <div className="font-mono text-base font-extrabold text-slate-900">
                {paymentStatus === 'expired' ? (
                  <span className="text-rose-600 font-bold">KADALUARSA</span>
                ) : (
                  <span>
                    {String(timeLeft.minutes).padStart(2, '0')}:{String(timeLeft.seconds).padStart(2, '0')}
                  </span>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Payment Breakdown Card (Light Theme) */}
      <div className="bg-[#f8f8f8] rounded-2xl border border-black/10 p-5 sm:p-6 space-y-4 text-slate-800 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-black/10">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Rincian Tagihan Pembayaran Kolektif
          </span>
          <span className="text-xs font-bold text-[#C9A227]">
            {paymentData.participant_count} Peserta
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block mb-0.5">
              Order ID
            </span>
            <span className="text-slate-900 font-semibold font-mono">{paymentData.order_id}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block mb-0.5">
              Metode
            </span>
            <span className="text-slate-900 font-semibold">{paymentData.payment_method.toUpperCase()}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block mb-0.5">
              Subtotal Tiket
            </span>
            <span className="text-slate-900 font-semibold">
              {formatCurrency(paymentData.raw_subtotal || paymentData.subtotal)}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block mb-0.5">
              Biaya Layanan
            </span>
            <span className="text-slate-900 font-semibold">
              {formatCurrency(
                (paymentData.admin_fee || paymentData.participant_count * 3000) +
                (paymentData.gateway_fee || 0)
              )}
            </span>
          </div>
        </div>

        {/* Promo Discount Row jika ada */}
        {paymentData.discount_amount && paymentData.discount_amount > 0 ? (
          <div className="pt-2 border-t border-black/5 text-xs space-y-2">
            <div className="flex justify-between items-center text-emerald-700 font-bold bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                Promo 10 Peserta (Diskon Tetap):
              </span>
              <span className="font-mono">-{formatCurrency(paymentData.discount_amount)}</span>
            </div>
            <div className="flex justify-between items-center px-1 font-semibold text-slate-700">
              <span>Subtotal Tiket Setelah Diskon</span>
              <span className="font-mono text-emerald-700">{formatCurrency(paymentData.subtotal)}</span>
            </div>
          </div>
        ) : null}

        {paymentData.participants && paymentData.participants.length > 0 && (
          <div className="pt-2 border-t border-black/5 flex flex-wrap gap-2 text-xs">
            {(() => {
              const p7k = paymentData.participants.filter((p) => p.kategori.toLowerCase().includes('7'));
              const p12k = paymentData.participants.filter((p) => p.kategori.toLowerCase().includes('12'));
              const tot7k = p7k.reduce((acc, c) => acc + c.priceAmount, 0);
              const tot12k = p12k.reduce((acc, c) => acc + c.priceAmount, 0);
              return (
                <>
                  {p7k.length > 0 && (
                    <span className="px-2.5 py-1 rounded-lg bg-white border border-black/10 text-slate-700">
                      7K Junior Pawitra: <strong>{p7k.length} orang</strong> ({formatCurrency(tot7k)})
                    </span>
                  )}
                  {p12k.length > 0 && (
                    <span className="px-2.5 py-1 rounded-lg bg-white border border-black/10 text-slate-700">
                      12K Senior Pawitra: <strong>{p12k.length} orang</strong> ({formatCurrency(tot12k)})
                    </span>
                  )}
                </>
              );
            })()}
          </div>
        )}

        <div className="pt-3 border-t border-black/10 flex justify-between items-center">
          <div>
            <span className="text-xs text-slate-600 uppercase font-bold tracking-wider block">Total Tagihan Rombongan</span>
            <span className="text-[10px] text-slate-400">Termasuk Tiket, Biaya Admin, dan Biaya Gateway ({paymentData.payment_method.toUpperCase()})</span>
          </div>
          <span className="text-2xl font-bold text-[#C9A227] font-mono">{formatCurrency(paymentData.total_payment)}</span>
        </div>
      </div>

      {/* QR Code / VA Display */}
      {paymentData.qr_string && (
        <div className="bg-[#f8f8f8] rounded-2xl border border-black/10 p-6 text-center space-y-3">
          <span className="text-xs text-slate-500 uppercase font-bold tracking-wider">
            Scan QRIS Kolektif ({paymentData.participant_count} Tiket)
          </span>
          <div className="mx-auto w-56 h-56 bg-white rounded-xl border border-black/10 flex items-center justify-center p-2 shadow-sm">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={
                paymentData.qr_string.startsWith('http') || paymentData.qr_string.startsWith('data:image')
                  ? paymentData.qr_string
                  : `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(
                      paymentData.qr_string
                    )}`
              }
              alt="QRIS Kolektif"
              className="w-full h-full object-contain rounded"
            />
          </div>
          <p className="text-xs text-slate-500 font-medium max-w-md mx-auto">
            Scan menggunakan aplikasi m-Banking (BCA, Mandiri, BRI, BNI) atau e-Wallet (GoPay, OVO, Dana, ShopeePay).
          </p>
        </div>
      )}

      {paymentData.va_number && (
        <div className="bg-[#f8f8f8] rounded-2xl border border-black/10 p-6 text-center space-y-2">
          <span className="text-xs text-slate-500 uppercase font-bold tracking-wider">Nomor Virtual Account</span>
          <div className="text-2xl sm:text-3xl font-mono font-bold text-slate-900 tracking-wider select-all">
            {paymentData.va_number}
          </div>
          <p className="text-xs text-slate-400">Transfer tepat sesuai nominal tagihan melalui ATM atau m-Banking.</p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          type="button"
          onClick={onCheckStatus}
          disabled={checkingStatus || paymentStatus === 'expired'}
          className="flex-1 py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
        >
          <RefreshCw className={`w-4 h-4 ${checkingStatus ? 'animate-spin' : ''}`} />
          <span>{checkingStatus ? 'Mengecek...' : 'Cek Status Pembayaran'}</span>
        </button>

        {paymentStatus !== 'completed' && (
          <button
            type="button"
            onClick={onCancelPayment}
            disabled={cancellingPayment}
            className="py-3.5 px-4 bg-rose-500/10 hover:bg-rose-500/20 text-rose-700 hover:text-rose-800 border border-rose-200 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            title="Batalkan pendaftaran rombongan ini dan hapus tagihan"
          >
            <XCircle className="w-4 h-4 text-rose-600" />
            <span>{cancellingPayment ? 'Membatalkan...' : 'Batalkan Transaksi'}</span>
          </button>
        )}

        <button
          type="button"
          onClick={onReset}
          className="py-3.5 px-4 bg-white border border-black/10 hover:border-[#C9A227] text-slate-700 hover:text-[#C9A227] rounded-xl font-semibold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <span>Daftar Rombongan Baru</span>
        </button>
      </div>
    </div>
  );
}
