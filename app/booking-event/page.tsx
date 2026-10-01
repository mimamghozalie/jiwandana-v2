import React, { Suspense } from 'react';
import BookingForm from '@/components/BookingForm';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Booking Event - JIWANDANA Event Organizer',
  description:
    'Pesan dan rencanakan konsep acara Anda secara instan bersama JIWANDANA Event Organizer. Isi formulir pemesanan untuk kolaborasi event korporat, pernikahan, konser, atau pameran.',
  keywords: ['booking event', 'pesan eo', 'wedding booking', 'corporate gathering booking', 'JIWANDANA'],
};

export default function BookingEventPage() {
  return (
    <main className="pt-28 pb-20 min-h-[90vh] flex items-center justify-center bg-[#f8f8f8]">
      <div className="w-full max-w-2xl mx-auto px-6 space-y-8">
        {/* Title */}
        <div className="text-center space-y-3">
          <span className="text-xs font-semibold uppercase tracking-widest text-[#C9A227] block">
            Formulir Kerjasama
          </span>
          <h1 className="text-3xl md:text-5xl font-serif font-bold text-slate-900 tracking-wide">
            Booking Event
          </h1>
          <p className="text-slate-600 text-sm md:text-base leading-relaxed">
            Lengkapi formulir di bawah ini untuk merencanakan kolaborasi event Anda bersama tim profesional JIWANDANA.
          </p>
        </div>

        {/* Form Container using the created BookingForm component */}
        <Suspense fallback={<div className="text-center py-12 text-slate-500 text-sm">Memuat formulir...</div>}>
          <BookingForm />
        </Suspense>
      </div>
    </main>
  );
}
