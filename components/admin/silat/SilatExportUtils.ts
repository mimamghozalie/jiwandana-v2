import * as XLSX from 'xlsx';
import type { SilatAtletRow, SilatOfficialRow } from './types';
import { getSilatCategoryPrice } from '@/components/silat/types';

/**
 * Export Data Atlet Silat ke format Excel (.xlsx)
 */
export const exportSilatAtletsToExcel = (
  data: SilatAtletRow[],
  fileNamePrefix = 'data-atlet-silat-dsc-2026'
) => {
  if (data.length === 0) return;

  const headers = [
    'No',
    'Nama Lengkap',
    'Asal Sekolah / Kontingen',
    'NIK',
    'Tanggal Lahir',
    'Umur (Tahun)',
    'Tinggi (cm)',
    'Berat (kg)',
    'Kota / Kabupaten',
    'Jenis Kelamin',
    'Tingkat Pendidikan',
    'Kategori Lomba (11 Kat)',
    'Kelas / Nomor Seni',
    'Biaya Pendaftaran (Rp)',
    'Status Pembayaran',
    'No. HP (BPJS)',
    'Email (BPJS)',
    'Pas Foto URL',
    'Berkas KK URL',
    'Order ID Transaksi',
    'Waktu Mendaftar',
  ];

  const rows = data.map((item, index) => {
    const price = getSilatCategoryPrice(item.kategori_lomba);
    return [
      index + 1,
      item.nama,
      item.asal_sekolah,
      item.nik,
      item.tanggal_lahir,
      item.umur || '',
      item.tinggi || '',
      item.berat || '',
      item.kota || 'Mojokerto',
      item.jenis_kelamin,
      item.tingkat_pendidikan,
      item.kategori_lomba,
      item.kategori_kelas_seni || '',
      price,
      item.status === 'paid' ? 'LUNAS (PAID)' : 'PENDING',
      item.no_hp || '',
      item.email || '',
      item.foto_url || '',
      item.kk_url || '',
      item.order_id || '',
      item.created_at ? new Date(item.created_at).toLocaleString('id-ID') : '',
    ];
  });

  const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Data Atlet Silat');

  const dateStr = new Date().toISOString().split('T')[0];
  XLSX.writeFile(workbook, `${fileNamePrefix}-${dateStr}.xlsx`);
};

/**
 * Export Data Official ke format Excel (.xlsx)
 */
export const exportSilatOfficialsToExcel = (
  data: SilatOfficialRow[],
  fileNamePrefix = 'data-official-silat-dsc-2026'
) => {
  if (data.length === 0) return;

  const headers = [
    'No',
    'Nama Official',
    'Jabatan',
    'NIK',
    'Tanggal Lahir',
    'Kota',
    'Jenis Kelamin',
    'No. HP',
    'Email',
    'Pas Foto URL',
    'Berkas KK / KTP URL',
    'Order ID',
  ];

  const rows = data.map((item, index) => [
    index + 1,
    item.nama,
    item.jabatan,
    item.nik,
    item.tanggal_lahir || '',
    item.kota || 'Mojokerto',
    item.jenis_kelamin,
    item.no_hp || '',
    item.email || '',
    item.foto_url || '',
    item.kk_url || '',
    item.order_id || '',
  ]);

  const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Data Official');

  const dateStr = new Date().toISOString().split('T')[0];
  XLSX.writeFile(workbook, `${fileNamePrefix}-${dateStr}.xlsx`);
};
