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
  Clock,
  XCircle,
  AlertCircle,
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
  raw_subtotal?: number;
  discount_amount?: number;
  promo_note?: string | null;
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
  const [validatingBibs, setValidatingBibs] = useState(false);
  const [parseError, setParseError] = useState('');
  const [categorySummary, setCategorySummary] = useState({ '7k': 0, '12k': 0 });

  // Payment state
  const [paymentMethod, setPaymentMethod] = useState('qris');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [paymentData, setPaymentData] = useState<BulkPaymentResponse | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'completed' | 'error' | 'cancelled' | 'expired'>('pending');
  const [checkingStatus, setCheckingStatus] = useState(false);
  const [cancellingPayment, setCancellingPayment] = useState(false);
  const [timeLeft, setTimeLeft] = useState<{ minutes: number; seconds: number; isExpired: boolean }>({
    minutes: 60,
    seconds: 0,
    isExpired: false,
  });

  // Timer Countdown 1 Jam Pembayaran Kolektif
  useEffect(() => {
    if (!paymentData?.expired_at || paymentStatus === 'completed' || paymentStatus === 'cancelled') {
      return;
    }

    const updateTimer = () => {
      const now = Date.now();
      const expiry = new Date(paymentData.expired_at).getTime();
      const diff = expiry - now;

      if (diff <= 0) {
        setTimeLeft({ minutes: 0, seconds: 0, isExpired: true });
        setPaymentStatus('expired');
      } else {
        const totalSecs = Math.floor(diff / 1000);
        const mins = Math.floor(totalSecs / 60);
        const secs = totalSecs % 60;
        setTimeLeft({ minutes: mins, seconds: secs, isExpired: false });
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [paymentData?.expired_at, paymentStatus]);

  // Fungsi Batalkan Transaksi Pendaftaran Kelompok
  const handleCancelTransaction = async () => {
    if (!paymentData?.order_id) return;

    const confirmed = window.confirm(
      'Apakah Anda yakin ingin membatalkan transaksi pendaftaran kelompok ini?\n\n' +
      'Data peserta yang didaftarkan pada transaksi ini akan dihapus dari sistem.'
    );
    if (!confirmed) return;

    setCancellingPayment(true);
    try {
      const res = await fetch('/api/payment/cancel-bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order_id: paymentData.order_id,
          txn_id: paymentData.txn_id,
          registration_ids: paymentData.registration_ids || [],
          pic_phone: paymentData.pic?.phone || picData.pic_phone || null,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || 'Gagal membatalkan transaksi.');
      }

      alert('Transaksi pendaftaran kelompok berhasil dibatalkan.');
      setPaymentData(null);
      setPaymentStatus('pending');
    } catch (err: any) {
      alert(`Terjadi kesalahan: ${err.message}`);
    } finally {
      setCancellingPayment(false);
    }
  };

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

      // Otomatis validasi manual BIB & generate BIB unik untuk peserta yang kosong
      setValidatingBibs(true);
      try {
        const bibRes = await fetch('/api/trailrun/bulk-bib-process', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ participants: result.participants }),
        });
        const bibJson = await bibRes.json();
        if (bibJson.success && Array.isArray(bibJson.participants)) {
          setParticipants(bibJson.participants);
        } else {
          setParticipants(result.participants);
        }
      } catch (bibErr) {
        console.warn('Gagal memproses BIB massal via API, menggunakan data awal:', bibErr);
        setParticipants(result.participants);
      } finally {
        setValidatingBibs(false);
      }

      setCategorySummary(result.categoryCounts);
    } catch (err: any) {
      setParseError(err.message || 'Gagal membaca file Excel. Pastikan format sesuai template.');
    } finally {
      setParsing(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Re-generate fresh unique sequential BIBs for all participants
  const handleRegenerateAllBibs = async () => {
    if (participants.length === 0) return;
    setValidatingBibs(true);
    setSubmitError('');
    try {
      const res = await fetch('/api/trailrun/bulk-bib-process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          participants,
          forceRegenerateAll: true,
        }),
      });
      const json = await res.json();
      if (json.success && Array.isArray(json.participants)) {
        setParticipants(json.participants);
      } else if (!json.success && json.error) {
        setSubmitError(json.error);
      }
    } catch (err: any) {
      setSubmitError('Gagal mengenerate ulang nomor BIB: ' + (err.message || ''));
    } finally {
      setValidatingBibs(false);
    }
  };

  // Remove participant from list
  const handleRemoveParticipant = (index: number) => {
    setParticipants((prev) => {
      const updated = prev.filter((_, idx) => idx !== index);
      const counts = { '7k': 0, '12k': 0 };
      updated.forEach((p) => {
        const cat = p.kategori.toLowerCase();
        if (cat.includes('7')) counts['7k']++;
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

    if (validCount > 20) {
      setSubmitError(`Pendaftaran kolektif dibatasi maksimal 20 orang peserta per transaksi (saat ini ${validCount} peserta). Silakan kurangi peserta atau buat transaksi kedua.`);
      return;
    }

    const has3k = participants.some((p) => p.kategori.toLowerCase().includes('3'));
    if (has3k) {
      setSubmitError('Pendaftaran kolektif hanya menerima kategori 7K dan 12K. Kategori 3K tidak tersedia untuk pendaftaran kelompok.');
      return;
    }

    const hasInvalid = participants.some((p) => !p.isValid);
    if (hasInvalid) {
      setSubmitError('Masih terdapat baris data yang belum valid (berwarna merah). Periksa kembali data Anda atau klik "Generate Ulang BIB".');
      return;
    }

    const invalidBib = participants.some((p) => {
      const b = (p.no_bib || '').trim().toUpperCase();
      return !b || b.length !== 7 || !/^[FM]-\d{5}$/.test(b);
    });
    if (invalidBib) {
      setSubmitError('Ada peserta yang nomor BIB-nya kosong atau tidak sesuai ketentuan (harus tepat 7 karakter, contoh: M-00001, F-00001). Silakan klik "Generate Ulang BIB".');
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

  // Calculate live route pricing & totals based on fixed Pre-Sale group rates + Scheme B gateway fee
  const routeCalculations = useMemo(() => {
    const PRICE_7K = 270000;
    const PRICE_12K = 320000;
    const ADMIN_FEE_PER_PERSON = 3000;

    let count7k = 0;
    let count12k = 0;
    const participantPriceMap: Record<number, { amount: number; tierName: string; categoryName: string }> = {};

    participants.forEach((p, idx) => {
      if (!p.isValid) {
        participantPriceMap[idx] = { amount: 0, tierName: '-', categoryName: p.kategori };
        return;
      }
      const catKey = p.kategori.toLowerCase().includes('12') ? '12k' : '7k';
      const amount = catKey === '12k' ? PRICE_12K : PRICE_7K;

      participantPriceMap[idx] = {
        amount,
        tierName: 'Pre-Sale (Harga Khusus Kelompok)',
        categoryName: catKey === '12k' ? '12K Senior Pawitra' : '7K Junior Pawitra',
      };

      if (catKey === '7k') {
        count7k++;
      } else if (catKey === '12k') {
        count12k++;
      }
    });

    const subtotal7k = count7k * PRICE_7K;
    const subtotal12k = count12k * PRICE_12K;
    const rawSubtotalTickets = subtotal7k + subtotal12k;

    // Promo Kelipatan 10 Peserta: Diskon Rp 320.000 tiap 10 peserta (10 = 320k, 20 = 640k)
    const discountMultiplier = Math.floor(validCount / 10);
    const isPromoActive = discountMultiplier > 0;
    const discountAmount = discountMultiplier * 320000;
    const subtotalTickets = Math.max(0, rawSubtotalTickets - discountAmount);

    // Biaya Layanan: Biaya Layanan Admin Rp 3.000 / orang + Biaya Transaksi QRIS (0.7% + Rp 300)
    const adminFee = validCount * ADMIN_FEE_PER_PERSON;
    const amountToSend = subtotalTickets + adminFee;
    const estimatedGatewayFee = validCount > 0 ? Math.round(amountToSend * 0.007 + 300) : 0;
    const totalServiceFee = adminFee;
    const grandTotal = subtotalTickets + totalServiceFee;

    return {
      count7k,
      count12k,
      subtotal7k,
      subtotal12k,
      unitPrice7k: PRICE_7K,
      unitPrice12k: PRICE_12K,
      tierName7k: 'Pre-Sale (Tarif Tetap)',
      tierName12k: 'Pre-Sale (Tarif Tetap)',
      rawSubtotalTickets,
      isPromoActive,
      discountMultiplier,
      discountAmount,
      subtotalTickets,
      adminFee,
      estimatedGatewayFee,
      totalServiceFee,
      grandTotal,
      participantPriceMap,
    };
  }, [participants, validCount]);

  return (
    <div className="space-y-8 animate-[fadeIn_0.4s_ease-out]">
      {/* =========================================================================
          VIEW A: PAYMENT DATA ACTIVE (LIGHT THEME)
      ========================================================================= */}
      {paymentData ? (
        <div className="space-y-6">
          {/* Header Status Banner dengan Countdown Timer 1 Jam */}
          <div
            className={`p-5 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${paymentStatus === 'completed'
                ? 'bg-emerald-50 border-emerald-200'
                : paymentStatus === 'expired'
                  ? 'bg-rose-50 border-rose-200'
                  : 'bg-amber-50 border-amber-200'
              }`}
          >
            <div className="flex items-center gap-4">
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${paymentStatus === 'completed'
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
                  className={`text-base sm:text-lg font-bold font-serif ${paymentStatus === 'completed'
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
              <div className="pt-2 border-t border-black/5 text-xs">
                <div className="flex justify-between items-center text-emerald-700 font-bold bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                    Promo 10 Peserta (Diskon Tetap):
                  </span>
                  <span className="font-mono">-{formatCurrency(paymentData.discount_amount)}</span>
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
                <span className="text-[10px] text-slate-400">Termasuk Tiket, Biaya Admin, dan Biaya QRIS</span>
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
              onClick={checkStatus}
              disabled={checkingStatus || paymentStatus === 'expired'}
              className="flex-1 py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
            >
              <RefreshCw className={`w-4 h-4 ${checkingStatus ? 'animate-spin' : ''}`} />
              <span>{checkingStatus ? 'Mengecek...' : 'Cek Status Pembayaran'}</span>
            </button>

            {paymentStatus !== 'completed' && (
              <button
                type="button"
                onClick={handleCancelTransaction}
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
                    5 - 20 Peserta
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold whitespace-nowrap">
                    Tarif Pre-Sale Terkunci
                  </span>
                </div>
                <h3 className="text-lg sm:text-xl font-serif font-bold text-slate-900">
                  Registrasi Kolektif via File Excel (7K &amp; 12K)
                </h3>
                <p className="text-xs text-slate-500 max-w-xl leading-relaxed">
                  Daftarkan rombongan pelari (5 hingga 20 orang) dengan tarif khusus Pre-Sale tetap (7K: Rp 270.000, 12K: Rp 320.000). Rombongan mendapatkan potongan otomatis <strong>Rp 320.000 tiap kelipatan 10 orang</strong> (10 peserta diskon Rp 320.000, 20 peserta diskon Rp 640.000).
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
                <span>Isi Data (BIB Otomatis Sistem) &amp; Upload</span>
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
                  {validatingBibs && (
                    <span className="text-xs text-amber-600 font-semibold flex items-center gap-1 animate-pulse">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      Memvalidasi BIB...
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 text-xs flex-wrap">
                  <button
                    type="button"
                    onClick={handleRegenerateAllBibs}
                    disabled={validatingBibs}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#C9A227]/40 bg-[#C9A227]/10 hover:bg-[#C9A227]/20 text-[#0d1c32] font-bold text-xs transition-all cursor-pointer disabled:opacity-50"
                    title="Generate ulang nomor BIB urut unik untuk seluruh peserta"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${validatingBibs ? 'animate-spin' : ''}`} />
                    <span>Generate Ulang BIB</span>
                  </button>

                  <span
                    className={`px-2.5 py-1 rounded-full border font-bold ${validCount >= 5 && validCount <= 10
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}
                  >
                    {validCount >= 5 && validCount <= 10
                      ? `✓ ${validCount} Peserta Valid (Siap Checkout)`
                      : validCount > 10
                        ? `⚠ ${validCount} Peserta (Maks. 10)`
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
                      <th className="py-2.5 px-3 font-bold whitespace-nowrap">Kategori & Biaya</th>
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
                        className={`transition-colors ${p.isValid ? 'hover:bg-slate-50' : 'bg-rose-50/60 hover:bg-rose-50'
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
                    className={`p-3.5 rounded-xl border-2 text-left transition-all flex items-center gap-3 cursor-pointer ${paymentMethod === pm.id
                        ? 'border-[#C9A227] bg-[#C9A227]/5 shadow-xs'
                        : 'border-black/10 bg-white hover:border-[#C9A227]/40'
                      }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${paymentMethod === pm.id ? 'border-[#C9A227] bg-[#C9A227]' : 'border-slate-300'
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
                    <div className="flex justify-between items-center py-1 px-2.5 rounded-lg bg-emerald-50 text-emerald-700 font-semibold text-xs border border-emerald-200">
                      <span>
                        Promo Spesial {routeCalculations.discountMultiplier * 10} Peserta ({routeCalculations.discountMultiplier}x Rp 320.000)
                      </span>
                      <strong className="font-mono">
                        -{formatCurrency(routeCalculations.discountAmount)}
                      </strong>
                    </div>
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
                onClick={handleProcessPayment}
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
          )}
        </div>
      )}
    </div>
  );
}
