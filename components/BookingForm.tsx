'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { submitBooking } from '@/lib/api';

export default function BookingForm() {
  const searchParams = useSearchParams();

  const [formData, setFormData] = useState({
    instansi: '',
    pemohon: '',
    contact: '',
    event_type: '',
    scale: '',
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Set default category from query param if available
  useEffect(() => {
    const category = searchParams.get('category');
    if (category) {
      setFormData((prev) => ({
        ...prev,
        event_type: category,
      }));
    }
  }, [searchParams]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 10 * 1024 * 1024) {
        setErrorMsg('Ukuran file maksimal 10MB.');
        return;
      }
      setSelectedFile(file);
      setErrorMsg('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      const res = await submitBooking(formData, selectedFile);
      if (res.success) {
        setShowSuccessModal(true);
      } else {
        setErrorMsg(res.error || 'Gagal mengirim formulir pemesanan.');
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
      instansi: '',
      pemohon: '',
      contact: '',
      event_type: '',
      scale: '',
    });
    setSelectedFile(null);
  };

  return (
    <>
      <form
        id="booking-form"
        onSubmit={handleSubmit}
        className="bg-white border border-black/10 rounded-2xl p-6 md:p-10 space-y-6 shadow-sm relative overflow-hidden"
      >
        {errorMsg && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm flex items-center gap-3">
            <span className="material-symbols-outlined text-rose-600 text-lg">error</span>
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Input: Nama Instansi/Komunitas */}
        <div className="space-y-2 relative z-10">
          <label htmlFor="instansi" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
            Nama Instansi/Komunitas
          </label>
          <input
            type="text"
            id="instansi"
            name="instansi"
            required
            value={formData.instansi}
            onChange={handleChange}
            placeholder="Masukkan nama instansi atau nama komunitas Anda"
            className="w-full bg-[#f8f8f8] border border-black/10 focus:border-[#C9A227] focus:ring-1 focus:ring-[#C9A227] text-slate-800 placeholder-slate-400 rounded-xl px-4 py-3.5 transition-all text-sm outline-none"
          />
        </div>

        {/* Input: Nama Pemohon */}
        <div className="space-y-2 relative z-10">
          <label htmlFor="pemohon" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
            Nama Pemohon
          </label>
          <input
            type="text"
            id="pemohon"
            name="pemohon"
            required
            value={formData.pemohon}
            onChange={handleChange}
            placeholder="Contoh: Udin"
            className="w-full bg-[#f8f8f8] border border-black/10 focus:border-[#C9A227] focus:ring-1 focus:ring-[#C9A227] text-slate-800 placeholder-slate-400 rounded-xl px-4 py-3.5 transition-all text-sm outline-none"
          />
        </div>

        {/* Input: Contact Person */}
        <div className="space-y-2 relative z-10">
          <label htmlFor="contact" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
            Contact Person
          </label>
          <input
            type="text"
            id="contact"
            name="contact"
            required
            value={formData.contact}
            onChange={handleChange}
            placeholder="Nomor WhatsApp atau Email aktif"
            className="w-full bg-[#f8f8f8] border border-black/10 focus:border-[#C9A227] focus:ring-1 focus:ring-[#C9A227] text-slate-800 placeholder-slate-400 rounded-xl px-4 py-3.5 transition-all text-sm outline-none"
          />
        </div>

        {/* Select: Pilih Event */}
        <div className="space-y-2 relative z-10">
          <label htmlFor="event_type" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
            Pilih Event
          </label>
          <div className="relative">
            <select
              id="event_type"
              name="event_type"
              required
              value={formData.event_type}
              onChange={handleChange}
              className="w-full bg-[#f8f8f8] border border-black/10 focus:border-[#C9A227] focus:ring-1 focus:ring-[#C9A227] text-slate-800 rounded-xl px-4 py-3.5 transition-all text-sm outline-none appearance-none cursor-pointer"
            >
              <option value="" disabled className="text-slate-400">
                Pilih jenis event...
              </option>
              <optgroup label="Perlombaan" className="bg-white text-[#C9A227] font-semibold">
                <option value="pencaksilat" className="text-slate-800 font-normal">
                  Pencak Silat
                </option>
                <option value="roadrun" className="text-slate-800 font-normal">
                  Road Run
                </option>
                <option value="trailrun" className="text-slate-800 font-normal">
                  Trail Run
                </option>
                <option value="menggambardanmewarnai" className="text-slate-800 font-normal">
                  Menggambar dan Mewarnai
                </option>
                <option value="voli" className="text-slate-800 font-normal">
                  Voli
                </option>
                <option value="panahan" className="text-slate-800 font-normal">
                  Panahan
                </option>
                <option value="streetfight" className="text-slate-800 font-normal">
                  Street Fight
                </option>
                <option value="kickboxing" className="text-slate-800 font-normal">
                  Kick Boxing
                </option>
                <option value="boxing" className="text-slate-800 font-normal">
                  Boxing
                </option>
                <option value="mancing" className="text-slate-800 font-normal">
                  Mancing
                </option>
                <option value="pushbike" className="text-slate-800 font-normal">
                  PushBike
                </option>
                <option value="esport" className="text-slate-800 font-normal">
                  Esport
                </option>
                <option value="badminton" className="text-slate-800 font-normal">
                  Badminton
                </option>
              </optgroup>
              <optgroup label="Festival" className="bg-white text-[#C9A227] font-semibold">
                <option value="silatfestival" className="text-slate-800 font-normal">
                  Silat Festival
                </option>
                <option value="paradeband" className="text-slate-800 font-normal">
                  Parade Band
                </option>
                <option value="tari" className="text-slate-800 font-normal">
                  Tari
                </option>
                <option value="kebudayaan" className="text-slate-800 font-normal">
                  Kebudayaan
                </option>
              </optgroup>
              <option value="other" className="text-slate-800">
                Lainnya (Custom Event)
              </option>
            </select>
            <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
              keyboard_arrow_down
            </span>
          </div>
        </div>

        {/* File: Upload Dokumen Terkait */}
        <div className="space-y-2 relative z-10">
          <label htmlFor="document" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
            Upload Dokumen Terkait
          </label>
          <div className="relative flex items-center justify-center w-full">
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-black/10 border-dashed rounded-xl cursor-pointer bg-[#f8f8f8] hover:bg-[#C9A227]/5 hover:border-[#C9A227]/50 transition-all duration-300">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <span className="material-symbols-outlined text-[#C9A227] text-3xl mb-2">
                  {selectedFile ? 'description' : 'cloud_upload'}
                </span>
                {selectedFile ? (
                  <>
                    <p className="text-xs text-slate-800 font-semibold">{selectedFile.name}</p>
                    <p className="text-[10px] text-slate-500 mt-1">
                      {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB - Klik untuk ganti
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-xs text-slate-600">Klik untuk unggah dokumen (PDF, Docx, JPG)</p>
                    <p className="text-[10px] text-slate-400 mt-1">Maksimal file 10MB</p>
                  </>
                )}
              </div>
              <input
                type="file"
                id="document"
                name="document"
                accept=".pdf,.docx,.doc,.jpg,.jpeg,.png"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Select: Skala Peserta */}
        <div className="space-y-2 relative z-10">
          <label htmlFor="scale" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
            Skala Peserta
          </label>
          <div className="relative">
            <select
              id="scale"
              name="scale"
              required
              value={formData.scale}
              onChange={handleChange}
              className="w-full bg-[#f8f8f8] border border-black/10 focus:border-[#C9A227] focus:ring-1 focus:ring-[#C9A227] text-slate-800 rounded-xl px-4 py-3.5 transition-all text-sm outline-none appearance-none cursor-pointer"
            >
              <option value="" disabled className="text-slate-400">
                Pilih skala peserta...
              </option>
              <option value="kecamatan">Kecamatan</option>
              <option value="kabupaten">Kabupaten</option>
              <option value="provinsi">Provinsi</option>
              <option value="nasional">Nasional</option>
              <option value="internasional">Internasional</option>
            </select>
            <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
              keyboard_arrow_down
            </span>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#C9A227] hover:bg-[#b08d20] disabled:opacity-50 text-[#0d1c32] font-semibold py-4 rounded-xl transition-all duration-300 transform active:scale-95 shadow-md flex items-center justify-center gap-2 text-sm uppercase tracking-wider mt-4"
        >
          {loading ? (
            <>
              <span className="material-symbols-outlined text-md animate-spin">progress_activity</span>
              <span>Menyimpan ke Supabase...</span>
            </>
          ) : (
            <>
              <span className="material-symbols-outlined text-md">send</span>
              <span>Kirim Formulir</span>
            </>
          )}
        </button>
      </form>

      {/* SUCCESS STATE MODAL matching booking-event.html */}
      {showSuccessModal && (
        <div
          id="success-modal"
          className="fixed inset-0 z-[9999] flex items-center justify-center px-4 bg-black/70 backdrop-blur-sm transition-opacity duration-300"
        >
          <div className="bg-white border border-black/10 rounded-2xl p-8 max-w-md w-full text-center space-y-6 transform scale-100 transition-transform duration-300 shadow-2xl">
            <div className="w-16 h-16 bg-[#C9A227]/10 border border-[#C9A227] rounded-full flex items-center justify-center mx-auto">
              <span className="material-symbols-outlined text-[#C9A227] text-3xl">verified</span>
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold font-serif text-slate-900">Pemesanan Terkirim!</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Formulir booking Anda telah berhasil kami terima. Tim JIWANDANA Event Organizer akan segera menghubungi
                Anda dalam waktu 1x24 jam selama hari kerja.
              </p>
            </div>
            <button
              id="close-modal"
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
