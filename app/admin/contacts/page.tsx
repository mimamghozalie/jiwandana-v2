'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { ContactSubmission } from '@/lib/types';
import { Mail, Check, RefreshCw, Reply } from 'lucide-react';

export default function AdminContactsPage() {
  const [contacts, setContacts] = useState<ContactSubmission[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchContacts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setContacts(data || []);
    } catch (err) {
      console.warn('Error fetching contacts:', err);
      // Fallback sample data if empty
      setContacts([
        {
          id: '1',
          nama: 'Bambang Irawan',
          email: 'bambang@gmail.com',
          jenis_acara: 'Kejuaraan Pencak Silat',
          detail_acara: 'Rencana mengadakan kejuaraan pencak silat piala bupati bulan November 2026, butuh 2 gelanggang digital.',
          status: 'unread',
          created_at: new Date().toISOString(),
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  const updateStatus = async (id: string, newStatus: 'unread' | 'read' | 'replied') => {
    try {
      await supabase.from('contacts').update({ status: newStatus }).eq('id', id);
      setContacts(contacts.map((c) => (c.id === id ? { ...c, status: newStatus } : c)));
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white">
            Inbox Pesan Kontak
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Pesan pertanyaan dan penawaran kerjasama dari formulir Hubungi Kami di website.
          </p>
        </div>

        <button
          onClick={fetchContacts}
          className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 flex items-center gap-2 text-xs font-semibold"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Refresh</span>
        </button>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-16 text-slate-400">Memuat pesan masuk...</div>
        ) : contacts.length === 0 ? (
          <div className="text-center py-16 text-slate-400 bg-[#12233c] rounded-2xl border border-white/10">
            Belum ada pesan kontak masuk.
          </div>
        ) : (
          contacts.map((c) => (
            <div
              key={c.id || Math.random()}
              className={`p-6 rounded-2xl border transition-all ${
                c.status === 'unread'
                  ? 'bg-[#142642] border-[#e9c176]/50 shadow-lg'
                  : 'bg-[#12233c] border-white/10 opacity-90'
              }`}
            >
              <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-base font-bold text-white">{c.nama}</span>
                    <span className="text-xs text-slate-400">({c.email})</span>
                    {c.status === 'unread' && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/30">
                        Baru
                      </span>
                    )}
                  </div>
                  <div className="inline-block px-2.5 py-1 rounded-md bg-[#e9c176]/10 text-[#e9c176] text-xs font-semibold">
                    Acara: {c.jenis_acara}
                  </div>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed pt-2">
                    {c.detail_acara}
                  </p>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end gap-2 shrink-0">
                  <a
                    href={`mailto:${c.email}?subject=Balasan%20JIWANDANA%20Event%20Organizer`}
                    className="px-3.5 py-1.5 rounded-lg bg-[#e9c176] text-[#0d1c32] font-bold text-xs flex items-center gap-1 hover:bg-[#d1a751]"
                  >
                    <Reply className="w-3.5 h-3.5" />
                    <span>Balas Email</span>
                  </a>

                  {c.status === 'unread' ? (
                    <button
                      onClick={() => updateStatus(c.id!, 'read')}
                      className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-slate-300"
                    >
                      Tandai Dibaca
                    </button>
                  ) : (
                    <span className="text-[11px] text-slate-500 flex items-center gap-1">
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span>Sudah dibaca</span>
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
