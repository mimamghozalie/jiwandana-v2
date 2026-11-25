/**
 * lib/rpcWhatsAppHelper.ts
 * -----------------------------------------------------------------------------
 * Helper utilitas untuk template pesan WhatsApp dan penyalinan gambar QR Code
 * Race Pack Collection (RPC) Pawitra Trail Run 2026.
 */

export interface RpcWaParticipantData {
  nama: string;
  nama_bib?: string | null;
  no_bib: string;
  kategori?: string | null;
  ukuran_jersey?: string | null;
  no_hp?: string | null;
}

/**
 * Menghasilkan teks pesan WhatsApp resmi untuk konfirmasi RPC peserta
 */
export function generateRpcWhatsAppMessage(participant: RpcWaParticipantData): string {
  const nama = (participant.nama || 'Peserta').trim();
  const noBib = (participant.no_bib || '—').trim().toUpperCase();
  const namaBib = (participant.nama_bib || participant.nama || '—').trim();
  const kategori = (participant.kategori || '12K').trim().toUpperCase();
  const ukuranJersey = (participant.ukuran_jersey || '—').trim().toUpperCase();

  return `*KONFIRMASI PENGAMBILAN RACE PACK (RPC)*
*PAWITRA TRAIL RUN 2026*
-----------------------------------------
Halo Kak *${nama}*,
Berikut adalah data registrasi & verifikasi Race Pack Collection (RPC) Anda:

- *Nomor BIB:* ${noBib}
- *Nama BIB:* ${namaBib}
- *Kategori:* ${kategori}
- *Ukuran Jersey:* ${ukuranJersey}

*Jadwal & Lokasi Pengambilan Race Pack:*
Waktu: 28 November pukul 10.00 WIB s/d 29 November pukul 03.00 WIB
Lokasi: Race Village — KDMP Seloliman, Kec. Trawas, Kab. Mojokerto, Jawa Timur

*Catatan Wajib:*
Pengambilan yang diwakilkan wajib membawa Surat Kuasa bermeterai serta salinan identitas pemberi & penerima kuasa.

Tunjukkan pesan ini beserta gambar QR Code yang terlampir kepada petugas meja RPC saat pengambilan paket race pack. Terima kasih dan sampai jumpa di garis start!`;
}

/**
 * Menghasilkan URL gambar QR Code CDN untuk verifikasi RPC
 */
export function getRpcQrImageUrl(no_bib: string): string {
  const cleanBib = (no_bib || '').trim().toUpperCase();
  const targetRpcUrl = `https://jiwandana.com/trailrun/cek_rpc?no_bib=${encodeURIComponent(cleanBib)}`;
  return `https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(targetRpcUrl)}`;
}

/**
 * Menyalin teks pesan WhatsApp ke clipboard pengguna
 */
export async function copyRpcWhatsAppMessage(
  participant: RpcWaParticipantData
): Promise<{ success: boolean; error?: string }> {
  try {
    const text = generateRpcWhatsAppMessage(participant);
    if (!navigator?.clipboard) {
      throw new Error('Clipboard API tidak didukung pada browser ini.');
    }
    await navigator.clipboard.writeText(text);
    return { success: true };
  } catch (err: any) {
    console.error('[copyRpcWhatsAppMessage] Error:', err);
    return { success: false, error: err.message || 'Gagal menyalin pesan WhatsApp.' };
  }
}

/**
 * Menyalin file gambar QR Code langsung ke clipboard sistem (image/png)
 * sehingga pengguna cukup menekan Ctrl+V / Cmd+V di WhatsApp untuk melampirkan gambar.
 */
export async function copyRpcQrImageToClipboard(
  no_bib: string
): Promise<{ success: boolean; error?: string; fallbackUrl?: string }> {
  const qrUrl = getRpcQrImageUrl(no_bib);

  try {
    if (!navigator?.clipboard || typeof ClipboardItem === 'undefined') {
      throw new Error('Clipboard Item image/png tidak didukung pada browser ini.');
    }

    // Ambil gambar dari URL CDN publik
    const response = await fetch(qrUrl, { mode: 'cors' });
    if (!response.ok) {
      throw new Error('Gagal mengunduh gambar QR Code dari server.');
    }

    const blob = await response.blob();

    // Pastikan blob bertipe image/png
    const pngBlob = blob.type === 'image/png' ? blob : new Blob([blob], { type: 'image/png' });

    const item = new ClipboardItem({ 'image/png': pngBlob });
    await navigator.clipboard.write([item]);

    return { success: true };
  } catch (err: any) {
    console.warn('[copyRpcQrImageToClipboard] Direct image copy failed, using fallback:', err);
    return {
      success: false,
      error: err.message || 'Gagal menyalin gambar QR Code ke clipboard.',
      fallbackUrl: qrUrl,
    };
  }
}

/**
 * Memformat nomor WhatsApp lokal (08... / 8...) menjadi format internasional (628...)
 */
export function formatPhoneNumberForWa(phone?: string | null): string {
  if (!phone) return '';
  let cleaned = phone.replace(/[^\d+]/g, '');

  if (cleaned.startsWith('+')) {
    cleaned = cleaned.substring(1);
  }

  if (cleaned.startsWith('0')) {
    cleaned = '62' + cleaned.substring(1);
  } else if (!cleaned.startsWith('62') && cleaned.length >= 8) {
    cleaned = '62' + cleaned;
  }

  return cleaned;
}

/**
 * Menghasilkan link wa.me dengan nomor dan pesan siap kirim
 */
export function getWhatsAppChatUrl(phone?: string | null, message?: string): string {
  const formattedPhone = formatPhoneNumberForWa(phone);
  const encodedText = message ? encodeURIComponent(message) : '';

  if (formattedPhone) {
    return `https://wa.me/${formattedPhone}${encodedText ? `?text=${encodedText}` : ''}`;
  }

  return encodedText ? `https://wa.me/?text=${encodedText}` : 'https://web.whatsapp.com';
}
