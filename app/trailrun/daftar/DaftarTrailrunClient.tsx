'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import trailrunData from '@/data/trailrun.json';
import { TrailrunCard } from '@/lib/types';
import { submitTrailrunRegistration } from '@/lib/api';

const categories = trailrunData.categories as TrailrunCard[];

const PROVINSI_LIST = [
  'Aceh', 'Sumatera Utara', 'Sumatera Barat', 'Riau', 'Jambi', 'Sumatera Selatan',
  'Bengkulu', 'Lampung', 'Kepulauan Bangka Belitung', 'Kepulauan Riau',
  'DKI Jakarta', 'Jawa Barat', 'Jawa Tengah', 'DI Yogyakarta', 'Jawa Timur', 'Banten',
  'Bali', 'Nusa Tenggara Barat', 'Nusa Tenggara Timur',
  'Kalimantan Barat', 'Kalimantan Tengah', 'Kalimantan Selatan', 'Kalimantan Timur', 'Kalimantan Utara',
  'Sulawesi Utara', 'Sulawesi Tengah', 'Sulawesi Selatan', 'Sulawesi Tenggara', 'Gorontalo', 'Sulawesi Barat',
  'Maluku', 'Maluku Utara', 'Papua', 'Papua Barat', 'Papua Tengah', 'Papua Pegunungan', 'Papua Selatan', 'Papua Barat Daya',
];

const PAYMENT_METHODS = [
  { id: 'qris', label: 'QRIS', desc: 'Gopay, OVO, Dana, ShopeePay, dll', icon: 'qr_code_2' },
  { id: 'bri_va', label: 'BRI Virtual Account', desc: 'Transfer via BRI', icon: 'account_balance' },
  { id: 'bni_va', label: 'BNI Virtual Account', desc: 'Transfer via BNI', icon: 'account_balance' },
  { id: 'mandiri_va', label: 'Mandiri Virtual Account', desc: 'Transfer via Mandiri', icon: 'account_balance' },
  { id: 'permata_va', label: 'Permata Virtual Account', desc: 'Transfer via Permata', icon: 'account_balance' },
];

type FormStep = 1 | 2 | 3 | 4;

interface PaymentData {
  txn_id: string;
  order_id: string;
  amount: number;
  total_payment: number;
  fee: number;
  payment_method: string;
  qr_string?: string;
  va_number?: string;
  payment_link?: string;
  expired_at: string;
  is_sandbox: boolean;
}

export default function DaftarTrailrunClient() {
  const searchParams = useSearchParams();
  const distParam = searchParams.get('dist') || '';

  const [currentStep, setCurrentStep] = useState<FormStep>(1);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [registrationId, setRegistrationId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('qris');
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'pending' | 'completed' | 'error'>('idle');
  const [showSuccess, setShowSuccess] = useState(false);

  const [formData, setFormData] = useState({
    nama: '',
    email: '',
    no_bib: '',
    no_hp: '',
    alamat: '',
    kota: '',
    provinsi: '',
    kewarganegaraan: 'Indonesia',
    tanggal_lahir: '',
    jenis_kelamin: '' as 'Laki-laki' | 'Perempuan' | '',
    nama_komunitas: '',
    golongan_darah: '' as 'A' | 'B' | 'AB' | 'O' | '',
    riwayat_medis: '',
    kontak_darurat: '',
    kategori: distParam,
  });

  const selectedCategory = categories.find((c) => c.id === formData.kategori);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errorMsg) setErrorMsg('');
  };

  const validateStep = (step: FormStep): boolean => {
    switch (step) {
      case 1:
        if (!formData.nama.trim()) return fail('Nama lengkap wajib diisi.');
        if (!formData.email.trim() || !formData.email.includes('@'))
          return fail('Email tidak valid.');
        if (!formData.no_hp.trim()) return fail('No. telepon/WhatsApp wajib diisi.');
        if (!formData.tanggal_lahir) return fail('Tanggal lahir wajib diisi.');
        if (!formData.jenis_kelamin) return fail('Jenis kelamin wajib dipilih.');
        return true;
      case 2:
        if (!formData.alamat.trim()) return fail('Alamat wajib diisi.');
        if (!formData.kota.trim()) return fail('Kota wajib diisi.');
        if (!formData.provinsi) return fail('Provinsi wajib dipilih.');
        if (!formData.kewarganegaraan.trim()) return fail('Kewarganegaraan wajib diisi.');
        if (!formData.golongan_darah) return fail('Golongan darah wajib dipilih.');
        if (!formData.kontak_darurat.trim()) return fail('Kontak darurat wajib diisi.');
        return true;
      case 3:
        if (!formData.kategori) return fail('Kategori lomba wajib dipilih.');
        return true;
      default:
        return true;
    }
  };

  function fail(msg: string) {
    setErrorMsg(msg);
    return false;
  }

  const goNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 4) as FormStep);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const goBack = () => {
    if (currentStep === 4 && paymentStatus === 'pending') return; // prevent going back during payment
    setCurrentStep((prev) => Math.max(prev - 1, 1) as FormStep);
    setErrorMsg('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Step 3 → Submit registration → then go to Step 4 (payment)
  const handleSubmitRegistration = async () => {
    if (!validateStep(3)) return;

    setLoading(true);
    setErrorMsg('');

    try {
      const res = await submitTrailrunRegistration({
        nama: formData.nama,
        email: formData.email,
        no_bib: formData.no_bib,
        no_hp: formData.no_hp,
        alamat: formData.alamat,
        kota: formData.kota,
        provinsi: formData.provinsi,
        kewarganegaraan: formData.kewarganegaraan,
        tanggal_lahir: formData.tanggal_lahir,
        jenis_kelamin: formData.jenis_kelamin as 'Laki-laki' | 'Perempuan',
        nama_komunitas: formData.nama_komunitas,
        golongan_darah: formData.golongan_darah as 'A' | 'B' | 'AB' | 'O',
        riwayat_medis: formData.riwayat_medis,
        kontak_darurat: formData.kontak_darurat,
        kategori: formData.kategori,
      });

      if (res.success && res.registration_id) {
        setRegistrationId(res.registration_id);
        setCurrentStep(4);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        setErrorMsg(res.error || 'Gagal mengirim pendaftaran.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Terjadi kesalahan sistem.');
    } finally {
      setLoading(false);
    }
  };

  // Step 4 → Create payment via Pakasir
  const handleCreatePayment = async () => {
    setLoading(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/payment/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          registration_id: registrationId,
          kategori: formData.kategori,
          payment_method: paymentMethod,
        }),
      });

      const result = await res.json();

      if (result.success) {
        setPaymentData(result.data);
        setPaymentStatus('pending');
      } else {
        setErrorMsg(result.error || 'Gagal membuat pembayaran.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Terjadi kesalahan sistem.');
    } finally {
      setLoading(false);
    }
  };

  const [checkingStatus, setCheckingStatus] = useState(false);

  // Poll payment status every 12 seconds or trigger manually
  const checkPaymentStatus = useCallback(async (isManual = false) => {
    if (!paymentData?.txn_id) return;
    if (isManual) setCheckingStatus(true);

    try {
      const res = await fetch(`/api/payment/status?txn_id=${paymentData.txn_id}`);
      const result = await res.json();

      if (result.success && (result.data?.status === 'completed' || result.data?.status === 'settled')) {
        setPaymentStatus('completed');
        setShowSuccess(true);
      }
    } catch {
      // Silently ignore polling errors
    } finally {
      if (isManual) setCheckingStatus(false);
    }
  }, [paymentData?.txn_id]);

  useEffect(() => {
    if (paymentStatus !== 'pending') return;

    const interval = setInterval(() => {
      checkPaymentStatus(false);
    }, 12000);
    return () => clearInterval(interval);
  }, [paymentStatus, checkPaymentStatus]);

  const stepLabels = ['Data Pribadi', 'Alamat & Medis', 'Kategori Lomba', 'Pembayaran'];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
  };

  const formatExpiry = (dateStr?: string | null) => {
    if (!dateStr) {
      const d = new Date(Date.now() + 24 * 60 * 60 * 1000);
      return d.toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' });
    }
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) {
      const dFallback = new Date(Date.now() + 24 * 60 * 60 * 1000);
      return dFallback.toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' });
    }
    return d.toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' });
  };

  return (
    <main className="min-h-screen bg-[#f8f8f8] text-slate-800 pt-20">
      {/* ===== HERO BANNER ===== */}
      <section className="relative w-full h-[340px] sm:h-[400px] overflow-hidden">
        <div className="absolute inset-0 bg-black z-0">
          <img
            src="/assets/jiwandana_trailrun_1.jpeg"
            alt="Trailrun Lintas Candi Majapahit"
            className="w-full h-full object-cover opacity-50 scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#f8f8f8] via-black/30 to-black/70" />
        </div>
        <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/50 border border-[#C9A227]/60 text-[10px] sm:text-xs font-semibold uppercase tracking-widest text-[#C9A227] backdrop-blur-md shadow-lg mb-4">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Pendaftaran Online Resmi</span>
          </div>
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-serif font-bold text-white tracking-wide leading-tight drop-shadow-md">
            Formulir Pendaftaran
          </h1>
          <p className="text-xs sm:text-sm md:text-base text-slate-200 max-w-xl mx-auto mt-3 leading-relaxed drop-shadow">
            Isi formulir di bawah untuk mendaftar sebagai peserta Trailrun Lintas Candi Majapahit
          </p>
        </div>
      </section>

      {/* ===== FORM SECTION ===== */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 -mt-10 relative z-20 pb-20">
        {/* STEP INDICATOR */}
        <div className="bg-white border border-black/10 rounded-2xl p-4 sm:p-5 mb-6 shadow-sm">
          <div className="flex items-center justify-between">
            {stepLabels.map((label, i) => {
              const stepNum = (i + 1) as FormStep;
              const isActive = currentStep === stepNum;
              const isDone = currentStep > stepNum;
              return (
                <div key={label} className="flex items-center gap-1.5 sm:gap-3 flex-1">
                  <div
                    className={`w-7 h-7 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-[10px] sm:text-sm font-bold transition-all duration-300 shrink-0 ${
                      isDone
                        ? 'bg-emerald-500 text-white'
                        : isActive
                        ? 'bg-[#C9A227] text-[#0d1c32] shadow-md'
                        : 'bg-slate-100 text-slate-400 border border-black/10'
                    }`}
                  >
                    {isDone ? (
                      <span className="material-symbols-outlined text-sm">check</span>
                    ) : (
                      stepNum
                    )}
                  </div>
                  <span className="hidden lg:block text-[11px] text-slate-500 font-medium">{label}</span>
                  {i < stepLabels.length - 1 && (
                    <div
                      className={`flex-1 h-[2px] rounded-full mx-1 sm:mx-2 transition-colors duration-300 ${
                        isDone ? 'bg-emerald-400' : 'bg-slate-200'
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
          <p className="lg:hidden text-center text-xs font-semibold text-[#C9A227] mt-3 uppercase tracking-wider">
            {stepLabels[currentStep - 1]}
          </p>
        </div>

        {/* ERROR MESSAGE */}
        {errorMsg && (
          <div className="mb-4 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm flex items-center gap-3 animate-[fadeIn_0.3s_ease-out]">
            <span className="material-symbols-outlined text-rose-600 text-lg">error</span>
            <span>{errorMsg}</span>
          </div>
        )}

        {/* FORM CARD */}
        <form onSubmit={(e) => e.preventDefault()}>
          <div className="bg-white border border-black/10 rounded-2xl shadow-sm overflow-hidden">
            {/* ===== STEP 1: DATA PRIBADI ===== */}
            {currentStep === 1 && (
              <div className="p-6 sm:p-8 space-y-5 animate-[fadeIn_0.4s_ease-out]">
                <div className="flex items-center gap-3 pb-4 border-b border-black/5">
                  <div className="w-9 h-9 rounded-xl bg-[#C9A227]/10 border border-[#C9A227]/30 flex items-center justify-center text-[#C9A227]">
                    <span className="material-symbols-outlined text-lg">person</span>
                  </div>
                  <div>
                    <h2 className="text-base sm:text-lg font-bold text-slate-900 font-serif">Data Pribadi</h2>
                    <p className="text-[11px] text-slate-500">Informasi identitas peserta</p>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="nama" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Nama Lengkap <span className="text-rose-500">*</span>
                  </label>
                  <input type="text" id="nama" name="nama" required value={formData.nama} onChange={handleChange}
                    placeholder="Masukkan nama lengkap sesuai KTP"
                    className="w-full bg-[#f8f8f8] border border-black/10 focus:border-[#C9A227] focus:ring-1 focus:ring-[#C9A227] text-slate-800 placeholder-slate-400 rounded-xl px-4 py-3.5 transition-all text-sm outline-none" />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="email" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Email <span className="text-rose-500">*</span>
                  </label>
                  <input type="email" id="email" name="email" required value={formData.email} onChange={handleChange}
                    placeholder="email@example.com"
                    className="w-full bg-[#f8f8f8] border border-black/10 focus:border-[#C9A227] focus:ring-1 focus:ring-[#C9A227] text-slate-800 placeholder-slate-400 rounded-xl px-4 py-3.5 transition-all text-sm outline-none" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label htmlFor="no_bib" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">No. BIB</label>
                    <input type="text" id="no_bib" name="no_bib" value={formData.no_bib} onChange={handleChange}
                      placeholder="Opsional / dari panitia"
                      className="w-full bg-[#f8f8f8] border border-black/10 focus:border-[#C9A227] focus:ring-1 focus:ring-[#C9A227] text-slate-800 placeholder-slate-400 rounded-xl px-4 py-3.5 transition-all text-sm outline-none" />
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="no_hp" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      No. Telepon / WhatsApp <span className="text-rose-500">*</span>
                    </label>
                    <input type="tel" id="no_hp" name="no_hp" required value={formData.no_hp} onChange={handleChange}
                      placeholder="08xxxxxxxxxx"
                      className="w-full bg-[#f8f8f8] border border-black/10 focus:border-[#C9A227] focus:ring-1 focus:ring-[#C9A227] text-slate-800 placeholder-slate-400 rounded-xl px-4 py-3.5 transition-all text-sm outline-none" />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label htmlFor="tanggal_lahir" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      Tanggal Lahir <span className="text-rose-500">*</span>
                    </label>
                    <input type="date" id="tanggal_lahir" name="tanggal_lahir" required value={formData.tanggal_lahir} onChange={handleChange}
                      className="w-full bg-[#f8f8f8] border border-black/10 focus:border-[#C9A227] focus:ring-1 focus:ring-[#C9A227] text-slate-800 rounded-xl px-4 py-3.5 transition-all text-sm outline-none" />
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="jenis_kelamin" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      Jenis Kelamin <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <select id="jenis_kelamin" name="jenis_kelamin" required value={formData.jenis_kelamin} onChange={handleChange}
                        className="w-full bg-[#f8f8f8] border border-black/10 focus:border-[#C9A227] focus:ring-1 focus:ring-[#C9A227] text-slate-800 rounded-xl px-4 py-3.5 transition-all text-sm outline-none appearance-none cursor-pointer">
                        <option value="" disabled>Pilih...</option>
                        <option value="Laki-laki">Laki-laki</option>
                        <option value="Perempuan">Perempuan</option>
                      </select>
                      <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-lg">keyboard_arrow_down</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="nama_komunitas" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">Nama Komunitas / Club</label>
                  <input type="text" id="nama_komunitas" name="nama_komunitas" value={formData.nama_komunitas} onChange={handleChange}
                    placeholder="Opsional — nama running club / komunitas"
                    className="w-full bg-[#f8f8f8] border border-black/10 focus:border-[#C9A227] focus:ring-1 focus:ring-[#C9A227] text-slate-800 placeholder-slate-400 rounded-xl px-4 py-3.5 transition-all text-sm outline-none" />
                </div>
              </div>
            )}

            {/* ===== STEP 2: ALAMAT & DATA MEDIS ===== */}
            {currentStep === 2 && (
              <div className="p-6 sm:p-8 space-y-5 animate-[fadeIn_0.4s_ease-out]">
                <div className="flex items-center gap-3 pb-4 border-b border-black/5">
                  <div className="w-9 h-9 rounded-xl bg-[#C9A227]/10 border border-[#C9A227]/30 flex items-center justify-center text-[#C9A227]">
                    <span className="material-symbols-outlined text-lg">location_on</span>
                  </div>
                  <div>
                    <h2 className="text-base sm:text-lg font-bold text-slate-900 font-serif">Alamat & Data Medis</h2>
                    <p className="text-[11px] text-slate-500">Informasi domisili dan kesehatan</p>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="alamat" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">Alamat Lengkap <span className="text-rose-500">*</span></label>
                  <textarea id="alamat" name="alamat" required rows={2} value={formData.alamat} onChange={handleChange}
                    placeholder="Jalan, RT/RW, Kelurahan, Kecamatan"
                    className="w-full bg-[#f8f8f8] border border-black/10 focus:border-[#C9A227] focus:ring-1 focus:ring-[#C9A227] text-slate-800 placeholder-slate-400 rounded-xl px-4 py-3.5 transition-all text-sm outline-none resize-none" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label htmlFor="kota" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">Kota / Kabupaten <span className="text-rose-500">*</span></label>
                    <input type="text" id="kota" name="kota" required value={formData.kota} onChange={handleChange}
                      placeholder="Contoh: Mojokerto"
                      className="w-full bg-[#f8f8f8] border border-black/10 focus:border-[#C9A227] focus:ring-1 focus:ring-[#C9A227] text-slate-800 placeholder-slate-400 rounded-xl px-4 py-3.5 transition-all text-sm outline-none" />
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="provinsi" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">Provinsi <span className="text-rose-500">*</span></label>
                    <div className="relative">
                      <select id="provinsi" name="provinsi" required value={formData.provinsi} onChange={handleChange}
                        className="w-full bg-[#f8f8f8] border border-black/10 focus:border-[#C9A227] focus:ring-1 focus:ring-[#C9A227] text-slate-800 rounded-xl px-4 py-3.5 transition-all text-sm outline-none appearance-none cursor-pointer">
                        <option value="" disabled>Pilih provinsi...</option>
                        {PROVINSI_LIST.map((p) => (
                          <option key={p} value={p}>{p}</option>
                        ))}
                      </select>
                      <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-lg">keyboard_arrow_down</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="kewarganegaraan" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">Kewarganegaraan <span className="text-rose-500">*</span></label>
                  <input type="text" id="kewarganegaraan" name="kewarganegaraan" required value={formData.kewarganegaraan} onChange={handleChange}
                    placeholder="Contoh: Indonesia"
                    className="w-full bg-[#f8f8f8] border border-black/10 focus:border-[#C9A227] focus:ring-1 focus:ring-[#C9A227] text-slate-800 placeholder-slate-400 rounded-xl px-4 py-3.5 transition-all text-sm outline-none" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">Golongan Darah <span className="text-rose-500">*</span></label>
                    <div className="flex gap-2">
                      {(['A', 'B', 'AB', 'O'] as const).map((gd) => (
                        <button key={gd} type="button"
                          onClick={() => setFormData((prev) => ({ ...prev, golongan_darah: gd }))}
                          className={`flex-1 py-3 rounded-xl font-bold text-sm uppercase tracking-wider transition-all duration-200 border cursor-pointer ${
                            formData.golongan_darah === gd
                              ? 'bg-[#C9A227] text-[#0d1c32] border-[#C9A227] shadow-md'
                              : 'bg-[#f8f8f8] text-slate-600 border-black/10 hover:border-[#C9A227]/50'
                          }`}>
                          {gd}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="kontak_darurat" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">Kontak Darurat <span className="text-rose-500">*</span></label>
                    <input type="text" id="kontak_darurat" name="kontak_darurat" required value={formData.kontak_darurat} onChange={handleChange}
                      placeholder="Nama & No. HP keluarga/kerabat"
                      className="w-full bg-[#f8f8f8] border border-black/10 focus:border-[#C9A227] focus:ring-1 focus:ring-[#C9A227] text-slate-800 placeholder-slate-400 rounded-xl px-4 py-3.5 transition-all text-sm outline-none" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="riwayat_medis" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">Riwayat Medis</label>
                  <textarea id="riwayat_medis" name="riwayat_medis" rows={3} value={formData.riwayat_medis} onChange={handleChange}
                    placeholder="Opsional — riwayat penyakit, alergi obat, atau kondisi medis lain yang perlu diketahui panitia"
                    className="w-full bg-[#f8f8f8] border border-black/10 focus:border-[#C9A227] focus:ring-1 focus:ring-[#C9A227] text-slate-800 placeholder-slate-400 rounded-xl px-4 py-3.5 transition-all text-sm outline-none resize-none" />
                  <p className="text-[10px] text-slate-400 flex items-center gap-1">
                    <span className="material-symbols-outlined text-xs">info</span>
                    Data medis dijaga kerahasiaannya dan hanya digunakan oleh tim medis event.
                  </p>
                </div>
              </div>
            )}

            {/* ===== STEP 3: KATEGORI LOMBA ===== */}
            {currentStep === 3 && (
              <div className="p-6 sm:p-8 space-y-5 animate-[fadeIn_0.4s_ease-out]">
                <div className="flex items-center gap-3 pb-4 border-b border-black/5">
                  <div className="w-9 h-9 rounded-xl bg-[#C9A227]/10 border border-[#C9A227]/30 flex items-center justify-center text-[#C9A227]">
                    <span className="material-symbols-outlined text-lg">directions_run</span>
                  </div>
                  <div>
                    <h2 className="text-base sm:text-lg font-bold text-slate-900 font-serif">Kategori Lomba</h2>
                    <p className="text-[11px] text-slate-500">Pilih jarak lomba yang ingin Anda ikuti</p>
                  </div>
                </div>

                <div className="space-y-3">
                  {categories.map((cat) => {
                    const isSelected = formData.kategori === cat.id;
                    return (
                      <button key={cat.id} type="button"
                        onClick={() => setFormData((prev) => ({ ...prev, kategori: cat.id }))}
                        className={`w-full text-left p-4 sm:p-5 rounded-xl border-2 transition-all duration-300 cursor-pointer group ${
                          isSelected ? 'border-[#C9A227] bg-[#C9A227]/5 shadow-md' : 'border-black/10 bg-white hover:border-[#C9A227]/40 hover:bg-[#f8f8f8]'
                        }`}>
                        <div className="flex items-center gap-4">
                          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                            isSelected ? 'border-[#C9A227] bg-[#C9A227]' : 'border-slate-300 group-hover:border-[#C9A227]/50'
                          }`}>
                            {isSelected && <span className="material-symbols-outlined text-white text-sm">check</span>}
                          </div>
                          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border border-black/10 shrink-0 bg-slate-100">
                            <img src={cat.bannerImage} alt={cat.categoryName} className="w-full h-full object-cover" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className={`text-sm sm:text-base font-bold transition-colors ${isSelected ? 'text-[#C9A227]' : 'text-slate-900'}`}>{cat.categoryName}</h3>
                              <span className="px-2 py-0.5 rounded-full bg-slate-100 text-[10px] font-semibold text-slate-600 border border-black/5">{cat.badge}</span>
                            </div>
                            <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5 line-clamp-1">{cat.description}</p>
                            <div className="flex items-center gap-3 mt-2 text-[10px] sm:text-[11px] text-slate-500">
                              <span className="flex items-center gap-1"><span className="material-symbols-outlined text-xs text-[#C9A227]">route</span>{cat.distance}</span>
                              <span className="flex items-center gap-1"><span className="material-symbols-outlined text-xs text-[#C9A227]">landscape</span>{cat.elevationGain}</span>
                              <span className="flex items-center gap-1"><span className="material-symbols-outlined text-xs text-[#C9A227]">timer</span>{cat.cutOffTime}</span>
                            </div>
                          </div>
                          <div className="hidden sm:block text-right shrink-0">
                            <span className="text-[10px] text-slate-400 font-semibold uppercase block">Mulai</span>
                            <span className={`text-base font-bold ${isSelected ? 'text-[#C9A227]' : 'text-slate-900'}`}>{cat.prices.early}</span>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Review Data Summary */}
                <div className="bg-slate-950 rounded-xl border border-white/10 p-5 space-y-4 text-white">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#C9A227]">
                    <span className="material-symbols-outlined text-sm">fact_check</span>
                    Ringkasan Pendaftaran
                  </div>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-xs">
                    <SummaryRow label="Nama" value={formData.nama} />
                    <SummaryRow label="Email" value={formData.email} />
                    <SummaryRow label="No. HP" value={formData.no_hp} />
                    <SummaryRow label="Tanggal Lahir" value={formData.tanggal_lahir} />
                    <SummaryRow label="Jenis Kelamin" value={formData.jenis_kelamin} />
                    <SummaryRow label="Kota" value={`${formData.kota}, ${formData.provinsi}`} />
                    <SummaryRow label="Gol. Darah" value={formData.golongan_darah} />
                    <SummaryRow label="Kontak Darurat" value={formData.kontak_darurat} />
                    {formData.nama_komunitas && <SummaryRow label="Komunitas" value={formData.nama_komunitas} />}
                    {formData.no_bib && <SummaryRow label="No. BIB" value={formData.no_bib} />}
                  </div>
                </div>
              </div>
            )}

            {/* ===== STEP 4: PEMBAYARAN ===== */}
            {currentStep === 4 && (
              <div className="p-6 sm:p-8 space-y-5 animate-[fadeIn_0.4s_ease-out]">
                <div className="flex items-center gap-3 pb-4 border-b border-black/5">
                  <div className="w-9 h-9 rounded-xl bg-[#C9A227]/10 border border-[#C9A227]/30 flex items-center justify-center text-[#C9A227]">
                    <span className="material-symbols-outlined text-lg">payments</span>
                  </div>
                  <div>
                    <h2 className="text-base sm:text-lg font-bold text-slate-900 font-serif">Pembayaran</h2>
                    <p className="text-[11px] text-slate-500">Pilih metode pembayaran dan selesaikan transaksi</p>
                  </div>
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
                              <img src={selectedCategory.bannerImage} alt={selectedCategory.categoryName} className="w-full h-full object-cover" />
                            </div>
                            <div>
                              <h4 className="text-sm font-bold text-slate-900">{selectedCategory.categoryName}</h4>
                              <p className="text-[11px] text-slate-500">{selectedCategory.distance} • {selectedCategory.elevationGain}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Total</span>
                            <span className="text-lg font-bold text-[#C9A227]">{selectedCategory.prices.presale}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Payment Method Selector */}
                    <div className="space-y-2">
                      <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider block">Metode Pembayaran</span>
                      <div className="space-y-2">
                        {PAYMENT_METHODS.map((pm) => (
                          <button key={pm.id} type="button"
                            onClick={() => setPaymentMethod(pm.id)}
                            className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer flex items-center gap-3 ${
                              paymentMethod === pm.id
                                ? 'border-[#C9A227] bg-[#C9A227]/5'
                                : 'border-black/10 hover:border-[#C9A227]/40'
                            }`}>
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                              paymentMethod === pm.id ? 'border-[#C9A227] bg-[#C9A227]' : 'border-slate-300'
                            }`}>
                              {paymentMethod === pm.id && <div className="w-2 h-2 rounded-full bg-white" />}
                            </div>
                            <div className="w-9 h-9 rounded-lg bg-slate-100 border border-black/5 flex items-center justify-center shrink-0">
                              <span className="material-symbols-outlined text-slate-600 text-lg">{pm.icon}</span>
                            </div>
                            <div>
                              <h4 className={`text-sm font-bold ${paymentMethod === pm.id ? 'text-[#C9A227]' : 'text-slate-800'}`}>{pm.label}</h4>
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
                    <div className={`p-4 rounded-xl border flex items-center gap-3 ${
                      paymentStatus === 'completed'
                        ? 'bg-emerald-50 border-emerald-200'
                        : 'bg-amber-50 border-amber-200'
                    }`}>
                      <span className={`material-symbols-outlined text-xl ${
                        paymentStatus === 'completed' ? 'text-emerald-500' : 'text-amber-500 animate-pulse'
                      }`}>
                        {paymentStatus === 'completed' ? 'check_circle' : 'hourglass_top'}
                      </span>
                      <div>
                        <h4 className={`text-sm font-bold ${paymentStatus === 'completed' ? 'text-emerald-700' : 'text-amber-700'}`}>
                          {paymentStatus === 'completed' ? 'Pembayaran Berhasil!' : 'Menunggu Pembayaran'}
                        </h4>
                        <p className="text-[11px] text-slate-500">
                          {paymentStatus === 'completed'
                            ? 'Transaksi Anda telah dikonfirmasi.'
                            : `Berlaku hingga: ${formatExpiry(paymentData.expired_at)}`}
                        </p>
                      </div>
                    </div>

                    {/* Payment Info */}
                    <div className="bg-slate-950 rounded-xl border border-white/10 p-5 space-y-4 text-white">
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <SummaryRow label="Order ID" value={paymentData.order_id} />
                        <SummaryRow label="Metode" value={paymentData.payment_method.toUpperCase().replace('_', ' ')} />
                        <SummaryRow label="Subtotal" value={formatCurrency(paymentData.amount)} />
                        <SummaryRow label="Biaya Admin" value={formatCurrency(paymentData.fee)} />
                      </div>
                      <div className="pt-3 border-t border-white/10 flex justify-between items-center">
                        <span className="text-xs text-slate-400 uppercase font-semibold">Total Bayar</span>
                        <span className="text-xl font-bold text-[#C9A227]">{formatCurrency(paymentData.total_payment)}</span>
                      </div>
                    </div>

                    {/* QR Code / VA Number / Payment Link */}
                    {paymentData.va_number && (
                      <div className="bg-[#f8f8f8] rounded-xl border border-black/10 p-5 text-center space-y-2">
                        <span className="text-xs text-slate-500 uppercase font-semibold">Nomor Virtual Account</span>
                        <div className="text-2xl sm:text-3xl font-mono font-bold text-slate-900 tracking-wider select-all">
                          {paymentData.va_number}
                        </div>
                        <p className="text-[11px] text-slate-400">Salin nomor di atas dan transfer melalui ATM, Mobile Banking, atau Internet Banking.</p>
                      </div>
                    )}

                    {paymentData.qr_string && (
                      <div className="bg-[#f8f8f8] rounded-xl border border-black/10 p-5 text-center space-y-3">
                        <span className="text-xs text-slate-500 uppercase font-semibold">Scan QRIS</span>
                        <div className="mx-auto w-52 h-52 bg-white rounded-xl border border-black/10 flex items-center justify-center p-2 shadow-sm">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={
                              paymentData.qr_string.startsWith('http') || paymentData.qr_string.startsWith('data:image')
                                ? paymentData.qr_string
                                : `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(paymentData.qr_string)}`
                            }
                            alt="QRIS Code"
                            className="w-full h-full object-contain rounded"
                          />
                        </div>
                        <p className="text-[11px] text-slate-500 font-medium">Buka aplikasi e-wallet (GoPay, OVO, DANA, ShopeePay, BCA, dll) dan scan QR Code di atas.</p>
                      </div>
                    )}

                    {paymentData.payment_link && (
                      <a href={paymentData.payment_link} target="_blank" rel="noopener noreferrer"
                        className="block w-full p-4 bg-[#C9A227] hover:bg-[#b08d20] text-[#0d1c32] rounded-xl font-semibold text-sm uppercase tracking-wider text-center shadow-md transition-all">
                        Bayar via Payment Link →
                      </a>
                    )}

                    {/* Action buttons inside paymentData */}
                    <div className="flex flex-col sm:flex-row gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => checkPaymentStatus(true)}
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
                        onClick={() => {
                          setPaymentData(null);
                          setPaymentStatus('idle');
                        }}
                        className="py-3 px-4 bg-white border border-black/10 hover:border-[#C9A227] text-slate-700 hover:text-[#C9A227] rounded-xl font-semibold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-sm">swap_horiz</span>
                        <span>Ganti Metode</span>
                      </button>
                    </div>

                    {paymentData.is_sandbox && (
                      <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-900 space-y-2.5">
                        <div className="flex items-center gap-2 font-bold text-xs">
                          <span className="material-symbols-outlined text-sm text-amber-600">science</span>
                          <span>Mode Sandbox Pakasir</span>
                        </div>
                        <p className="text-[11px] text-amber-800 leading-relaxed">
                          Transaksi ini adalah simulasi sandbox (tidak memotong saldo sungguhan). Anda dapat mengetes alur konfirmasi pembayaran dengan tombol di bawah:
                        </p>
                        <button
                          type="button"
                          onClick={async () => {
                            setCheckingStatus(true);
                            try {
                              await fetch('/api/pakasir/webhook', {
                                method: 'POST',
                                headers: {
                                  'Content-Type': 'application/json',
                                  'X-Secret': '46ea6cc47b3d104afc55ad3a795ad837',
                                },
                                body: JSON.stringify({
                                  txn_id: paymentData.txn_id,
                                  order_id: paymentData.order_id,
                                  status: 'completed',
                                  amount: paymentData.amount,
                                }),
                              });
                              await checkPaymentStatus(true);
                            } catch (e) {
                              console.error(e);
                            } finally {
                              setCheckingStatus(false);
                            }
                          }}
                          className="w-full py-2.5 px-3 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-semibold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-sm flex items-center justify-center gap-1.5"
                        >
                          <span className="material-symbols-outlined text-sm">check_circle</span>
                          <span>Simulasikan Pembayaran Berhasil</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* ===== FOOTER NAVIGATION ===== */}
            <div className="px-6 sm:px-8 py-5 bg-[#f8f8f8] border-t border-black/5 flex items-center justify-between gap-3">
              {currentStep > 1 && currentStep < 4 ? (
                <button type="button" onClick={goBack}
                  className="px-5 py-3 bg-white border border-black/10 text-slate-700 rounded-xl font-semibold text-xs uppercase tracking-wider hover:border-[#C9A227] hover:text-[#C9A227] transition-all flex items-center gap-1.5 cursor-pointer">
                  <span className="material-symbols-outlined text-sm">arrow_back</span>
                  <span>Kembali</span>
                </button>
              ) : currentStep === 1 ? (
                <Link href="/trailrun"
                  className="px-5 py-3 bg-white border border-black/10 text-slate-700 rounded-xl font-semibold text-xs uppercase tracking-wider hover:border-[#C9A227] hover:text-[#C9A227] transition-all flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-sm">arrow_back</span>
                  <span>Halaman Trailrun</span>
                </Link>
              ) : currentStep === 4 && paymentData && paymentStatus !== 'completed' ? (
                <button
                  type="button"
                  onClick={() => {
                    setPaymentData(null);
                    setPaymentStatus('idle');
                  }}
                  className="px-5 py-3 bg-white border border-black/10 text-slate-700 rounded-xl font-semibold text-xs uppercase tracking-wider hover:border-[#C9A227] hover:text-[#C9A227] transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-sm">swap_horiz</span>
                  <span>Ganti Metode</span>
                </button>
              ) : (
                <div /> /* spacer */
              )}

              {currentStep < 3 && (
                <button type="button" onClick={goNext}
                  className="px-6 py-3 bg-[#C9A227] hover:bg-[#b08d20] text-[#0d1c32] rounded-xl font-semibold text-xs uppercase tracking-wider shadow-md transition-all transform active:scale-95 flex items-center gap-1.5 cursor-pointer">
                  <span>Lanjutkan</span>
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </button>
              )}

              {currentStep === 3 && (
                <button type="button" onClick={handleSubmitRegistration} disabled={loading}
                  className="px-6 py-3 bg-[#C9A227] hover:bg-[#b08d20] disabled:opacity-50 text-[#0d1c32] rounded-xl font-semibold text-xs uppercase tracking-wider shadow-md transition-all transform active:scale-95 flex items-center gap-2 cursor-pointer">
                  {loading ? (
                    <>
                      <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <>
                      <span>Lanjut ke Pembayaran</span>
                      <span className="material-symbols-outlined text-sm">arrow_forward</span>
                    </>
                  )}
                </button>
              )}

              {currentStep === 4 && !paymentData && (
                <button type="button" onClick={handleCreatePayment} disabled={loading}
                  className="px-6 py-3 bg-[#C9A227] hover:bg-[#b08d20] disabled:opacity-50 text-[#0d1c32] rounded-xl font-semibold text-xs uppercase tracking-wider shadow-md transition-all transform active:scale-95 flex items-center gap-2 cursor-pointer">
                  {loading ? (
                    <>
                      <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>
                      <span>Memproses...</span>
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-sm">lock</span>
                      <span>Bayar Sekarang</span>
                    </>
                  )}
                </button>
              )}

              {currentStep === 4 && paymentData && paymentStatus !== 'completed' && (
                <button
                  type="button"
                  onClick={() => checkPaymentStatus(true)}
                  disabled={checkingStatus}
                  className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl font-semibold text-xs uppercase tracking-wider shadow-md transition-all flex items-center gap-2 cursor-pointer"
                >
                  <span className={`material-symbols-outlined text-sm ${checkingStatus ? 'animate-spin' : ''}`}>
                    {checkingStatus ? 'progress_activity' : 'refresh'}
                  </span>
                  <span>{checkingStatus ? 'Mengecek...' : 'Cek Status Pembayaran'}</span>
                </button>
              )}

              {currentStep === 4 && paymentData && paymentStatus === 'completed' && (
                <Link href="/trailrun"
                  className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-semibold text-xs uppercase tracking-wider shadow-md transition-all flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm">check_circle</span>
                  <span>Selesai</span>
                </Link>
              )}
            </div>
          </div>
        </form>
      </section>

      {/* ===== SUCCESS MODAL ===== */}
      {showSuccess && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center px-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-white border border-black/10 rounded-2xl p-8 max-w-md w-full text-center space-y-6 shadow-2xl animate-[fadeIn_0.3s_ease-out]">
            <div className="relative w-20 h-20 mx-auto">
              <div className="absolute inset-0 rounded-full bg-emerald-500/10 animate-ping" />
              <div className="relative w-20 h-20 bg-emerald-500/10 border-2 border-emerald-500 rounded-full flex items-center justify-center">
                <span className="material-symbols-outlined text-emerald-500 text-4xl">check_circle</span>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-bold font-serif text-slate-900">Pembayaran Berhasil!</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Pendaftaran dan pembayaran Anda telah berhasil dikonfirmasi. Silakan cek email <strong>{formData.email}</strong> untuk
                informasi race pack dan technical meeting.
              </p>
            </div>

            {selectedCategory && (
              <div className="bg-[#f8f8f8] rounded-xl p-4 text-sm border border-black/5">
                <div className="font-bold text-slate-900">{selectedCategory.categoryName}</div>
                <div className="text-xs text-slate-500 mt-0.5">{selectedCategory.distance} • {selectedCategory.elevationGain}</div>
              </div>
            )}

            <div className="flex flex-col gap-2">
              <Link href="/trailrun"
                className="w-full bg-[#C9A227] hover:bg-[#b08d20] text-[#0d1c32] font-semibold py-3 rounded-xl transition-colors text-sm uppercase tracking-wider shadow-sm text-center">
                Kembali ke Halaman Trailrun
              </Link>
              <button type="button"
                onClick={() => {
                  setShowSuccess(false);
                  setCurrentStep(1);
                  setRegistrationId('');
                  setPaymentData(null);
                  setPaymentStatus('idle');
                  setPaymentMethod('qris');
                  setFormData({
                    nama: '', email: '', no_bib: '', no_hp: '', alamat: '', kota: '',
                    provinsi: '', kewarganegaraan: 'Indonesia', tanggal_lahir: '',
                    jenis_kelamin: '', nama_komunitas: '', golongan_darah: '',
                    riwayat_medis: '', kontak_darurat: '', kategori: '',
                  });
                }}
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-3 rounded-xl transition-colors text-sm uppercase tracking-wider cursor-pointer">
                Daftarkan Peserta Lain
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="text-[10px] text-slate-400 uppercase font-semibold block">{label}</span>
      <span className="text-white font-medium">{value || '—'}</span>
    </div>
  );
}
