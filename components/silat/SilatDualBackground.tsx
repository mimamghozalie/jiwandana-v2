import React from 'react';
import Image from 'next/image';

export default function SilatDualBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden select-none">
      {/* Background Mobile / Phone (Portrait): aktif < md */}
      <div className="block md:hidden relative w-full h-full">
        <Image
          src="/assets/silat/bg_silat_phone.png"
          alt="Background Kejuaraan Pencak Silat Mobile"
          fill
          priority
          sizes="100vw"
          className="object-cover object-top"
        />
      </div>

      {/* Background PC / Desktop (Landscape): aktif >= md */}
      <div className="hidden md:block relative w-full h-full">
        <Image
          src="/assets/silat/bg_silat_pc.png"
          alt="Background Kejuaraan Pencak Silat Desktop"
          fill
          priority
          sizes="100vw"
          className="object-cover object-top"
        />
      </div>
    </div>
  );
}
