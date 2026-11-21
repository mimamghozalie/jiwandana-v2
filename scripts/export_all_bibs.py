#!/usr/bin/env python3
"""
scripts/export_all_bibs.py
-------------------------------------------------------------------
Skrip Ekspor Cepat Seluruh Kartu E-BIB Peserta Trail Run (300 DPI).
- Mengambil seluruh peserta terdaftar dari database Supabase.
- Mengunduh/cache QR Code BIO (https://jiwandana.com/trailrun/bio_peserta?no_bib=...).
- Merender gambar PNG beresolusi cetak asli 2483 x 1774 px (A5 @ 300 DPI)
  menggunakan template resmi 12K dan 7K terbaru.
- Mengelompokkan berkas per folder kategori (12K / 7K).
- Otomatis mengompres seluruh hasil ke dalam satu berkas ZIP.

Penggunaan:
  python3 scripts/export_all_bibs.py
  atau
  bun run export:bib
"""

import os
import sys
import json
import re
import time
import zipfile
import urllib.request
from io import BytesIO
from concurrent.futures import ThreadPoolExecutor, as_completed
from PIL import Image, ImageDraw, ImageFont

# ==============================================================================
# 1. KONFIGURASI PROYEK & KONEKSI SUPABASE
# ==============================================================================
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PUBLIC_DIR = os.path.join(BASE_DIR, 'public')
OUTPUT_DIR = os.path.join(BASE_DIR, 'export_bib')
CACHE_QR_DIR = os.path.join(BASE_DIR, '.cache_qr')

# Baca environment variables dari .env.local jika ada
def load_env():
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

# Template paths
TEMPLATE_MAP = {
    '12k': os.path.join(PUBLIC_DIR, 'bib-12-clean.jpeg'),
    '7k': os.path.join(PUBLIC_DIR, 'bib-7-clean.jpeg'),
    '3k': os.path.join(PUBLIC_DIR, 'bib-3-clean.jpeg'),
}

# System Fonts
FONT_ARIAL_BLACK = '/System/Library/Fonts/Supplemental/Arial Black.ttf'
FONT_ARIAL_BOLD = '/System/Library/Fonts/Supplemental/Arial Bold.ttf'

# ==============================================================================
# 2. HELPER FUNCTIONS
# ==============================================================================
def sanitize_filename(name: str) -> str:
    """Mengubah karakter nama menjadi format aman untuk nama file sistem."""
    clean = re.sub(r'[^a-zA-Z0-9_\- ]', '', name).strip()
    return re.sub(r'\s+', '_', clean)[:50]

def fetch_participants():
    """Mengambil seluruh data peserta terdaftar dari Supabase."""
    url = f"{SUPABASE_URL}/rest/v1/trailrun_registrations?select=nama,nama_bib,no_bib,kategori&no_bib=not.is.null&order=no_bib.asc"
    headers = {
        'apikey': SUPABASE_KEY,
        'Authorization': f'Bearer {SUPABASE_KEY}',
        'Range': '0-10000',
    }
    req = urllib.request.Request(url, headers=headers)
    with urllib.request.urlopen(req, timeout=15) as resp:
        return json.loads(resp.read().decode('utf-8'))

def get_or_fetch_qr(no_bib: str) -> Image.Image:
    """Mengambil QR Code dari cache disk lokal atau mengunduhnya secara online."""
    clean_bib = no_bib.strip().upper()
    cache_path = os.path.join(CACHE_QR_DIR, f"{clean_bib}.png")
    
    if os.path.exists(cache_path):
        try:
            return Image.open(cache_path).convert('RGB')
        except Exception:
            pass

    # Target URL yang sama persis dengan BibPreviewCard
    bio_url = f"https://jiwandana.com/trailrun/bio_peserta?no_bib={urllib.parse.quote(clean_bib)}"
    qr_api = f"https://api.qrserver.com/v1/create-qr-code/?size=350x350&data={urllib.parse.quote(bio_url)}"
    
    req = urllib.request.Request(qr_api, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req, timeout=10) as resp:
        raw_bytes = resp.read()
        im = Image.open(BytesIO(raw_bytes)).convert('RGB')
        im.save(cache_path, 'PNG')
        return im

def render_bib_card(participant: dict, template_cache: dict) -> tuple[str, str]:
    """Merender satu kartu BIB peserta dan menyimpannya ke disk."""
    no_bib = (participant.get('no_bib') or '').strip().upper()
    raw_name = participant.get('nama_bib') or participant.get('nama') or ''
    name = raw_name.strip().upper()
    cat_raw = (participant.get('kategori') or '12K').strip().lower()
    
    cat_key = '12k'
    if '7' in cat_raw:
        cat_key = '7k'
    elif '3' in cat_raw:
        cat_key = '3k'

    # 1. Background Template
    base_img = template_cache.get(cat_key)
    if not base_img:
        raise FileNotFoundError(f"Template gambar untuk {cat_key} tidak ditemukan!")
    bib_card = base_img.copy()

    # 2. Tempel QR Code BIO (Koordinat sesuai BibPreviewCard: x=88, y=714, 344x344 px)
    qr_img = get_or_fetch_qr(no_bib)
    qr_resized = qr_img.resize((344, 344), Image.Resampling.LANCZOS)
    bib_card.paste(qr_resized, (88, 714))

    draw = ImageDraw.Draw(bib_card)

    # 3. Render Nomor BIB (Tegak / Non-italic 900, size 340, cx=1470, cy=830)
    font_bib = ImageFont.truetype(FONT_ARIAL_BLACK, 340)
    bbox_b = draw.textbbox((0, 0), no_bib, font=font_bib)
    tw_b = bbox_b[2] - bbox_b[0]
    th_b = bbox_b[3] - bbox_b[1]

    # Fit width jika nomor BIB sangat panjang (area aman max ~1760px)
    max_bib_w = 1760
    if tw_b > max_bib_w:
        fitted_size = max(120, int(340 * (max_bib_w / tw_b) * 0.96))
        font_bib = ImageFont.truetype(FONT_ARIAL_BLACK, fitted_size)
        bbox_b = draw.textbbox((0, 0), no_bib, font=font_bib)
        tw_b = bbox_b[2] - bbox_b[0]
        th_b = bbox_b[3] - bbox_b[1]

    bib_x = int(1470 - tw_b / 2 - bbox_b[0])
    bib_y = int(830 - th_b / 2 - bbox_b[1])
    draw.text((bib_x, bib_y), no_bib, fill=(0, 0, 0), font=font_bib)

    # 4. Render Nama Pelari (Bold, default size 96, auto-shrink jika panjang, cx=1470, cy=1200)
    max_name_w = 1760
    base_name_size = 96
    font_name = ImageFont.truetype(FONT_ARIAL_BOLD, base_name_size)
    bbox_n = draw.textbbox((0, 0), name, font=font_name)
    tw_n = bbox_n[2] - bbox_n[0]
    th_n = bbox_n[3] - bbox_n[1]

    if tw_n > max_name_w:
        fitted_size = max(48, int(base_name_size * (max_name_w / tw_n) * 0.96))
        font_name = ImageFont.truetype(FONT_ARIAL_BOLD, fitted_size)
        bbox_n = draw.textbbox((0, 0), name, font=font_name)
        tw_n = bbox_n[2] - bbox_n[0]
        th_n = bbox_n[3] - bbox_n[1]

    name_x = int(1470 - tw_n / 2)
    name_y = int(1070 - th_n / 2)
    draw.text((name_x, name_y), name, fill=(0, 0, 0), font=font_name)

    # 5. Simpan Hasil ke Folder Kategori
    subfolder = cat_key.upper()
    cat_dir = os.path.join(OUTPUT_DIR, subfolder)
    os.makedirs(cat_dir, exist_ok=True)

    safe_name = sanitize_filename(name)
    filename = f"BIB-{cat_key.upper()}-{no_bib}-{safe_name}.png"
    out_path = os.path.join(cat_dir, filename)
    
    bib_card.save(out_path, 'PNG', optimize=True)
    return filename, out_path

# ==============================================================================
# 3. MAIN RUNNER
# ==============================================================================
def main():
    start_time = time.time()
    print("=" * 70)
    print("🏃 JIWANDANA TRAIL RUN - BULK BIB EXPORTER (300 DPI)")
    print("=" * 70)

    # Buat direktori output & cache
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    os.makedirs(CACHE_QR_DIR, exist_ok=True)

    # 1. Ambil data peserta
    print("📡 Mengambil daftar peserta dari Supabase...")
    try:
        participants = fetch_participants()
    except Exception as e:
        print(f"❌ Gagal mengambil data peserta: {e}")
        sys.exit(1)

    total = len(participants)
    print(f"✅ Ditemukan {total} peserta terdaftar yang memiliki nomor BIB.")
    if total == 0:
        print("⚠️ Tidak ada peserta untuk diproses.")
        return

    # 2. Preload template gambar ke memory RAM
    print("\n🖼️  Memuat template background...")
    template_cache = {}
    for key, path in TEMPLATE_MAP.items():
        if os.path.exists(path):
            template_cache[key] = Image.open(path).convert('RGB')
            print(f"  • Template {key.upper()} siap ({template_cache[key].size[0]}x{template_cache[key].size[1]} px)")
        else:
            print(f"  ⚠️ Peringatan: Template {key} tidak ditemukan di {path}")

    # 3. Pre-fetch QR Code secara paralel (20 threads concurrent)
    print("\n📲 Memeriksa & mengunduh QR Code (Paralel 20 worker)...")
    qr_done = 0
    with ThreadPoolExecutor(max_workers=20) as executor:
        futures = {executor.submit(get_or_fetch_qr, p['no_bib']): p for p in participants if p.get('no_bib')}
        for f in as_completed(futures):
            try:
                f.result()
                qr_done += 1
                percent = int(qr_done / total * 100)
                bar = '█' * (percent // 4) + '░' * (25 - percent // 4)
                sys.stdout.write(f"\r  [{bar}] {percent}% ({qr_done}/{total} QR siap)")
                sys.stdout.flush()
            except Exception as e:
                pass
    print("\n✅ Seluruh QR Code siap di memori/cache.")

    # 4. Render seluruh gambar BIB secara paralel
    print("\n🎨 Merender seluruh Kartu E-BIB ke resolusi cetak asli...")
    rendered_files = []
    done_count = 0

    with ThreadPoolExecutor(max_workers=8) as executor:
        futures = {executor.submit(render_bib_card, p, template_cache): p for p in participants if p.get('no_bib')}
        for f in as_completed(futures):
            try:
                filename, out_path = f.result()
                rendered_files.append((filename, out_path))
                done_count += 1
                percent = int(done_count / total * 100)
                bar = '█' * (percent // 4) + '░' * (25 - percent // 4)
                sys.stdout.write(f"\r  [{bar}] {percent}% ({done_count}/{total} BIB selesai)")
                sys.stdout.flush()
            except Exception as e:
                p_item = futures[f]
                print(f"\n  ❌ Gagal merender {p_item.get('no_bib')}: {e}")

    print(f"\n✅ Berhasil merender {len(rendered_files)} berkas gambar.")

    # 5. Kompresi ke dalam satu file ZIP
    zip_path = os.path.join(OUTPUT_DIR, "BIB_SEMUA_PESERTA.zip")
    print(f"\n📦 Mengemas seluruh berkas ke dalam ZIP ({zip_path})...")
    with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for fname, fpath in rendered_files:
            # Masukkan ke dalam arsip dengan struktur folder kategori
            arcname = os.path.relpath(fpath, OUTPUT_DIR)
            zipf.write(fpath, arcname)

    zip_size_mb = os.path.getsize(zip_path) / (1024 * 1024)
    elapsed = time.time() - start_time

    print("=" * 70)
    print(f"🎉 SELESAI DALAM {elapsed:.1f} DETIK!")
    print(f"📁 Folder Hasil : {OUTPUT_DIR}")
    print(f"📦 Berkas ZIP   : {zip_path} ({zip_size_mb:.1f} MB)")
    print(f"📊 Total BIB    : {len(rendered_files)} Peserta")
    print("=" * 70)

if __name__ == '__main__':
    main()
