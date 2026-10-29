// Interface Data Official (Sesuai DATA OFFICIAL.xlsx)
export interface OfficialItem {
  id: string;
  nama: string;
  jabatan: string;
  nik: string;
  tanggalLahir: string;
  kota: string;
  jenisKelamin: 'Laki-Laki' | 'Perempuan';
  noHp: string;
  email: string;
  fotoUrl?: string;
  kkUrl?: string;
}

// Interface Data Atlet (Sesuai DATA atlet.xlsx)
export interface AtletItem {
  id: string;
  nama: string;
  asalSekolah: string;
  nik: string;
  tanggalLahir: string;
  umur: number | string;
  tinggi: number | string;
  berat: number | string;
  kota: string;
  jenisKelamin: 'Laki-Laki' | 'Perempuan';
  tingkatPendidikan: string;
  kategoriLomba: string;
  kategoriKelasSeni: string;
  noHp: string;
  email: string;
  fotoUrl?: string;
  kkUrl?: string;
}

// Opsi Kelas Tanding (Pemasalan & Prestasi)
export const KELAS_TANDING_OPTIONS = [
  'A',
  'B',
  'C',
  'D',
  'E',
  'F',
  'G',
  'H',
  'I',
  'J',
  'K',
  'L',
  'M',
  'N',
  'O',
  'P',
  'Q',
  'R',
  'S',
  'OPEN',
  'OPEN 1',
  'OPEN 2',
  'UNDER',
  'UNDER A',
];

// Pemetaan Opsi Kelas / Nomor Seni per Kategori Lomba
export const KELAS_SENI_BY_KATEGORI: Record<string, string[]> = {
  'Tanding - Pemasalan': KELAS_TANDING_OPTIONS,
  'Tanding - Prestasi': KELAS_TANDING_OPTIONS,
  'Jurus Baku Tunggal - Pemasalan': [
    'TUNGGAL TANGAN KOSONG',
    'TUNGGAL BERSENJATA',
    'TUNGGAL IPSI',
  ],
  'Jurus Baku Tunggal - Prestasi': [
    'TUNGGAL IPSI',
  ],
  'Jurus Bebas - Pemasalan': [
    'Tangan Kosong',
    'Bersenjata',
    'Tangan Kosong dan Senjata',
  ],
  'Jurus Bebas - Prestasi': [
    'Tangan Kosong',
    'Bersenjata',
    'Tangan Kosong dan Senjata',
  ],
  'Silat Festival - Perorangan': [
    'Perorangan',
  ],
  'Silat Festival - Berpasangan': [
    'Berpasangan',
  ],
  'Silat Festival - Berkelompok 3': [
    'Berkelompok 3',
  ],
  'Silat Festival - Berkelompok 5': [
    'Berkelompok 5',
  ],
  'Silat Bebas': [
    'Bebas',
    // ...KELAS_TANDING_OPTIONS,
  ],
};

/**
 * Mendapatkan daftar opsi Kelas / Nomor Seni berdasarkan Kategori Lomba
 */
export function getKelasSeniOptions(kategoriLomba: string): string[] {
  if (KELAS_SENI_BY_KATEGORI[kategoriLomba]) {
    return KELAS_SENI_BY_KATEGORI[kategoriLomba];
  }
  // Default fallback
  return KELAS_TANDING_OPTIONS;
}

// Daftar Gabungan Seluruh Pilihan Kategori Kelas / Seni
export const KELAS_SENI_OPTIONS = Array.from(
  new Set(Object.values(KELAS_SENI_BY_KATEGORI).flat())
);

// Opsi Pilihan Jabatan Official
export const JABATAN_OFFICIAL_OPTIONS = [
  'Pelatih Kepala',
  'Official',
  'Pendamping Official',
];

// Opsi Tingkat Pendidikan
export const TINGKAT_PENDIDIKAN_OPTIONS = [
  'Usia Dini / SD',
  'Pra-Remaja / SMP',
  'Remaja / SMA',
  'Dewasa / Umum',
];

// Opsi 11 Kategori Lomba Atlet Sesuai Penetapan Tarif Resmi
export const KATEGORI_LOMBA_OPTIONS = [
  'Tanding - Pemasalan',
  'Tanding - Prestasi',
  'Jurus Baku Tunggal - Pemasalan',
  'Jurus Baku Tunggal - Prestasi',
  'Jurus Bebas - Pemasalan',
  'Jurus Bebas - Prestasi',
  'Silat Bebas',
  'Silat Festival - Perorangan',
  'Silat Festival - Berpasangan',
  'Silat Festival - Berkelompok 3',
  'Silat Festival - Berkelompok 5',
] as const;

export type KategoriLombaSilat = typeof KATEGORI_LOMBA_OPTIONS[number];

// Kamus Tarif Resmi per Kategori Lomba (IDR)
export const SILAT_CATEGORY_PRICING: Record<string, number> = {
  'Tanding - Pemasalan': 275000,
  'Tanding - Prestasi': 250000,
  'Jurus Baku Tunggal - Pemasalan': 275000,
  'Jurus Baku Tunggal - Prestasi': 250000,
  'Jurus Bebas - Pemasalan': 275000,
  'Jurus Bebas - Prestasi': 250000,
  'Silat Bebas': 350000,
  'Silat Festival - Perorangan': 175000,
  'Silat Festival - Berpasangan': 250000,
  'Silat Festival - Berkelompok 3': 300000,
  'Silat Festival - Berkelompok 5': 300000,
};

// Helper mendapatkan tarif harga per kategori
export function getSilatCategoryPrice(kategori: string): number {
  if (!kategori) return 0;
  if (SILAT_CATEGORY_PRICING[kategori]) {
    return SILAT_CATEGORY_PRICING[kategori];
  }
  // Toleransi jika ada nama variasi lama
  const lower = kategori.toLowerCase();
  if (lower.includes('silat bebas')) return 350000;
  if (lower.includes('festival') && lower.includes('perorangan')) return 175000;
  if (lower.includes('festival') && lower.includes('berpasangan')) return 250000;
  if (lower.includes('festival') && (lower.includes('kelompok') || lower.includes('beregu'))) return 300000;
  if (lower.includes('prestasi')) return 250000;
  if (lower.includes('pemasalan')) return 275000;
  return 275000; // default tarif dasar
}

// Format mata uang Rupiah
export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
}

// Helper fungsi hitung umur otomatis presisi dari tanggal lahir
export function calculateAgeFromBirthDate(birthDateStr: string): number | '' {
  if (!birthDateStr) return '';
  const birthDate = new Date(birthDateStr);
  if (isNaN(birthDate.getTime())) return '';
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return Math.max(0, age);
}
