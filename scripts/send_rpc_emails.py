#!/usr/bin/env python3
"""
scripts/send_rpc_emails.py
-------------------------------------------------------------------
Skrip Pengiriman Email Blast Race Pack Collection (RPC) Pawitra Trail Run 2026.
Menggunakan Gmail SMTP (smtplib bawaan Python).

Fitur:
  --preview          : Menghasilkan berkas HTML sampel untuk ditinjau di browser lokal.
  --test <email>     : Mengirimkan 1 email uji coba ke alamat email Anda/panitia.
  --dry-run          : Simulasi pengiriman ke seluruh peserta tanpa kirim email nyata.
  --blast            : Mengirimkan email resmi ke seluruh peserta terdaftar.
  --cat <12K|7K>     : Filter kategori tertentu (opsional).
  --bib <NO_BIB>     : Kirim ke satu nomor BIB tertentu (opsional).

Penggunaan:
  python3 scripts/send_rpc_emails.py --preview
  python3 scripts/send_rpc_emails.py --test emailku@gmail.com
  python3 scripts/send_rpc_emails.py --blast
"""

import os
import sys
import json
import time
import argparse
import smtplib
import urllib.request
import urllib.parse
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.image import MIMEImage

# ==============================================================================
# 1. KONFIGURASI PROYEK & KONEKSI
# ==============================================================================
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CACHE_QR_DIR = os.path.join(BASE_DIR, '.cache_qr')
OUTPUT_DIR = os.path.join(BASE_DIR, 'export_bib')

def load_env():
    """Membaca konfigurasi environment dari .env.local atau .env."""
    env_vars = {}
    for filename in ['.env.local', '.env']:
        env_path = os.path.join(BASE_DIR, filename)
        if os.path.exists(env_path):
            with open(env_path, 'r', encoding='utf-8') as f:
                for line in f:
                    line = line.strip()
                    if line and not line.startswith('#') and '=' in line:
                        k, v = line.split('=', 1)
                        env_vars[k.strip()] = v.strip().strip("'\"")
    return env_vars

env = load_env()
SUPABASE_URL = env.get('NEXT_PUBLIC_SUPABASE_URL', 'https://gnbyrvileybbqfuzgbty.supabase.co')
SUPABASE_KEY = (
    env.get('SUPABASE_SERVICE_ROLE_KEY')
    or env.get('NEXT_PUBLIC_SUPABASE_ANON_KEY')
    or 'sb_publishable_8p4hyisKhyQaYNJWa6G48Q_DILEiCO7'
)

# Kredensial Gmail SMTP
GMAIL_USER = env.get('GMAIL_USER') or env.get('SMTP_USER') or ''
GMAIL_APP_PASSWORD = env.get('GMAIL_APP_PASSWORD') or env.get('SMTP_PASS') or env.get('SMTP_PASSWORD') or ''
GMAIL_SENDER_NAME = env.get('GMAIL_SENDER_NAME') or 'Pawitra Trail Run 2026'

SMTP_HOST = 'smtp.gmail.com'
SMTP_PORT = 587

# ==============================================================================
# 2. HELPER FUNCTIONS & DATA RETRIEVAL
# ==============================================================================
def fetch_participants(cat_filter=None, bib_filter=None):
    """Mengambil data peserta aktif yang memiliki no_bib dari database Supabase."""
    url = f"{SUPABASE_URL}/rest/v1/trailrun_registrations?select=nama,nama_bib,no_bib,kategori,email,no_hp,ukuran_jersey&no_bib=not.is.null&order=no_bib.asc"
    headers = {
        'apikey': SUPABASE_KEY,
        'Authorization': f'Bearer {SUPABASE_KEY}',
        'Range': '0-10000',
    }
    req = urllib.request.Request(url, headers=headers)
    with urllib.request.urlopen(req, timeout=15) as resp:
        data = json.loads(resp.read().decode('utf-8'))

    # Filter jika ditentukan
    if cat_filter:
        clean_cat = cat_filter.strip().upper()
        data = [p for p in data if (p.get('kategori') or '').strip().upper() == clean_cat]
    if bib_filter:
        clean_b = bib_filter.strip().upper()
        data = [p for p in data if (p.get('no_bib') or '').strip().upper() == clean_b]

    return data

def get_rpc_qr_bytes(no_bib: str) -> bytes:
    """Mengambil atau mengunduh QR Code RPC yang mengarah ke /trailrun/cek_rpc?no_bib=..."""
    clean_bib = no_bib.strip().upper()
    os.makedirs(CACHE_QR_DIR, exist_ok=True)
    cache_path = os.path.join(CACHE_QR_DIR, f"RPC_{clean_bib}.png")

    if os.path.exists(cache_path):
        try:
            with open(cache_path, 'rb') as f:
                return f.read()
        except Exception:
            pass

    # Link tujuan yang wajib di-scan oleh panitia saat RPC
    target_rpc_url = f"https://jiwandana.com/trailrun/cek_rpc?no_bib={urllib.parse.quote(clean_bib)}"
    qr_api = f"https://api.qrserver.com/v1/create-qr-code/?size=400x400&data={urllib.parse.quote(target_rpc_url)}"

    req = urllib.request.Request(qr_api, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req, timeout=10) as resp:
        raw_bytes = resp.read()
        with open(cache_path, 'wb') as f:
            f.write(raw_bytes)
        return raw_bytes

# ==============================================================================
# 3. HTML EMAIL TEMPLATE BUILDER (LIGHT THEME - CLEAN & RESPONSIVE)
# ==============================================================================
def build_rpc_email_html(participant: dict) -> str:
    """Menghasilkan HTML email bertema Light Theme yang bersih, modern, dan responsif."""
    raw_name = participant.get('nama') or 'Peserta'
    name_display = raw_name.strip()
    no_bib = (participant.get('no_bib') or '—').strip().upper()
    kategori = (participant.get('kategori') or '12K').strip().upper()
    
    rpc_url = f"https://jiwandana.com/trailrun/cek_rpc?no_bib={urllib.parse.quote(no_bib)}"
    
    # Warna badge kategori (Light Theme friendly)
    badge_bg = '#fee2e2' if '12' in kategori else '#fef3c7'
    badge_text = '#b91c1c' if '12' in kategori else '#b45309'
    badge_border = '#fca5a5' if '12' in kategori else '#fde68a'

    html = f"""<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Panduan &amp; Verifikasi Race Pack Collection (RPC)</title>
  <style>
    body, table, td, a {{ -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }}
    table, td {{ mso-table-lspace: 0pt; mso-table-rspace: 0pt; }}
    img {{ -ms-interpolation-mode: bicubic; border: 0; outline: none; text-decoration: none; }}
    body {{ margin: 0; padding: 0; width: 100% !important; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b; }}
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
                  Halo <strong>{name_display}</strong>,
                </p>
                <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #475569;">
                  Terima kasih telah menjadi bagian dari <strong>Pawitra Trail Run 2026</strong>. Pengambilan paket lomba (<em>Race Pack Collection</em>) akan segera dibuka. Silakan tunjukkan <strong>QR Code Verifikasi</strong> di bawah ini kepada panitia meja registrasi saat kedatangan Anda di Race Village.
                </p>
              </td>
            </tr>

            <!-- 3. Highlight Card: Kartu Data Peserta (Tanpa Ukuran Jersey) -->
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
                              {no_bib}
                            </div>
                          </td>
                          <td align="right" style="vertical-align: middle;">
                            <span style="font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #64748b; font-weight: 600; display: block; margin-bottom: 4px;">Kategori</span>
                            <div style="display: inline-block; padding: 4px 12px; background-color: {badge_bg}; color: {badge_text}; font-weight: 800; font-size: 13px; border-radius: 8px; border: 1px solid {badge_border};">
                              {kategori}
                            </div>
                          </td>
                        </tr>
                        <tr>
                          <td colspan="2" style="padding-top: 14px; margin-top: 10px; border-top: 1px solid #e2e8f0;">
                            <span style="font-size: 11px; color: #64748b; font-weight: 600;">NAMA PESERTA:</span>
                            <div style="font-size: 15px; font-weight: 800; color: #0f172a; margin-top: 2px;">
                              {name_display}
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
                      
                      <!-- Gambar QR Code Inline (CID Attachment) -->
                      <div style="margin: 18px 0 12px 0;">
                        <img src="cid:rpc_qrcode" alt="QR Code Verifikasi RPC" width="220" height="220" style="display: block; margin: 0 auto; border-radius: 12px; border: 1px solid #e2e8f0; max-width: 220px;" />
                      </div>
                      
                      <p style="margin: 0; font-size: 12px; color: #64748b; line-height: 1.5;">
                        Tunjukkan QR ini saat berada di meja pengambilan Race Pack.<br>
                        Panitia akan memindai kode ini untuk verifikasi pengambilan perlengkapan lomba Anda.
                      </p>
                      
                      <!-- CTA Button -->
                      <div style="margin-top: 18px;">
                        <a href="{rpc_url}" target="_blank" style="display: inline-block; background-color: #0f172a; color: #ffffff; font-size: 13px; font-weight: 700; text-decoration: none; padding: 11px 22px; border-radius: 10px; border: 1px solid #C9A227; box-shadow: 0 2px 8px rgba(15, 23, 42, 0.12);">
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
                        28 November pukul 14.00 WIB s/d 29 November pukul 03.00 WIB
                      </span>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- 6. Catatan Pengambilan -->
            <tr>
              <td style="padding: 0 28px 28px 28px;">
                <div style="background-color: #fffbeb; border-radius: 12px; padding: 16px; border: 1px solid #fef08a;">
                  <p style="margin: 0; font-size: 13px; font-weight: 700; color: #854d0e; line-height: 1.6;">
                    ⚠️ <strong>Catatan !!!</strong> Pengambilan yang diwakilkan wajib membawa Surat Kuasa bermeterai serta salinan identitas pemberi &amp; penerima kuasa.
                  </p>
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
</html>"""
    return html

# ==============================================================================
# 4. SEND EMAIL FUNCTION (SMTP GMAIL)
# ==============================================================================
def send_single_email(smtp_server, sender_email, sender_name, recipient_email, subject, html_content, qr_bytes):
    """Mengirim 1 email dengan HTML dan lampiran QR Code inline (CID)."""
    msg = MIMEMultipart('related')
    msg['From'] = f"{sender_name} <{sender_email}>"
    msg['To'] = recipient_email
    msg['Subject'] = subject

    # Bagian alternatif untuk HTML
    msg_alt = MIMEMultipart('alternative')
    msg.attach(msg_alt)

    # Plaintext fallback
    plain_text = f"Silakan buka tautan berikut untuk memverifikasi Race Pack Anda: {recipient_email}"
    msg_alt.attach(MIMEText(plain_text, 'plain', 'utf-8'))

    # HTML Body
    msg_alt.attach(MIMEText(html_content, 'html', 'utf-8'))

    # Inline QR Code Image (cid:rpc_qrcode)
    img_part = MIMEImage(qr_bytes)
    img_part.add_header('Content-ID', '<rpc_qrcode>')
    img_part.add_header('Content-Disposition', 'inline', filename='rpc_qrcode.png')
    msg.attach(img_part)

    # Kirim
    smtp_server.send_message(msg)

# ==============================================================================
# 5. CLI HANDLERS (PREVIEW, TEST, DRY-RUN, BLAST)
# ==============================================================================
def handle_preview():
    """Menghasilkan file HTML preview untuk ditinjau lokal di browser."""
    sample_participant = {
        'nama': 'MOHAMMAD QOSIM AL HAFIEZH',
        'nama_bib': 'QOSIM',
        'no_bib': 'M-00001',
        'kategori': '12K',
        'ukuran_jersey': 'L',
        'email': 'sample@jiwandana.com',
    }
    
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    preview_file = os.path.join(OUTPUT_DIR, 'preview_rpc_email.html')
    
    # Ambil QR code sampel
    print("📲 Menyiapkan QR Code sampel...")
    qr_bytes = get_rpc_qr_bytes(sample_participant['no_bib'])
    
    # Simpan QR sampel untuk preview lokal
    sample_qr_path = os.path.join(OUTPUT_DIR, 'preview_qr.png')
    with open(sample_qr_path, 'wb') as f:
        f.write(qr_bytes)

    html = build_rpc_email_html(sample_participant)
    # Ganti cid:rpc_qrcode dengan file lokal untuk preview browser
    html_local = html.replace('cid:rpc_qrcode', 'preview_qr.png')
    
    with open(preview_file, 'w', encoding='utf-8') as f:
        f.write(html_local)
        
    print("=" * 70)
    print("✅ PREVIEW EMAIL BERHASIL DIBUAT!")
    print(f"📄 Buka file ini di browser Anda: {preview_file}")
    print("=" * 70)

def handle_test(target_email):
    """Mengirim 1 email simulasi ke alamat admin."""
    if not GMAIL_USER or not GMAIL_APP_PASSWORD:
        print_missing_credentials()
        sys.exit(1)

    print(f"📡 Mengirim email uji coba ke: {target_email}...")
    sample_participant = {
        'nama': 'MOHAMMAD QOSIM AL HAFIEZH (TEST SIMULASI)',
        'nama_bib': 'TEST USER',
        'no_bib': 'M-00001',
        'kategori': '12K',
        'ukuran_jersey': 'XL',
        'email': target_email,
    }

    qr_bytes = get_rpc_qr_bytes(sample_participant['no_bib'])
    html = build_rpc_email_html(sample_participant)
    subject = f"[UJI COBA] Konfirmasi & Panduan Pengambilan Race Pack - BIB: {sample_participant['no_bib']}"

    try:
        with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
            server.ehlo()
            server.starttls()
            server.login(GMAIL_USER, GMAIL_APP_PASSWORD)
            send_single_email(
                server,
                GMAIL_USER,
                GMAIL_SENDER_NAME,
                target_email,
                subject,
                html,
                qr_bytes
            )
        print("=" * 70)
        print(f"🎉 SUKSES! Email uji coba berhasil dikirim ke: {target_email}")
        print("Silakan buka aplikasi Gmail di ponsel/komputer untuk memeriksa tampilannya.")
        print("=" * 70)
    except Exception as e:
        print(f"❌ Gagal mengirim email: {e}")

def handle_blast(cat_filter=None, bib_filter=None, dry_run=False):
    """Menjalankan pengiriman email blast ke seluruh peserta."""
    if not dry_run and (not GMAIL_USER or not GMAIL_APP_PASSWORD):
        print_missing_credentials()
        sys.exit(1)

    print("📡 Mengambil data peserta dari Supabase...")
    participants = fetch_participants(cat_filter=cat_filter, bib_filter=bib_filter)
    total = len(participants)
    print(f"✅ Ditemukan {total} peserta terdaftar yang memenuhi kriteria.")

    if total == 0:
        print("⚠️ Tidak ada peserta untuk diproses.")
        return

    if dry_run:
        print("\n🔍 MODE DRY-RUN: Simulasi tanpa pengiriman nyata.")
        for idx, p in enumerate(participants[:5], 1):
            print(f"  {idx}. [{p.get('kategori')}] BIB: {p.get('no_bib')} | Nama: {p.get('nama')} | Email: {p.get('email')}")
        if total > 5:
            print(f"  ... dan {total - 5} peserta lainnya.")
        print(f"✅ Seluruh {total} email siap dikirim.")
        return

    # Konfirmasi sebelum blast live
    print("\n" + "!" * 70)
    print(f"PERINGATAN: Anda akan mengirim email resmi ke {total} peserta.")
    print(f"Pengirim: {GMAIL_SENDER_NAME} <{GMAIL_USER}>")
    print("!" * 70)
    
    confirm = input("Ketik 'YA' untuk melanjutkan pengiriman: ").strip()
    if confirm != 'YA':
        print("Pengiriman dibatalkan.")
        return

    success_count = 0
    fail_count = 0
    log_results = []
    start_time = time.time()

    print("\n🚀 Membuka koneksi Gmail SMTP dan memulai pengiriman...")
    try:
        with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
            server.ehlo()
            server.starttls()
            server.login(GMAIL_USER, GMAIL_APP_PASSWORD)
            print("✅ Terhubung ke Gmail SMTP server.")

            for idx, p in enumerate(participants, 1):
                email = (p.get('email') or '').strip()
                no_bib = (p.get('no_bib') or '').strip().upper()
                name = (p.get('nama') or '').strip()

                if not email or '@' not in email:
                    print(f"  ⚠️ [{idx}/{total}] Lewatkan {no_bib} (Email tidak valid: {email})")
                    fail_count += 1
                    log_results.append({'no_bib': no_bib, 'nama': name, 'email': email, 'status': 'invalid_email'})
                    continue

                try:
                    qr_bytes = get_rpc_qr_bytes(no_bib)
                    html = build_rpc_email_html(p)
                    subject = f"Konfirmasi & Panduan Pengambilan Race Pack (RPC) - BIB: {no_bib}"
                    
                    send_single_email(
                        server,
                        GMAIL_USER,
                        GMAIL_SENDER_NAME,
                        email,
                        subject,
                        html,
                        qr_bytes
                    )
                    
                    success_count += 1
                    log_results.append({'no_bib': no_bib, 'nama': name, 'email': email, 'status': 'success', 'time': time.strftime('%Y-%m-%d %H:%M:%S')})
                    
                    percent = int(idx / total * 100)
                    sys.stdout.write(f"\r  [{idx}/{total}] ({percent}%) Terkirim ke: {email[:30]:<30} | BIB: {no_bib}")
                    sys.stdout.flush()

                    # Jeda aman 1 detik per email agar reputasi IP/Gmail aman dari rate-limiting
                    time.sleep(1.0)

                except Exception as e:
                    print(f"\n  ❌ Gagal kirim ke {email} ({no_bib}): {e}")
                    fail_count += 1
                    log_results.append({'no_bib': no_bib, 'nama': name, 'email': email, 'status': 'error', 'error': str(e)})

    except Exception as e:
        print(f"\n❌ Terputus dari SMTP server: {e}")

    # Simpan log pengiriman
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    log_file = os.path.join(OUTPUT_DIR, 'rpc_email_blast_log.json')
    with open(log_file, 'w', encoding='utf-8') as f:
        json.dump(log_results, f, indent=2)

    elapsed = time.time() - start_time
    print("\n" + "=" * 70)
    print(f"🎉 PENGIRIMAN BLAST SELESAI DALAM {elapsed:.1f} DETIK!")
    print(f"✅ Berhasil Terkirim : {success_count} Email")
    if fail_count > 0:
        print(f"⚠️ Gagal / Dilewati  : {fail_count} Peserta")
    print(f"📄 Rekap Log Lengkap : {log_file}")
    print("=" * 70)

def print_missing_credentials():
    print("=" * 70)
    print("⚠️  KREDENSIAL GMAIL SMTP BELUM DITEMUKAN!")
    print("=" * 70)
    print("Untuk mengirim email via Gmail, Anda perlu menambahkan App Password di file .env.local:")
    print("\n  GMAIL_USER=\"emailpanitia@gmail.com\"")
    print("  GMAIL_APP_PASSWORD=\"xxxx xxxx xxxx xxxx\"  # 16 Karakter App Password")
    print("  GMAIL_SENDER_NAME=\"Pawitra Trail Run 2026\"")
    print("\nCara mendapatkan Gmail App Password (Gratis & Cepat):")
    print("1. Buka https://myaccount.google.com/security")
    print("2. Aktifkan 2-Step Verification jika belum aktif.")
    print("3. Cari menu 'App Passwords' (Sandi Aplikasi).")
    print("4. Beri nama 'Jiwandana Trail Run' dan salin 16 karakter password yang muncul.")
    print("=" * 70)

# ==============================================================================
# 6. ENTRY POINT
# ==============================================================================
if __name__ == '__main__':
    parser = argparse.ArgumentParser(description="Blast Email RPC Pawitra Trail Run 2026")
    parser.add_argument('--preview', action='store_true', help="Hasilkan HTML preview di browser lokal")
    parser.add_argument('--test', type=str, help="Kirim 1 email uji coba ke alamat email tujuan")
    parser.add_argument('--dry-run', action='store_true', help="Simulasi kirim tanpa pengiriman nyata")
    parser.add_argument('--blast', action='store_true', help="Kirim email blast ke seluruh peserta terdaftar")
    parser.add_argument('--cat', type=str, help="Filter kategori tertentu (e.g. 12K / 7K)")
    parser.add_argument('--bib', type=str, help="Filter nomor BIB tertentu (e.g. M-00069)")

    args = parser.parse_args()

    if args.preview:
        handle_preview()
    elif args.test:
        handle_test(args.test)
    elif args.blast or args.dry_run:
        handle_blast(cat_filter=args.cat, bib_filter=args.bib, dry_run=args.dry_run)
    else:
        # Default: jalankan preview dan tampilkan bantuan
        print("💡 Menjalankan mode --preview sebagai contoh default.")
        handle_preview()
        print("\nPerintah lainnya:")
        print("  python3 scripts/send_rpc_emails.py --test emailku@gmail.com")
        print("  python3 scripts/send_rpc_emails.py --dry-run")
        print("  python3 scripts/send_rpc_emails.py --blast")
