import * as XLSX from 'xlsx';
import { TrailrunRow, ColumnConfig, getRowFinancials } from './types';

export interface GroupRegistrationBatch {
  orderId: string;
  namaKomunitas: string;
  picName: string;
  picPhone: string;
  picEmail: string;
  totalParticipants: number;
  paidParticipants: number;
  pendingParticipants: number;
  isFullyPaid: boolean;
  rawTicketTotal: number;
  discountAmount: number;
  hasDiscount: boolean;
  finalTicketTotal: number;
  adminFeeTotal: number;
  totalPayment: number;
  paymentMethod: string;
  paymentStatus: 'paid' | 'pending';
  participants: TrailrunRow[];
  createdAt: string;
}

/**
 * Export data peserta perorangan ke Excel (.xlsx)
 */
export const exportIndividuToExcel = (data: TrailrunRow[], fileNamePrefix = 'peserta-individu-trailrun') => {
  if (data.length === 0) return;

  const headers = [
    'No',
    'No. BIB',
    'Nama Peserta',
    'Kategori',
    'Ukuran Jersey',
    'Hasil Lari',
    'Status Pembayaran',
    'Harga Tiket (Rp)',
    'Biaya Admin (Rp)',
    'Biaya Tx Gateway (Rp)',
    'Profit Fee Admin (Rp)',
    'Total Bayar (Rp)',
    'Metode Bayar',
    'Email',
    'WhatsApp / HP',
    'Jenis Kelamin',
    'NIK / No. Passport',
    'No. KK',
    'Tanggal Lahir',
    'Kewarganegaraan',
    'Kota',
    'Provinsi',
    'Alamat Lengkap',
    'Golongan Darah',
    'Riwayat Medis',
    'Kontak Darurat',
    'ID Transaksi',
    'Order ID',
    'Waktu Pendaftaran',
  ];

  const dataRows = data.map((row, idx) => {
    const fin = getRowFinancials(row);
    return [
      idx + 1,
      row.no_bib || '-',
      row.nama || '-',
      row.kategori || '-',
      row.ukuran_jersey || '-',
      row.hasil_lari || '-',
      row.status === 'paid' ? 'Lunas (Paid)' : row.status === 'confirmed' ? 'Dikonfirmasi' : 'Menunggu Bayar',
      fin.baseAmount,
      fin.adminFee,
      fin.gatewayFee,
      fin.adminProfit,
      fin.totalPayment,
      row.payment?.payment_method?.toUpperCase() || '-',
      row.email || '-',
      row.no_hp || '-',
      row.jenis_kelamin || '-',
      row.nik || '-',
      row.kk || '-',
      row.tanggal_lahir || '-',
      row.kewarganegaraan || 'Indonesia',
      row.kota || '-',
      row.provinsi || '-',
      row.alamat || '-',
      row.golongan_darah || '-',
      row.riwayat_medis || '-',
      row.kontak_darurat || '-',
      row.payment?.txn_id || '-',
      row.payment?.order_id || '-',
      row.created_at ? new Date(row.created_at).toLocaleString('id-ID') : '-',
    ];
  });

  const worksheetData = [headers, ...dataRows];
  const ws = XLSX.utils.aoa_to_sheet(worksheetData);

  ws['!cols'] = [
    { wch: 6 },
    { wch: 14 },
    { wch: 26 },
    { wch: 14 },
    { wch: 14 },
    { wch: 18 },
    { wch: 20 },
    { wch: 16 },
    { wch: 16 },
    { wch: 18 },
    { wch: 18 },
    { wch: 18 },
    { wch: 16 },
    { wch: 28 },
    { wch: 18 },
    { wch: 14 },
    { wch: 20 },
    { wch: 20 },
    { wch: 14 },
    { wch: 16 },
    { wch: 16 },
    { wch: 16 },
    { wch: 32 },
    { wch: 12 },
    { wch: 24 },
    { wch: 20 },
    { wch: 22 },
    { wch: 22 },
    { wch: 22 },
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Peserta Individu');
  const dateStr = new Date().toISOString().slice(0, 10);
  XLSX.writeFile(wb, `${fileNamePrefix}-${dateStr}.xlsx`);
};

/**
 * Export transaksi pendaftaran kelompok (per PIC / order) ke Excel
 */
export const exportKelompokToExcel = (batches: GroupRegistrationBatch[], fileNamePrefix = 'rekap-pendaftaran-kelompok') => {
  if (batches.length === 0) return;

  const headers = [
    'No',
    'Order ID Transaksi',
    'Nama Komunitas / Klub',
    'Nama Penanggung Jawab (PIC)',
    'WhatsApp PIC',
    'Email PIC',
    'Jumlah Anggota',
    'Status Pembayaran',
    'Status Promo Diskon',
    'Potongan Diskon (Rp)',
    'Total Biaya Tiket (Rp)',
    'Total Biaya Admin (Rp)',
    'Total Pembayaran (Rp)',
    'Metode Bayar',
    'Waktu Transaksi',
  ];

  const dataRows = batches.map((b, idx) => [
    idx + 1,
    b.orderId,
    b.namaKomunitas,
    b.picName || '-',
    b.picPhone || '-',
    b.picEmail || '-',
    b.totalParticipants,
    b.isFullyPaid ? 'LUNAS (PAID)' : 'MENUNGGU BAYAR',
    b.hasDiscount ? 'DAPAT DISKON (10 ORG)' : 'TIDAK DAPAT DISKON',
    b.discountAmount,
    b.finalTicketTotal,
    b.adminFeeTotal,
    b.totalPayment,
    b.paymentMethod || '-',
    b.createdAt ? new Date(b.createdAt).toLocaleString('id-ID') : '-',
  ]);

  const ws = XLSX.utils.aoa_to_sheet([headers, ...dataRows]);
  ws['!cols'] = [
    { wch: 6 },
    { wch: 24 },
    { wch: 26 },
    { wch: 24 },
    { wch: 18 },
    { wch: 26 },
    { wch: 16 },
    { wch: 18 },
    { wch: 24 },
    { wch: 20 },
    { wch: 22 },
    { wch: 20 },
    { wch: 22 },
    { wch: 16 },
    { wch: 22 },
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Pendaftaran Kelompok');
  const dateStr = new Date().toISOString().slice(0, 10);
  XLSX.writeFile(wb, `${fileNamePrefix}-${dateStr}.xlsx`);
};

/**
 * Export data peserta ke CSV sesuai kolom aktif
 */
export const exportToCSV = (data: TrailrunRow[], visibleColumns: string[], allColumns: ColumnConfig[], filename = 'peserta-trailrun.csv') => {
  if (data.length === 0) return;

  const activeCols = allColumns.filter((c) => visibleColumns.includes(c.key));
  const headerRow = activeCols.map((c) => `"${c.label}"`).join(',');

  const rows = data.map((row) => {
    const fin = getRowFinancials(row);
    return activeCols
      .map((col) => {
        let val: any = '';
        switch (col.key) {
          case 'no_bib':
            val = row.no_bib;
            break;
          case 'nama':
            val = row.nama;
            break;
          case 'kategori':
            val = row.kategori;
            break;
          case 'ukuran_jersey':
            val = row.ukuran_jersey || '-';
            break;
          case 'hasil_lari':
            val = row.hasil_lari || '-';
            break;
          case 'status':
            val = row.status === 'paid' ? 'LUNAS (PAID)' : row.status === 'confirmed' ? 'Dikonfirmasi' : 'Menunggu Bayar';
            break;
          case 'total_payment':
            val = fin.totalPayment > 0 ? `Rp ${fin.totalPayment.toLocaleString('id-ID')}` : '-';
            break;
          case 'base_amount':
            val = fin.baseAmount > 0 ? `Rp ${fin.baseAmount.toLocaleString('id-ID')}` : '-';
            break;
          case 'admin_profit':
            val = `Rp ${fin.adminProfit.toLocaleString('id-ID')}`;
            break;
          case 'admin_fee':
            val = `Rp ${fin.adminFee.toLocaleString('id-ID')}`;
            break;
          case 'gateway_fee':
            val = `Rp ${fin.gatewayFee.toLocaleString('id-ID')}`;
            break;
          case 'payment_method':
            val = row.payment?.payment_method?.toUpperCase() || '-';
            break;
          case 'email':
            val = row.email;
            break;
          case 'no_hp':
            val = row.no_hp;
            break;
          case 'created_at':
            val = new Date(row.created_at).toLocaleString('id-ID');
            break;
          case 'jenis_kelamin':
            val = row.jenis_kelamin || '-';
            break;
          case 'nik':
            val = row.nik || '-';
            break;
          case 'kk':
            val = row.kk || '-';
            break;
          case 'tanggal_lahir':
            val = row.tanggal_lahir || '-';
            break;
          case 'nama_komunitas':
            val = row.nama_komunitas || '-';
            break;
          case 'pic_name':
            val = row.pic_name || row.payment?.pic_name || '-';
            break;
          case 'pic_phone':
            val = row.pic_phone || row.payment?.pic_phone || '-';
            break;
          case 'pic_email':
            val = row.pic_email || row.payment?.pic_email || '-';
            break;
          case 'kota_provinsi':
            val = [row.kota, row.provinsi].filter(Boolean).join(', ') || '-';
            break;
          case 'alamat':
            val = row.alamat || '-';
            break;
          case 'golongan_darah':
            val = row.golongan_darah || '-';
            break;
          case 'riwayat_medis':
            val = row.riwayat_medis || '-';
            break;
          case 'kontak_darurat':
            val = row.kontak_darurat || '-';
            break;
          case 'txn_id':
            val = row.payment?.txn_id || '-';
            break;
          case 'order_id':
            val = row.payment?.order_id || '-';
            break;
          default:
            val = '';
        }
        return `"${String(val).replace(/"/g, '""')}"`;
      })
      .join(',');
  });

  const csvContent = '\uFEFF' + [headerRow, ...rows].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Export Ringkasan Statistik Finansial & Rincian Fee Tiket Semua Peserta ke Excel (.xlsx)
 */
export const exportStatsToExcel = (
  allRows: TrailrunRow[],
  statsSummary: {
    totalParticipants: number;
    paidParticipants: number;
    pendingParticipants: number;
    totalTicketRevenue: number;
    totalGrossRevenue: number;
    totalAdminFee: number;
    totalGatewayFee: number;
    totalAdminProfit: number;
    categoryBreakdown: Record<string, { count: number; ticketRevenue: number }>;
    sessionBreakdown: Record<string, { count: number; ticketRevenue: number }>;
    typeBreakdown: Record<string, { count: number; ticketRevenue: number }>;
    groupBatches?: GroupRegistrationBatch[];
  },
  fileNamePrefix = 'laporan-fee-tiket-trailrun'
) => {
  if (allRows.length === 0) return;

  const wb = XLSX.utils.book_new();

  // SHEET 1: RINGKASAN FINANSIAL
  const summaryAoa: any[][] = [
    ['LAPORAN REKAPITULASI KEUANGAN & STATISTIK TIKET TRAIL RUN PAWITRA'],
    [`Tanggal Unduh: ${new Date().toLocaleString('id-ID')}`],
    [],
    ['RINGKASAN UTAMA', 'NILAI / JUMLAH'],
    ['Total Seluruh Pendaftar', statsSummary.totalParticipants],
    ['Peserta Lunas (Paid)', statsSummary.paidParticipants],
    ['Peserta Menunggu Bayar (Pending)', statsSummary.pendingParticipants],
    ['Total Pendapatan Tiket (Net Ticket Fee)', statsSummary.totalTicketRevenue],
    ['Total Masuk Payment Gateway (Gross Revenue)', statsSummary.totalGrossRevenue],
    ['Total Biaya Admin Masuk', statsSummary.totalAdminFee],
    ['Total Biaya Potongan Gateway (MDR)', statsSummary.totalGatewayFee],
    ['Total Profit Bersih Biaya Admin', statsSummary.totalAdminProfit],
    [],
    ['BREAKDOWN PER KATEGORI LOMBA', 'PESERTA', 'TOTAL FEE TIKET (RP)'],
    ...Object.entries(statsSummary.categoryBreakdown).map(([cat, data]) => [
      `Kategori ${cat}`,
      data.count,
      data.ticketRevenue,
    ]),
    [],
    ['BREAKDOWN PER SESI PENDAFTARAN', 'PESERTA', 'TOTAL FEE TIKET (RP)'],
    ...Object.entries(statsSummary.sessionBreakdown).map(([session, data]) => [
      `Sesi ${session}`,
      data.count,
      data.ticketRevenue,
    ]),
    [],
    ['BREAKDOWN PER TIPE REGISTRASI', 'PESERTA', 'TOTAL FEE TIKET (RP)'],
    ...Object.entries(statsSummary.typeBreakdown).map(([type, data]) => [
      `Pendaftaran ${type}`,
      data.count,
      data.ticketRevenue,
    ]),
  ];

  const wsSummary = XLSX.utils.aoa_to_sheet(summaryAoa);
  wsSummary['!cols'] = [{ wch: 45 }, { wch: 18 }, { wch: 26 }];
  XLSX.utils.book_append_sheet(wb, wsSummary, 'Ringkasan Keuangan');

  // SHEET 2: REKAP KELOMPOK PER PIC (JIKA ADA TRANSAKSI KELOMPOK)
  if (statsSummary.groupBatches && statsSummary.groupBatches.length > 0) {
    const groupHeaders = [
      'No',
      'Order ID',
      'Nama PIC',
      'Komunitas / Klub',
      'Jumlah Peserta',
      'Peserta Lunas',
      'Subtotal Tiket Normal (Rp)',
      'Diskon Promo Rombongan (Rp)',
      'Total Fee Tiket Bersih (Rp)',
      'Biaya Admin (Rp)',
      'Total Bayar (Rp)',
      'Metode Bayar',
      'Status Bayar',
      'No. WhatsApp PIC',
      'Email PIC',
      'Waktu Transaksi',
    ];

    const groupRows = statsSummary.groupBatches.map((b, idx) => [
      idx + 1,
      b.orderId,
      b.picName,
      b.namaKomunitas,
      b.totalParticipants,
      b.paidParticipants,
      b.rawTicketTotal,
      b.discountAmount,
      b.finalTicketTotal,
      b.adminFeeTotal,
      b.totalPayment,
      b.paymentMethod,
      b.paymentStatus === 'paid' ? 'Lunas (Paid)' : 'Pending',
      b.picPhone,
      b.picEmail,
      b.createdAt ? new Date(b.createdAt).toLocaleString('id-ID') : '-',
    ]);

    const wsGroup = XLSX.utils.aoa_to_sheet([groupHeaders, ...groupRows]);
    wsGroup['!cols'] = [
      { wch: 6 },
      { wch: 24 },
      { wch: 22 },
      { wch: 24 },
      { wch: 16 },
      { wch: 14 },
      { wch: 24 },
      { wch: 26 },
      { wch: 24 },
      { wch: 18 },
      { wch: 20 },
      { wch: 14 },
      { wch: 14 },
      { wch: 18 },
      { wch: 26 },
      { wch: 22 },
    ];
    XLSX.utils.book_append_sheet(wb, wsGroup, 'Rekap Kelompok PIC');
  }

  // SHEET 3: RINCIAN TIKET SEMUA PESERTA (DETAIL PER ANGGOTA)
  const detailHeaders = [
    'No',
    'No. BIB',
    'Nama Peserta / PIC',
    'Kategori',
    'Tipe Pendaftaran',
    'Status Bayar',
    'Fee Tiket Dasar (Rp)',
    'Biaya Admin (Rp)',
    'Biaya Gateway (Rp)',
    'Profit Admin (Rp)',
    'Total Bayar Peserta (Rp)',
    'Metode Bayar',
    'Ukuran Jersey',
    'Email',
    'WhatsApp / HP',
    'Komunitas / Klub',
    'Order ID',
    'ID Transaksi',
    'Waktu Pendaftaran',
  ];

  const detailRows = allRows.map((r, idx) => {
    const fin = getRowFinancials(r);
    return [
      idx + 1,
      r.no_bib || '-',
      r.nama || '-',
      r.kategori || '-',
      r.registration_type === 'bulk' ? 'Kelompok / Rombongan' : 'Individu',
      r.status === 'paid' ? 'Lunas (Paid)' : r.status === 'confirmed' ? 'Dikonfirmasi' : 'Pending',
      fin.baseAmount,
      fin.adminFee,
      fin.gatewayFee,
      fin.adminProfit,
      fin.totalPayment,
      r.payment?.payment_method?.toUpperCase() || '-',
      r.ukuran_jersey || '-',
      r.email || '-',
      r.no_hp || '-',
      r.nama_komunitas || '-',
      r.payment?.order_id || r.order_id || '-',
      r.payment?.txn_id || '-',
      r.created_at ? new Date(r.created_at).toLocaleString('id-ID') : '-',
    ];
  });

  const wsDetails = XLSX.utils.aoa_to_sheet([detailHeaders, ...detailRows]);
  wsDetails['!cols'] = [
    { wch: 6 },
    { wch: 14 },
    { wch: 28 },
    { wch: 12 },
    { wch: 22 },
    { wch: 16 },
    { wch: 20 },
    { wch: 16 },
    { wch: 18 },
    { wch: 16 },
    { wch: 22 },
    { wch: 14 },
    { wch: 14 },
    { wch: 28 },
    { wch: 18 },
    { wch: 22 },
    { wch: 26 },
    { wch: 18 },
    { wch: 22 },
  ];
  XLSX.utils.book_append_sheet(wb, wsDetails, 'Rincian Tiket Peserta');

  const dateStr = new Date().toISOString().slice(0, 10);
  XLSX.writeFile(wb, `${fileNamePrefix}-${dateStr}.xlsx`);
};
