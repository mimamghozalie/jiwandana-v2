import { Suspense } from 'react';
import { Metadata } from 'next';
import AdminAllPesertaClient from './AdminAllPesertaClient';
import { RefreshCw } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Meja Verifikasi RPC & Semua Peserta | Admin Trailrun Pawitra 2026',
  description:
    'Pusat verifikasi pengambilan Race Pack Collection (RPC) Pawitra Trail Run 2026. Checklist mandatory gear, waiver, surat sehat, surat izin ortu, strava 5k, dan status penyerahan paket.',
};

export default function AdminAllPesertaPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[50vh] flex items-center justify-center p-6 text-slate-400">
          <div className="flex items-center gap-2.5 text-sm font-semibold">
            <RefreshCw className="w-5 h-5 text-[#C9A227] animate-spin" />
            <span>Memuat Meja Verifikasi RPC...</span>
          </div>
        </div>
      }
    >
      <AdminAllPesertaClient />
    </Suspense>
  );
}
