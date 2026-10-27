import React from 'react';

interface SilatSponsorPillarProps {
  variant: 'pink' | 'tosca';
  height?: string;
  className?: string;
}

export default function SilatSponsorPillar({
  variant,
  height = 'h-[480px] lg:h-[540px]',
  className = '',
}: SilatSponsorPillarProps) {
  const isPink = variant === 'pink';

  return (
    <div
      className={`hidden md:flex md:col-span-2 ${height} ${
        isPink
          ? 'bg-[#f8a5c2]/80 border-2 border-white/80'
          : 'bg-[#81ecec]/80 border-2 border-white/80'
      } backdrop-blur-md rounded-3xl p-4 flex-col items-center justify-center text-center shadow-md shrink-0 select-none ${className}`}
    >
      <span
        className={`text-xs lg:text-sm font-black uppercase tracking-[0.25em] ${
          isPink ? 'text-[#0088cc]' : 'text-[#ff007f]'
        } drop-shadow-xs whitespace-nowrap ${
          isPink ? 'rotate-[-90deg]' : 'rotate-[90deg]'
        }`}
      >
        SPONSORSHIP
      </span>
    </div>
  );
}
