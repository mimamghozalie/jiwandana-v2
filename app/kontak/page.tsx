import React from 'react';
import ContactForm from '@/components/ContactForm';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Kontak Kami - JIWANDANA Event Organizer',
  description:
    'Hubungi JIWANDANA Event Organizer untuk konsultasi perencanaan event Anda. Lokasi kantor pusat, kontak WhatsApp, email resmi, dan peta petunjuk arah.',
  keywords: ['kontak eo', 'alamat jiwandana', 'whatsapp event organizer', 'tanya eo', 'JIWANDANA'],
};

export default function KontakPage() {
  return (
    <main className="pt-20 bg-[#f8f8f8]">
      <section className="py-24 bg-[#f8f8f8] min-h-screen text-slate-800">
        <div className="max-w-6xl mx-auto px-6">
          {/* Title */}
          <div className="text-center mb-16 space-y-3">
            <span className="text-xs font-semibold uppercase tracking-widest text-[#C9A227] block">
              Konsultasi & Kemitraan
            </span>
            <h1 className="text-3xl md:text-5xl font-serif font-bold text-slate-900 tracking-wide">
              Hubungi Kami
            </h1>
            <p className="text-slate-600 text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
              Mari diskusikan visi Anda dan wujudkan acara luar biasa bersama kami.
            </p>
          </div>

          <div className="flex flex-col md:flex-row gap-12 lg:gap-16 items-start">
            {/* Form Column */}
            <div className="w-full md:w-7/12">
              <ContactForm />
            </div>

            {/* Office Info Column */}
            <div className="w-full md:w-5/12 space-y-6">
              {/* Kantor Pusat */}
              <div className="bg-white border border-black/10 hover:border-[#C9A227]/50 rounded-2xl p-8 md:p-10 transition-all duration-300 shadow-sm hover:shadow-md group">
                <span className="material-symbols-outlined text-4xl text-[#C9A227] mb-4 group-hover:scale-110 transition-transform block">
                  location_on
                </span>
                <h3 className="text-lg font-bold font-serif text-slate-900 mb-2 group-hover:text-[#C9A227] transition-colors">
                  Kantor Pusat
                </h3>
                <p className="text-slate-600 leading-relaxed text-sm md:text-base">
                  Jl. Raya Medali Rt 005 Rw 002 Medali, <br />
                  Kec. Puri, Kab Mojokerto Jawa Timur<br />
                  Indonesia
                </p>
              </div>

              {/* Telepon & WhatsApp */}
              <div className="bg-white border border-black/10 hover:border-[#C9A227]/50 rounded-2xl p-8 md:p-10 transition-all duration-300 shadow-sm hover:shadow-md group">
                <span className="material-symbols-outlined text-4xl text-[#C9A227] mb-4 group-hover:scale-110 transition-transform block">
                  call
                </span>
                <h3 className="text-lg font-bold font-serif text-slate-900 mb-2 group-hover:text-[#C9A227] transition-colors">
                  Telepon & WhatsApp
                </h3>
                <div className="text-slate-600 leading-relaxed text-sm md:text-base space-y-1">
                  <p>
                    RESTU{' '}
                    <a
                      href="https://wa.me/6282171914989"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-slate-800 hover:text-[#C9A227] transition-colors"
                    >
                      +62 821-7191-4989
                    </a>
                  </p>
                  <p>
                    PUTRA{' '}
                    <a
                      href="https://wa.me/6285804333939"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-slate-800 hover:text-[#C9A227] transition-colors"
                    >
                      +62 858-0433-3939
                    </a>
                  </p>
                </div>
              </div>

              {/* Email */}
              <div className="bg-white border border-black/10 hover:border-[#C9A227]/50 rounded-2xl p-8 md:p-10 transition-all duration-300 shadow-sm hover:shadow-md group">
                <span className="material-symbols-outlined text-4xl text-[#C9A227] mb-4 group-hover:scale-110 transition-transform block">
                  mail
                </span>
                <h3 className="text-lg font-bold font-serif text-slate-900 mb-2 group-hover:text-[#C9A227] transition-colors">
                  Email
                </h3>
                <p className="text-slate-600 leading-relaxed text-sm md:text-base">
                  <a
                    href="mailto:jiwandana23@gmail.com"
                    className="hover:text-[#C9A227] transition-colors"
                  >
                    jiwandana23@gmail.com
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
