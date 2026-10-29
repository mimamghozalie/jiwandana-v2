'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import type { AtletItem, OfficialItem } from '@/components/silat/types';
import { getSilatCategoryPrice, formatRupiah } from '@/components/silat/types';
import SilatDualBackground from '@/components/silat/SilatDualBackground';
import SilatSponsorPillar from '@/components/silat/SilatSponsorPillar';
import { useSilatAuth } from '@/components/silat/auth/useSilatAuth';
import ModalAuthKontingen from '@/components/silat/auth/ModalAuthKontingen';
import { ShieldCheck, User } from 'lucide-react';

interface PakasirPaymentResult {
  txn_id: string;
  order_id: string;
  amount: number;
  fee: number;
  total_payment: number;
  payment_method: string;
  qr_string?: string;
  va_number?: string;
  payment_link?: string;
  expired_at: string;
  subtotal?: number;
  admin_fee?: number;
  total_atlet?: number;
}

const PAYMENT_METHODS = [
  {
    id: 'qris',
    name: 'QRIS Real-Time',
    desc: 'BCA, Mandiri, BRI, BNI, GoPay, OVO, ShopeePay, DANA',
    icon: 'qr_code_scanner',
    badge: 'Paling Cepat & Instan',
    badgeColor: 'bg-emerald-500/20 text-emerald-800 border-emerald-400',
  },
  {
    id: 'bri_va',
    name: 'Bank BRI Virtual Account',
    desc: 'Transfer via BRIMO, ATM, atau Internet Banking',
    icon: 'account_balance',
    badge: 'Verifikasi Otomatis',
    badgeColor: 'bg-blue-500/20 text-blue-800 border-blue-400',
  },
  {
    id: 'bni_va',
    name: 'Bank BNI Virtual Account',
    desc: 'Transfer via BNI Mobile Banking, ATM BNI',
    icon: 'account_balance',
    badge: 'Verifikasi Otomatis',
    badgeColor: 'bg-orange-500/20 text-orange-800 border-orange-400',
  },
  {
    id: 'mandiri_va',
    name: 'Bank Mandiri Virtual Account',
    desc: 'Transfer via Livin by Mandiri, ATM Mandiri',
    icon: 'account_balance',
    badge: 'Verifikasi Otomatis',
    badgeColor: 'bg-indigo-500/20 text-indigo-800 border-indigo-400',
  },
  {
    id: 'permata_va',
    name: 'Bank Permata Virtual Account',
    desc: 'Transfer via PermataMobile X, ATM Permata',
    icon: 'account_balance',
    badge: 'Verifikasi Otomatis',
    badgeColor: 'bg-teal-500/20 text-teal-800 border-teal-400',
  },
  {
    id: 'cimb_niaga_va',
    name: 'CIMB Niaga Virtual Account',
    desc: 'Transfer via OCTO Mobile, ATM CIMB Niaga',
    icon: 'account_balance',
    badge: 'Verifikasi Otomatis',
    badgeColor: 'bg-rose-500/20 text-rose-800 border-rose-400',
  },
];

export default function PembayaranSilatClient() {
  const {
    user,
    isAuthenticated,
    isLoading: isAuthLoading,
    isAuthModalOpen,
    authModalMode,
    openAuthModal,
    closeAuthModal,
  } = useSilatAuth();

  const [atlets, setAtlets] = useState<AtletItem[]>([]);
  const [officials, setOfficials] = useState<OfficialItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isFetchingData, setIsFetchingData] = useState(false);

  // Form Payment State
  const [kontingenName, setKontingenName] = useState('');
  const [picName, setPicName] = useState('');
  const [picPhone, setPicPhone] = useState('');
  const [selectedMethod, setSelectedMethod] = useState('qris');

  // Loading & Transaction States
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [paymentData, setPaymentData] = useState<PakasirPaymentResult | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'pending' | 'completed' | 'expired'>('idle');
  const [checkingStatus, setCheckingStatus] = useState(false);
  const [copiedVa, setCopiedVa] = useState(false);

  // Auto-fill profil kontingen saat user login
  useEffect(() => {
    if (user) {
      if (user.namaKontingen) setKontingenName(user.namaKontingen);
      if (user.picName) setPicName(user.picName);
      if (user.picPhone) setPicPhone(user.picPhone);
    }
  }, [user]);

  // Fetch Cloud data if authenticated
  useEffect(() => {
    if (isAuthenticated) {
      setIsFetchingData(true);
      fetch('/api/silat/kontingen/data', { cache: 'no-store' })
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setAtlets(data.atlets || []);
            setOfficials(data.officials || []);
            if (!picName && data.officials && data.officials[0]?.nama) {
              setPicName(data.officials[0].nama);
              setPicPhone(data.officials[0].noHp || '');
            }
          }
        })
        .catch((e) => console.warn('Could not fetch cloud silat data for checkout:', e))
        .finally(() => {
          setIsFetchingData(false);
          setIsLoaded(true);
        });
    } else {
      setAtlets([]);
      setOfficials([]);
      try {
        localStorage.removeItem('silat_atlets');
        localStorage.removeItem('silat_officials');
      } catch {}
      setIsLoaded(true);
    }
  }, [isAuthenticated]);

  // 2. Hitung subtotal & rincian biaya 11 kategori
  const { subtotal, breakdownByCategory } = useMemo(() => {
    let sum = 0;
    const breakdown: Record<string, { count: number; total: number; price: number }> = {};

    atlets.forEach((item) => {
      const kat = item.kategoriLomba || 'Tanding - Pemasalan';
      const price = getSilatCategoryPrice(kat);
      sum += price;

      if (!breakdown[kat]) {
        breakdown[kat] = { count: 0, total: 0, price };
      }
      breakdown[kat].count += 1;
      breakdown[kat].total += price;
    });

    return { subtotal: sum, breakdownByCategory: breakdown };
  }, [atlets]);

  const adminFee = atlets.length > 0 ? 5000 : 0;
  const totalAmount = subtotal + adminFee;

  // 3. Handle Submit Buat Pembayaran via Pakasir
  const handleCreatePayment = async () => {
    if (atlets.length === 0) {
      setErrorMsg('Belum ada atlet yang didaftarkan. Harap tambahkan atlet di halaman data kontingen terlebih dahulu.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/silat/payment/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          atlets,
          officials,
          kontingen_name: kontingenName || user?.namaKontingen || 'Kontingen Pencak Silat DSC',
          pic_name: picName,
          pic_phone: picPhone,
          payment_method: selectedMethod,
          kontingen_id: user?.kontingenId,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Gagal membuat transaksi pembayaran.');
      }

      setPaymentData(json.data);
      setPaymentStatus('pending');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      setErrorMsg(err.message || 'Terjadi kesalahan sistem.');
    } finally {
      setLoading(false);
    }
  };

  // 4. Polling & Cek Status Pembayaran
  const checkStatus = async () => {
    if (!paymentData?.txn_id) return;
    setCheckingStatus(true);
    try {
      const res = await fetch(`/api/payment/status?txn_id=${paymentData.txn_id}`);
      const json = await res.json();
      if (json.success && json.data) {
        if (json.data.status === 'completed' || json.data.status === 'settled') {
          setPaymentStatus('completed');
        } else if (json.data.status === 'canceled' || json.data.status === 'expired') {
          setPaymentStatus('expired');
        }
      }
    } catch (err) {
      console.warn('Cek status error:', err);
    } finally {
      setCheckingStatus(false);
    }
  };

  useEffect(() => {
    if (paymentStatus !== 'pending' || !paymentData?.txn_id) return;
    const interval = setInterval(() => {
      checkStatus();
    }, 7000); // Polling setiap 7 detik
    return () => clearInterval(interval);
  }, [paymentStatus, paymentData?.txn_id]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedVa(true);
    setTimeout(() => setCopiedVa(false), 2000);
  };

  return (
    <div className="relative min-h-screen text-slate-900 selection:bg-[#00e5ff]/30 selection:text-slate-950 font-sans">
      {/* 1. DUAL RESPONSIVE BACKGROUND */}
      <SilatDualBackground />

      {/* 2. MAIN CONTENT AREA */}
      <main className="relative z-10 pt-24 sm:pt-28 md:pt-36 lg:pt-40 pb-20 px-3 sm:px-6 max-w-7xl mx-auto flex flex-col items-center justify-between min-h-[calc(100vh-2rem)]">

        {/* TOP: BADGE JUDUL PEMBAYARAN */}
        <div className="w-full text-center mb-6">
          <div className="inline-block py-3 sm:py-3.5 px-8 sm:px-14 bg-gradient-to-r from-[#00d2ff] via-[#00b4d8] to-[#0099ff] text-white font-black text-base sm:text-xl md:text-2xl tracking-wider uppercase rounded-2xl shadow-lg shadow-cyan-500/25 border-2 border-white">
            PEMBAYARAN
          </div>
          <p className="text-xs sm:text-sm font-semibold text-slate-700 mt-2">
            Rincian pendaftaran atlet dan pembayaran otomatis QRIS / Virtual Account
          </p>
        </div>

        {/* MIDDLE SECTION:
            [ PILAR SPONSOR KIRI ] - [ FORM PEMBAYARAN ] - [ PILAR SPONSOR KANAN ] */}
        <div className="w-full grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-6 items-start my-auto">
          {/* PILAR KIRI: SPONSORSHIP */}
          <SilatSponsorPillar variant="pink" height="h-[520px] lg:h-[600px]" />

          {/* AREA TENGAH: KONTEN PEMBAYARAN */}
          <div className="md:col-span-8 w-full space-y-6">

            {/* Error Message Banner */}
            {errorMsg && (
              <div className="p-4 rounded-2xl bg-rose-50 border-2 border-rose-300 text-rose-800 text-xs sm:text-sm font-semibold flex items-center gap-2">
                <span className="material-symbols-outlined text-lg text-rose-600">error</span>
                <span>{errorMsg}</span>
              </div>
            )}

            {/* STATUS: LUNAS (COMPLETED) */}
            {paymentStatus === 'completed' ? (
              <div className="p-6 sm:p-8 bg-white/95 backdrop-blur-md rounded-3xl border-2 border-emerald-400 shadow-2xl text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center border-2 border-emerald-300">
                  <span className="material-symbols-outlined text-4xl">check_circle</span>
                </div>
                <div>
                  <h3 className="text-xl sm:text-2xl font-black text-slate-900 uppercase">
                    PEMBAYARAN BERHASIL (LUNAS)
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 mt-1">
                    Terima kasih! Pembayaran kontingen <span className="font-bold text-slate-900">{kontingenName || 'Pencak Silat'}</span> telah terverifikasi otomatis oleh sistem.
                  </p>
                </div>

                <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-left text-xs space-y-1.5 font-mono">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Order ID:</span>
                    <span className="font-bold text-slate-800">{paymentData?.order_id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Total Atlet:</span>
                    <span className="font-bold text-slate-800">{atlets.length} Atlet</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Total Terbayar:</span>
                    <span className="font-bold text-emerald-700">{formatRupiah(paymentData?.total_payment || totalAmount)}</span>
                  </div>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                  <Link
                    href="/silat/kontingen"
                    className="py-3 px-6 bg-gradient-to-r from-[#00d2ff] to-[#00b4d8] text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md hover:scale-105 transition-all"
                  >
                    Cek Data Kontingen
                  </Link>
                  <Link
                    href="/silat"
                    className="py-3 px-6 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs uppercase tracking-wider rounded-xl transition-all"
                  >
                    Kembali ke Beranda Silat
                  </Link>
                </div>
              </div>
            ) : paymentData && paymentStatus === 'pending' ? (
              /* STATUS: MENUNGGU PEMBAYARAN (QRIS / VA DISPLAY) */
              <div className="p-6 sm:p-8 bg-white/95 backdrop-blur-md rounded-3xl border-2 border-[#00b4d8] shadow-2xl space-y-6">
                <div className="flex items-center justify-between border-b pb-4">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#0088cc] block">
                      STATUS PEMBAYARAN
                    </span>
                    <h3 className="text-base sm:text-lg font-black text-slate-900">
                      MENUNGGU PEMBAYARAN
                    </h3>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-black bg-amber-100 text-amber-800 border border-amber-300 animate-pulse">
                    PENDING
                  </span>
                </div>

                {/* TAMPILAN METODE: QRIS */}
                {paymentData.payment_method === 'qris' && paymentData.qr_string ? (
                  <div className="flex flex-col items-center justify-center space-y-3 py-2">
                    <div className="p-3 bg-white border-2 border-slate-300 rounded-2xl shadow-md w-56 h-56 flex items-center justify-center">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={
                          paymentData.qr_string.startsWith('http') || paymentData.qr_string.startsWith('data:image')
                            ? paymentData.qr_string
                            : `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(
                              paymentData.qr_string
                            )}`
                        }
                        alt="QRIS Pakasir Code"
                        className="w-full h-full object-contain rounded-xl"
                      />
                    </div>
                    <p className="text-xs text-slate-600 text-center font-medium max-w-sm">
                      Pindai QRIS di atas menggunakan <span className="font-bold text-slate-900">BCA Mobile, Mandiri, BRImo, BNI, GoPay, OVO, ShopeePay, DANA</span>, dll.
                    </p>
                  </div>
                ) : (
                  /* TAMPILAN METODE: VIRTUAL ACCOUNT */
                  <div className="p-4 sm:p-5 bg-blue-50/70 border-2 border-blue-200 rounded-2xl space-y-3 text-center">
                    <span className="text-xs font-bold text-slate-600 uppercase tracking-wider block">
                      Nomor Virtual Account ({paymentData.payment_method.toUpperCase()})
                    </span>
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-2xl sm:text-3xl font-mono font-black text-[#0055aa] tracking-widest">
                        {paymentData.va_number || '-'}
                      </span>
                      {paymentData.va_number && (
                        <button
                          type="button"
                          onClick={() => copyToClipboard(paymentData.va_number!)}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all cursor-pointer"
                        >
                          {copiedVa ? 'Tersalin!' : 'Salin'}
                        </button>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Transfer nominal tepat sesuai total tagihan agar pembayaran terverifikasi otomatis.
                    </p>
                  </div>
                )}

                {/* Ringkasan Nominal */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Total Atlet:</span>
                    <span className="font-bold text-slate-900">{paymentData.total_atlet || atlets.length} Orang</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Subtotal Atlet:</span>
                    <span className="font-bold text-slate-900">{formatRupiah(paymentData.subtotal || subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Biaya Admin Sistem:</span>
                    <span className="font-bold text-slate-900">Rp 5.000</span>
                  </div>
                  <div className="flex justify-between border-t pt-2 text-sm">
                    <span className="font-extrabold text-slate-900">Total Pembayaran:</span>
                    <span className="font-black text-emerald-700 text-base">{formatRupiah(paymentData.total_payment || totalAmount)}</span>
                  </div>
                </div>

                {/* Tombol Aksi Cek Status Manual */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                  <button
                    type="button"
                    onClick={checkStatus}
                    disabled={checkingStatus}
                    className="w-full sm:w-auto py-3 px-6 bg-gradient-to-r from-[#00d2ff] to-[#00b4d8] hover:from-[#00b4d8] hover:to-[#0099ff] text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <span className="material-symbols-outlined text-sm">sync</span>
                    <span>{checkingStatus ? 'Memeriksa...' : 'Cek Status Pembayaran'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setPaymentData(null);
                      setPaymentStatus('idle');
                    }}
                    className="text-xs font-semibold text-slate-500 hover:text-slate-800 underline cursor-pointer"
                  >
                    Ganti Metode Pembayaran
                  </button>
                </div>
              </div>
            ) : (
              /* FORM PILIH METODE BAYAR & RINCIAN TAGIHAN */
              <div className="space-y-6">

                {/* 1. RINGKASAN DATA KONTINGEN & DAFTAR ATLET */}
                <div className="p-4 sm:p-6 bg-white/95 backdrop-blur-md rounded-3xl border-2 border-slate-300 shadow-xl space-y-4">
                  <div className="flex items-center justify-between border-b pb-3 flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <span className="w-8 h-8 rounded-xl bg-cyan-100 text-[#0099ff] flex items-center justify-center font-bold">
                        <span className="material-symbols-outlined text-lg">groups</span>
                      </span>
                      <h3 className="font-black text-sm sm:text-base text-slate-900 uppercase">
                        Data Kontingen &amp; Atlet Terdaftar
                      </h3>
                    </div>
                    <div className="flex items-center gap-3">
                      {isAuthenticated ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Akun: {user?.namaKontingen}</span>
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => openAuthModal('login')}
                          className="text-xs font-bold text-cyan-600 hover:text-cyan-800 hover:underline cursor-pointer flex items-center gap-1"
                        >
                          <User className="w-3.5 h-3.5" />
                          <span>Masuk Akun</span>
                        </button>
                      )}
                      <Link
                        href="/silat/kontingen"
                        className="text-xs font-bold text-[#ff007f] hover:underline"
                      >
                        + Tambah/Edit Atlet
                      </Link>
                    </div>
                  </div>

                  {/* Input Nama Kontingen & PIC */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div>
                      <label className="block text-slate-700 font-bold mb-1">Nama Kontingen</label>
                      <input
                        type="text"
                        placeholder="Contoh: Kontingen Mojokerto"
                        value={kontingenName}
                        onChange={(e) => setKontingenName(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl outline-none focus:border-[#00b4d8] font-semibold text-slate-900"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-bold mb-1">Nama Official / PIC</label>
                      <input
                        type="text"
                        placeholder="Nama penanggung jawab"
                        value={picName}
                        onChange={(e) => setPicName(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl outline-none focus:border-[#00b4d8] font-semibold text-slate-900"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-bold mb-1">WhatsApp PIC</label>
                      <input
                        type="text"
                        placeholder="0812xxxxxxxx"
                        value={picPhone}
                        onChange={(e) => setPicPhone(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl outline-none focus:border-[#00b4d8] font-semibold text-slate-900"
                      />
                    </div>
                  </div>

                  {/* Rincian Berdasarkan 11 Kategori */}
                  <div className="pt-2">
                    <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider block mb-2">
                      Rincian Biaya per Kategori ({atlets.length} Atlet):
                    </span>
                    {isAuthLoading || (isAuthenticated && !isLoaded) || isFetchingData ? (
                      <div className="p-6 bg-slate-50 border border-slate-200 rounded-xl text-center text-xs text-slate-500 flex flex-col items-center justify-center gap-2">
                        <div className="w-5 h-5 border-2 border-[#00b4d8] border-t-transparent rounded-full animate-spin" />
                        <span>Memuat data atlet & tagihan dari cloud...</span>
                      </div>
                    ) : atlets.length === 0 ? (
                      <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-center text-xs text-amber-800">
                        Belum ada atlet yang terdaftar di sistem. Silakan isi data kontingen terlebih dahulu.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        {Object.entries(breakdownByCategory).map(([kat, data]) => (
                          <div
                            key={kat}
                            className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between"
                          >
                            <div>
                              <span className="font-bold text-slate-900 block">{kat}</span>
                              <span className="text-[11px] text-slate-500">
                                {data.count} atlet × {formatRupiah(data.price)}
                              </span>
                            </div>
                            <span className="font-extrabold text-[#0066cc]">
                              {formatRupiah(data.total)}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* 2. PILIHAN METODE PEMBAYARAN PAKASIR */}
                <div className="p-4 sm:p-6 bg-white/95 backdrop-blur-md rounded-3xl border-2 border-slate-300 shadow-xl space-y-4">
                  <div className="flex items-center gap-2 border-b pb-3">
                    <span className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">
                      <span className="material-symbols-outlined text-lg">payment</span>
                    </span>
                    <h3 className="font-black text-sm sm:text-base text-slate-900 uppercase">
                      Pilih Metode Pembayaran Pakasir
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {PAYMENT_METHODS.map((method) => {
                      const isSelected = selectedMethod === method.id;
                      return (
                        <div
                          key={method.id}
                          onClick={() => setSelectedMethod(method.id)}
                          className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${isSelected
                            ? 'border-[#00b4d8] bg-cyan-50/50 shadow-md ring-2 ring-[#00b4d8]/30'
                            : 'border-slate-200 hover:border-slate-300 bg-white'
                            }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <span className="material-symbols-outlined text-xl text-slate-700">
                                {method.icon}
                              </span>
                              <span className="font-extrabold text-xs text-slate-900">
                                {method.name}
                              </span>
                            </div>
                            <span
                              className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full border ${method.badgeColor}`}
                            >
                              {method.badge}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-500 mt-2">{method.desc}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 3. TOTAL PEMBAYARAN & TOMBOL BAYAR SEKARANG */}
                <div className="p-4 sm:p-6 bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-3xl shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#00e5ff] block">
                      TOTAL TAGIHAN KONTINGEN
                    </span>
                    <div className="text-2xl sm:text-3xl font-black text-white">
                      {formatRupiah(totalAmount)}
                    </div>
                    <span className="text-[11px] text-slate-400 block mt-0.5">
                      Subtotal ({atlets.length} Atlet): {formatRupiah(subtotal)} + Biaya Admin: Rp 5.000
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={handleCreatePayment}
                    disabled={loading || atlets.length === 0}
                    className="w-full sm:w-auto py-3.5 px-8 sm:px-10 bg-gradient-to-r from-[#00e676] to-[#00c853] hover:from-[#00d46d] hover:to-[#00b34a] text-white font-black text-base sm:text-lg tracking-wider uppercase rounded-2xl shadow-lg shadow-emerald-500/30 border-2 border-white transform hover:scale-105 active:scale-95 transition-all text-center cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'MEMPROSES...' : 'BAYAR SEKARANG'}
                  </button>
                </div>

              </div>
            )}

          </div>

          {/* PILAR KANAN: SPONSORSHIP */}
          <SilatSponsorPillar variant="tosca" height="h-[520px] lg:h-[600px]" />
        </div>

        {/* BOTTOM: NAVIGASI KEMBALI KE HUB PENDAFTARAN */}
        <div className="mt-8 text-center">
          <Link
            href="/silat/daftar"
            className="text-xs font-semibold text-slate-600 hover:text-[#0088cc] transition-colors inline-flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            <span>Kembali ke Hub Pendaftaran Silat</span>
          </Link>
        </div>

      </main>

      {/* MODAL AUTENTIKASI KONTINGEN */}
      <ModalAuthKontingen
        isOpen={isAuthModalOpen}
        onClose={closeAuthModal}
        initialMode={authModalMode}
      />
    </div>
  );
}
