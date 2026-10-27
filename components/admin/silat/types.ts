export interface SilatKontingenRow {
  id: string;
  nama_kontingen: string;
  asal_sekolah?: string;
  kota?: string;
  pic_name?: string;
  pic_phone?: string;
  pic_email?: string;
  status: 'pending' | 'paid' | 'verified';
  created_at: string;
  total_atlets?: number;
  total_officials?: number;
}

export interface SilatOfficialRow {
  id: string;
  kontingen_id?: string;
  order_id?: string;
  nama: string;
  jabatan: string;
  nik: string;
  tanggal_lahir?: string;
  kota?: string;
  jenis_kelamin: 'Laki-Laki' | 'Perempuan';
  no_hp?: string;
  email?: string;
  foto_url?: string;
  kk_url?: string;
  created_at: string;
}

export interface SilatAtletRow {
  id: string;
  kontingen_id?: string;
  order_id?: string;
  nama: string;
  asal_sekolah: string;
  nik: string;
  tanggal_lahir: string;
  umur?: number | null;
  tinggi?: number | null;
  berat?: number | null;
  kota?: string;
  jenis_kelamin: 'Laki-Laki' | 'Perempuan';
  tingkat_pendidikan: string;
  kategori_lomba: string;
  kategori_kelas_seni?: string;
  no_hp?: string;
  email?: string;
  foto_url?: string;
  kk_url?: string;
  status: 'pending' | 'paid' | 'confirmed';
  created_at: string;
  kontingen_name?: string;
  payment?: SilatPaymentRow;
}

export interface SilatPaymentRow {
  id: string;
  order_id: string;
  txn_id?: string;
  kontingen_id?: string;
  kontingen_name?: string;
  pic_name?: string;
  pic_phone?: string;
  total_atlet: number;
  subtotal: number;
  fee: number;
  admin_fee: number;
  total_payment: number;
  payment_method: string;
  qr_string?: string;
  va_number?: string;
  status: 'pending' | 'completed' | 'canceled' | 'expired';
  is_sandbox?: boolean;
  expired_at?: string;
  completed_at?: string;
  created_at: string;
}

export interface SilatAdminMetrics {
  totalAtlets: number;
  totalPaidAtlets: number;
  totalPendingAtlets: number;
  totalKontingen: number;
  totalOfficials: number;
  totalRevenue: number;
  pendingRevenue: number;
}
