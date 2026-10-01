'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import { getEvents, getPortfolios } from '@/lib/api';
import { BookingSubmission, ContactSubmission } from '@/lib/types';
import {
  Calendar,
  Image as ImageIcon,
  Inbox,
  Mail,
  ArrowRight,
  TrendingUp,
  Clock,
  CheckCircle2,
  FileText,
  Trophy,
} from 'lucide-react';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    totalBookings: 0,
    pendingBookings: 0,
    totalContacts: 0,
    unreadContacts: 0,
    totalEvents: 0,
    totalPortfolios: 0,
    totalTrailrun: 0,
    paidTrailrun: 0,
  });

  const [recentBookings, setRecentBookings] = useState<BookingSubmission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        // Fetch events & portfolios
        const [events, portfolios] = await Promise.all([getEvents(), getPortfolios()]);

        // Fetch bookings count & recent rows
        const { data: bookingsData } = await supabase
          .from('bookings')
          .select('*')
          .order('created_at', { ascending: false });

        // Fetch contacts count
        const { data: contactsData } = await supabase
          .from('contacts')
          .select('*')
          .order('created_at', { ascending: false });

        // Fetch trailrun registrations count
        const { data: trailrunData } = await supabase
          .from('trailrun_registrations')
          .select('id, status');

        const bookings = bookingsData || [];
        const contacts = contactsData || [];
        const trailruns = trailrunData || [];

        setStats({
          totalBookings: bookings.length,
          pendingBookings: bookings.filter((b: any) => !b.status || b.status === 'pending').length,
          totalContacts: contacts.length,
          unreadContacts: contacts.filter((c: any) => !c.status || c.status === 'unread').length,
          totalEvents: events.length,
          totalPortfolios: portfolios.length,
          totalTrailrun: trailruns.length,
          paidTrailrun: trailruns.filter((t: any) => t.status === 'paid').length,
        });

        setRecentBookings(bookings.slice(0, 5));
      } catch (err) {
        console.error('Error fetching admin stats:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white">
            Ringkasan Sistem CMS
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Selamat datang di panel kelola konten dan data reservasi JIWANDANA Event Organizer.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/events"
            className="px-4 py-2.5 rounded-xl bg-[#e9c176] hover:bg-[#d1a751] text-[#0d1c32] text-xs font-bold uppercase tracking-wider transition-all shadow-md"
          >
            + Tambah Event Baru
          </Link>
        </div>
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
        {/* Card 0: Peserta Trailrun */}
        <Link
          href="/admin/trailrun"
          className="p-5 rounded-2xl bg-[#12233c] border border-[#e9c176]/30 hover:border-[#e9c176] transition-all group shadow-lg flex flex-col justify-between"
        >
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold uppercase tracking-wider text-[#e9c176]">
              Peserta Trailrun
            </span>
            <div className="p-2.5 rounded-xl bg-[#e9c176]/15 text-[#e9c176]">
              <Trophy className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-serif font-bold text-white group-hover:text-[#e9c176] transition-colors">
              {stats.totalTrailrun}
            </div>
            <div className="text-xs text-emerald-400 flex items-center gap-1 mt-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{stats.paidTrailrun} sudah lunas</span>
            </div>
          </div>
        </Link>

        {/* Card 1: Bookings */}
        <Link
          href="/admin/bookings"
          className="p-5 rounded-2xl bg-[#12233c] border border-white/10 hover:border-[#e9c176]/50 transition-all group shadow-lg flex flex-col justify-between"
        >
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Pemesanan Event
            </span>
            <div className="p-2.5 rounded-xl bg-[#e9c176]/10 text-[#e9c176]">
              <Inbox className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-serif font-bold text-white group-hover:text-[#e9c176] transition-colors">
              {stats.totalBookings}
            </div>
            <div className="text-xs text-amber-400 flex items-center gap-1 mt-1">
              <Clock className="w-3.5 h-3.5" />
              <span>{stats.pendingBookings} menunggu tindak lanjut</span>
            </div>
          </div>
        </Link>

        {/* Card 2: Contacts */}
        <Link
          href="/admin/contacts"
          className="p-6 rounded-2xl bg-[#12233c] border border-white/10 hover:border-[#e9c176]/50 transition-all group shadow-lg flex flex-col justify-between"
        >
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Pesan Masuk
            </span>
            <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400">
              <Mail className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-serif font-bold text-white group-hover:text-[#e9c176] transition-colors">
              {stats.totalContacts}
            </div>
            <div className="text-xs text-cyan-300 flex items-center gap-1 mt-1">
              <span>{stats.unreadContacts} belum dibaca</span>
            </div>
          </div>
        </Link>

        {/* Card 3: Events */}
        <Link
          href="/admin/events"
          className="p-6 rounded-2xl bg-[#12233c] border border-white/10 hover:border-[#e9c176]/50 transition-all group shadow-lg flex flex-col justify-between"
        >
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Agenda Event
            </span>
            <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-serif font-bold text-white group-hover:text-[#e9c176] transition-colors">
              {stats.totalEvents}
            </div>
            <div className="text-xs text-slate-400 mt-1">
              Aktif & Coming Soon
            </div>
          </div>
        </Link>

        {/* Card 4: Portfolio */}
        <Link
          href="/admin/portofolio"
          className="p-6 rounded-2xl bg-[#12233c] border border-white/10 hover:border-[#e9c176]/50 transition-all group shadow-lg flex flex-col justify-between"
        >
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Portofolio Galeri
            </span>
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400">
              <ImageIcon className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-serif font-bold text-white group-hover:text-[#e9c176] transition-colors">
              {stats.totalPortfolios}
            </div>
            <div className="text-xs text-slate-400 mt-1">
              Studi Kasus Selesai
            </div>
          </div>
        </Link>
      </div>

      {/* Recent Bookings Section */}
      <div className="bg-[#12233c] border border-white/10 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-serif font-bold text-white">
              Pesanan / Booking Event Terbaru
            </h3>
            <p className="text-xs text-slate-400">
              Daftar instansi yang baru saja mengajukan reservasi acara melalui formulir website.
            </p>
          </div>
          <Link
            href="/admin/bookings"
            className="text-xs font-semibold text-[#e9c176] hover:underline flex items-center gap-1"
          >
            <span>Lihat Semua</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-10 text-slate-400 text-sm">Memuat data pesanan...</div>
        ) : recentBookings.length === 0 ? (
          <div className="text-center py-10 text-slate-400 text-sm">
            Belum ada data pesanan baru di Supabase. Anda dapat mencoba mengirim pesanan di halaman <Link href="/booking-event" className="text-[#e9c176] underline">Booking Event</Link>.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-white/5 uppercase text-slate-400 text-[10px] tracking-wider">
                <tr>
                  <th className="p-3.5 rounded-l-xl">Instansi</th>
                  <th className="p-3.5">Pemohon</th>
                  <th className="p-3.5">Jenis Event</th>
                  <th className="p-3.5">Kontak</th>
                  <th className="p-3.5">Dokumen</th>
                  <th className="p-3.5 rounded-r-xl">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {recentBookings.map((b: any, idx: number) => (
                  <tr key={idx} className="hover:bg-white/5 transition-colors">
                    <td className="p-3.5 font-semibold text-white">{b.instansi}</td>
                    <td className="p-3.5">{b.pemohon}</td>
                    <td className="p-3.5 capitalize text-[#e9c176] font-medium">{b.event_type}</td>
                    <td className="p-3.5">{b.contact}</td>
                    <td className="p-3.5">
                      {b.document_url ? (
                        <a
                          href={b.document_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-cyan-400 hover:underline"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>Unduh</span>
                        </a>
                      ) : (
                        <span className="text-slate-500">-</span>
                      )}
                    </td>
                    <td className="p-3.5">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        {b.status || 'Pending'}
                      </span>
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
