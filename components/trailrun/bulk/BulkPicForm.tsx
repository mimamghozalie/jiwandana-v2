import React, { useRef } from 'react';
import { User, Upload, CheckCircle2, FileSpreadsheet, AlertTriangle } from 'lucide-react';
import { PicData } from './types';

interface BulkPicFormProps {
  picData: PicData;
  onPicChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  fileName: string;
  parsing: boolean;
  parseError: string;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function BulkPicForm({
  picData,
  onPicChange,
  fileName,
  parsing,
  parseError,
  onFileUpload,
}: BulkPicFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="space-y-6">
      {/* 2. PIC / Coordinator Info */}
      <div className="bg-white border border-black/10 rounded-2xl p-6 sm:p-7 shadow-xs space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-black/5">
          <User className="w-5 h-5 text-[#C9A227]" />
          <h4 className="text-sm font-bold uppercase tracking-wider text-slate-900">
            Data Penanggung Jawab (PIC / Koordinator Rombongan)
          </h4>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
              Nama Lengkap PIC <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              name="pic_name"
              value={picData.pic_name}
              onChange={onPicChange}
              placeholder="Nama koordinator komunitas"
              className="w-full bg-[#f8f8f8] border border-black/10 focus:border-[#C9A227] rounded-xl px-4 py-3 text-xs sm:text-sm text-slate-900 outline-none"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
              No WhatsApp PIC <span className="text-rose-500">*</span>
            </label>
            <input
              type="tel"
              name="pic_phone"
              value={picData.pic_phone}
              onChange={onPicChange}
              placeholder="08xxxxxxxxxx"
              className="w-full bg-[#f8f8f8] border border-black/10 focus:border-[#C9A227] rounded-xl px-4 py-3 text-xs sm:text-sm text-slate-900 outline-none"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
              Email PIC <span className="text-rose-500">*</span>
            </label>
            <input
              type="email"
              name="pic_email"
              value={picData.pic_email}
              onChange={onPicChange}
              placeholder="email@komunitas.com"
              className="w-full bg-[#f8f8f8] border border-black/10 focus:border-[#C9A227] rounded-xl px-4 py-3 text-xs sm:text-sm text-slate-900 outline-none"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
              Nama Komunitas / Running Club
            </label>
            <input
              type="text"
              name="group_name"
              value={picData.group_name}
              onChange={onPicChange}
              placeholder="Contoh: Pawitra Trail Runners"
              className="w-full bg-[#f8f8f8] border border-black/10 focus:border-[#C9A227] rounded-xl px-4 py-3 text-xs sm:text-sm text-slate-900 outline-none"
            />
          </div>
        </div>
      </div>

      {/* 3. Upload File Excel Dropzone */}
      <div className="bg-white border border-black/10 rounded-2xl p-6 sm:p-7 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-black/5">
          <div className="flex items-center gap-2.5">
            <Upload className="w-5 h-5 text-[#C9A227]" />
            <h4 className="text-sm font-bold uppercase tracking-wider text-slate-900">
              Unggah File Excel yang Telah Diisi
            </h4>
          </div>
          {fileName && (
            <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" />
              {fileName}
            </span>
          )}
        </div>

        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-black/15 hover:border-[#C9A227] rounded-2xl p-8 text-center bg-[#fcfcfc] hover:bg-[#fffdf7] transition-all cursor-pointer space-y-3"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx, .xls, .csv"
            onChange={onFileUpload}
            className="hidden"
          />

          <div className="w-14 h-14 mx-auto rounded-2xl bg-[#C9A227]/10 border border-[#C9A227]/30 flex items-center justify-center text-[#C9A227]">
            <FileSpreadsheet className="w-7 h-7" />
          </div>

          <div className="space-y-1">
            <strong className="text-sm text-slate-800 block font-semibold">
              {parsing
                ? 'Sedang membaca file Excel...'
                : 'Klik atau Tarik File Excel (.xlsx / .xls) ke Sini'}
            </strong>
            <p className="text-xs text-slate-400">
              Mendukung file spreadsheet Microsoft Excel (.xlsx, .xls) dan CSV
            </p>
          </div>
        </div>

        {parseError && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-500" />
            <span>{parseError}</span>
          </div>
        )}
      </div>
    </div>
  );
}
