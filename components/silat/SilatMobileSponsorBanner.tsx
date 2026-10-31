import React from 'react';

interface SilatMobileSponsorBannerProps {
  className?: string;
}

export default function SilatMobileSponsorBanner({
  className = '',
}: SilatMobileSponsorBannerProps) {
  return (
    <div className={`w-full block md:hidden mt-8 select-none ${className}`}>
      <div className="grid grid-cols-2 gap-3">
        {/* Box Kiri: SPONSORSHIP (Pink Pastel) */}
        <div className="bg-[#f8a5c2]/85 backdrop-blur-md border-2 border-white/90 rounded-2xl p-3 flex flex-col items-center justify-between text-center shadow-md min-h-[95px]">
          <div className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#0088cc]" />
            <span className="text-[9px] font-black uppercase tracking-wider text-white/90">
              KOLABORASI
            </span>
          </div>
          <span className="text-xs font-black uppercase tracking-[0.18em] text-[#0088cc] drop-shadow-xs my-1">
            SPONSORSHIP
          </span>
          <a
            href="https://wa.me/6285804333939?text=Halo%20Admin%20JIWANDANA,%20kami%20tertarik%20menjadi%20Sponsor%20Kejuaraan%20Silat%20DSC%202026"
            target="_blank"
            rel="noopener noreferrer"
            className="py-1 px-3 bg-white hover:bg-white/90 text-[#0088cc] font-black text-[10px] uppercase tracking-wider rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer flex items-center gap-1"
            title="Hubungi Admin untuk Sponsorship"
          >
            <span>HUB</span>
            <span className="text-[10px]">💬</span>
          </a>
        </div>

        {/* Box Kanan: MEDIA PARTNER (Tosca / Cyan Pastel) */}
        <div className="bg-[#81ecec]/85 backdrop-blur-md border-2 border-white/90 rounded-2xl p-3 flex flex-col items-center justify-between text-center shadow-md min-h-[95px]">
          <div className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#ff007f]" />
            <span className="text-[9px] font-black uppercase tracking-wider text-white/90">
              KOLABORASI
            </span>
          </div>
          <span className="text-xs font-black uppercase tracking-[0.18em] text-[#ff007f] drop-shadow-xs my-1">
            MEDIA PARTNER
          </span>
          <a
            href="https://wa.me/6285804333939?text=Halo%20Admin%20JIWANDANA,%20kami%20ingin%20bekerja%20sama%20sebagai%20Media%20Partner%20Kejuaraan%20Silat%20DSC%202026"
            target="_blank"
            rel="noopener noreferrer"
            className="py-1 px-3 bg-white hover:bg-white/90 text-[#ff007f] font-black text-[10px] uppercase tracking-wider rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer flex items-center gap-1"
            title="Hubungi Admin untuk Media Partner"
          >
            <span>HUB</span>
            <span className="text-[10px]">💬</span>
          </a>
        </div>
      </div>
    </div>
  );
}

