import { useState, useEffect, useMemo, useCallback } from 'react';
import { getActivePricingTier, ActiveTierResult } from '@/lib/pricing';
import { parseTrailrunExcelFile } from '@/lib/excel-template';
import { BulkParticipant, PicData, BulkPaymentData, RouteCalculations } from './types';

export function useBulkRegistration() {
  const [picData, setPicData] = useState<PicData>({
    group_name: '',
    pic_name: '',
    pic_email: '',
    pic_phone: '',
  });

  const [participants, setParticipants] = useState<BulkParticipant[]>([]);
  const [parsing, setParsing] = useState(false);
  const [fileName, setFileName] = useState('');
  const [parseError, setParseError] = useState('');
  const [regeneratingBibs, setRegeneratingBibs] = useState(false);

  // Checkout modal & payment state
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('qris');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [paymentData, setPaymentData] = useState<BulkPaymentData | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'completed' | 'expired'>('pending');
  const [checkingStatus, setCheckingStatus] = useState(false);
  const [cancellingPayment, setCancellingPayment] = useState(false);

  // Active pricing tier information
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

  // Live Gateway Fee from Pakasir API: https://app.pakasir.com/api/v2/payment-fee/{subtotalTickets}
  const [liveFeeData, setLiveFeeData] = useState<Record<string, number> | null>(null);

  const validParticipants = useMemo(() => participants.filter((p) => p.isValid), [participants]);
  const validCount = validParticipants.length;
  const invalidCount = participants.length - validCount;

  // Kalkulasi subtotalTickets dinamis untuk request live payment fee
  const currentSubtotalTickets = useMemo(() => {
    let count7k = 0;
    let count12k = 0;
    participants.forEach((p) => {
      if (!p.isValid) return;
      const cat = (p.kategori || '').toLowerCase();
      if (cat.includes('12')) count12k++;
      else if (cat.includes('7')) count7k++;
    });
    const raw = count7k * 270000 + count12k * 320000;
    const discount = Math.floor(validCount / 10) * 320000;
    return Math.max(0, raw - discount);
  }, [participants, validCount]);

  useEffect(() => {
    if (currentSubtotalTickets <= 0) {
      setLiveFeeData(null);
      return;
    }

    const controller = new AbortController();
    fetch(`https://app.pakasir.com/api/v2/payment-fee/${currentSubtotalTickets}`, {
      signal: controller.signal,
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch fee from Pakasir');
        return res.json();
      })
      .then((data) => {
        if (data && typeof data === 'object') {
          setLiveFeeData(data);
        }
      })
      .catch((err) => {
        if (err.name !== 'AbortError') {
          console.warn('Could not fetch fee from Pakasir API:', err);
        }
      });

    return () => controller.abort();
  }, [currentSubtotalTickets]);

  // Handle PIC form input
  const handlePicChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPicData((prev) => ({ ...prev, [name]: value }));
    setSubmitError('');
  }, []);

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

      const parsedWithBibs = [...result.participants];
      const usedBibs = new Set<string>();

      for (let i = 0; i < parsedWithBibs.length; i++) {
        const p = parsedWithBibs[i];
        let currentBib = (p.no_bib || '').trim().toUpperCase();

        const isValidBibFormat = currentBib.length === 7 && /^[FM]-\d{5}$/.test(currentBib);

        if (!currentBib || !isValidBibFormat || usedBibs.has(currentBib)) {
          try {
            const bibRes = await fetch('/api/trailrun/generate-bib', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                gender: p.jenis_kelamin,
                kategori: p.kategori,
              }),
            });
            const bibData = await bibRes.json();
            if (bibData.success && bibData.bib) {
              currentBib = bibData.bib;
            } else {
              const prefix = (p.jenis_kelamin || '').toLowerCase().includes('perempuan') ? 'F' : 'M';
              const randNum = Math.floor(10000 + Math.random() * 90000);
              currentBib = `${prefix}-${randNum}`;
            }
          } catch {
            const prefix = (p.jenis_kelamin || '').toLowerCase().includes('perempuan') ? 'F' : 'M';
            const randNum = Math.floor(10000 + Math.random() * 90000);
            currentBib = `${prefix}-${randNum}`;
          }
        }

        usedBibs.add(currentBib);
        const filteredErrors = (p.errors || []).filter((err) => !err.toLowerCase().includes('bib'));
        parsedWithBibs[i] = {
          ...p,
          no_bib: currentBib,
          errors: filteredErrors,
          isValid: filteredErrors.length === 0,
        };
      }

      setParticipants(parsedWithBibs);

      if (parsedWithBibs.length < 5) {
        setParseError(`Jumlah peserta terdeteksi ${parsedWithBibs.length} orang. Pendaftaran kolektif membutuhkan minimal 5 orang peserta.`);
      } else if (parsedWithBibs.length > 20) {
        setParseError(`Jumlah peserta terdeteksi ${parsedWithBibs.length} orang. Pendaftaran kolektif dibatasi maksimal 20 orang peserta per transaksi.`);
      }
    } catch (err: any) {
      setParseError(err.message || 'Gagal membaca file Excel. Pastikan format file sesuai template resmi.');
    } finally {
      setParsing(false);
      e.target.value = '';
    }
  };

  // Re-generate all BIBs
  const handleRegenerateBibs = async () => {
    if (participants.length === 0) return;
    setRegeneratingBibs(true);
    try {
      const updated = [...participants];
      const usedBibs = new Set<string>();

      for (let i = 0; i < updated.length; i++) {
        const p = updated[i];
        let newBib = '';
        try {
          const bibRes = await fetch('/api/trailrun/generate-bib', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              gender: p.jenis_kelamin,
              kategori: p.kategori,
            }),
          });
          const bibData = await bibRes.json();
          if (bibData.success && bibData.bib && !usedBibs.has(bibData.bib)) {
            newBib = bibData.bib;
          }
        } catch {
          // fallback
        }

        if (!newBib) {
          const prefix = (p.jenis_kelamin || '').toLowerCase().includes('perempuan') ? 'F' : 'M';
          let candidate = '';
          do {
            const randNum = Math.floor(10000 + Math.random() * 90000);
            candidate = `${prefix}-${randNum}`;
          } while (usedBibs.has(candidate));
          newBib = candidate;
        }

        usedBibs.add(newBib);
        const filteredErrors = (p.errors || []).filter((err) => !err.toLowerCase().includes('bib'));
        updated[i] = {
          ...p,
          no_bib: newBib,
          errors: filteredErrors,
          isValid: filteredErrors.length === 0,
        };
      }

      setParticipants(updated);
    } finally {
      setRegeneratingBibs(false);
    }
  };

  const handleRemoveParticipant = (indexToRemove: number) => {
    setParticipants((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  // Pricing calculations
  const routeCalculations: RouteCalculations = useMemo(() => {
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

    // Promo Kelipatan 10 Peserta: Diskon Rp 320.000 tiap 10 peserta
    const discountMultiplier = Math.floor(validCount / 10);
    const isPromoActive = discountMultiplier > 0;
    const discountAmount = discountMultiplier * 320000;
    const subtotalTickets = Math.max(0, rawSubtotalTickets - discountAmount);

    // Biaya Transaksi Gateway dari Pakasir API
    const feeFromApi = liveFeeData ? (liveFeeData[paymentMethod] ?? liveFeeData['qris']) : undefined;
    const fallbackFee =
      paymentMethod === 'qris'
        ? Math.round(subtotalTickets * 0.01)
        : 3500;
    const estimatedGatewayFee = validCount > 0 && subtotalTickets > 0 ? (feeFromApi ?? fallbackFee) : 0;

    const adminFee = validCount * ADMIN_FEE_PER_PERSON;
    const totalServiceFee = adminFee + estimatedGatewayFee;
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
  }, [participants, validCount, liveFeeData, paymentMethod]);

  // Checkout submission
  const handleSubmitBulk = async () => {
    if (!picData.pic_name.trim() || !picData.pic_phone.trim() || !picData.pic_email.trim()) {
      setSubmitError('Nama PIC, No. WhatsApp, dan Email PIC wajib diisi lengkap.');
      return;
    }

    if (validCount < 5) {
      setSubmitError(`Pendaftaran kolektif membutuhkan minimal 5 orang peserta valid (saat ini ${validCount} peserta).`);
      return;
    }

    if (validCount > 20) {
      setSubmitError(`Pendaftaran kolektif dibatasi maksimal 20 orang peserta per transaksi (saat ini ${validCount} peserta).`);
      return;
    }

    const has3k = participants.some((p) => p.kategori.toLowerCase().includes('3'));
    if (has3k) {
      setSubmitError('Pendaftaran kolektif hanya menerima kategori 7K dan 12K. Kategori 3K tidak tersedia untuk pendaftaran kelompok.');
      return;
    }

    const hasInvalid = participants.some((p) => !p.isValid);
    if (hasInvalid) {
      setSubmitError('Masih terdapat baris data yang belum valid. Periksa kembali data Anda atau klik "Generate Ulang BIB".');
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
      setShowCheckoutModal(false);
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
      const data = await res.json();
      if (data.status === 'completed' || data.status === 'settled') {
        setPaymentStatus('completed');
      }
    } catch (err) {
      console.error('Error checking payment status:', err);
    } finally {
      setCheckingStatus(false);
    }
  };

  // Countdown timer 1 hour
  const [timeLeft, setTimeLeft] = useState<{ minutes: number; seconds: number }>({ minutes: 60, seconds: 0 });

  useEffect(() => {
    if (!paymentData?.expired_at || paymentStatus === 'completed') return;

    const interval = setInterval(() => {
      const expiry = new Date(paymentData.expired_at).getTime();
      const now = Date.now();
      const diff = Math.max(0, expiry - now);

      if (diff <= 0) {
        setPaymentStatus('expired');
        setTimeLeft({ minutes: 0, seconds: 0 });
        clearInterval(interval);
      } else {
        const minutes = Math.floor(diff / 60000);
        const seconds = Math.floor((diff % 60000) / 1000);
        setTimeLeft({ minutes, seconds });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [paymentData?.expired_at, paymentStatus]);

  // Cancel bulk payment
  const handleCancelPayment = async () => {
    if (!paymentData?.order_id && !paymentData?.txn_id) return;
    const confirmCancel = window.confirm(
      'Apakah Anda yakin ingin membatalkan transaksi kelompok ini? Seluruh data pendaftaran rombongan ini akan dibersihkan dari sistem.'
    );
    if (!confirmCancel) return;

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

  return {
    picData,
    setPicData,
    handlePicChange,
    participants,
    setParticipants,
    parsing,
    fileName,
    parseError,
    regeneratingBibs,
    handleFileUpload,
    handleRegenerateBibs,
    handleRemoveParticipant,
    validParticipants,
    validCount,
    invalidCount,
    pricingInfo,
    liveFeeData,
    routeCalculations,
    showCheckoutModal,
    setShowCheckoutModal,
    paymentMethod,
    setPaymentMethod,
    submitting,
    submitError,
    handleSubmitBulk,
    paymentData,
    setPaymentData,
    paymentStatus,
    setPaymentStatus,
    checkingStatus,
    checkStatus,
    cancellingPayment,
    handleCancelPayment,
    timeLeft,
  };
}

export type UseBulkRegistrationReturn = ReturnType<typeof useBulkRegistration>;
