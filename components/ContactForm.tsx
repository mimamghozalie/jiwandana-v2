'use client';

import React, { useState } from 'react';
import { submitContact } from '@/lib/api';

export default function ContactForm() {
  const [formData, setFormData] = useState({
    nama: '',
    email: '',
    jenis_acara: 'Kejuaraan Pencak Silat',
    detail_acara: '',
  });

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      const res = await submitContact(formData);
      if (res.success) {
        setShowSuccessModal(true);
      } else {
        setErrorMsg(res.error || 'Gagal mengirim pesan.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Terjadi kesalahan sistem.');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    setShowSuccessModal(false);
    setFormData({
      nama: '',
      email: '',
      jenis_acara: 'Kejuaraan Pencak Silat',
      detail_acara: '',
    });
  };

  return (
    <>
      <form
        id="contact-form"
        onSubmit={handleSubmit}
        className="space-y-6 bg-white p-8 md:p-10 border border-black/10 rounded-2xl shadow-sm"
      >
        <h3 className="text-xl font-bold font-serif text-slate-900 mb-6">
          Kirim Pesan Langsung
        </h3>

        {errorMsg && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm flex items-center gap-3">
            <span className="material-symbols-outlined text-rose-600 text-lg">error</span>
            <span>{errorMsg}</span>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Nama Lengkap
          </label>
          <input
            type="text"
            id="contact-nama"
            required
            value={formData.nama}
            onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
            placeholder="Masukkan nama Anda"
            className="w-full bg-[#f8f8f8] border border-black/10 rounded-xl p-4 text-slate-800 placeholder-slate-400 focus:border-[#C9A227] focus:ring-1 focus:ring-[#C9A227] outline-none transition-all text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Email
          </label>
          <input
            type="email"
            id="contact-email"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="Masukkan email Anda"
            className="w-full bg-[#f8f8f8] border border-black/10 rounded-xl p-4 text-slate-800 placeholder-slate-400 focus:border-[#C9A227] focus:ring-1 focus:ring-[#C9A227] outline-none transition-all text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Jenis Acara
          </label>
          <select
            id="contact-jenis"
            value={formData.jenis_acara}
            onChange={(e) => setFormData({ ...formData, jenis_acara: e.target.value })}
            className="w-full bg-[#f8f8f8] border border-black/10 rounded-xl p-4 text-slate-800 focus:border-[#C9A227] focus:ring-1 focus:ring-[#C9A227] outline-none transition-all text-sm cursor-pointer"
          >
            <option value="Kejuaraan Pencak Silat">Kejuaraan Pencak Silat</option>
            <option value="Festival Seni & Kebudayaan">Festival Seni & Kebudayaan</option>
            <option value="Gala Korporat">Gala Korporat</option>
            <option value="Acara Olahraga & Lari">Acara Olahraga & Lari</option>
            <option value="Lainnya">Lainnya</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Detail Acara
          </label>
          <textarea
            id="contact-detail"
            required
            rows={4}
            value={formData.detail_acara}
            onChange={(e) => setFormData({ ...formData, detail_acara: e.target.value })}
            placeholder="Ceritakan tanggal, lokasi, atau konsep acara Anda..."
            className="w-full bg-[#f8f8f8] border border-black/10 rounded-xl p-4 text-slate-800 placeholder-slate-400 focus:border-[#C9A227] focus:ring-1 focus:ring-[#C9A227] outline-none h-32 transition-all text-sm resize-none"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#C9A227] hover:bg-[#b08d20] disabled:opacity-50 text-[#0d1c32] font-semibold py-4 rounded-xl transition-all duration-300 transform active:scale-95 shadow-md flex items-center justify-center gap-2 text-sm uppercase tracking-wider mt-4"
        >
          {loading ? (
            <>
              <span className="material-symbols-outlined text-md animate-spin">sync</span>
              <span>Mengirim...</span>
            </>
          ) : (
            <span>Kirim Permintaan</span>
          )}
        </button>
      </form>

      {/* SUCCESS STATE MODAL */}
      {showSuccessModal && (
        <div
          id="success-modal"
          className="fixed inset-0 z-[9999] flex items-center justify-center px-4 bg-black/70 backdrop-blur-sm transition-opacity duration-300"
          onClick={handleCloseModal}
        >
          <div
            className="bg-white border border-black/10 rounded-2xl p-8 max-w-md w-full text-center space-y-6 transform scale-100 transition-transform duration-300 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-16 h-16 bg-[#C9A227]/10 border border-[#C9A227] rounded-full flex items-center justify-center mx-auto">
              <span className="material-symbols-outlined text-[#C9A227] text-3xl">verified</span>
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold font-serif text-slate-900">Pesan Terkirim!</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Terima kasih telah menghubungi kami. Tim JIWANDANA akan segera merespons pesan Anda dalam waktu 1x24 jam.
              </p>
            </div>
            <button
              id="close-modal"
              type="button"
              onClick={handleCloseModal}
              className="w-full bg-[#C9A227] hover:bg-[#b08d20] text-[#0d1c32] font-semibold py-3 rounded-xl transition-colors text-sm uppercase tracking-wider shadow-sm"
            >
              Selesai
            </button>
          </div>
        </div>
      )}
    </>
  );
}
