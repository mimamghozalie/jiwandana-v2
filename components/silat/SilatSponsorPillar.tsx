import React from 'react';

interface SilatSponsorPillarProps {
  variant: 'pink' | 'tosca';
  height?: string;
  className?: string;
  title?: string;
}

export default function SilatSponsorPillar({
  variant,
  height = 'h-[480px] lg:h-[540px]',
  className = '',
  title,
}: SilatSponsorPillarProps) {
  const isPink = variant === 'pink';
  const label = title || (isPink ? 'SPONSORSHIP' : 'MEDIA PARTNER');
  const waText = isPink
    ? 'Halo Admin JIWANDANA, kami tertarik menjadi Sponsor Kejuaraan Silat DSC 2026'
    : 'Halo Admin JIWANDANA, kami ingin bekerja sama sebagai Media Partner Kejuaraan Silat DSC 2026';

  return (
    <div
      className={`hidden md:flex md:col-span-2 ${height} ${
        isPink
          ? 'bg-[#f8a5c2]/80 border-2 border-white/80'
          : 'bg-[#81ecec]/80 border-2 border-white/80'
      } backdrop-blur-md rounded-3xl p-4 flex-col items-center justify-between text-center shadow-md shrink-0 select-none ${className}`}
    >
      <span className="text-[10px] font-black uppercase tracking-wider text-white/80">
        KOLABORASI
      </span>
      <span
        className={`text-xs lg:text-sm font-black uppercase tracking-[0.25em] ${
          isPink ? 'text-[#0088cc]' : 'text-[#ff007f]'
        } drop-shadow-xs whitespace-nowrap ${
          isPink ? 'rotate-[-90deg]' : 'rotate-[90deg]'
        }`}
      >
        {label}
      </span>
      <a
        href={`https://wa.me/6285804333939?text=${encodeURIComponent(waText)}`}
        target="_blank"
        rel="noopener noreferrer"
        className={`py-1.5 px-3 bg-white/90 hover:bg-white ${
          isPink ? 'text-[#0088cc] hover:text-[#0066aa]' : 'text-[#ff007f] hover:text-[#d6006c]'
        } font-black text-[11px] uppercase tracking-wider rounded-xl shadow-xs transition-all transform hover:scale-105 active:scale-95 cursor-pointer flex items-center gap-1`}
        title={`Hubungi Admin untuk ${label}`}
      >
        <span>HUB</span>
        <span className="text-[10px]">💬</span>
      </a>
    </div>
  );
}
