'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import trailrunData from '@/data/trailrun.json';
import { TrailrunCard } from '@/lib/types';
import { submitTrailrunRegistration } from '@/lib/api';
import TrailrunBulkRegister from '@/components/trailrun/TrailrunBulkRegister';

import {
  TrailrunFormData,
  FormStep,
  PaymentData,
  formatCurrency,
  formatExpiry,
} from '@/components/trailrun/registration/types';
import RegistrationStepIndicator from '@/components/trailrun/registration/RegistrationStepIndicator';
import StepKategoriLomba from '@/components/trailrun/registration/StepKategoriLomba';
import StepDataPribadi from '@/components/trailrun/registration/StepDataPribadi';
import StepAlamatMedis from '@/components/trailrun/registration/StepAlamatMedis';
import StepPembayaran from '@/components/trailrun/registration/StepPembayaran';
import RegistrationSuccessModal from '@/components/trailrun/registration/RegistrationSuccessModal';

const categories = trailrunData.categories as TrailrunCard[];

export default function DaftarTrailrunClient() {
  const searchParams = useSearchParams();
  const distParam = searchParams.get('dist') || '';
  const modeParam = searchParams.get('mode') || '';

  const [registerMode, setRegisterMode] = useState<'individual' | 'bulk'>(
    modeParam === 'bulk' ? 'bulk' : 'individual'
  );

  const [currentStep, setCurrentStep] = useState<FormStep>(1);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [registrationId, setRegistrationId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('qris');
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'pending' | 'completed' | 'error'>('idle');
  const [showSuccess, setShowSuccess] = useState(false);
  const [pricingInfoMap, setPricingInfoMap] = useState<Record<string, any>>({});
  const [checkingStatus, setCheckingStatus] = useState(false);

  useEffect(() => {
    fetch('/api/trailrun/pricing')
      .then((res) => res.json())
      .then((data) => {
        if (data) setPricingInfoMap(data);
      })
      .catch((err) => console.warn('Could not fetch pricing in register page:', err));
  }, []);

  const [formData, setFormData] = useState<TrailrunFormData>({
    nama: '',
    email: '',
    no_bib: '',
    no_hp: '',
    alamat: '',
    kota: '',
    provinsi: '',
    kewarganegaraan: 'Indonesia',
    tanggal_lahir: '',
    jenis_kelamin: '',
    nama_komunitas: '',
    golongan_darah: '',
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

  const handleSelectCategory = (catId: string) => {
    setFormData((prev) => ({ ...prev, kategori: catId }));
    if (errorMsg) setErrorMsg('');
  };

  const handleSelectGolonganDarah = (gd: 'A' | 'B' | 'AB' | 'O') => {
    setFormData((prev) => ({ ...prev, golongan_darah: gd }));
    if (errorMsg) setErrorMsg('');
  };

  const validateStep = (step: FormStep): boolean => {
    switch (step) {
      case 1:
        if (!formData.kategori) return fail('Kategori lomba wajib dipilih.');
        return true;
      case 2:
        if (!formData.nama.trim()) return fail('Nama lengkap wajib diisi.');
        if (!formData.email.trim() || !formData.email.includes('@'))
          return fail('Email tidak valid.');
        if (!formData.no_hp.trim()) return fail('No. telepon/WhatsApp wajib diisi.');
        if (!formData.tanggal_lahir) return fail('Tanggal lahir wajib diisi.');
        if (!formData.jenis_kelamin) return fail('Jenis kelamin wajib dipilih.');
        return true;
      case 3:
        if (!formData.alamat.trim()) return fail('Alamat wajib diisi.');
        if (!formData.kota.trim()) return fail('Kota wajib diisi.');
        if (!formData.provinsi) return fail('Provinsi wajib dipilih.');
        if (!formData.kewarganegaraan.trim()) return fail('Kewarganegaraan wajib diisi.');
        if (!formData.golongan_darah) return fail('Golongan darah wajib dipilih.');
        if (!formData.kontak_darurat.trim()) return fail('Kontak darurat wajib diisi.');
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
    if (currentStep === 4 && paymentStatus === 'pending') return;
    setCurrentStep((prev) => Math.max(prev - 1, 1) as FormStep);
    setErrorMsg('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Step 3 → Submit registration → then go to Step 4 (payment)
  const handleSubmitRegistration = async () => {
    if (!validateStep(1) || !validateStep(2) || !validateStep(3)) return;

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

  const handleResetForm = () => {
    setShowSuccess(false);
    setCurrentStep(1);
    setRegistrationId('');
    setPaymentData(null);
    setPaymentStatus('idle');
    setPaymentMethod('qris');
    setFormData({
      nama: '',
      email: '',
      no_bib: '',
      no_hp: '',
      alamat: '',
      kota: '',
      provinsi: '',
      kewarganegaraan: 'Indonesia',
      tanggal_lahir: '',
      jenis_kelamin: '',
      nama_komunitas: '',
      golongan_darah: '',
      riwayat_medis: '',
      kontak_darurat: '',
      kategori: '',
    });
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
        {/* REGISTRATION TYPE TABS (Individu vs Kolektif/Excel) */}
        <div className="flex items-center justify-center p-1 rounded-2xl bg-white border border-black/10 shadow-xs mb-6 max-w-xl mx-auto">
          <button
            type="button"
            onClick={() => setRegisterMode('individual')}
            className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer ${
              registerMode === 'individual'
                ? 'bg-[#C9A227] text-[#0d1c32] shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <span className="material-symbols-outlined text-sm">person</span>
            <span>Individu</span>
          </button>
          <button
            type="button"
            onClick={() => setRegisterMode('bulk')}
            className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer ${
              registerMode === 'bulk'
                ? 'bg-[#C9A227] text-[#0d1c32] shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <span className="material-symbols-outlined text-sm">groups</span>
            <span>Kolektif / Grup (Min. 5)</span>
          </button>
        </div>

        {registerMode === 'bulk' ? (
          <TrailrunBulkRegister />
        ) : (
          <>
            {/* STEP INDICATOR */}
            <RegistrationStepIndicator currentStep={currentStep} />

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
                {/* STEP 1: KATEGORI LOMBA */}
                {currentStep === 1 && (
                  <StepKategoriLomba
                    categories={categories}
                    selectedKategori={formData.kategori}
                    onSelect={handleSelectCategory}
                  />
                )}

                {/* STEP 2: DATA PRIBADI */}
                {currentStep === 2 && (
                  <StepDataPribadi
                    formData={formData}
                    selectedCategory={selectedCategory}
                    onChange={handleChange}
                    onChangeCategoryStep={() => setCurrentStep(1)}
                  />
                )}

                {/* STEP 3: ALAMAT & DATA MEDIS */}
                {currentStep === 3 && (
                  <StepAlamatMedis
                    formData={formData}
                    selectedCategory={selectedCategory}
                    onChange={handleChange}
                    onSelectGolonganDarah={handleSelectGolonganDarah}
                  />
                )}

                {/* STEP 4: PEMBAYARAN */}
                {currentStep === 4 && (
                  <StepPembayaran
                    selectedCategory={selectedCategory}
                    pricingInfoMap={pricingInfoMap}
                    paymentMethod={paymentMethod}
                    onSelectPaymentMethod={setPaymentMethod}
                    paymentData={paymentData}
                    paymentStatus={paymentStatus}
                    checkingStatus={checkingStatus}
                    onCheckPaymentStatus={checkPaymentStatus}
                    onChangePaymentMethod={() => {
                      setPaymentData(null);
                      setPaymentStatus('idle');
                    }}
                    formatCurrency={formatCurrency}
                    formatExpiry={formatExpiry}
                  />
                )}

                {/* ===== FOOTER NAVIGATION ===== */}
                <div className="px-6 sm:px-8 py-5 bg-[#f8f8f8] border-t border-black/5 flex items-center justify-between gap-3">
                  {currentStep > 1 && currentStep < 4 ? (
                    <button
                      type="button"
                      onClick={goBack}
                      className="px-5 py-3 bg-white border border-black/10 text-slate-700 rounded-xl font-semibold text-xs uppercase tracking-wider hover:border-[#C9A227] hover:text-[#C9A227] transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-sm">arrow_back</span>
                      <span>Kembali</span>
                    </button>
                  ) : currentStep === 1 ? (
                    <Link
                      href="/trailrun"
                      className="px-5 py-3 bg-white border border-black/10 text-slate-700 rounded-xl font-semibold text-xs uppercase tracking-wider hover:border-[#C9A227] hover:text-[#C9A227] transition-all flex items-center gap-1.5"
                    >
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
                    <div />
                  )}

                  {currentStep < 3 && (
                    <button
                      type="button"
                      onClick={goNext}
                      className="px-6 py-3 bg-[#C9A227] hover:bg-[#b08d20] text-[#0d1c32] rounded-xl font-semibold text-xs uppercase tracking-wider shadow-md transition-all transform active:scale-95 flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>Lanjutkan</span>
                      <span className="material-symbols-outlined text-sm">arrow_forward</span>
                    </button>
                  )}

                  {currentStep === 3 && (
                    <button
                      type="button"
                      onClick={handleSubmitRegistration}
                      disabled={loading}
                      className="px-6 py-3 bg-[#C9A227] hover:bg-[#b08d20] disabled:opacity-50 text-[#0d1c32] rounded-xl font-semibold text-xs uppercase tracking-wider shadow-md transition-all transform active:scale-95 flex items-center gap-2 cursor-pointer"
                    >
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
                    <button
                      type="button"
                      onClick={handleCreatePayment}
                      disabled={loading}
                      className="px-6 py-3 bg-[#C9A227] hover:bg-[#b08d20] disabled:opacity-50 text-[#0d1c32] rounded-xl font-semibold text-xs uppercase tracking-wider shadow-md transition-all transform active:scale-95 flex items-center gap-2 cursor-pointer"
                    >
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
                    <Link
                      href="/trailrun"
                      className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-semibold text-xs uppercase tracking-wider shadow-md transition-all flex items-center gap-2"
                    >
                      <span className="material-symbols-outlined text-sm">check_circle</span>
                      <span>Selesai</span>
                    </Link>
                  )}
                </div>
              </div>
            </form>
          </>
        )}
      </section>

      {/* ===== SUCCESS MODAL ===== */}
      <RegistrationSuccessModal
        isOpen={showSuccess}
        email={formData.email}
        selectedCategory={selectedCategory}
        onReset={handleResetForm}
      />
    </main>
  );
}
