'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  BulkParticipant,
  downloadTrailrunExcelTemplate,
  parseTrailrunExcelFile,
} from '@/lib/excel-template';
import { getActivePricingTier, ActiveTierResult } from '@/lib/pricing';
import {
  FileSpreadsheet,
  Download,
  Upload,
  CheckCircle2,
  AlertTriangle,
  Trash2,
  Users,
  CreditCard,
  RefreshCw,
  QrCode,
  Building,
  User,
  Mail,
  Phone,
  Calculator,
  Tag,
  Sparkles,
} from 'lucide-react';

const PAYMENT_METHODS = [
  { id: 'qris', label: 'QRIS', desc: 'Gopay, OVO, Dana, ShopeePay, BCA, dll', icon: 'qr_code_2' },
  { id: 'bri_va', label: 'BRI Virtual Account', desc: 'Transfer via BRI', icon: 'account_balance' },
  { id: 'bni_va', label: 'BNI Virtual Account', desc: 'Transfer via BNI', icon: 'account_balance' },
  { id: 'mandiri_va', label: 'Mandiri Virtual Account', desc: 'Transfer via Mandiri', icon: 'account_balance' },
  { id: 'permata_va', label: 'Permata Virtual Account', desc: 'Transfer via Permata', icon: 'account_balance' },
];

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatExpiry(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateStr;
  }
}

interface BulkPaymentResponse {
  order_id: string;
  txn_id: string;
  participant_count: number;
  subtotal: number;
  admin_fee: number;
  gateway_fee: number;
  fee: number;
  total_payment: number;
  payment_method: string;
  qr_string?: string;
  va_number?: string;
  payment_link?: string;
  expired_at: string;
  is_sandbox: boolean;
  participants: Array<{
    nama: string;
    kategori: string;
    tierName: string;
    priceAmount: number;
  }>;
}

export default function TrailrunBulkRegister() {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // PIC Information
  const [picData, setPicData] = useState({
    pic_name: '',
    pic_email: '',
    pic_phone: '',
    group_name: '',
  });

  // Excel parsing state
  const [fileName, setFileName] = useState('');
  const [participants, setParticipants] = useState<BulkParticipant[]>([]);
  const [parsing, setParsing] = useState(false);
  const [parseError, setParseError] = useState('');
  const [categorySummary, setCategorySummary] = useState({ '3k': 0, '7k': 0, '12k': 0 });

  // Payment state
  const [paymentMethod, setPaymentMethod] = useState('qris');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [paymentData, setPaymentData] = useState<BulkPaymentResponse | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'completed' | 'error'>('pending');
  const [checkingStatus, setCheckingStatus] = useState(false);

  // Active pricing tier information from trailrun-pricing.json & database counts
  const [pricingInfo, setPricingInfo] = useState<Record<string, ActiveTierResult>>({
    '3k': getActivePricingTier('3k', 0),
    '7k': getActivePricingTier('7k', 0),
    '12k': getActivePricingTier('12k', 0),
  });

  useEffect(() => {
    fetch('/api/trailrun/pricing')
      .then((res) => res.json())
      .then((data) => {
        if (data && data['3k'] && data['7k'] && data['12k']) {
          setPricingInfo({
            '3k': data['3k'],
            '7k': data['7k'],
            '12k': data['12k'],
          });
        }
      })
      .catch((err) => console.warn('Could not fetch trailrun pricing:', err));
  }, []);

  // Handle PIC form input
  const handlePicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPicData((prev) => ({ ...prev, [name]: value }));
    if (submitError) setSubmitError('');
  };

  // Handle Excel upload & parsing
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setParsing(true);
    setParseError('');
    setSubmitError('');

    try {
      const result = await parseTrailrunExcelFile(file, picData.group_name);
      setFileName(file.name);
      setParticipants(result.participants);
      setCategorySummary(result.categoryCounts);
    } catch (err: any) {
      setParseError(err.message || 'Gagal membaca file Excel. Pastikan format sesuai template.');
    } finally {
      setParsing(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Remove participant from list
  const handleRemoveParticipant = (index: number) => {
    setParticipants((prev) => {
      const updated = prev.filter((_, idx) => idx !== index);
      const counts = { '3k': 0, '7k': 0, '12k': 0 };
      updated.forEach((p) => {
        const cat = p.kategori.toLowerCase();
        if (cat.includes('3')) counts['3k']++;
        else if (cat.includes('7')) counts['7k']++;
        else if (cat.includes('12')) counts['12k']++;
      });
      setCategorySummary(counts);
      return updated;
    });
  };

  // Process bulk registration payment
  const handleProcessPayment = async () => {
    if (!picData.pic_name.trim() || !picData.pic_email.trim() || !picData.pic_phone.trim()) {
      setSubmitError('Data Penanggung Jawab (PIC) wajib diisi lengkap.');
      return;
    }

    if (participants.length === 0) {
      setSubmitError('Belum ada data peserta. Silakan upload file Excel.');
      return;
    }

    if (validCount < 5) {
      setSubmitError(`Pendaftaran kolektif membutuhkan minimal 5 orang peserta valid (saat ini baru ${validCount} peserta).`);
      return;
    }

    const hasInvalid = participants.some((p) => !p.isValid);
    if (hasInvalid) {
      setSubmitError('Masih terdapat baris data yang belum valid (berwarna merah). Periksa kembali data Anda.');
      return;
    }

    setSubmitting(true);
    setSubmitError('');

    try {
      const res = await fetch('/api/payment/create-bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          group_name: picData.group_name || 'Komunitas Lari',
          pic_name: picData.pic_name,
          pic_email: picData.pic_email,
          pic_phone: picData.pic_phone,
          payment_method: paymentMethod,
          participants,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Gagal memproses pembayaran kolektif.');
      }

      setPaymentData(json.data);
      setPaymentStatus('pending');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      setSubmitError(err.message || 'Terjadi kesalahan sistem.');
    } finally {
      setSubmitting(false);
    }
  };

  // Check payment status
  const checkStatus = async () => {
    if (!paymentData?.txn_id) return;
    setCheckingStatus(true);
    try {
      const res = await fetch(`/api/payment/status?txn_id=${paymentData.txn_id}`);
      const json = await res.json();
      if (json.success && (json.data?.status === 'completed' || json.data?.status === 'settled')) {
        setPaymentStatus('completed');
      }
    } catch {
      // ignore network errors
    } finally {
      setCheckingStatus(false);
    }
  };

  const validParticipants = participants.filter((p) => p.isValid);
  const validCount = validParticipants.length;
  const invalidCount = participants.length - validCount;

  // Calculate live route pricing & totals matching trailrun-pricing.json and active tiers
  const routeCalculations = useMemo(() => {
    // Current database base counts from pricingInfo if available
    const baseCounts = {
      '3k':
        pricingInfo['3k']?.quotaRemaining !== null && pricingInfo['3k']?.quotaLimit !== null
          ? Math.max(0, pricingInfo['3k'].quotaLimit - (pricingInfo['3k'].quotaRemaining || 0))
          : 0,
      '7k':
        pricingInfo['7k']?.quotaRemaining !== null && pricingInfo['7k']?.quotaLimit !== null
          ? Math.max(0, pricingInfo['7k'].quotaLimit - (pricingInfo['7k'].quotaRemaining || 0))
          : 0,
      '12k':
        pricingInfo['12k']?.quotaRemaining !== null && pricingInfo['12k']?.quotaLimit !== null
          ? Math.max(0, pricingInfo['12k'].quotaLimit - (pricingInfo['12k'].quotaRemaining || 0))
          : 0,
    };

    const running = { ...baseCounts };
    let subtotal3k = 0;
    let subtotal7k = 0;
    let subtotal12k = 0;
    let count3k = 0;
    let count7k = 0;
    let count12k = 0;

    const participantPriceMap: Record<number, { amount: number; tierName: string; categoryName: string }> = {};

    participants.forEach((p, idx) => {
      if (!p.isValid) {
        participantPriceMap[idx] = { amount: 0, tierName: '-', categoryName: p.kategori };
        return;
      }
      const catKey = p.kategori.toLowerCase().includes('12')
        ? '12k'
        : p.kategori.toLowerCase().includes('7')
        ? '7k'
        : '3k';

      const evaluated = getActivePricingTier(catKey, running[catKey]);
      running[catKey] += 1;

      participantPriceMap[idx] = {
        amount: evaluated.amount,
        tierName: evaluated.tierName,
        categoryName: evaluated.categoryName,
      };

      if (catKey === '3k') {
        count3k++;
        subtotal3k += evaluated.amount;
      } else if (catKey === '7k') {
        count7k++;
        subtotal7k += evaluated.amount;
      } else if (catKey === '12k') {
        count12k++;
        subtotal12k += evaluated.amount;
      }
    });

    const subtotalTickets = subtotal3k + subtotal7k + subtotal12k;
    const adminFee = validCount * 2000;
    const grandTotal = subtotalTickets + adminFee;

    return {
      count3k,
      count7k,
      count12k,
      subtotal3k,
      subtotal7k,
      subtotal12k,
      unitPrice3k: pricingInfo['3k']?.amount || 2500,
      unitPrice7k: pricingInfo['7k']?.amount || 2400,
      unitPrice12k: pricingInfo['12k']?.amount || 2900,
      tierName3k: pricingInfo['3k']?.tierName || 'Early Bird',
      tierName7k: pricingInfo['7k']?.tierName || 'Early Bird',
      tierName12k: pricingInfo['12k']?.tierName || 'Early Bird',
      subtotalTickets,
      adminFee,
      grandTotal,
      participantPriceMap,
    };
  }, [participants, validCount, pricingInfo]);

  return (
    <div className="space-y-8 animate-[fadeIn_0.4s_ease-out]">
      {/* =========================================================================
          VIEW A: PAYMENT DATA ACTIVE (LIGHT THEME)
      ========================================================================= */}
      {paymentData ? (
        <div className="space-y-6">
          {/* Header Status Banner */}
          <div
            className={`p-5 rounded-2xl border flex items-center gap-4 ${
              paymentStatus === 'completed'
                ? 'bg-emerald-50 border-emerald-200'
                : 'bg-amber-50 border-amber-200'
            }`}
          >
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                paymentStatus === 'completed' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'
              }`}
            >
              {paymentStatus === 'completed' ? (
                <CheckCircle2 className="w-6 h-6" />
              ) : (
                <RefreshCw className="w-6 h-6 animate-spin text-amber-600" />
              )}
            </div>
            <div>
              <h3
                className={`text-base sm:text-lg font-bold font-serif ${
                  paymentStatus === 'completed' ? 'text-emerald-800' : 'text-amber-800'
                }`}
              >
                {paymentStatus === 'completed'
                  ? 'Pembayaran Kolektif Berhasil Dikonfirmasi!'
                  : 'Menunggu Pembayaran Kolektif'}
              </h3>
              <p className="text-xs text-slate-600">
                {paymentStatus === 'completed'
                  ? `Seluruh ${paymentData.participant_count} peserta telah resmi terdaftar pada Trailrun Lintas Candi.`
                  : `Batas waktu pembayaran hingga: ${formatExpiry(paymentData.expired_at)}`}
              </p>
            </div>
          </div>

          {/* Payment Breakdown Card (Light Theme) */}
          <div className="bg-[#f8f8f8] rounded-2xl border border-black/10 p-5 sm:p-6 space-y-4 text-slate-800 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-black/10">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Rincian Pembayaran Komunitas
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
                <span className="text-slate-900 font-semibold">{formatCurrency(paymentData.subtotal)}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block mb-0.5">
                  Biaya Admin ({paymentData.participant_count} x Rp 2.000)
                </span>
                <span className="text-slate-900 font-semibold">{formatCurrency(paymentData.fee)}</span>
              </div>
            </div>

            {paymentData.participants && paymentData.participants.length > 0 && (
              <div className="pt-2 border-t border-black/5 flex flex-wrap gap-2 text-xs">
                {(() => {
                  const p3k = paymentData.participants.filter((p) => p.kategori.toLowerCase().includes('3'));
                  const p7k = paymentData.participants.filter((p) => p.kategori.toLowerCase().includes('7'));
                  const p12k = paymentData.participants.filter((p) => p.kategori.toLowerCase().includes('12'));
                  const tot3k = p3k.reduce((acc, c) => acc + c.priceAmount, 0);
                  const tot7k = p7k.reduce((acc, c) => acc + c.priceAmount, 0);
                  const tot12k = p12k.reduce((acc, c) => acc + c.priceAmount, 0);
                  return (
                    <>
                      {p3k.length > 0 && (
                        <span className="px-2.5 py-1 rounded-lg bg-white border border-black/10 text-slate-700">
                          3K: <strong>{p3k.length} orang</strong> ({formatCurrency(tot3k)})
                        </span>
                      )}
                      {p7k.length > 0 && (
                        <span className="px-2.5 py-1 rounded-lg bg-white border border-black/10 text-slate-700">
                          7K: <strong>{p7k.length} orang</strong> ({formatCurrency(tot7k)})
                        </span>
                      )}
                      {p12k.length > 0 && (
                        <span className="px-2.5 py-1 rounded-lg bg-white border border-black/10 text-slate-700">
                          12K: <strong>{p12k.length} orang</strong> ({formatCurrency(tot12k)})
                        </span>
                      )}
                    </>
                  );
                })()}
              </div>
            )}

            <div className="pt-3 border-t border-black/10 flex justify-between items-center">
              <span className="text-xs text-slate-600 uppercase font-bold tracking-wider">Total Tagihan Rombongan</span>
              <span className="text-2xl font-bold text-[#C9A227]">{formatCurrency(paymentData.total_payment)}</span>
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
              onClick={checkStatus}
              disabled={checkingStatus}
              className="flex-1 py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
            >
              <RefreshCw className={`w-4 h-4 ${checkingStatus ? 'animate-spin' : ''}`} />
              <span>{checkingStatus ? 'Mengecek...' : 'Cek Status Pembayaran'}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setPaymentData(null);
                setPaymentStatus('pending');
              }}
              className="py-3.5 px-4 bg-white border border-black/10 hover:border-[#C9A227] text-slate-700 hover:text-[#C9A227] rounded-xl font-semibold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Daftar Rombongan Baru</span>
            </button>
          </div>
        </div>
      ) : (
        /* =========================================================================
            VIEW B: EXCEL DOWNLOAD, UPLOAD, PREVIEW, AND CHECKOUT
        ========================================================================= */
        <div className="space-y-8">
          {/* 1. Step Guidance & Download Template Banner */}
          <div className="bg-white border border-black/10 rounded-2xl p-6 sm:p-7 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="space-y-1.5 flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#C9A227] whitespace-nowrap">
                    Pendaftaran Komunitas / Rombongan
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-[#C9A227]/10 text-[#C9A227] border border-[#C9A227]/30 text-[10px] font-bold whitespace-nowrap">
                    Minimal 5 Peserta
                  </span>
                </div>
                <h3 className="text-lg sm:text-xl font-serif font-bold text-slate-900">
                  Registrasi Kolektif via File Excel
                </h3>
                <p className="text-xs text-slate-500 max-w-xl leading-relaxed">
                  Daftarkan rombongan pelari sekaligus dengan mudah (minimal 5 peserta). Cukup unduh format template resmi (.xlsx), isi data seluruh peserta, lalu upload kembali untuk 1 kali pembayaran kolektif.
                </p>
              </div>

              {/* Download Button - Gold Primary */}
              <button
                type="button"
                onClick={() => downloadTrailrunExcelTemplate(picData.group_name)}
                className="px-5 py-3 bg-[#C9A227] hover:bg-[#b08d20] text-[#0d1c32] font-bold text-xs uppercase tracking-wider rounded-xl transition-all transform active:scale-95 shadow-md flex items-center gap-2 cursor-pointer shrink-0"
              >
                <Download className="w-4 h-4 text-[#0d1c32]" />
                <span>Unduh Format Template (.xlsx)</span>
              </button>
            </div>

            {/* Quick 3-step pills */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-black/5 text-xs text-slate-600">
              <div className="flex items-center gap-2.5 p-2 rounded-lg bg-slate-50">
                <span className="w-6 h-6 rounded-full bg-[#C9A227] text-[#0d1c32] font-black text-xs flex items-center justify-center shrink-0">
                  1
                </span>
                <span>Unduh Template Format Kosong</span>
              </div>
              <div className="flex items-center gap-2.5 p-2 rounded-lg bg-slate-50">
                <span className="w-6 h-6 rounded-full bg-[#C9A227] text-[#0d1c32] font-black text-xs flex items-center justify-center shrink-0">
                  2
                </span>
                <span>Isi Data (Min. 5 Peserta) &amp; Upload</span>
              </div>
              <div className="flex items-center gap-2.5 p-2 rounded-lg bg-slate-50">
                <span className="w-6 h-6 rounded-full bg-[#C9A227] text-[#0d1c32] font-black text-xs flex items-center justify-center shrink-0">
                  3
                </span>
                <span>1 Pembayaran Kolektif (QRIS/VA)</span>
              </div>
            </div>
          </div>

          {/* 2. PIC / Coordinator Info */}
          <div className="bg-white border border-black/10 rounded-2xl p-6 sm:p-7 shadow-xs space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-black/5">
              <User className="w-5 h-5 text-[#C9A227]" />
              <h4 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                Data Penanggung Jawab (PIC / Koordinator Rombongan)
              </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                  Nama Lengkap PIC <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="pic_name"
                  value={picData.pic_name}
                  onChange={handlePicChange}
                  placeholder="Nama koordinator komunitas"
                  className="w-full bg-[#f8f8f8] border border-black/10 focus:border-[#C9A227] rounded-xl px-4 py-3 text-xs sm:text-sm text-slate-900 outline-none"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                  No WhatsApp PIC <span className="text-rose-500">*</span>
                </label>
                <input
                  type="tel"
                  name="pic_phone"
                  value={picData.pic_phone}
                  onChange={handlePicChange}
                  placeholder="08xxxxxxxxxx"
                  className="w-full bg-[#f8f8f8] border border-black/10 focus:border-[#C9A227] rounded-xl px-4 py-3 text-xs sm:text-sm text-slate-900 outline-none"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                  Email PIC <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  name="pic_email"
                  value={picData.pic_email}
                  onChange={handlePicChange}
                  placeholder="email@komunitas.com"
                  className="w-full bg-[#f8f8f8] border border-black/10 focus:border-[#C9A227] rounded-xl px-4 py-3 text-xs sm:text-sm text-slate-900 outline-none"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                  Nama Komunitas / Running Club
                </label>
                <input
                  type="text"
                  name="group_name"
                  value={picData.group_name}
                  onChange={handlePicChange}
                  placeholder="Contoh: Pawitra Trail Runners"
                  className="w-full bg-[#f8f8f8] border border-black/10 focus:border-[#C9A227] rounded-xl px-4 py-3 text-xs sm:text-sm text-slate-900 outline-none"
                />
              </div>
            </div>
          </div>

          {/* 3. Upload File Excel Dropzone */}
          <div className="bg-white border border-black/10 rounded-2xl p-6 sm:p-7 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-black/5">
              <div className="flex items-center gap-2.5">
                <Upload className="w-5 h-5 text-[#C9A227]" />
                <h4 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                  Unggah File Excel yang Telah Diisi
                </h4>
              </div>
              {fileName && (
                <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" />
                  {fileName}
                </span>
              )}
            </div>

            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-black/15 hover:border-[#C9A227] rounded-2xl p-8 text-center bg-[#fcfcfc] hover:bg-[#fffdf7] transition-all cursor-pointer space-y-3"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx, .xls, .csv"
                onChange={handleFileUpload}
                className="hidden"
              />

              <div className="w-14 h-14 mx-auto rounded-2xl bg-[#C9A227]/10 border border-[#C9A227]/30 flex items-center justify-center text-[#C9A227]">
                <FileSpreadsheet className="w-7 h-7" />
              </div>

              <div className="space-y-1">
                <strong className="text-sm text-slate-800 block font-semibold">
                  {parsing
                    ? 'Sedang membaca file Excel...'
                    : 'Klik atau Tarik File Excel (.xlsx / .xls) ke Sini'}
                </strong>
                <p className="text-xs text-slate-400">
                  Mendukung file spreadsheet Microsoft Excel (.xlsx, .xls) dan CSV
                </p>
              </div>
            </div>

            {parseError && (
              <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-500" />
                <span>{parseError}</span>
              </div>
            )}
          </div>

          {/* 4. Preview Table of Uploaded Participants */}
          {participants.length > 0 && (
            <div className="bg-white border border-black/10 rounded-2xl p-6 sm:p-7 shadow-xs space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-black/5">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-[#C9A227]" />
                  <h4 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                    Pratinjau Data Peserta ({participants.length} Orang)
                  </h4>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <span
                    className={`px-2.5 py-1 rounded-full border font-bold ${
                      validCount >= 5
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}
                  >
                    {validCount >= 5 ? `✓ ${validCount} Siap Daftar` : `⚠ ${validCount}/5 Peserta (Min. 5 Peserta)`}
                  </span>
                  {invalidCount > 0 && (
                    <span className="px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200 font-bold">
                      ⚠ {invalidCount} Perlu Perbaikan
                    </span>
                  )}
                </div>
              </div>

              {validCount < 5 && (
                <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
                  <span>
                    Pendaftaran kolektif membutuhkan minimal <strong>5 orang peserta valid</strong>. Saat ini baru terdapat <strong>{validCount} peserta valid</strong>. Silakan tambahkan minimal {5 - validCount} peserta lagi pada file Excel Anda.
                  </span>
                </div>
              )}

              {/* Category Breakdown & Calculated Route Pricing Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* 3K Card */}
                <div className="p-3.5 rounded-xl bg-slate-50 border border-black/10 flex flex-col justify-between gap-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-xs">3K Hallo Pawitra</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#C9A227]/10 text-[#C9A227] border border-[#C9A227]/20">
                      {routeCalculations.tierName3k}
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between pt-1 border-t border-black/5">
                    <span className="text-xs text-slate-500">
                      {routeCalculations.count3k} Peserta × {formatCurrency(routeCalculations.unitPrice3k)}
                    </span>
                    <strong className="text-sm font-mono text-slate-900">
                      {formatCurrency(routeCalculations.subtotal3k)}
                    </strong>
                  </div>
                </div>

                {/* 7K Card */}
                <div className="p-3.5 rounded-xl bg-slate-50 border border-black/10 flex flex-col justify-between gap-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-xs">7K Junior Pawitra</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#C9A227]/10 text-[#C9A227] border border-[#C9A227]/20">
                      {routeCalculations.tierName7k}
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between pt-1 border-t border-black/5">
                    <span className="text-xs text-slate-500">
                      {routeCalculations.count7k} Peserta × {formatCurrency(routeCalculations.unitPrice7k)}
                    </span>
                    <strong className="text-sm font-mono text-slate-900">
                      {formatCurrency(routeCalculations.subtotal7k)}
                    </strong>
                  </div>
                </div>

                {/* 12K Card */}
                <div className="p-3.5 rounded-xl bg-slate-50 border border-black/10 flex flex-col justify-between gap-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-xs">12K Senior Pawitra</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#C9A227]/10 text-[#C9A227] border border-[#C9A227]/20">
                      {routeCalculations.tierName12k}
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between pt-1 border-t border-black/5">
                    <span className="text-xs text-slate-500">
                      {routeCalculations.count12k} Peserta × {formatCurrency(routeCalculations.unitPrice12k)}
                    </span>
                    <strong className="text-sm font-mono text-slate-900">
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
                      <th className="py-2.5 px-3 font-bold">Nama Lengkap</th>
                      <th className="py-2.5 px-3 font-bold">Kategori & Biaya</th>
                      <th className="py-2.5 px-3 font-bold">Email</th>
                      <th className="py-2.5 px-3 font-bold">WhatsApp</th>
                      <th className="py-2.5 px-3 font-bold">Kota / Prov</th>
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
                            onClick={() => handleRemoveParticipant(idx)}
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
          )}

          {/* 5. Payment Selection & Checkout (Visible if participants exist) */}
          {participants.length > 0 && (
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
                      Rincian Biaya Tiap Rute &amp; Total Tagihan
                    </span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-bold">
                    {validCount} Peserta Valid
                  </span>
                </div>

                <div className="space-y-2.5">
                  {/* 3K Route Row */}
                  <div className="flex justify-between items-center py-1.5 border-b border-black/5">
                    <div>
                      <span className="font-bold text-slate-900 text-xs">Rute 3K Hallo Pawitra</span>
                      <span className="text-[11px] text-slate-500 block">
                        {routeCalculations.count3k} Peserta × {formatCurrency(routeCalculations.unitPrice3k)} ({routeCalculations.tierName3k})
                      </span>
                    </div>
                    <strong className="text-slate-900 font-mono text-sm">
                      {formatCurrency(routeCalculations.subtotal3k)}
                    </strong>
                  </div>

                  {/* 7K Route Row */}
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

                  {/* 12K Route Row */}
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

                  {/* Subtotal Tiket */}
                  <div className="flex justify-between items-center pt-1 text-slate-600">
                    <span className="font-semibold">Subtotal Biaya Tiket ({validCount} Peserta)</span>
                    <strong className="text-slate-900 font-mono text-xs">
                      {formatCurrency(routeCalculations.subtotalTickets)}
                    </strong>
                  </div>

                  {/* Biaya Admin */}
                  <div className="flex justify-between items-center text-slate-600">
                    <span>Biaya Admin Komunitas ({validCount} peserta × Rp 2.000)</span>
                    <strong className="text-slate-900 font-mono text-xs">
                      {formatCurrency(routeCalculations.adminFee)}
                    </strong>
                  </div>
                </div>

                {/* Grand Total */}
                <div className="pt-3 border-t-2 border-black/10 flex justify-between items-center">
                  <div>
                    <span className="text-xs text-slate-600 uppercase font-bold tracking-wider block">
                      Total Estimasi Pembayaran
                    </span>
                    <span className="text-[10px] text-slate-400">
                      Dihitung otomatis sesuai sesi aktif data/trailrun-pricing.json
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

              {/* Submit Button */}
              <button
                type="button"
                onClick={handleProcessPayment}
                disabled={submitting || validCount < 5 || invalidCount > 0}
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
                ) : (
                  <>
                    <span>Proses Pembayaran Kolektif • {formatCurrency(routeCalculations.grandTotal)}</span>
                    <span className="material-symbols-outlined text-sm">arrow_forward</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
