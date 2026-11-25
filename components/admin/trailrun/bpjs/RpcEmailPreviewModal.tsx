'use client';

import React, { useState } from 'react';
import {
  X,
  Mail,
  Copy,
  Check,
  ExternalLink,
  Sparkles,
  QrCode,
  Calendar,
  Eye,
} from 'lucide-react';
import {
  generateRpcEmailHtml,
  getRpcEmailSubject,
  copyRpcEmailToClipboard,
  openGmailCompose,
} from '@/lib/rpcEmailTemplate';

export interface RpcEmailPreviewParticipant {
  nama: string;
  no_bib: string;
  kategori?: string | null;
  email?: string | null;
}

interface RpcEmailPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  participant: RpcEmailPreviewParticipant | null;
}

export default function RpcEmailPreviewModal({
  isOpen,
  onClose,
  participant,
}: RpcEmailPreviewModalProps) {
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedSubject, setCopiedSubject] = useState(false);
  const [copiedHtml, setCopiedHtml] = useState(false);
  const [toastText, setToastText] = useState<string | null>(null);

  if (!isOpen || !participant) return null;

  const subject = getRpcEmailSubject(participant.no_bib);
  const htmlContent = generateRpcEmailHtml({
    nama: participant.nama,
    no_bib: participant.no_bib,
    kategori: participant.kategori || undefined,
    email: participant.email || undefined,
  });

  const showToast = (text: string) => {
    setToastText(text);
    setTimeout(() => setToastText(null), 3000);
  };

  const handleCopyEmail = async () => {
    if (!participant.email) return;
    try {
      await navigator.clipboard.writeText(participant.email);
      setCopiedEmail(true);
      showToast('Alamat email berhasil disalin!');
      setTimeout(() => setCopiedEmail(false), 2000);
    } catch {
      showToast('Gagal menyalin email.');
    }
  };

  const handleCopySubject = async () => {
    try {
      await navigator.clipboard.writeText(subject);
      setCopiedSubject(true);
      showToast('Subjek email berhasil disalin!');
      setTimeout(() => setCopiedSubject(false), 2000);
    } catch {
      showToast('Gagal menyalin subjek.');
    }
  };

  const handleCopyHtml = async () => {
    const res = await copyRpcEmailToClipboard({
      nama: participant.nama,
      no_bib: participant.no_bib,
      kategori: participant.kategori || undefined,
      email: participant.email || undefined,
    });
    if (res.success) {
      setCopiedHtml(true);
      showToast('Isi Email (Rich HTML) berhasil disalin! Siap dipaste (Ctrl+V) di Gmail.');
      setTimeout(() => setCopiedHtml(false), 2500);
    } else {
      showToast(res.error || 'Gagal menyalin isi email.');
    }
  };

  const handleOpenGmail = () => {
    openGmailCompose(participant.email || '', subject);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]">
      <div className="w-full max-w-4xl bg-[#0a1424] rounded-2xl border border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-[scaleUp_0.2s_ease-out]">
        {/* Header Modal */}
        <div className="p-5 sm:p-6 border-b border-white/10 bg-black/40 flex items-start justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[11px] font-bold uppercase tracking-wider mb-2">
              <Mail className="w-3.5 h-3.5" />
              <span>Preview Template Email RPC</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-white font-sans flex items-center gap-2">
              <span>Pratinjau &amp; Salin Email RPC</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Untuk:{' '}
              <strong className="text-white">{participant.nama}</strong> • BIB:{' '}
              <strong className="text-amber-300 font-mono">{participant.no_bib || '-'}</strong> •{' '}
              Kategori:{' '}
              <strong className="text-purple-300 font-mono">{participant.kategori || '12K'}</strong>
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Info Box: Penerima & Subjek */}
        <div className="p-4 sm:p-5 bg-black/20 border-b border-white/10 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            {/* Field Penerima */}
            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-between gap-2">
              <div className="min-w-0">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">
                  Alamat Email Penerima
                </span>
                <span className="font-mono text-sm text-white font-bold truncate block">
                  {participant.email || '(Email belum diisi)'}
                </span>
              </div>
              <button
                type="button"
                disabled={!participant.email}
                onClick={handleCopyEmail}
                className="px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-200 text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-40"
                title="Salin Alamat Email"
              >
                {copiedEmail ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Tersalin!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Salin</span>
                  </>
                )}
              </button>
            </div>

            {/* Field Subjek */}
            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-between gap-2">
              <div className="min-w-0">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">
                  Subjek Email
                </span>
                <span className="text-xs text-slate-200 font-medium truncate block" title={subject}>
                  {subject}
                </span>
              </div>
              <button
                type="button"
                onClick={handleCopySubject}
                className="px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-200 text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Salin Subjek Email"
              >
                {copiedSubject ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Tersalin!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Salin</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Quick Action Buttons Row */}
          <div className="flex flex-wrap items-center justify-between gap-2.5 pt-1">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopyHtml}
                className={`px-4 py-2 rounded-xl font-bold text-xs uppercase tracking-wider shadow-md transition-all inline-flex items-center gap-2 cursor-pointer ${
                  copiedHtml
                    ? 'bg-emerald-600 text-white'
                    : 'bg-[#C9A227] hover:bg-amber-400 text-[#0d1c32]'
                }`}
              >
                {copiedHtml ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Isi Email Tersalin!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Salin Isi Email RPC (HTML)</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleOpenGmail}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/10 text-xs font-bold uppercase tracking-wider inline-flex items-center gap-2 transition-all cursor-pointer"
              >
                <ExternalLink className="w-4 h-4 text-rose-400" />
                <span>Buka di Gmail Web</span>
              </button>
            </div>

            <span className="text-[11px] text-slate-400 hidden sm:inline">
              💡 Buka Gmail, lalu tekan <kbd className="px-1.5 py-0.5 rounded bg-black/60 border border-white/20 font-mono text-[10px] text-amber-300">Ctrl+V</kbd> di badan email.
            </span>
          </div>
        </div>

        {/* Live Preview Iframe Container */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-900/60 flex justify-center">
          <div className="w-full max-w-[620px] bg-white rounded-2xl overflow-hidden shadow-2xl border border-slate-300/40">
            <iframe
              srcDoc={htmlContent}
              title="Pratinjau Email RPC"
              className="w-full h-[520px] border-none block"
            />
          </div>
        </div>

        {/* Footer Modal */}
        <div className="p-4 bg-black/60 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="text-slate-400 flex items-center gap-1.5 text-[11px]">
            {toastText ? (
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <Check className="w-3.5 h-3.5" />
                {toastText}
              </span>
            ) : (
              <span>Template sesuai standar resmi Light Theme Pawitra Trail Run 2026.</span>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 text-xs font-semibold transition-colors cursor-pointer"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
