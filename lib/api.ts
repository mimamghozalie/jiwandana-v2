import { supabase } from './supabaseClient';
import portfoliosData from '@/data/portfolios.json';
import { initialEvents, initialPortfolios, initialTestimonials, initialServices } from './data';

import { EventItem, PortfolioItem, TestimonialItem, ServiceItem, BookingSubmission, ContactSubmission, TrailrunRegistration } from './types';

import eventsData from '@/data/events.json';

// ============ EVENTS API (STATIC JSON) ============
export async function getEvents(): Promise<EventItem[]> {
  return eventsData as unknown as EventItem[];
}

export async function getEventBySlug(slug: string): Promise<EventItem | null> {
  const cleanSlug = (slug || '').replace(/\.html$/, '').toLowerCase().trim();
  const list = eventsData as unknown as EventItem[];
  const item = list.find((e) => e.slug.toLowerCase().trim() === cleanSlug);
  return item || null;
}


// Helper to prevent hanging on network/Supabase timeouts
async function withTimeout<T>(promise: PromiseLike<T>, timeoutMs = 1200): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) => setTimeout(() => reject(new Error('SUPABASE_TIMEOUT')), timeoutMs)),
  ]);
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
export async function submitTrailrunRegistration(
  formData: Omit<TrailrunRegistration, 'id' | 'status' | 'created_at'>
): Promise<{ success: boolean; registration_id?: string; error?: string }> {
  try {
    const insertPromise = supabase
      .from('trailrun_registrations')
      .insert([{
        nama: formData.nama,
        email: formData.email,
        no_bib: formData.no_bib,
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
      throw error;
    }

    return { success: true, registration_id: data?.id };
  } catch (err: any) {
    console.error('Submit trailrun registration failed:', err);
    return { success: false, error: err.message || 'Gagal menyimpan data pendaftaran.' };
  }
}

