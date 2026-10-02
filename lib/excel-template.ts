import * as XLSX from 'xlsx';

export interface BulkParticipant {
  nama: string;
  email: string;
  no_hp: string;
  kategori: string;
  tanggal_lahir: string;
  jenis_kelamin: string;
  golongan_darah: string;
  alamat: string;
  kota: string;
  provinsi: string;
  kontak_darurat: string;
  nama_komunitas?: string;
  riwayat_medis?: string;
  isValid?: boolean;
  errors?: string[];
}

/**
 * Downloads the official formatted Excel template for Trailrun Bulk Registration
 */
export function downloadTrailrunExcelTemplate(communityName = '') {
  // 1. Column headers only (clean template ready to fill, minimal 5 peserta)
  const headers = [
    'No',
    'Nama Lengkap *',
    'Email *',
    'No WhatsApp *',
    'Kategori Race (3K / 7K / 12K) *',
    'Tgl Lahir (YYYY-MM-DD) *',
    'Jenis Kelamin (Laki-laki / Perempuan) *',
    'Golongan Darah (A / B / AB / O)',
    'Alamat Lengkap *',
    'Kota *',
    'Provinsi *',
    'Kontak Darurat (Nama & No HP) *',
    'Nama Komunitas / Running Club',
    'Riwayat Medis (Opsional)',
  ];

  const worksheetData = [headers];

  // 2. Create workbook and add worksheet
  const ws = XLSX.utils.aoa_to_sheet(worksheetData);

  // Set column widths for readability
  ws['!cols'] = [
    { wch: 6 },  // No
    { wch: 25 }, // Nama Lengkap
    { wch: 28 }, // Email
    { wch: 18 }, // No WhatsApp
    { wch: 30 }, // Kategori
    { wch: 24 }, // Tgl Lahir
    { wch: 32 }, // Jenis Kelamin
    { wch: 26 }, // Golongan Darah
    { wch: 35 }, // Alamat
    { wch: 18 }, // Kota
    { wch: 18 }, // Provinsi
    { wch: 30 }, // Kontak Darurat
    { wch: 28 }, // Komunitas
    { wch: 28 }, // Riwayat Medis
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Pendaftaran Kolektif');

  // 3. Trigger download (Clean template without dummy data & without price data)
  XLSX.writeFile(wb, 'Template-Pendaftaran-Kolektif-Trailrun-Jiwandana.xlsx');
}

/**
 * Normalizes category input to '3k' | '7k' | '12k'
 */
export function normalizeCategory(val: any): '3k' | '7k' | '12k' | null {
  if (!val) return null;
  const str = String(val).toLowerCase().replace(/\s+/g, '');
  if (str.includes('12k') || str.includes('12') || str.includes('senior')) return '12k';
  if (str.includes('7k') || str.includes('7') || str.includes('junior')) return '7k';
  if (str.includes('3k') || str.includes('3') || str.includes('fun') || str.includes('hallo')) return '3k';
  return null;
}

/**
 * Normalizes date to YYYY-MM-DD
 */
export function normalizeDate(val: any): string {
  if (!val) return '';
  if (typeof val === 'number') {
    // Excel serial date number
    const date = new Date(Math.round((val - 25569) * 86400 * 1000));
    return date.toISOString().split('T')[0];
  }
  const str = String(val).trim();
  // Check if already YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return str;
  // If DD/MM/YYYY or DD-MM-YYYY
  const dmyMatch = str.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
  if (dmyMatch) {
    const day = dmyMatch[1].padStart(2, '0');
    const month = dmyMatch[2].padStart(2, '0');
    const year = dmyMatch[3];
    return `${year}-${month}-${day}`;
  }
  return str;
}

/**
 * Parses uploaded Excel File and returns validated participant rows
 */
export async function parseTrailrunExcelFile(
  file: File,
  defaultCommunity = ''
): Promise<{
  participants: BulkParticipant[];
  validCount: number;
  invalidCount: number;
  categoryCounts: { '3k': number; '7k': number; '12k': number };
}> {
  const data = await file.arrayBuffer();
  const workbook = XLSX.read(data, { type: 'array' });
  const firstSheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[firstSheetName];

  // Convert to JSON with array of arrays (header: 1)
  const rows: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

  if (rows.length < 2) {
    throw new Error('File Excel kosong atau tidak memiliki baris data.');
  }

  // Find header row index (matches 'nama' or 'nama lengkap')
  let headerRowIndex = 0;
  for (let i = 0; i < Math.min(5, rows.length); i++) {
    const rowStr = rows[i].map((c) => String(c || '').toLowerCase()).join(' ');
    if (rowStr.includes('nama') && (rowStr.includes('kategori') || rowStr.includes('email'))) {
      headerRowIndex = i;
      break;
    }
  }

  const headers = rows[headerRowIndex].map((h: any) =>
    String(h || '').toLowerCase().trim()
  );

  // Helper to get value by matching possible header synonyms
  const getColVal = (row: any[], possibleNames: string[]): string => {
    for (const name of possibleNames) {
      const idx = headers.findIndex((h: string) => h.includes(name));
      if (idx !== -1 && row[idx] !== undefined && row[idx] !== null) {
        return String(row[idx]).trim();
      }
    }
    return '';
  };

  const participants: BulkParticipant[] = [];
  const categoryCounts = { '3k': 0, '7k': 0, '12k': 0 };

  for (let i = headerRowIndex + 1; i < rows.length; i++) {
    const row = rows[i];
    if (!row || row.length === 0 || row.every((c) => !c || String(c).trim() === '')) {
      continue; // Skip empty row
    }

    const nama = getColVal(row, ['nama lengkap', 'nama']);
    const email = getColVal(row, ['email', 'surel', 'e-mail']);
    const no_hp = getColVal(row, ['whatsapp', 'wa', 'hp', 'telepon', 'telp', 'phone']);
    const rawKategori = getColVal(row, ['kategori', 'category', 'jarak', 'race']);
    const rawTglLahir = getColVal(row, ['tgl lahir', 'tanggal lahir', 'birth', 'lahir']);
    const rawGender = getColVal(row, ['kelamin', 'gender', 'jenis']);
    const rawBlood = getColVal(row, ['darah', 'golongan darah', 'blood']);
    const alamat = getColVal(row, ['alamat', 'address', 'domisili']);
    const kota = getColVal(row, ['kota', 'kabupaten', 'city']);
    const provinsi = getColVal(row, ['provinsi', 'province']);
    const kontak_darurat = getColVal(row, ['darurat', 'emergency']);
    const nama_komunitas = getColVal(row, ['komunitas', 'club', 'community']) || defaultCommunity;
    const riwayat_medis = getColVal(row, ['medis', 'penyakit', 'riwayat']);

    // Validations
    const errors: string[] = [];

    if (!nama) errors.push('Nama lengkap wajib diisi');
    if (!email || !email.includes('@')) errors.push('Email tidak valid');
    if (!no_hp || no_hp.length < 9) errors.push('No WhatsApp tidak valid');

    const normalizedCat = normalizeCategory(rawKategori);
    if (!normalizedCat) {
      errors.push('Kategori harus 3K, 7K, atau 12K');
    } else {
      categoryCounts[normalizedCat]++;
    }

    const normalizedDate = normalizeDate(rawTglLahir);
    if (!normalizedDate) errors.push('Tanggal lahir wajib diisi (YYYY-MM-DD)');

    // Normalize gender
    let normalizedGender = '';
    const gLower = rawGender.toLowerCase();
    if (gLower.startsWith('l') || gLower.includes('pria') || gLower.includes('laki')) {
      normalizedGender = 'Laki-laki';
    } else if (gLower.startsWith('p') || gLower.includes('wanita') || gLower.includes('perempuan')) {
      normalizedGender = 'Perempuan';
    } else {
      errors.push('Jenis kelamin wajib dipilih (Laki-laki/Perempuan)');
    }

    if (!alamat) errors.push('Alamat wajib diisi');
    if (!kota) errors.push('Kota wajib diisi');
    if (!provinsi) errors.push('Provinsi wajib diisi');
    if (!kontak_darurat) errors.push('Kontak darurat wajib diisi');

    // Blood type normalization
    let normalizedBlood = '';
    const bUpper = rawBlood.toUpperCase();
    if (['A', 'B', 'AB', 'O'].includes(bUpper)) {
      normalizedBlood = bUpper;
    }

    const isValid = errors.length === 0;

    participants.push({
      nama,
      email,
      no_hp,
      kategori: normalizedCat || rawKategori || '7k',
      tanggal_lahir: normalizedDate,
      jenis_kelamin: normalizedGender,
      golongan_darah: normalizedBlood,
      alamat,
      kota,
      provinsi,
      kontak_darurat,
      nama_komunitas,
      riwayat_medis,
      isValid,
      errors,
    });
  }

  const validCount = participants.filter((p) => p.isValid).length;
  const invalidCount = participants.length - validCount;

  return {
    participants,
    validCount,
    invalidCount,
    categoryCounts,
  };
}
