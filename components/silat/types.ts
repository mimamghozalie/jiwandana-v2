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
}

// Daftar Pilihan Kategori Kelas / Seni sesuai standar kejuaraan
export const KELAS_SENI_OPTIONS = [
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
  'UNDER B',
  'UNDER C',
  '>39',
  'SOLO KREATIF',
  'TUNGGAL TANGAN KOSONG',
  'TUNGGAL BERSENJATA',
  'GANDA TANGAN KOSONG',
  'GANDA BERSENJATA',
  'BEREGU JURUS 1-6',
  'TUNGGAL IPSI',
  'GANDA IPSI',
  'REGU IPSI',
];

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

// Opsi Kategori Lomba Atlet
export const KATEGORI_LOMBA_OPTIONS = [
  'Tanding',
  'Tunggal Ganda Regu',
];

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
