'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { supabase } from '@/lib/supabaseClient';
import { getEvents } from '@/lib/api';
import { EventItem } from '@/lib/types';
import {
  Plus,
  Trash2,
  Edit3,
  Calendar,
  MapPin,
  CheckCircle,
  AlertCircle,
  Loader2,
  X,
  ExternalLink,
  RefreshCw,
  Search,
  Link as LinkIcon,
} from 'lucide-react';

export default function AdminEventsPage() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const defaultNewEvent = {
    title: '',
    slug: '',
    category: 'perlombaan' as const,
    event_date: '',
    location: '',
    status: 'active' as const,
    badge_text: 'Coming Soon',
    poster_url: '/assets/4.jpeg',
    description: '',
    registration_url: '',
    portfolio_url: '',
    rundown: '',
  };

  const [newEvent, setNewEvent] = useState(defaultNewEvent);
  const [editingEvent, setEditingEvent] = useState<EventItem | null>(null);

  const loadEvents = async () => {
    try {
      const data = await getEvents();
      setEvents(data);
    } catch (err: any) {
      console.error('Failed to load events:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadEvents();
  };

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
  };

  // CREATE EVENT
  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);

    const payload = {
      title: newEvent.title.trim(),
      slug: newEvent.slug.trim(),
      category: newEvent.category,
      event_date: newEvent.event_date.trim(),
      location: newEvent.location.trim(),
      status: newEvent.status,
      badge_text: newEvent.badge_text.trim(),
      poster_url: newEvent.poster_url.trim() || '/assets/4.jpeg',
      description: newEvent.description.trim(),
      registration_url: newEvent.registration_url.trim() || null,
      portfolio_url: newEvent.portfolio_url.trim() || null,
      rundown: newEvent.rundown.trim() || null,
    };

    try {
      const { data, error } = await supabase
        .from('events')
        .insert([payload])
        .select('*');

      if (error) {
        console.warn('Supabase insert warning:', error);
      }

      const createdItem: EventItem = data && data[0]
        ? data[0]
        : {
            id: String(Date.now()),
            ...payload,
          };

      setEvents((prev) => [createdItem, ...prev.filter((e) => e.slug !== createdItem.slug)]);

      setMessage({ type: 'success', text: `Event "${payload.title}" berhasil ditambahkan ke Supabase & CMS!` });
      setIsCreateModalOpen(false);
      setNewEvent(defaultNewEvent);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Gagal menyimpan event ke database.' });
    } finally {
      setSubmitting(false);
    }
  };

  // OPEN EDIT MODAL
  const openEditModal = (evt: EventItem) => {
    setEditingEvent({ ...evt });
    setIsEditModalOpen(true);
  };

  // SAVE EDITED EVENT
  const handleUpdateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEvent) return;

    setSubmitting(true);
    setMessage(null);

    const updatePayload = {
      title: editingEvent.title.trim(),
      slug: editingEvent.slug.trim(),
      category: editingEvent.category,
      event_date: editingEvent.event_date.trim(),
      location: editingEvent.location.trim(),
      status: editingEvent.status,
      badge_text: editingEvent.badge_text?.trim() || '',
      poster_url: editingEvent.poster_url?.trim() || '/assets/4.jpeg',
      description: editingEvent.description?.trim() || '',
      registration_url: editingEvent.registration_url?.trim() || null,
      portfolio_url: editingEvent.portfolio_url?.trim() || null,
    };

    try {
      // Update by id if exists, or by slug
      let query = supabase.from('events').update(updatePayload);
      if (editingEvent.id) {
        query = query.eq('id', editingEvent.id);
      } else {
        query = query.eq('slug', editingEvent.slug);
      }

      const { error } = await query;
      if (error) {
        console.warn('Supabase update warning:', error);
      }

      setEvents((prev) =>
        prev.map((item): EventItem =>
          item.id === editingEvent.id || item.slug === editingEvent.slug
            ? { ...item, ...updatePayload }
            : item
        )
      );

      setMessage({ type: 'success', text: `Event "${updatePayload.title}" berhasil diperbarui!` });
      setIsEditModalOpen(false);
      setEditingEvent(null);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Gagal memperbarui event.' });
    } finally {
      setSubmitting(false);
    }
  };

  // DELETE EVENT
  const handleDelete = async (id: string, slug: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus event ini?')) return;

    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .or(`id.eq.${id},slug.eq.${slug}`);

      if (error) {
        console.warn('Supabase delete warning:', error);
      }

      setEvents((prev) => prev.filter((e) => e.id !== id && e.slug !== slug));
      setMessage({ type: 'success', text: 'Event berhasil dihapus dari database.' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Gagal menghapus event.' });
    }
  };

  // FILTERED EVENTS
  const filteredEvents = useMemo(() => {
    return events.filter((evt) => {
      const matchSearch =
        searchQuery === '' ||
        evt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        evt.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        evt.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        evt.slug.toLowerCase().includes(searchQuery.toLowerCase());

      const matchCategory = filterCategory === 'all' || evt.category === filterCategory;
      const matchStatus = filterStatus === 'all' || evt.status === filterStatus;

      return matchSearch && matchCategory && matchStatus;
    });
  }, [events, searchQuery, filterCategory, filterStatus]);

  return (
    <div className="space-y-8 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Kelola Agenda Event
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Tambah, sunting jadwal, link registrasi, dan publikasikan event kejuaraan dan festival JIWANDANA via Supabase.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 transition-colors flex items-center gap-2 text-xs font-semibold"
            title="Muat Ulang dari Supabase"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-[#e9c176]' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-[#e9c176] hover:bg-[#d1a751] text-[#0d1c32] text-xs font-bold uppercase tracking-wider transition-all shadow-md flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Event</span>
          </button>
        </div>
      </div>

      {/* Alert Notification */}
      {message && (
        <div
          className={`p-4 rounded-xl text-xs sm:text-sm flex items-center justify-between gap-3 ${
            message.type === 'success'
              ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300'
              : 'bg-rose-500/10 border border-rose-500/30 text-rose-300'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {message.type === 'success' ? (
              <CheckCircle className="w-5 h-5 shrink-0 text-emerald-400" />
            ) : (
              <AlertCircle className="w-5 h-5 shrink-0 text-rose-400" />
            )}
            <span>{message.text}</span>
          </div>
          <button
            onClick={() => setMessage(null)}
            className="text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Filters & Search Toolbar */}
      <div className="bg-[#12233c] border border-white/10 rounded-2xl p-4 flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari event, judul, lokasi, atau slug..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#0a1424] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 outline-none focus:border-[#e9c176]"
          />
        </div>

        <div className="flex flex-wrap sm:flex-nowrap gap-2">
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="bg-[#0a1424] border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-300 outline-none focus:border-[#e9c176]"
          >
            <option value="all">Semua Kategori</option>
            <option value="perlombaan">Perlombaan</option>
            <option value="olahraga">Olahraga / Run</option>
            <option value="festival">Festival Seni</option>
            <option value="umum">Umum</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-[#0a1424] border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-300 outline-none focus:border-[#e9c176]"
          >
            <option value="all">Semua Status</option>
            <option value="active">Active (Aktif)</option>
            <option value="upcoming">Upcoming (Coming Soon)</option>
            <option value="completed">Completed (Selesai)</option>
          </select>
        </div>
      </div>

      {/* Events Grid */}
      {loading ? (
        <div className="text-center py-20 text-slate-400 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-6 h-6 animate-spin text-[#e9c176]" />
          <span className="text-xs">Memuat data agenda event dari Supabase...</span>
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="text-center py-16 bg-[#12233c]/50 border border-white/10 rounded-2xl text-slate-400">
          <p className="text-sm font-semibold text-white mb-1">Tidak ada event ditemukan</p>
          <p className="text-xs text-slate-400">
            Coba ubah kata kunci pencarian atau filter yang dipilih.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((evt) => (
            <div
              key={evt.id || evt.slug}
              className="bg-[#12233c] border border-white/10 rounded-2xl p-5 flex flex-col justify-between shadow-xl group hover:border-[#e9c176]/50 transition-all"
            >
              <div className="space-y-3">
                <div className="relative w-full h-48 rounded-xl overflow-hidden border border-white/10 bg-slate-900">
                  <Image
                    src={evt.poster_url || '/assets/4.jpeg'}
                    alt={evt.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-2 left-2 flex gap-1.5">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        evt.status === 'active'
                          ? 'bg-emerald-500/90 text-white'
                          : evt.status === 'upcoming'
                          ? 'bg-amber-500/90 text-[#0d1c32]'
                          : 'bg-slate-700/90 text-slate-200'
                      }`}
                    >
                      {evt.status}
                    </span>
                    {evt.badge_text && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-black/70 text-[#e9c176]">
                        {evt.badge_text}
                      </span>
                    )}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold text-[#e9c176] tracking-wider">
                      {evt.category}
                    </span>
                    <span className="text-[10px] text-slate-400">/{evt.slug}</span>
                  </div>

                  <h3 className="text-base font-bold text-white group-hover:text-[#e9c176] transition-colors line-clamp-1">
                    {evt.title}
                  </h3>

                  <p className="text-xs text-slate-300 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[#e9c176] shrink-0" />
                    <span>{evt.event_date}</span>
                  </p>
                  <p className="text-xs text-slate-400 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#e9c176] shrink-0" />
                    <span className="truncate">{evt.location}</span>
                  </p>

                  {evt.registration_url && (
                    <p className="text-[11px] text-cyan-400 flex items-center gap-1 truncate pt-1">
                      <LinkIcon className="w-3 h-3 shrink-0" />
                      <span className="truncate">{evt.registration_url}</span>
                    </p>
                  )}

                  <p className="text-xs text-slate-400 line-clamp-2 pt-1">
                    {evt.description}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-white/10 flex justify-between items-center mt-4">
                <a
                  href={`/event/${evt.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-[#e9c176] hover:underline font-semibold flex items-center gap-1"
                >
                  <span>Halaman</span>
                  <ExternalLink className="w-3 h-3" />
                </a>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEditModal(evt)}
                    className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
                    title="Edit Event"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(evt.id, evt.slug)}
                    className="p-2 rounded-lg text-rose-400 hover:bg-rose-500/10 transition-colors"
                    title="Hapus Event"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL: TAMBAH EVENT BARU */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
          <div className="bg-[#12233c] border border-[#e9c176]/30 rounded-3xl p-6 sm:p-8 max-w-xl w-full space-y-6 shadow-2xl my-8">
            <div className="flex justify-between items-center border-b border-white/10 pb-4">
              <h3 className="text-lg font-bold text-white">
                Tambah Event Baru ke Supabase
              </h3>
              <button
                onClick={() => setIsCreateModalOpen(false)}
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
                    const slug = generateSlug(title);
                    setNewEvent({ ...newEvent, title, slug });
                  }}
                  placeholder="Contoh: Trailrun Lintas Candi"
                  className="w-full bg-[#0a1424] border border-white/10 rounded-xl p-3 text-white outline-none focus:border-[#e9c176]"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Slug URL (Unik) *</label>
                <input
                  type="text"
                  required
                  value={newEvent.slug}
                  onChange={(e) => setNewEvent({ ...newEvent, slug: generateSlug(e.target.value) })}
                  className="w-full bg-[#0a1424] border border-white/10 rounded-xl p-3 text-white outline-none focus:border-[#e9c176]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Kategori</label>
                  <select
                    value={newEvent.category}
                    onChange={(e) => setNewEvent({ ...newEvent, category: e.target.value as any })}
                    className="w-full bg-[#0a1424] border border-white/10 rounded-xl p-3 text-white outline-none focus:border-[#e9c176]"
                  >
                    <option value="olahraga">Olahraga / Trailrun</option>
                    <option value="perlombaan">Perlombaan</option>
                    <option value="festival">Festival Seni</option>
                    <option value="umum">Umum</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Status Event</label>
                  <select
                    value={newEvent.status}
                    onChange={(e) => setNewEvent({ ...newEvent, status: e.target.value as any })}
                    className="w-full bg-[#0a1424] border border-white/10 rounded-xl p-3 text-white outline-none focus:border-[#e9c176]"
                  >
                    <option value="active">Active (Aktif / Buka Pendaftaran)</option>
                    <option value="upcoming">Upcoming (Coming Soon)</option>
                    <option value="completed">Completed (Selesai)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Tanggal Pelaksanaan *</label>
                  <input
                    type="text"
                    required
                    value={newEvent.event_date}
                    onChange={(e) => setNewEvent({ ...newEvent, event_date: e.target.value })}
                    placeholder="Contoh: coming soon. atau 14–16 Agustus 2026"
                    className="w-full bg-[#0a1424] border border-white/10 rounded-xl p-3 text-white outline-none focus:border-[#e9c176]"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Badge Tag</label>
                  <input
                    type="text"
                    value={newEvent.badge_text}
                    onChange={(e) => setNewEvent({ ...newEvent, badge_text: e.target.value })}
                    placeholder="Contoh: Coming Soon, Terbuka, Eksklusif"
                    className="w-full bg-[#0a1424] border border-white/10 rounded-xl p-3 text-white outline-none focus:border-[#e9c176]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Lokasi Venue *</label>
                <input
                  type="text"
                  required
                  value={newEvent.location}
                  onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                  placeholder="Contoh: Pegunungan Pawitra, Mojokerto"
                  className="w-full bg-[#0a1424] border border-white/10 rounded-xl p-3 text-white outline-none focus:border-[#e9c176]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Link Pendaftaran (Opsional)</label>
                  <input
                    type="text"
                    value={newEvent.registration_url}
                    onChange={(e) => setNewEvent({ ...newEvent, registration_url: e.target.value })}
                    placeholder="Contoh: /trailrun atau URL eksternal"
                    className="w-full bg-[#0a1424] border border-white/10 rounded-xl p-3 text-white outline-none focus:border-[#e9c176]"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">URL Poster Flyer</label>
                  <input
                    type="text"
                    value={newEvent.poster_url}
                    onChange={(e) => setNewEvent({ ...newEvent, poster_url: e.target.value })}
                    placeholder="/assets/jiwandana_trailrun_1.jpeg"
                    className="w-full bg-[#0a1424] border border-white/10 rounded-xl p-3 text-white outline-none focus:border-[#e9c176]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Deskripsi Singkat</label>
                <textarea
                  rows={3}
                  value={newEvent.description}
                  onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                  placeholder="Tuliskan gambaran umum kejuaraan / kompetisi..."
                  className="w-full bg-[#0a1424] border border-white/10 rounded-xl p-3 text-white outline-none focus:border-[#e9c176]"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
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

      {/* MODAL: EDIT EVENT */}
      {isEditModalOpen && editingEvent && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
          <div className="bg-[#12233c] border border-[#e9c176]/30 rounded-3xl p-6 sm:p-8 max-w-xl w-full space-y-6 shadow-2xl my-8">
            <div className="flex justify-between items-center border-b border-white/10 pb-4">
              <div>
                <h3 className="text-lg font-bold text-white">
                  Edit Agenda Event
                </h3>
                <p className="text-xs text-slate-400">/{editingEvent.slug}</p>
              </div>
              <button
                onClick={() => {
                  setIsEditModalOpen(false);
                  setEditingEvent(null);
                }}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateEvent} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Judul Event *</label>
                <input
                  type="text"
                  required
                  value={editingEvent.title}
                  onChange={(e) => setEditingEvent({ ...editingEvent, title: e.target.value })}
                  className="w-full bg-[#0a1424] border border-white/10 rounded-xl p-3 text-white outline-none focus:border-[#e9c176]"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Slug URL *</label>
                <input
                  type="text"
                  required
                  value={editingEvent.slug}
                  onChange={(e) => setEditingEvent({ ...editingEvent, slug: generateSlug(e.target.value) })}
                  className="w-full bg-[#0a1424] border border-white/10 rounded-xl p-3 text-white outline-none focus:border-[#e9c176]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Kategori</label>
                  <select
                    value={editingEvent.category}
                    onChange={(e) => setEditingEvent({ ...editingEvent, category: e.target.value as any })}
                    className="w-full bg-[#0a1424] border border-white/10 rounded-xl p-3 text-white outline-none focus:border-[#e9c176]"
                  >
                    <option value="olahraga">Olahraga / Trailrun</option>
                    <option value="perlombaan">Perlombaan</option>
                    <option value="festival">Festival Seni</option>
                    <option value="umum">Umum</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Status Event</label>
                  <select
                    value={editingEvent.status}
                    onChange={(e) => setEditingEvent({ ...editingEvent, status: e.target.value as any })}
                    className="w-full bg-[#0a1424] border border-white/10 rounded-xl p-3 text-white outline-none focus:border-[#e9c176]"
                  >
                    <option value="active">Active (Aktif / Buka Pendaftaran)</option>
                    <option value="upcoming">Upcoming (Coming Soon)</option>
                    <option value="completed">Completed (Selesai)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Tanggal Pelaksanaan *</label>
                  <input
                    type="text"
                    required
                    value={editingEvent.event_date}
                    onChange={(e) => setEditingEvent({ ...editingEvent, event_date: e.target.value })}
                    className="w-full bg-[#0a1424] border border-white/10 rounded-xl p-3 text-white outline-none focus:border-[#e9c176]"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Badge Tag</label>
                  <input
                    type="text"
                    value={editingEvent.badge_text || ''}
                    onChange={(e) => setEditingEvent({ ...editingEvent, badge_text: e.target.value })}
                    className="w-full bg-[#0a1424] border border-white/10 rounded-xl p-3 text-white outline-none focus:border-[#e9c176]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Lokasi Venue *</label>
                <input
                  type="text"
                  required
                  value={editingEvent.location}
                  onChange={(e) => setEditingEvent({ ...editingEvent, location: e.target.value })}
                  className="w-full bg-[#0a1424] border border-white/10 rounded-xl p-3 text-white outline-none focus:border-[#e9c176]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Link Pendaftaran (Opsional)</label>
                  <input
                    type="text"
                    value={editingEvent.registration_url || ''}
                    onChange={(e) => setEditingEvent({ ...editingEvent, registration_url: e.target.value })}
                    placeholder="Contoh: /trailrun"
                    className="w-full bg-[#0a1424] border border-white/10 rounded-xl p-3 text-white outline-none focus:border-[#e9c176]"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">URL Poster Flyer</label>
                  <input
                    type="text"
                    value={editingEvent.poster_url || ''}
                    onChange={(e) => setEditingEvent({ ...editingEvent, poster_url: e.target.value })}
                    className="w-full bg-[#0a1424] border border-white/10 rounded-xl p-3 text-white outline-none focus:border-[#e9c176]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Deskripsi Singkat</label>
                <textarea
                  rows={3}
                  value={editingEvent.description || ''}
                  onChange={(e) => setEditingEvent({ ...editingEvent, description: e.target.value })}
                  className="w-full bg-[#0a1424] border border-white/10 rounded-xl p-3 text-white outline-none focus:border-[#e9c176]"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setEditingEvent(null);
                  }}
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
                  <span>Simpan Perubahan</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
