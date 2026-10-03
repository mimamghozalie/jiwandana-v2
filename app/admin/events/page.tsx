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
  FileText,
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
    juknis_url: '',
    guide_book_url: '',
    rules_url: '',
  };

  const [newEvent, setNewEvent] = useState(defaultNewEvent);
  const [editingEvent, setEditingEvent] = useState<EventItem | null>(null);

  const loadEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('Error fetching events directly, trying fallback:', error);
        const fallbackData = await getEvents();
        const mapped = (fallbackData || []).map((item: any) => ({
          ...item,
          juknis_url: item.juknis_url || item.juknis || '',
          guide_book_url: item.guide_book_url || item.guidebook_url || item.pedoman || item.buku_pedoman || item.pedoman_url || '',
          rules_url: item.rules_url || item.peraturan || item.peraturan_url || '',
        }));
        setEvents(mapped);
        return;
      }

      const mapped = (data || []).map((item: any) => ({
        ...item,
        juknis_url: item.juknis_url || item.juknis || '',
        guide_book_url: item.guide_book_url || item.guidebook_url || item.pedoman || item.buku_pedoman || item.pedoman_url || '',
        rules_url: item.rules_url || item.peraturan || item.peraturan_url || '',
      }));
      setEvents(mapped);
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

    const juknisVal = newEvent.juknis_url?.trim() || null;
    const guideBookVal = newEvent.guide_book_url?.trim() || null;
    const rulesVal = newEvent.rules_url?.trim() || null;

    let payload: any = {
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
      juknis_url: juknisVal,
      guide_book_url: guideBookVal,
      rules_url: rulesVal,
    };

    try {
      let { data, error } = await supabase
        .from('events')
        .insert([payload])
        .select('*');

      // If column schema mismatch (e.g. columns named juknis, pedoman, peraturan)
      if (error && (error.message?.includes('column') || error.code === 'PGRST204' || error.message?.includes('schema cache'))) {
        const altPayload = { ...payload, juknis: juknisVal, pedoman: guideBookVal, peraturan: rulesVal };
        delete altPayload.juknis_url;
        delete altPayload.guide_book_url;
        delete altPayload.rules_url;
        const altRes = await supabase.from('events').insert([altPayload]).select('*');
        if (!altRes.error) {
          data = altRes.data;
          error = null;
        } else {
          throw error;
        }
      } else if (error) {
        throw error;
      }

      const createdItem: EventItem = data && data[0]
        ? {
            ...data[0],
            juknis_url: data[0].juknis_url ?? data[0].juknis ?? juknisVal,
            guide_book_url: data[0].guide_book_url ?? data[0].pedoman ?? guideBookVal,
            rules_url: data[0].rules_url ?? data[0].peraturan ?? rulesVal,
          }
        : {
            id: String(Date.now()),
            ...payload,
          };

      setEvents((prev) => [createdItem, ...prev.filter((item) => item.slug !== createdItem.slug)]);

      setMessage({ type: 'success', text: `Event "${payload.title}" berhasil ditambahkan ke Supabase & CMS!` });
      setIsCreateModalOpen(false);
      setNewEvent(defaultNewEvent);
      await loadEvents();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Gagal menyimpan event ke database.' });
    } finally {
      setSubmitting(false);
    }
  };

  // OPEN EDIT MODAL
  const openEditModal = (evt: any) => {
    setEditingEvent({
      ...evt,
      title: evt.title || '',
      slug: evt.slug || '',
      category: evt.category || 'perlombaan',
      event_date: evt.event_date || '',
      location: evt.location || '',
      status: evt.status || 'active',
      badge_text: evt.badge_text || '',
      poster_url: evt.poster_url || '/assets/4.jpeg',
      description: evt.description || '',
      registration_url: evt.registration_url || '',
      portfolio_url: evt.portfolio_url || '',
      rundown: evt.rundown || '',
      juknis_url: evt.juknis_url || evt.juknis || '',
      guide_book_url: evt.guide_book_url || evt.guidebook_url || evt.pedoman || evt.buku_pedoman || evt.pedoman_url || '',
      rules_url: evt.rules_url || evt.peraturan || evt.peraturan_url || '',
    });
    setIsEditModalOpen(true);
  };

  // SAVE EDITED EVENT
  const handleUpdateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEvent) return;

    setSubmitting(true);
    setMessage(null);

    const juknisVal = editingEvent.juknis_url?.trim() || null;
    const guideBookVal = editingEvent.guide_book_url?.trim() || null;
    const rulesVal = editingEvent.rules_url?.trim() || null;

    let updatePayload: any = {
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
      rundown: editingEvent.rundown?.trim() || null,
      juknis_url: juknisVal,
      guide_book_url: guideBookVal,
      rules_url: rulesVal,
    };

    try {
      // 1. Try update by id or by slug
      let { data, error } = await (editingEvent.id
        ? supabase.from('events').update(updatePayload).eq('id', editingEvent.id).select('*')
        : supabase.from('events').update(updatePayload).eq('slug', editingEvent.slug).select('*'));

      // If id didn't match any row, fallback to updating by slug
      if (!error && (!data || data.length === 0) && editingEvent.slug) {
        const slugRes = await supabase.from('events').update(updatePayload).eq('slug', editingEvent.slug).select('*');
        data = slugRes.data;
        error = slugRes.error;
      }

      // 2. If column schema mismatch (e.g. columns in DB are named juknis, pedoman, peraturan)
      if (error && (error.message?.includes('column') || error.code === 'PGRST204' || error.message?.includes('schema cache'))) {
        const altPayload = {
          ...updatePayload,
          juknis: juknisVal,
          pedoman: guideBookVal,
          peraturan: rulesVal,
        };
        delete altPayload.juknis_url;
        delete altPayload.guide_book_url;
        delete altPayload.rules_url;

        let altRes = await (editingEvent.id
          ? supabase.from('events').update(altPayload).eq('id', editingEvent.id).select('*')
          : supabase.from('events').update(altPayload).eq('slug', editingEvent.slug).select('*'));

        if (!altRes.error && (!altRes.data || altRes.data.length === 0) && editingEvent.slug) {
          altRes = await supabase.from('events').update(altPayload).eq('slug', editingEvent.slug).select('*');
        }

        if (!altRes.error && altRes.data && altRes.data.length > 0) {
          data = altRes.data;
          error = null;
        } else if (altRes.error) {
          throw error;
        }
      } else if (error) {
        throw error;
      }

      const updatedRow = data && data[0] ? data[0] : null;

      // Update state locally immediately
      setEvents((prev) =>
        prev.map((item): EventItem =>
          item.id === editingEvent.id || item.slug === editingEvent.slug
            ? {
                ...item,
                ...(updatedRow || updatePayload),
                juknis_url: updatedRow?.juknis_url ?? updatedRow?.juknis ?? juknisVal,
                guide_book_url: updatedRow?.guide_book_url ?? updatedRow?.pedoman ?? guideBookVal,
                rules_url: updatedRow?.rules_url ?? updatedRow?.peraturan ?? rulesVal,
              }
            : item
        )
      );

      setMessage({ type: 'success', text: `Event "${updatePayload.title}" berhasil diperbarui!` });
      setIsEditModalOpen(false);
      setEditingEvent(null);
      await loadEvents();
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

                  {/* Dokumen Acara (Juknis, Pedoman, Peraturan) */}
                  <div className="pt-2.5 border-t border-white/5 space-y-1.5">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                      Dokumen Acara:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {evt.juknis_url ? (
                        <a
                          href={evt.juknis_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-300 hover:bg-amber-500/20 transition-colors flex items-center gap-1 text-[10px] font-medium"
                          title={evt.juknis_url}
                        >
                          <FileText className="w-3 h-3 text-amber-400" />
                          <span>Juknis</span>
                          <ExternalLink className="w-2.5 h-2.5 opacity-70" />
                        </a>
                      ) : (
                        <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/5 text-slate-500 flex items-center gap-1 text-[10px]">
                          <FileText className="w-3 h-3 text-slate-600" />
                          <span>Juknis: -</span>
                        </span>
                      )}

                      {evt.guide_book_url ? (
                        <a
                          href={evt.guide_book_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2 py-0.5 rounded-md bg-blue-500/10 border border-blue-500/30 text-blue-300 hover:bg-blue-500/20 transition-colors flex items-center gap-1 text-[10px] font-medium"
                          title={evt.guide_book_url}
                        >
                          <FileText className="w-3 h-3 text-blue-400" />
                          <span>Pedoman</span>
                          <ExternalLink className="w-2.5 h-2.5 opacity-70" />
                        </a>
                      ) : (
                        <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/5 text-slate-500 flex items-center gap-1 text-[10px]">
                          <FileText className="w-3 h-3 text-slate-600" />
                          <span>Pedoman: -</span>
                        </span>
                      )}

                      {evt.rules_url ? (
                        <a
                          href={evt.rules_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2 py-0.5 rounded-md bg-purple-500/10 border border-purple-500/30 text-purple-300 hover:bg-purple-500/20 transition-colors flex items-center gap-1 text-[10px] font-medium"
                          title={evt.rules_url}
                        >
                          <FileText className="w-3 h-3 text-purple-400" />
                          <span>Peraturan</span>
                          <ExternalLink className="w-2.5 h-2.5 opacity-70" />
                        </a>
                      ) : (
                        <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/5 text-slate-500 flex items-center gap-1 text-[10px]">
                          <FileText className="w-3 h-3 text-slate-600" />
                          <span>Peraturan: -</span>
                        </span>
                      )}
                    </div>
                  </div>
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

              {/* Dokumen Pendukung (Juknis, Buku Pedoman, Peraturan) */}
              <div className="bg-[#0a1424]/80 border border-white/10 rounded-2xl p-4 space-y-3">
                <div className="flex items-center gap-2 text-white font-semibold">
                  <FileText className="w-4 h-4 text-[#e9c176]" />
                  <span>Dokumen Pendukung Event (Juknis, Pedoman & Peraturan)</span>
                </div>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Masukkan URL berkas (Google Drive / direct PDF link). Jika kolom dikosongkan, tombol unduh dokumen tersebut akan otomatis disembunyikan pada halaman publik event.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  <div>
                    <label className="block text-slate-300 mb-1 font-semibold text-[11px]">Link Juknis (PDF/Drive)</label>
                    <input
                      type="text"
                      value={newEvent.juknis_url}
                      onChange={(e) => setNewEvent({ ...newEvent, juknis_url: e.target.value })}
                      placeholder="https://drive.google.com/..."
                      className="w-full bg-[#12233c] border border-white/10 rounded-xl p-3 text-white outline-none focus:border-[#e9c176]"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 mb-1 font-semibold text-[11px]">Buku Pedoman</label>
                    <input
                      type="text"
                      value={newEvent.guide_book_url}
                      onChange={(e) => setNewEvent({ ...newEvent, guide_book_url: e.target.value })}
                      placeholder="https://drive.google.com/..."
                      className="w-full bg-[#12233c] border border-white/10 rounded-xl p-3 text-white outline-none focus:border-[#e9c176]"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 mb-1 font-semibold text-[11px]">Peraturan</label>
                    <input
                      type="text"
                      value={newEvent.rules_url}
                      onChange={(e) => setNewEvent({ ...newEvent, rules_url: e.target.value })}
                      placeholder="https://drive.google.com/..."
                      className="w-full bg-[#12233c] border border-white/10 rounded-xl p-3 text-white outline-none focus:border-[#e9c176]"
                    />
                  </div>
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

              {/* Dokumen Pendukung (Juknis, Buku Pedoman, Peraturan) */}
              <div className="bg-[#0a1424]/80 border border-white/10 rounded-2xl p-4 space-y-3">
                <div className="flex items-center gap-2 text-white font-semibold">
                  <FileText className="w-4 h-4 text-[#e9c176]" />
                  <span>Dokumen Pendukung Event (Juknis, Pedoman & Peraturan)</span>
                </div>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Masukkan URL berkas (Google Drive / direct PDF link). Jika kolom dikosongkan, tombol unduh dokumen tersebut akan otomatis disembunyikan pada halaman publik event.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  <div>
                    <label className="block text-slate-300 mb-1 font-semibold text-[11px]">Link Juknis (PDF/Drive)</label>
                    <input
                      type="text"
                      value={editingEvent.juknis_url || ''}
                      onChange={(e) => setEditingEvent({ ...editingEvent, juknis_url: e.target.value })}
                      placeholder="https://drive.google.com/..."
                      className="w-full bg-[#12233c] border border-white/10 rounded-xl p-3 text-white outline-none focus:border-[#e9c176]"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 mb-1 font-semibold text-[11px]">Buku Pedoman</label>
                    <input
                      type="text"
                      value={editingEvent.guide_book_url || ''}
                      onChange={(e) => setEditingEvent({ ...editingEvent, guide_book_url: e.target.value })}
                      placeholder="https://drive.google.com/..."
                      className="w-full bg-[#12233c] border border-white/10 rounded-xl p-3 text-white outline-none focus:border-[#e9c176]"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 mb-1 font-semibold text-[11px]">Peraturan</label>
                    <input
                      type="text"
                      value={editingEvent.rules_url || ''}
                      onChange={(e) => setEditingEvent({ ...editingEvent, rules_url: e.target.value })}
                      placeholder="https://drive.google.com/..."
                      className="w-full bg-[#12233c] border border-white/10 rounded-xl p-3 text-white outline-none focus:border-[#e9c176]"
                    />
                  </div>
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
