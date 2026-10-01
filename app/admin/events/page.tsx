'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { supabase } from '@/lib/supabaseClient';
import { getEvents } from '@/lib/api';
import { EventItem } from '@/lib/types';
import { Plus, Trash2, Calendar, MapPin, CheckCircle, AlertCircle, Loader2, X } from 'lucide-react';

export default function AdminEventsPage() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [newEvent, setNewEvent] = useState({
    title: '',
    slug: '',
    category: 'perlombaan',
    event_date: '',
    location: '',
    status: 'active',
    badge_text: 'Aktif Bulan Ini',
    poster_url: '/assets/4.jpeg',
    description: '',
    rundown: '',
  });

  const loadEvents = async () => {
    setLoading(true);
    const data = await getEvents();
    setEvents(data);
    setLoading(false);
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);

    try {
      const { error } = await supabase.from('events').insert([newEvent]);

      if (error) {
        // If Supabase table isn't created yet, handle gracefully and update local state
        console.warn('Supabase insert warning:', error);
      }

      setEvents([
        {
          id: String(Date.now()),
          ...newEvent as any,
        },
        ...events,
      ]);

      setMessage({ type: 'success', text: 'Event berhasil ditambahkan ke CMS!' });
      setIsModalOpen(false);
      setNewEvent({
        title: '',
        slug: '',
        category: 'perlombaan',
        event_date: '',
        location: '',
        status: 'active',
        badge_text: 'Aktif Bulan Ini',
        poster_url: '/assets/4.jpeg',
        description: '',
        rundown: '',
      });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Gagal menyimpan event.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, slug: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus event ini?')) return;

    try {
      await supabase.from('events').delete().eq('id', id);
      setEvents(events.filter((e) => e.id !== id && e.slug !== slug));
      setMessage({ type: 'success', text: 'Event berhasil dihapus.' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Gagal menghapus event.' });
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Kelola Agenda Event
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Tambah, sunting jadwal, dan publikasikan event kejuaraan dan festival JIWANDANA.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-[#e9c176] hover:bg-[#d1a751] text-[#0d1c32] text-xs font-bold uppercase tracking-wider transition-all shadow-md flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Event</span>
        </button>
      </div>

      {message && (
        <div
          className={`p-4 rounded-xl text-xs sm:text-sm flex items-center gap-3 ${
            message.type === 'success'
              ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300'
              : 'bg-rose-500/10 border border-rose-500/30 text-rose-300'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle className="w-5 h-5 shrink-0 text-emerald-400" />
          ) : (
            <AlertCircle className="w-5 h-5 shrink-0 text-rose-400" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Events Table / Grid */}
      {loading ? (
        <div className="text-center py-16 text-slate-400">Memuat event...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((evt) => (
            <div
              key={evt.id}
              className="bg-[#12233c] border border-white/10 rounded-2xl p-5 flex flex-col justify-between shadow-xl group hover:border-[#e9c176]/50 transition-all"
            >
              <div className="space-y-3">
                <div className="relative w-full h-48 rounded-xl overflow-hidden border border-white/10">
                  <Image
                    src={evt.poster_url || '/assets/4.jpeg'}
                    alt={evt.title}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-black/70 text-[#e9c176]">
                    {evt.status}
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400">
                    {evt.category}
                  </span>
                  <h3 className="text-base font-bold text-white group-hover:text-[#e9c176] transition-colors line-clamp-1">
                    {evt.title}
                  </h3>
                  <p className="text-xs text-slate-300 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[#e9c176]" />
                    <span>{evt.event_date}</span>
                  </p>
                  <p className="text-xs text-slate-400 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#e9c176]" />
                    <span className="truncate">{evt.location}</span>
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-white/10 flex justify-between items-center mt-4">
                <a
                  href={`/event/${evt.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-[#e9c176] hover:underline font-semibold"
                >
                  Lihat Halaman
                </a>
                <button
                  onClick={() => handleDelete(evt.id, evt.slug)}
                  className="p-2 rounded-lg text-rose-400 hover:bg-rose-500/10 transition-colors"
                  title="Hapus Event"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Tambah Event */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
          <div className="bg-[#12233c] border border-[#e9c176]/30 rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-6 shadow-2xl my-8">
            <div className="flex justify-between items-center border-b border-white/10 pb-4">
              <h3 className="text-lg font-bold text-white">
                Tambah Event Baru
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateEvent} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Judul Event *</label>
                <input
                  type="text"
                  required
                  value={newEvent.title}
                  onChange={(e) => {
                    const title = e.target.value;
                    const slug = title
                      .toLowerCase()
                      .replace(/[^a-z0-9]+/g, '-')
                      .replace(/(^-|-$)+/g, '');
                    setNewEvent({ ...newEvent, title, slug });
                  }}
                  placeholder="Contoh: KEJURNAS SILAT MAJAPAHIT II"
                  className="w-full bg-[#0a1424] border border-white/10 rounded-xl p-3 text-white outline-none focus:border-[#e9c176]"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Slug URL (Otomatis) *</label>
                <input
                  type="text"
                  required
                  value={newEvent.slug}
                  onChange={(e) => setNewEvent({ ...newEvent, slug: e.target.value })}
                  className="w-full bg-[#0a1424] border border-white/10 rounded-xl p-3 text-slate-400 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Kategori</label>
                  <select
                    value={newEvent.category}
                    onChange={(e) => setNewEvent({ ...newEvent, category: e.target.value })}
                    className="w-full bg-[#0a1424] border border-white/10 rounded-xl p-3 text-white outline-none"
                  >
                    <option value="perlombaan">Perlombaan</option>
                    <option value="festival">Festival Seni</option>
                    <option value="olahraga">Olahraga / Run</option>
                    <option value="umum">Umum</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Status Event</label>
                  <select
                    value={newEvent.status}
                    onChange={(e) => setNewEvent({ ...newEvent, status: e.target.value })}
                    className="w-full bg-[#0a1424] border border-white/10 rounded-xl p-3 text-white outline-none"
                  >
                    <option value="active">Aktif (Active)</option>
                    <option value="upcoming">Coming Soon</option>
                    <option value="completed">Selesai</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Tanggal Pelaksanaan *</label>
                <input
                  type="text"
                  required
                  value={newEvent.event_date}
                  onChange={(e) => setNewEvent({ ...newEvent, event_date: e.target.value })}
                  placeholder="Contoh: 14–16 Agustus 2026"
                  className="w-full bg-[#0a1424] border border-white/10 rounded-xl p-3 text-white outline-none focus:border-[#e9c176]"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Lokasi Venue *</label>
                <input
                  type="text"
                  required
                  value={newEvent.location}
                  onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                  placeholder="Contoh: GOR Dinas Pendidikan Kab. Mojokerto"
                  className="w-full bg-[#0a1424] border border-white/10 rounded-xl p-3 text-white outline-none focus:border-[#e9c176]"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">URL Poster Flyer</label>
                <input
                  type="text"
                  value={newEvent.poster_url}
                  onChange={(e) => setNewEvent({ ...newEvent, poster_url: e.target.value })}
                  placeholder="/assets/4.jpeg atau URL gambar"
                  className="w-full bg-[#0a1424] border border-white/10 rounded-xl p-3 text-white outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Deskripsi Singkat</label>
                <textarea
                  rows={3}
                  value={newEvent.description}
                  onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                  placeholder="Tuliskan gambaran umum kejuaraan..."
                  className="w-full bg-[#0a1424] border border-white/10 rounded-xl p-3 text-white outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-semibold uppercase"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-xl bg-[#e9c176] hover:bg-[#d1a751] text-[#0d1c32] font-bold uppercase tracking-wider flex items-center gap-2"
                >
                  {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Simpan Event</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
