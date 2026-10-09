export interface TrailrunPayment {
  txn_id?: string;
  order_id?: string;
  amount?: number;
  fee?: number;
  admin_fee?: number;
  gateway_fee?: number;
  admin_profit?: number;
  total_payment?: number;
  payment_method?: string;
  status?: string;
  completed_at?: string;
  is_sandbox?: boolean;
}

export interface TrailrunRow {
  id: string;
  nama: string;
  email: string;
  no_bib: string;
  no_hp: string;
  alamat?: string;
  kota?: string;
  provinsi?: string;
  kewarganegaraan?: string;
  tanggal_lahir?: string;
  jenis_kelamin?: string;
  nama_komunitas?: string | null;
  golongan_darah?: string;
  riwayat_medis?: string | null;
  kontak_darurat?: string;
  kategori: string;
  ukuran_jersey?: string;
  hasil_lari?: string;
  status: 'pending' | 'confirmed' | 'paid';
  created_at: string;
  payment?: TrailrunPayment;
}

export interface ColumnConfig {
  key: string;
  label: string;
  category: 'Utama' | 'Pembayaran' | 'Profil & Kontak' | 'Medis & Darurat';
  defaultVisible: boolean;
}

export interface MetricsData {
  total: number;
  paidCount: number;
  pendingCount: number;
  totalRevenue: number;
  totalTicketRevenue: number;
  pendingRevenue: number;
  pendingTicketRevenue: number;
  totalAdminProfit: number;
  totalAdminFee: number;
  totalGatewayFee: number;
}

/**
 * Format angka ke mata uang Rupiah IDR
 */
export const formatCurrency = (num: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(num);
};

/**
 * Helper untuk menghitung rincian finansial per pendaftar:
 * - totalPayment: Total yang dibayar peserta (misal 245.000)
 * - adminFee: Biaya admin flat ke peserta (Rp 5.000)
 * - gatewayFee: Biaya potongan transaksi gateway (0.7% + Rp 300)
 * - adminProfit: Keuntungan bersih fee admin (adminFee - gatewayFee)
 * - baseAmount: Harga tiket dasar (totalPayment - adminFee)
 */
export const getRowFinancials = (row: TrailrunRow) => {
  const adminFee = row.payment?.admin_fee ?? (row.payment?.fee ?? 5000);
  
  let baseAmount = row.payment?.amount || 0;
  let totalPayment = row.payment?.total_payment || 0;

  // Jika salah satu kosong, turunkan dari nilai yang ada
  if (baseAmount > 0 && totalPayment === 0) {
    totalPayment = baseAmount + adminFee;
  } else if (totalPayment > 0 && baseAmount === 0) {
    baseAmount = Math.max(0, totalPayment - adminFee);
  } else if (baseAmount === 0 && totalPayment === 0) {
    const cat = (row.kategori || '').toLowerCase();
    baseAmount = cat.includes('12') ? 290000 : cat.includes('7') ? 240000 : 250000;
    totalPayment = baseAmount + adminFee;
  }

  // Jika amount dan totalPayment sama persis (artinya amount berisi gross), pisahkan baseAmount
  if (baseAmount > 0 && baseAmount === totalPayment) {
    baseAmount = Math.max(0, totalPayment - adminFee);
  }

  // Jika gateway_fee belum tersimpan, hitung rumus gateway: 0.7% + Rp 300
  const gatewayFee =
    row.payment?.gateway_fee ??
    (totalPayment > 0 ? Math.round(totalPayment * 0.007 + 300) : 0);

  // Profit fee admin = adminFee - gatewayFee
  const adminProfit =
    row.payment?.admin_profit ??
    Math.max(0, adminFee - gatewayFee);

  return { totalPayment, adminFee, gatewayFee, adminProfit, baseAmount };
};

export const ALL_COLUMNS: ColumnConfig[] = [
  { key: 'no_bib', label: 'No. BIB', category: 'Utama', defaultVisible: true },
  { key: 'nama', label: 'Nama Peserta', category: 'Utama', defaultVisible: true },
  { key: 'kategori', label: 'Kategori', category: 'Utama', defaultVisible: true },
  { key: 'ukuran_jersey', label: 'Ukuran Jersey', category: 'Utama', defaultVisible: true },
  { key: 'hasil_lari', label: 'Hasil Lari', category: 'Utama', defaultVisible: true },
  { key: 'status', label: 'Status Bayar', category: 'Pembayaran', defaultVisible: true },
  { key: 'total_payment', label: 'Nominal Bayar', category: 'Pembayaran', defaultVisible: true },
  { key: 'base_amount', label: 'Fee Pendaftaran (Tiket)', category: 'Pembayaran', defaultVisible: false },
  { key: 'admin_profit', label: 'Profit Fee Admin', category: 'Pembayaran', defaultVisible: true },
  { key: 'payment_method', label: 'Metode Bayar', category: 'Pembayaran', defaultVisible: true },
  { key: 'email', label: 'Email', category: 'Profil & Kontak', defaultVisible: true },
  { key: 'no_hp', label: 'WhatsApp / HP', category: 'Profil & Kontak', defaultVisible: true },
  { key: 'created_at', label: 'Waktu Daftar', category: 'Utama', defaultVisible: true },
  { key: 'admin_fee', label: 'Biaya Admin', category: 'Pembayaran', defaultVisible: false },
  { key: 'gateway_fee', label: 'Biaya Tx Gateway', category: 'Pembayaran', defaultVisible: false },
  { key: 'jenis_kelamin', label: 'Gender', category: 'Profil & Kontak', defaultVisible: false },
  { key: 'tanggal_lahir', label: 'Tgl Lahir', category: 'Profil & Kontak', defaultVisible: false },
  { key: 'nama_komunitas', label: 'Komunitas / Klub', category: 'Profil & Kontak', defaultVisible: false },
  { key: 'kota_provinsi', label: 'Kota / Asal', category: 'Profil & Kontak', defaultVisible: false },
  { key: 'alamat', label: 'Alamat Lengkap', category: 'Profil & Kontak', defaultVisible: false },
  { key: 'golongan_darah', label: 'Gol. Darah', category: 'Medis & Darurat', defaultVisible: false },
  { key: 'riwayat_medis', label: 'Riwayat Medis', category: 'Medis & Darurat', defaultVisible: false },
  { key: 'kontak_darurat', label: 'Kontak Darurat', category: 'Medis & Darurat', defaultVisible: false },
  { key: 'txn_id', label: 'ID Transaksi', category: 'Pembayaran', defaultVisible: false },
  { key: 'order_id', label: 'Order ID', category: 'Pembayaran', defaultVisible: false },
];

export const DEFAULT_VISIBLE_KEYS = ALL_COLUMNS.filter((c) => c.defaultVisible).map((c) => c.key);

// Fallback sample data if Supabase tables have no rows yet
export const SAMPLE_TRAILRUN_DATA: TrailrunRow[] = [
  {
    id: 'sample-1',
    nama: 'Budi Santoso',
    email: 'budi.santoso@example.com',
    no_bib: '7K-0142',
    no_hp: '081234567890',
    alamat: 'Jl. Hayam Wuruk No. 45',
    kota: 'Mojokerto',
    provinsi: 'Jawa Timur',
    kewarganegaraan: 'WNI',
    tanggal_lahir: '1992-05-14',
    jenis_kelamin: 'Laki-laki',
    nama_komunitas: 'Mojokerto Runners Club',
    golongan_darah: 'O',
    riwayat_medis: 'Tidak ada',
    kontak_darurat: 'Siti Rahayu (Istri) - 081298765432',
    kategori: '7K Junior Pawitra',
    status: 'paid',
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    payment: {
      txn_id: 'TXN-7K-001',
      order_id: 'ORD-TR-7K-0142',
      amount: 240000,
      fee: 5000,
      admin_fee: 5000,
      gateway_fee: 2015,
      admin_profit: 2985,
      total_payment: 245000,
      payment_method: 'qris',
      status: 'completed',
      completed_at: new Date(Date.now() - 3600000 * 1.8).toISOString(),
      is_sandbox: false,
    },
  },
  {
    id: 'sample-2',
    nama: 'Aditya Pratama',
    email: 'aditya.p@example.com',
    no_bib: '3K-0089',
    no_hp: '082198765432',
    alamat: 'Perum Gatsu Asri Blok C-12',
    kota: 'Surabaya',
    provinsi: 'Jawa Timur',
    kewarganegaraan: 'WNI',
    tanggal_lahir: '1996-11-20',
    jenis_kelamin: 'Laki-laki',
    nama_komunitas: 'Suroboyo Trail Run',
    golongan_darah: 'A',
    riwayat_medis: 'Asma ringan (terkontrol)',
    kontak_darurat: 'Bambang (Kakak) - 082111223344',
    kategori: '3K Hallo Pawitra',
    status: 'paid',
    created_at: new Date(Date.now() - 3600000 * 5).toISOString(),
    payment: {
      txn_id: 'TXN-3K-002',
      order_id: 'ORD-TR-3K-0089',
      amount: 280000,
      fee: 5000,
      admin_fee: 5000,
      gateway_fee: 2295,
      admin_profit: 2705,
      total_payment: 285000,
      payment_method: 'bri_va',
      status: 'completed',
      completed_at: new Date(Date.now() - 3600000 * 4.5).toISOString(),
      is_sandbox: false,
    },
  },
  {
    id: 'sample-3',
    nama: 'Dewi Lestari',
    email: 'dewi.lestari@example.com',
    no_bib: '7K-0205',
    no_hp: '085712345678',
    alamat: 'Jl. Pahlawan No. 18',
    kota: 'Malang',
    provinsi: 'Jawa Timur',
    kewarganegaraan: 'WNI',
    tanggal_lahir: '1998-08-09',
    jenis_kelamin: 'Perempuan',
    nama_komunitas: 'Malang Trail Squad',
    golongan_darah: 'B',
    riwayat_medis: 'Tidak ada',
    kontak_darurat: 'Dr. Agus (Ayah) - 085799887766',
    kategori: '7K Junior Pawitra',
    status: 'pending',
    created_at: new Date(Date.now() - 3600000 * 8).toISOString(),
    payment: {
      txn_id: 'TXN-7K-003',
      order_id: 'ORD-TR-7K-0205',
      amount: 240000,
      fee: 5000,
      admin_fee: 5000,
      gateway_fee: 2015,
      admin_profit: 2985,
      total_payment: 245000,
      payment_method: 'qris',
      status: 'pending',
      is_sandbox: false,
    },
  },
  {
    id: 'sample-4',
    nama: 'Rizky Nugraha',
    email: 'rizky.nugraha@example.com',
    no_bib: '3K-0012',
    no_hp: '081344556677',
    alamat: 'Jl. Kusuma Bangsa No. 03',
    kota: 'Sidoarjo',
    provinsi: 'Jawa Timur',
    kewarganegaraan: 'WNI',
    tanggal_lahir: '2000-01-25',
    jenis_kelamin: 'Laki-laki',
    nama_komunitas: null,
    golongan_darah: 'AB',
    riwayat_medis: 'Pernah cedera lutut tahun 2024',
    kontak_darurat: 'Hj. Endang (Ibu) - 081333221100',
    kategori: '3K Hallo Pawitra',
    status: 'confirmed',
    created_at: new Date(Date.now() - 3600000 * 14).toISOString(),
    payment: {
      txn_id: 'TXN-3K-004',
      order_id: 'ORD-TR-3K-0012',
      amount: 280000,
      fee: 5000,
      admin_fee: 5000,
      gateway_fee: 2295,
      admin_profit: 2705,
      total_payment: 285000,
      payment_method: 'mandiri_va',
      status: 'pending',
      is_sandbox: false,
    },
  },
];
