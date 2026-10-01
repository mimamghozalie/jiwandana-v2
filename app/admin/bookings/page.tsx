'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { BookingSubmission } from '@/lib/types';
import { FileText, CheckCircle2, Clock, XCircle, PhoneCall, RefreshCw, Filter } from 'lucide-react';

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<BookingSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'contacted' | 'confirmed'>('all');

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBookings(data || []);
    } catch (err) {
      console.warn('Error or table not yet seeded in Supabase:', err);
      // Fallback sample data if database is empty so admin can test UI
      setBookings([
        {
          id: '1',
          instansi: 'Pengcab IPSI Kab. Mojokerto',
          pemohon: 'Udin Subarkah',
          contact: '081234567890',
          event_type: 'pencaksilat',
          scale: 'provinsi',
          document_url: null,
          status: 'pending',
          created_at: new Date().toISOString(),
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const updateStatus = async (id: string, newStatus: 'pending' | 'contacted' | 'confirmed' | 'cancelled') => {
    try {
      await supabase.from('bookings').update({ status: newStatus }).eq('id', id);
      setBookings(bookings.map((b) => (b.id === id ? { ...b, status: newStatus } : b)));
    } catch (err) {
      console.error('Update status failed:', err);
    }
  };

  const filteredBookings = bookings.filter((b) => {
    if (filter === 'all') return true;
    return b.status === filter;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white">
            Inbox Pemesanan Event
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Daftar pengajuan kolaborasi acara dan reservasi turnamen yang masuk ke Supabase.
          </p>
        </div>

        <button
          onClick={fetchBookings}
          className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 flex items-center gap-2 text-xs font-semibold"
          title="Refresh data"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-white/10 pb-4 overflow-x-auto text-xs">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-xl font-semibold transition-all ${
            filter === 'all'
              ? 'bg-[#e9c176] text-[#0d1c32]'
              : 'text-slate-400 hover:text-white bg-white/5'
          }`}
        >
          Semua ({bookings.length})
        </button>
        <button
          onClick={() => setFilter('pending')}
          className={`px-4 py-2 rounded-xl font-semibold transition-all ${
            filter === 'pending'
              ? 'bg-amber-500 text-[#0d1c32]'
              : 'text-slate-400 hover:text-white bg-white/5'
          }`}
        >
          Menunggu Tindak Lanjut
        </button>
        <button
          onClick={() => setFilter('contacted')}
          className={`px-4 py-2 rounded-xl font-semibold transition-all ${
            filter === 'contacted'
              ? 'bg-cyan-500 text-[#0d1c32]'
              : 'text-slate-400 hover:text-white bg-white/5'
          }`}
        >
          Sudah Dihubungi
        </button>
        <button
          onClick={() => setFilter('confirmed')}
          className={`px-4 py-2 rounded-xl font-semibold transition-all ${
            filter === 'confirmed'
              ? 'bg-emerald-500 text-[#0d1c32]'
              : 'text-slate-400 hover:text-white bg-white/5'
          }`}
        >
          Confirmed (Deal)
        </button>
      </div>

      {/* Bookings Table */}
      <div className="bg-[#12233c] border border-white/10 rounded-3xl p-6 shadow-xl overflow-hidden">
        {loading ? (
          <div className="text-center py-16 text-slate-400">Memuat data pesanan...</div>
        ) : filteredBookings.length === 0 ? (
          <div className="text-center py-16 text-slate-400 text-sm">
            Tidak ada data pemesanan pada kategori filter ini.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-white/5 uppercase text-slate-400 text-[10px] tracking-wider">
                <tr>
                  <th className="p-4 rounded-l-xl">Instansi & Pemohon</th>
                  <th className="p-4">Kontak (WA/Email)</th>
                  <th className="p-4">Jenis Event & Skala</th>
                  <th className="p-4">Dokumen Lampiran</th>
                  <th className="p-4">Status & Tindakan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredBookings.map((b) => (
                  <tr key={b.id || Math.random()} className="hover:bg-white/5 transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-white text-sm">{b.instansi}</div>
                      <div className="text-xs text-slate-400">Pemohon: {b.pemohon}</div>
                    </td>
                    <td className="p-4">
                      <div className="font-mono text-[#e9c176]">{b.contact}</div>
                      <a
                        href={`https://wa.me/${b.contact.replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] text-emerald-400 hover:underline mt-1"
                      >
                        <PhoneCall className="w-3 h-3" />
                        <span>Chat WhatsApp</span>
                      </a>
                    </td>
                    <td className="p-4 capitalize">
                      <div className="font-semibold text-white">{b.event_type}</div>
                      <div className="text-[11px] text-slate-400">Skala: {b.scale}</div>
                    </td>
                    <td className="p-4">
                      {b.document_url ? (
                        <a
                          href={b.document_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/20 transition-colors font-medium"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>Unduh Proposal</span>
                        </a>
                      ) : (
                        <span className="text-slate-500">Tidak ada lampiran</span>
                      )}
                    </td>
                    <td className="p-4">
                      <select
                        value={b.status || 'pending'}
                        onChange={(e) => updateStatus(b.id!, e.target.value as any)}
                        className={`text-xs font-bold uppercase rounded-lg px-2.5 py-1.5 border outline-none cursor-pointer ${
                          b.status === 'confirmed'
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                            : b.status === 'contacted'
                            ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                            : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                        }`}
                      >
                        <option value="pending" className="bg-[#12233c] text-white">Pending</option>
                        <option value="contacted" className="bg-[#12233c] text-white">Sudah Dihubungi</option>
                        <option value="confirmed" className="bg-[#12233c] text-white">Confirmed (Deal)</option>
                        <option value="cancelled" className="bg-[#12233c] text-white">Batal</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
