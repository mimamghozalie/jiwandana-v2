import React from 'react';
import Image from 'next/image';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Tentang Kami - JIWANDANA Event Organizer',
  description:
    'Ketahui lebih dalam mengenai filosofi logo instansi, makna lambang teratai, api, sayap, visi misi, serta dedikasi profesionalisme dari JIWANDANA Event Organizer.',
  keywords: ['filosofi logo', 'tentang jiwandana', 'visi misi eo', 'profil event organizer', 'JIWANDANA'],
};

export default function TentangPage() {
  return (
    <main className="pt-20 bg-[#f8f8f8]">
      <section className="py-24 bg-[#f8f8f8] min-h-screen text-slate-800">
        <div className="max-w-4xl mx-auto px-6">
          {/* Header Title */}
          <div className="text-center mb-16 space-y-3">
            <span className="text-xs font-semibold uppercase tracking-widest text-[#C9A227] block">
              Makna & Nilai
            </span>
            <h1 className="text-3xl md:text-5xl font-serif font-bold text-slate-900 tracking-wide">
              Filosofi Logo JIWANDANA
            </h1>
            <p className="text-slate-600 text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
              Logo JIWANDANA dirancang sebagai representasi identitas, semangat, dan harapan yang diwujudkan
              melalui perpaduan simbol huruf, api, dan bunga teratai dalam satu kesatuan visual yang harmonis.
            </p>
          </div>

          {/* Grid 1: Logo & Huruf J + Api */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-16">
            <div className="bg-white p-12 border border-black/10 hover:border-[#C9A227]/50 transition-all duration-300 rounded-2xl flex justify-center items-center h-full shadow-sm hover:shadow-md">
              <Image
                src="/logo.webp"
                alt="Logo Jiwandana"
                width={256}
                height={256}
                className="w-64 h-auto object-contain"
                priority
              />
            </div>
            <div className="space-y-8">
              <div className="bg-white p-6 rounded-2xl border border-black/10 shadow-sm">
                <h3 className="text-xl font-bold font-serif text-[#C9A227] flex items-center gap-3 mb-3">
                  <span className="material-symbols-outlined text-[#C9A227]">title</span>
                  Huruf &quot;J&quot;
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Huruf &quot;J&quot; pada bagian tengah merupakan simbol utama instansi sekaligus identitas dari
                  JIWANDANA. Bentuknya dibuat tegas namun menyatu dengan elemen di sekelilingnya, melambangkan
                  karakter yang kuat, profesional, dan memiliki arah yang jelas dalam setiap penyelenggaraan
                  kegiatan.
                </p>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-black/10 shadow-sm">
                <h3 className="text-xl font-bold font-serif text-[#C9A227] flex items-center gap-3 mb-3">
                  <span className="material-symbols-outlined text-[#C9A227]">local_fire_department</span>
                  Api
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Elemen api menggambarkan jiwa, semangat, energi, dan dedikasi yang terus menyala. Api menjadi
                  simbol motivasi untuk selalu aktif, kreatif, serta penuh antusiasme dalam memberikan pelayanan
                  terbaik dan menghadirkan kegiatan yang berkesan.
                </p>
              </div>
            </div>
          </div>

          {/* Grid 2: Bunga Teratai & Sayap */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
            <div className="bg-white p-8 rounded-2xl border border-black/10 shadow-sm">
              <h3 className="text-xl font-bold font-serif text-[#C9A227] flex items-center gap-3 mb-3">
                <span className="material-symbols-outlined text-[#C9A227]">spa</span>
                Bunga Teratai
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Simbol bunga teratai pada bagian bawah melambangkan pengayoman, ketulusan, dan keseimbangan.
                Teratai juga mencerminkan harapan agar JIWANDANA mampu menjadi wadah yang membawa ketenangan,
                kenyamanan, serta mampu tumbuh dan berkembang di berbagai kondisi.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-black/10 shadow-sm">
              <h3 className="text-xl font-bold font-serif text-[#C9A227] flex items-center gap-3 mb-3">
                <span className="material-symbols-outlined text-[#C9A227]">flight_takeoff</span>
                Api Membentuk Sayap Kanan dan Kiri
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Bentuk api yang menyerupai sayap di sisi kanan dan kiri melambangkan harapan, perkembangan, dan
                kebebasan untuk terus melangkah maju. Sayap tersebut menjadi simbol semangat untuk berkembang lebih
                luas, meningkatkan kualitas, serta membawa JIWANDANA menuju pencapaian yang lebih tinggi di masa
                depan.
              </p>
            </div>
          </div>

          {/* Quote Banner */}
          <div className="bg-[#C9A227]/10 p-8 md:p-12 text-center rounded-2xl border border-[#C9A227]/30 shadow-sm">
            <p className="text-lg md:text-xl font-serif text-slate-800 italic leading-relaxed">
              &quot;Secara keseluruhan, logo ini merepresentasikan perpaduan antara identitas, semangat, pengayoman,
              dan visi perkembangan yang berkelanjutan dalam membangun citra JIWANDANA EVENT ORGANIZER yang profesional
              dan berkarakter.&quot;
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
