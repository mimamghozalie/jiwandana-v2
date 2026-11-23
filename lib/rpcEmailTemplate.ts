/**
 * lib/rpcEmailTemplate.ts
 * -----------------------------------------------------------------------------
 * Generator HTML Email Konfirmasi & Verifikasi Race Pack Collection (RPC)
 * Pawitra Trail Run 2026.
 *
 * Digunakan untuk:
 * 1. Menghasilkan template visual email HTML (Light Theme) secara dinamis.
 * 2. Menyalin Rich HTML ke clipboard agar siap di-paste langsung di Gmail Compose.
 * 3. Deep link membuka Gmail Web Compose.
 */

export interface RpcParticipantData {
  nama: string;
  no_bib: string;
  kategori?: string;
  email?: string;
}

/**
 * Menghasilkan subjek standar resmi email RPC
 */
export function getRpcEmailSubject(no_bib?: string): string {
  const cleanBib = (no_bib || '').trim().toUpperCase() || 'PESERTA';
  return `Konfirmasi & Panduan Pengambilan Race Pack (RPC) - BIB: ${cleanBib}`;
}

/**
 * Menghasilkan HTML email RPC yang responsif dan elegan (Light Theme)
 * Menggunakan QR Code CDN publik agar langsung tampil saat di-paste di Gmail.
 */
export function generateRpcEmailHtml(participant: RpcParticipantData): string {
  const nameDisplay = (participant.nama || 'Peserta').trim();
  const noBib = (participant.no_bib || '—').trim().toUpperCase();
  const kategori = (participant.kategori || '12K').trim().toUpperCase();

  const is12k = kategori.includes('12');
  const badgeBg = is12k ? '#fee2e2' : '#fef3c7';
  const badgeText = is12k ? '#b91c1c' : '#b45309';
  const badgeBorder = is12k ? '#fca5a5' : '#fde68a';

  const targetRpcUrl = `https://jiwandana.com/trailrun/cek_rpc?no_bib=${encodeURIComponent(noBib)}`;
  const qrImgUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(targetRpcUrl)}`;

  return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Panduan &amp; Verifikasi Race Pack Collection (RPC)</title>
  <style>
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; border: 0; outline: none; text-decoration: none; }
    body { margin: 0; padding: 0; width: 100% !important; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b; }
  </style>
</head>
<body style="margin: 0; padding: 24px 0; background-color: #f8fafc;">
  <center style="width: 100%; table-layout: fixed; background-color: #f8fafc;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f8fafc;">
      <tr>
        <td align="center" style="padding: 12px 16px;">
          <!-- Card Container -->
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05); border: 1px solid #e2e8f0;">
            
            <!-- 1. Header Bar (Light Theme dengan Aksen Emas) -->
            <tr>
              <td style="background-color: #ffffff; padding: 32px 28px 24px 28px; text-align: center; border-top: 6px solid #C9A227; border-bottom: 1px solid #f1f5f9;">
                <p style="margin: 0 0 8px 0; color: #b45309; font-size: 11px; font-weight: 800; letter-spacing: 2px; text-transform: uppercase;">
                  PAWITRA TRAIL RUN 2026
                </p>
                <h1 style="margin: 0; color: #0f172a; font-size: 22px; font-weight: 800; line-height: 1.3;">
                  Panduan &amp; Verifikasi Pengambilan Race Pack (RPC)
                </h1>
                <p style="margin: 8px 0 0 0; color: #64748b; font-size: 13px;">
                  Simpan email ini untuk ditunjukkan kepada panitia di venue lomba.
                </p>
              </td>
            </tr>

            <!-- 2. Greeting & Intro -->
            <tr>
              <td style="padding: 28px 28px 16px 28px;">
                <p style="margin: 0 0 12px 0; font-size: 15px; line-height: 1.6; color: #334155;">
                  Halo <strong>${nameDisplay}</strong>,
                </p>
                <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #475569;">
                  Terima kasih telah menjadi bagian dari <strong>Pawitra Trail Run 2026</strong>. Pengambilan paket lomba (<em>Race Pack Collection</em>) akan segera dibuka. Silakan tunjukkan <strong>QR Code Verifikasi</strong> di bawah ini kepada panitia meja registrasi saat kedatangan Anda di Race Village.
                </p>
              </td>
            </tr>

            <!-- 3. Highlight Card: Kartu Data Peserta -->
            <tr>
              <td style="padding: 0 28px 20px 28px;">
                <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f8fafc; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden;">
                  <tr>
                    <td style="padding: 20px 22px;">
                      <table width="100%" cellpadding="0" cellspacing="0" border="0">
                        <tr>
                          <td style="vertical-align: middle;">
                            <span style="font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #64748b; font-weight: 600;">Nomor BIB Resmi</span>
                            <div style="font-size: 28px; font-weight: 900; color: #0f172a; letter-spacing: 1.5px; margin-top: 2px;">
                              ${noBib}
                            </div>
                          </td>
                          <td align="right" style="vertical-align: middle;">
                            <span style="font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #64748b; font-weight: 600; display: block; margin-bottom: 4px;">Kategori</span>
                            <div style="display: inline-block; padding: 4px 12px; background-color: ${badgeBg}; color: ${badgeText}; font-weight: 800; font-size: 13px; border-radius: 8px; border: 1px solid ${badgeBorder};">
                              ${kategori}
                            </div>
                          </td>
                        </tr>
                        <tr>
                          <td colspan="2" style="padding-top: 14px; margin-top: 10px; border-top: 1px solid #e2e8f0;">
                            <span style="font-size: 11px; color: #64748b; font-weight: 600;">NAMA PESERTA:</span>
                            <div style="font-size: 15px; font-weight: 800; color: #0f172a; margin-top: 2px;">
                              ${nameDisplay}
                            </div>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- 4. QR Code RPC Box -->
            <tr>
              <td align="center" style="padding: 10px 28px 24px 28px;">
                <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff; border: 2px dashed #C9A227; border-radius: 16px; padding: 24px; text-align: center;">
                  <tr>
                    <td align="center">
                      <span style="display: inline-block; background-color: #fef3c7; color: #92400e; font-size: 11px; font-weight: 800; letter-spacing: 1px; padding: 5px 14px; border-radius: 20px; text-transform: uppercase; border: 1px solid #fde68a;">
                        QR CODE VERIFIKASI RPC
                      </span>
                      
                      <!-- Gambar QR Code Inline Publik -->
                      <div style="margin: 18px 0 12px 0;">
                        <img src="${qrImgUrl}" alt="QR Code Verifikasi RPC ${noBib}" width="220" height="220" style="display: block; margin: 0 auto; border-radius: 12px; border: 1px solid #e2e8f0; max-width: 220px;" />
                      </div>
                      
                      <p style="margin: 0; font-size: 12px; color: #64748b; line-height: 1.5;">
                        Tunjukkan QR ini saat berada di meja pengambilan Race Pack.<br>
                        Panitia akan memindai kode ini untuk verifikasi pengambilan perlengkapan lomba Anda.
                      </p>
                      
                      <!-- CTA Button -->
                      <div style="margin-top: 18px;">
                        <a href="${targetRpcUrl}" target="_blank" style="display: inline-block; background-color: #0f172a; color: #ffffff; font-size: 13px; font-weight: 700; text-decoration: none; padding: 11px 22px; border-radius: 10px; border: 1px solid #C9A227; box-shadow: 0 2px 8px rgba(15, 23, 42, 0.12);">
                          Buka Lembar Verifikasi RPC &rarr;
                        </a>
                      </div>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- 5. Jadwal & Lokasi Pengambilan -->
            <tr>
              <td style="padding: 0 28px 24px 28px;">
                <h3 style="margin: 0 0 12px 0; font-size: 15px; font-weight: 800; color: #0f172a; border-left: 4px solid #C9A227; padding-left: 10px;">
                  Informasi &amp; Lokasi Pengambilan
                </h3>
                
                <table width="100%" cellpadding="0" cellspacing="0" border="0" style="font-size: 13px; line-height: 1.6; color: #475569;">
                  <tr>
                    <td width="26" style="vertical-align: top; padding-bottom: 10px;">📍</td>
                    <td style="vertical-align: top; padding-bottom: 10px;">
                      <strong>Lokasi Venue:</strong><br>
                      Race Village — KDMP Seloliman, Kec. Trawas, Kab. Mojokerto, Jawa Timur.
                    </td>
                  </tr>
                  <tr>
                    <td width="26" style="vertical-align: top; padding-bottom: 10px;">⏰</td>
                    <td style="vertical-align: top; padding-bottom: 10px;">
                      <strong>Waktu Pengambilan:</strong><br>
                      <span style="display: inline-block; background-color: #f1f5f9; padding: 4px 10px; border-radius: 6px; font-weight: 700; color: #0f172a; margin-top: 2px; border: 1px solid #e2e8f0;">
                        28 November pukul 10.00 WIB s/d 29 November pukul 03.00 WIB
                      </span>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- 6. Syarat Pengambilan -->
            <tr>
              <td style="padding: 0 28px 28px 28px;">
                <div style="background-color: #fffbeb; border-radius: 12px; padding: 16px; border: 1px solid #fef08a;">
                  <h4 style="margin: 0 0 8px 0; font-size: 13px; font-weight: 800; color: #854d0e;">
                    ⚠️ Syarat &amp; Ketentuan Wajib:
                  </h4>
                  <ul style="margin: 0; padding-left: 18px; font-size: 12px; line-height: 1.6; color: #713f12;">
                    <li>Membawa <strong>e-KTP / Kartu Identitas Asli</strong> sesuai nama terdaftar.</li>
                    <li>Menunjukkan QR Code verifikasi pada email ini (bisa berupa tangkapan layar ponsel).</li>
                    <li>Pengambilan yang diwakilkan <strong>wajib</strong> membawa Surat Kuasa bermeterai serta salinan identitas pemberi &amp; penerima kuasa.</li>
                  </ul>
                </div>
              </td>
            </tr>

            <!-- 7. Footer -->
            <tr>
              <td style="background-color: #f8fafc; padding: 24px 28px; text-align: center; border-top: 1px solid #e2e8f0;">
                <p style="margin: 0 0 6px 0; font-size: 12px; font-weight: 700; color: #475569;">
                  PANITIA PAWITRA TRAIL RUN SECTION 2026
                </p>
                <p style="margin: 0; font-size: 11px; color: #94a3b8; line-height: 1.5;">
                  Website: <a href="https://jiwandana.com" style="color: #b45309; text-decoration: none; font-weight: 600;">jiwandana.com</a> &bull; Butuh bantuan? Hubungi panitia via WhatsApp resmi.
                </p>
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </center>
</body>
</html>`;
}

/**
 * Menghasilkan versi teks biasa (fallback plaintext)
 */
export function generateRpcEmailPlainText(participant: RpcParticipantData): string {
  const nameDisplay = (participant.nama || 'Peserta').trim();
  const noBib = (participant.no_bib || '—').trim().toUpperCase();
  const kategori = (participant.kategori || '12K').trim().toUpperCase();
  const targetRpcUrl = `https://jiwandana.com/trailrun/cek_rpc?no_bib=${encodeURIComponent(noBib)}`;

  return `PAWITRA TRAIL RUN 2026
PANDUAN & VERIFIKASI PENGAMBILAN RACE PACK (RPC)

Halo ${nameDisplay},

Terima kasih telah menjadi bagian dari Pawitra Trail Run 2026.
Berikut data resmi kepesertaan Anda:

• Nomor BIB Resmi : ${noBib}
• Kategori        : ${kategori}
• Nama Peserta    : ${nameDisplay}

Link Verifikasi & QR Code RPC:
${targetRpcUrl}

Jadwal Pengambilan RPC:
28 November pukul 10.00 WIB s/d 29 November pukul 03.00 WIB

Lokasi Venue:
Race Village — KDMP Seloliman, Kec. Trawas, Kab. Mojokerto, Jawa Timur.

Syarat & Ketentuan Wajib:
1. Membawa e-KTP / Kartu Identitas Asli sesuai nama terdaftar.
2. Menunjukkan QR Code verifikasi pada tautan di atas.
3. Pengambilan yang diwakilkan wajib membawa Surat Kuasa bermeterai serta salinan identitas pemberi & penerima kuasa.

Salam,
Panitia Pawitra Trail Run Section 2026
jiwandana.com`;
}

/**
 * Menyalin Email RPC dalam format Rich Text (text/html) & Plain Text
 * agar saat di-paste di Gmail Compose langsung ter-render visual utuh.
 */
export async function copyRpcEmailToClipboard(
  participant: RpcParticipantData
): Promise<{ success: boolean; error?: string }> {
  try {
    const htmlContent = generateRpcEmailHtml(participant);
    const plainTextContent = generateRpcEmailPlainText(participant);

    if (typeof navigator !== 'undefined' && navigator.clipboard && typeof ClipboardItem !== 'undefined') {
      const blobHtml = new Blob([htmlContent], { type: 'text/html' });
      const blobText = new Blob([plainTextContent], { type: 'text/plain' });

      await navigator.clipboard.write([
        new ClipboardItem({
          'text/html': blobHtml,
          'text/plain': blobText,
        }),
      ]);
      return { success: true };
    }

    // Fallback jika ClipboardItem tidak didukung
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      await navigator.clipboard.writeText(htmlContent);
      return { success: true };
    }

    throw new Error('Clipboard API tidak didukung pada browser ini.');
  } catch (err: any) {
    console.error('Gagal menyalin email ke clipboard:', err);
    return { success: false, error: err?.message || 'Gagal menyalin ke clipboard.' };
  }
}

/**
 * Membuka tab baru Gmail Web Compose dengan penerima dan subjek terisi
 */
export function openGmailCompose(email: string, subject: string): void {
  const cleanEmail = (email || '').trim();
  const url = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(cleanEmail)}&su=${encodeURIComponent(subject)}`;
  if (typeof window !== 'undefined') {
    window.open(url, '_blank', 'noopener,noreferrer');
  }
}
