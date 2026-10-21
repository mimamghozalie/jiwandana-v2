import React from 'react';
import { Download } from 'lucide-react';
import { downloadTrailrunExcelTemplate } from '@/lib/excel-template';

interface BulkUploadBannerProps {
  groupName: string;
}

export function BulkUploadBanner({ groupName }: BulkUploadBannerProps) {
  return (
    <div className="bg-white border border-black/10 rounded-2xl p-6 sm:p-7 shadow-xs space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1.5 flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#C9A227] whitespace-nowrap">
              Pendaftaran Komunitas / Rombongan
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-[#C9A227]/10 text-[#C9A227] border border-[#C9A227]/30 text-[10px] font-bold whitespace-nowrap">
              5 - 20 Peserta
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold whitespace-nowrap">
              Tarif Pre-Sale Terkunci
            </span>
          </div>
          <h3 className="text-lg sm:text-xl font-serif font-bold text-slate-900">
            Registrasi Kolektif via File Excel (7K &amp; 12K)
          </h3>
          <p className="text-xs text-slate-500 max-w-xl leading-relaxed">
            Daftarkan rombongan pelari (5 hingga 20 orang) dengan tarif khusus Pre-Sale tetap (7K: Rp 270.000, 12K: Rp 320.000). Rombongan mendapatkan potongan otomatis <strong>Rp 320.000 tiap kelipatan 10 orang</strong> (10 peserta diskon Rp 320.000, 20 peserta diskon Rp 640.000).
          </p>
        </div>

        {/* Download Button - Gold Primary */}
        <button
          type="button"
          onClick={() => downloadTrailrunExcelTemplate(groupName)}
          className="px-5 py-3 bg-[#C9A227] hover:bg-[#b08d20] text-[#0d1c32] font-bold text-xs uppercase tracking-wider rounded-xl transition-all transform active:scale-95 shadow-md flex items-center gap-2 cursor-pointer shrink-0"
        >
          <Download className="w-4 h-4 text-[#0d1c32]" />
          <span>Unduh Format Template (.xlsx)</span>
        </button>
      </div>

      {/* Quick 3-step pills */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-black/5 text-xs text-slate-600">
        <div className="flex items-center gap-2.5 p-2 rounded-lg bg-slate-50">
          <span className="w-6 h-6 rounded-full bg-[#C9A227] text-[#0d1c32] font-black text-xs flex items-center justify-center shrink-0">
            1
          </span>
          <span>Unduh Template Format Kosong</span>
        </div>
        <div className="flex items-center gap-2.5 p-2 rounded-lg bg-slate-50">
          <span className="w-6 h-6 rounded-full bg-[#C9A227] text-[#0d1c32] font-black text-xs flex items-center justify-center shrink-0">
            2
          </span>
          <span>Isi Data (BIB Otomatis Sistem) &amp; Upload</span>
        </div>
        <div className="flex items-center gap-2.5 p-2 rounded-lg bg-slate-50">
          <span className="w-6 h-6 rounded-full bg-[#C9A227] text-[#0d1c32] font-black text-xs flex items-center justify-center shrink-0">
            3
          </span>
          <span>1 Pembayaran Kolektif (QRIS/VA)</span>
        </div>
      </div>
    </div>
  );
}
