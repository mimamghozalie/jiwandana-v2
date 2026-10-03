import { supabase } from './supabaseClient';
import portfoliosData from '@/data/portfolios.json';
import { initialPortfolios, initialTestimonials, initialServices } from './data';

import { EventItem, PortfolioItem, TestimonialItem, ServiceItem, BookingSubmission, ContactSubmission, TrailrunRegistration } from './types';

// Helper to prevent hanging on network/Supabase timeouts
async function withTimeout<T>(promise: PromiseLike<T>, timeoutMs = 2500): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) => setTimeout(() => reject(new Error('SUPABASE_TIMEOUT')), timeoutMs)),
  ]);
}

// ============ EVENTS API (SUPABASE) ============
export async function getEvents(): Promise<EventItem[]> {
  try {
    const fetchPromise = supabase
      .from('events')
      .select('*')
      .order('created_at', { ascending: false });

    const { data, error } = await withTimeout(fetchPromise, 3000);

    if (error || !data) {
      console.warn('Error fetching events from Supabase:', error);
      return [];
    }
    return data as EventItem[];
  } catch (err) {
    console.error('Failed to load events from Supabase:', err);
    return [];
  }
}

export async function getEventBySlug(slug: string): Promise<EventItem | null> {
  const cleanSlug = (slug || '').replace(/\.html$/, '').toLowerCase().trim();
  try {
    const fetchPromise = supabase
      .from('events')
      .select('*')
      .eq('slug', cleanSlug)
      .maybeSingle();

    const { data, error } = await withTimeout(fetchPromise, 3000);
    if (!error && data) {
      return data as EventItem;
    }

    // Alias fallback for koni-championship-1 -> koni-1
    if (cleanSlug === 'koni-championship-1') {
      const aliasPromise = supabase
        .from('events')
        .select('*')
        .eq('slug', 'koni-1')
        .maybeSingle();
      const { data: aliasData } = await withTimeout(aliasPromise, 3000);
      if (aliasData) return aliasData as EventItem;
    }
  } catch (err) {
    console.warn('Error fetching event from Supabase for slug:', cleanSlug, err);
  }

  return null;
}

// ============ PORTFOLIO API (STATIC JSON) ============
export async function getPortfolios(): Promise<PortfolioItem[]> {
  return portfoliosData as unknown as PortfolioItem[];
}

export async function getPortfolioBySlug(slug: string): Promise<PortfolioItem | null> {
  const cleanSlug = (slug || '').replace(/\.html$/, '').toLowerCase().trim();
  const list = portfoliosData as unknown as PortfolioItem[];

  const found = list.find((p) => {
    const pSlug = p.slug.toLowerCase().trim();
    return (
      pSlug === cleanSlug ||
      (cleanSlug === 'koni-championship-1' && pSlug === 'koni-1') ||
      (cleanSlug === 'koni-1' && (pSlug === 'koni-1' || pSlug === 'koni-championship-1'))
    );
  });

  return found || null;
}



// ============ TESTIMONIALS API ============
export async function getTestimonials(): Promise<TestimonialItem[]> {
  try {
    const { data, error } = await supabase
      .from('testimonials')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data || data.length === 0) {
      return initialTestimonials;
    }
    return data as TestimonialItem[];
  } catch (err) {
    console.warn('Using fallback testimonials:', err);
    return initialTestimonials;
  }
}

// ============ SERVICES API ============
export async function getServices(): Promise<ServiceItem[]> {
  try {
    const { data, error } = await supabase
      .from('services')
      .select('*');

    if (error || !data || data.length === 0) {
      return initialServices;
    }
    return data as ServiceItem[];
  } catch (err) {
    console.warn('Using fallback services:', err);
    return initialServices;
  }
}

// ============ BOOKING SUBMISSION ============
export async function submitBooking(formData: BookingSubmission, file?: File | null): Promise<{ success: boolean; error?: string }> {
  try {
    let document_url: string | null = null;

    if (file) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('booking-documents')
        .upload(fileName, file);

      if (!uploadError) {
        const { data: publicUrlData } = supabase.storage
          .from('booking-documents')
          .getPublicUrl(fileName);
        document_url = publicUrlData.publicUrl;
      } else {
        console.warn('Storage upload error, continuing without document URL:', uploadError);
      }
    }

    const { error: insertError } = await supabase
      .from('bookings')
      .insert([{
        instansi: formData.instansi,
        pemohon: formData.pemohon,
        contact: formData.contact,
        event_type: formData.event_type,
        scale: formData.scale,
        document_url: document_url,
        status: 'pending'
      }]);

    if (insertError) {
      throw insertError;
    }

    return { success: true };
  } catch (err: any) {
    console.error('Submit booking failed:', err);
    return { success: false, error: err.message || 'Gagal menyimpan data booking.' };
  }
}

// ============ CONTACT SUBMISSION ============
export async function submitContact(formData: ContactSubmission): Promise<{ success: boolean; error?: string }> {
  try {
    const insertPromise = supabase
      .from('contacts')
      .insert([{
        nama: formData.nama,
        email: formData.email,
        jenis_acara: formData.jenis_acara,
        detail_acara: formData.detail_acara,
        status: 'unread'
      }]);

    const { error } = await withTimeout(insertPromise, 3000);
    if (error) {
      console.warn('Supabase contact submission warning:', error);
    }
    return { success: true };
  } catch (err: any) {
    console.warn('Submit contact warning/timeout, continuing with success:', err);
    return { success: true };
  }
}

// ============ TRAILRUN REGISTRATION ============
export async function checkBibAvailability(
  bib: string
): Promise<{ available: boolean; bib?: string; message?: string; error?: string }> {
  const cleanBib = bib.trim();
  if (!cleanBib) {
    return { available: false, error: 'Nomor BIB tidak boleh kosong.' };
  }

  try {
    const res = await fetch(`/api/trailrun/check-bib?bib=${encodeURIComponent(cleanBib)}`);
    const data = await res.json();
    return data;
  } catch (err: any) {
    // Graceful fallback: check directly via Supabase client if API route fails
    try {
      const checkPromise = supabase
        .from('trailrun_registrations')
        .select('id, no_bib')
        .ilike('no_bib', cleanBib)
        .limit(1);

      const { data } = await withTimeout(checkPromise, 3500);
      const isTaken = !!(data && data.length > 0);
      return {
        available: !isTaken,
        bib: cleanBib,
        message: isTaken
          ? `Nomor BIB "${cleanBib}" sudah terdaftar oleh peserta lain.`
          : `Nomor BIB "${cleanBib}" tersedia.`,
      };
    } catch {
      return { available: true, bib: cleanBib };
    }
  }
}

export async function generateAutoBib(
  kategori: string,
  currentBib?: string
): Promise<{ success: boolean; bib: string; prefix?: string }> {
  try {
    const params = new URLSearchParams({ kategori: kategori || '' });
    if (currentBib) params.set('current', currentBib);
    const res = await fetch(`/api/trailrun/generate-bib?${params.toString()}`);
    const data = await res.json();
    if (data?.success && data?.bib) {
      return { success: true, bib: data.bib, prefix: data.prefix };
    }
  } catch (err) {
    console.warn('generateAutoBib error, fallback to category prefix:', err);
  }

  // Graceful fallback
  const cat = (kategori || '').toLowerCase();
  const prefix = cat.includes('12') ? '12-' : cat.includes('7') ? '7-' : '3-';
  return { success: true, bib: `${prefix}0001`, prefix };
}

export async function submitTrailrunRegistration(
  formData: Omit<TrailrunRegistration, 'id' | 'status' | 'created_at'>
): Promise<{ success: boolean; registration_id?: string; error?: string }> {
  try {
    const cleanBib = (formData.no_bib || '').trim();
    if (!cleanBib) {
      return { success: false, error: 'Nomor BIB wajib diisi.' };
    }

    // Uniqueness pre-check right before insert
    const checkPromise = supabase
      .from('trailrun_registrations')
      .select('id')
      .ilike('no_bib', cleanBib)
      .limit(1);

    const { data: existingBib } = await withTimeout(checkPromise, 3500).catch(() => ({ data: null }));

    if (existingBib && existingBib.length > 0) {
      return {
        success: false,
        error: `Nomor BIB "${cleanBib}" sudah digunakan oleh peserta lain. Silakan pilih nomor BIB yang berbeda.`,
      };
    }

    const insertPromise = supabase
      .from('trailrun_registrations')
      .insert([{
        nama: formData.nama,
        email: formData.email,
        no_bib: cleanBib,
        no_hp: formData.no_hp,
        alamat: formData.alamat,
        kota: formData.kota,
        provinsi: formData.provinsi,
        kewarganegaraan: formData.kewarganegaraan,
        tanggal_lahir: formData.tanggal_lahir,
        jenis_kelamin: formData.jenis_kelamin,
        nama_komunitas: formData.nama_komunitas || null,
        golongan_darah: formData.golongan_darah,
        riwayat_medis: formData.riwayat_medis || null,
        kontak_darurat: formData.kontak_darurat,
        kategori: formData.kategori,
        status: 'pending',
      }])
      .select('id')
      .single();

    const { data, error } = await withTimeout(insertPromise, 5000);

    if (error) {
      if (
        error.code === '23505' ||
        error.message?.toLowerCase().includes('duplicate') ||
        error.message?.toLowerCase().includes('unique')
      ) {
        return {
          success: false,
          error: `Nomor BIB "${cleanBib}" sudah digunakan oleh peserta lain. Silakan pilih nomor BIB yang berbeda.`,
        };
      }
      throw error;
    }

    return { success: true, registration_id: data?.id };
  } catch (err: any) {
    console.error('Submit trailrun registration failed:', err);
    return { success: false, error: err.message || 'Gagal menyimpan data pendaftaran.' };
  }
}


