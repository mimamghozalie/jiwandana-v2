import { TrailrunCard } from '@/lib/types';

export interface TrailrunFormData {
  nama: string;
  email: string;
  no_bib: string;
  ukuran_jersey: string;
  custom_jersey?: string;
  no_hp: string;
  alamat: string;
  kota: string;
  provinsi: string;
  kewarganegaraan: string;
  tanggal_lahir: string;
  jenis_kelamin: 'Laki-laki' | 'Perempuan' | '';
  nama_komunitas: string;
  golongan_darah: 'A' | 'B' | 'AB' | 'O' | '';
  riwayat_medis: string;
  kontak_darurat: string;
  kategori: string;
}

export const JERSEY_SIZES = [
  { id: 'S', label: 'S (Small)', extraFee: 0 },
  { id: 'M', label: 'M (Medium)', extraFee: 0 },
  { id: 'L', label: 'L (Large)', extraFee: 0 },
  { id: 'XL', label: 'XL (Extra Large)', extraFee: 0 },
  { id: 'XXL', label: 'XXL (+Rp 5.000)', extraFee: 5000 },
  { id: 'XXXL', label: 'XXXL (+Rp 10.000)', extraFee: 10000 },
  { id: 'Custom', label: 'Custom (Spesifik)', extraFee: 0 },
] as const;

export function getJerseyExtraFee(size?: string, customText?: string): number {
  if (!size) return 0;
  const upper = size.toUpperCase().trim();

  // Known options
  if (upper === 'XXL' || upper === '2XL') return 5000;
  if (upper === 'XXXL' || upper === '3XL') return 10000;
  if (upper === 'XXXXL' || upper === '4XL') return 15000;
  if (upper === 'XXXXXL' || upper === '5XL') return 20000;

  // Custom text evaluation
  if (upper.startsWith('CUSTOM')) {
    const textToCheck = customText ? customText.toUpperCase() : upper;
    const matchNXL = textToCheck.match(/(\d+)\s*XL/);
    if (matchNXL) {
      const n = parseInt(matchNXL[1], 10);
      if (n > 1) return (n - 1) * 5000;
    }
    const xCount = (textToCheck.match(/X/g) || []).length;
    if (xCount > 1) {
      return (xCount - 1) * 5000;
    }
    return 0;
  }

  // Pattern N-XL (misal 4XL)
  const matchN = upper.match(/^(\d+)XL$/);
  if (matchN) {
    const n = parseInt(matchN[1], 10);
    if (n > 1) return (n - 1) * 5000;
  }
  const xMatches = upper.match(/X/g);
  if (xMatches && xMatches.length > 1) {
    return (xMatches.length - 1) * 5000;
  }

  return 0;
}


export type FormStep = 1 | 2 | 3 | 4;

export type BibStatus = 'idle' | 'checking' | 'available' | 'taken' | 'error';

export interface PaymentData {
  txn_id: string;
  order_id: string;
  amount: number;
  total_payment: number;
  fee: number;
  admin_fee?: number;
  gateway_fee?: number;
  payment_method: string;
  qr_string?: string;
  va_number?: string;
  payment_link?: string;
  expired_at: string;
  is_sandbox: boolean;
}

export const PROVINSI_LIST = [
  'Aceh', 'Sumatera Utara', 'Sumatera Barat', 'Riau', 'Jambi', 'Sumatera Selatan',
  'Bengkulu', 'Lampung', 'Kepulauan Bangka Belitung', 'Kepulauan Riau',
  'DKI Jakarta', 'Jawa Barat', 'Jawa Tengah', 'DI Yogyakarta', 'Jawa Timur', 'Banten',
  'Bali', 'Nusa Tenggara Barat', 'Nusa Tenggara Timur',
  'Kalimantan Barat', 'Kalimantan Tengah', 'Kalimantan Selatan', 'Kalimantan Timur', 'Kalimantan Utara',
  'Sulawesi Utara', 'Sulawesi Tengah', 'Sulawesi Selatan', 'Sulawesi Tenggara', 'Gorontalo', 'Sulawesi Barat',
  'Maluku', 'Maluku Utara', 'Papua', 'Papua Barat', 'Papua Tengah', 'Papua Pegunungan', 'Papua Selatan', 'Papua Barat Daya',
];

export const PAYMENT_METHODS = [
  { id: 'qris', label: 'QRIS', desc: 'Gopay, OVO, Dana, ShopeePay, dll', icon: 'qr_code_2' },
  { id: 'bri_va', label: 'BRI Virtual Account', desc: 'Transfer via BRI', icon: 'account_balance' },
  { id: 'bni_va', label: 'BNI Virtual Account', desc: 'Transfer via BNI', icon: 'account_balance' },
  { id: 'mandiri_va', label: 'Mandiri Virtual Account', desc: 'Transfer via Mandiri', icon: 'account_balance' },
  { id: 'permata_va', label: 'Permata Virtual Account', desc: 'Transfer via Permata', icon: 'account_balance' },
];

export const STEP_LABELS = ['Kategori Lomba', 'Data Pribadi', 'Alamat & Medis', 'Pembayaran'];

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
}

export function formatExpiry(dateStr?: string | null) {
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
}
