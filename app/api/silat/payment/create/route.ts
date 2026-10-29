import { NextRequest, NextResponse } from 'next/server';
import { createPakasirTransaction } from '@/lib/pakasir';
import { getSilatCategoryPrice } from '@/components/silat/types';
import { supabaseServerClient as supabase } from '@/lib/supabaseClient';
import { getSilatSessionFromRequest } from '@/lib/silatAuth';

const isUUID = (str: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);

export async function POST(request: NextRequest) {
  try {
    const session = await getSilatSessionFromRequest(request);
    const body = await request.json();
    const {
      order_id,
      atlets,
      officials,
      kontingen_name,
      pic_name,
      pic_phone,
      payment_method,
      kontingen_id,
    } = body;

    if (!payment_method) {
      return NextResponse.json(
        { error: 'Metode pembayaran wajib dipilih.' },
        { status: 400 }
      );
    }

    if (!Array.isArray(atlets) || atlets.length === 0) {
      return NextResponse.json(
        { error: 'Tidak ada atlet yang didaftarkan. Harap tambahkan atlet terlebih dahulu.' },
        { status: 400 }
      );
    }

    // Hitung total harga resmi dari backend (mencegah manipulasi client)
    let totalNominal = 0;
    atlets.forEach((item: any) => {
      const price = getSilatCategoryPrice(item.kategoriLomba || '');
      totalNominal += price;
    });

    if (totalNominal <= 0) {
      return NextResponse.json(
        { error: 'Total biaya tidak valid.' },
        { status: 400 }
      );
    }

    // Biaya admin flat sistem / gateway Rp 5.000
    const adminFee = 5000;
    const finalAmount = totalNominal + adminFee;

    const orderId =
      order_id ||
      `DSC-SILAT-${Date.now().toString(36).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;

    // Panggil API Pakasir
    const pakasirRes = await createPakasirTransaction(orderId, {
      method: payment_method,
      amount: finalAmount,
    });

    // Simpan / Hubungkan ke Supabase
    try {
      let activeKontingenId = session?.kontingenId || kontingen_id || null;

      // 1. Dapatkan atau Buat Kontingen
      if (activeKontingenId) {
        await supabase
          .from('silat_kontingen')
          .update({
            pic_name: pic_name || undefined,
            pic_phone: pic_phone || undefined,
          })
          .eq('id', activeKontingenId);
      } else {
        const { data: kontingenRecord } = await supabase
          .from('silat_kontingen')
          .insert({
            nama_kontingen: kontingen_name || 'Kontingen Silat DSC',
            asal_sekolah: atlets[0]?.asalSekolah || '',
            pic_name: pic_name || '',
            pic_phone: pic_phone || '',
            status: 'pending',
          })
          .select('id')
          .maybeSingle();

        activeKontingenId = kontingenRecord?.id || null;
      }

      // 2. Hubungkan Atlet yang Sudah Ada di Cloud & Insert Atlet Baru
      const existingAtletIds = atlets
        .map((a: any) => a.id)
        .filter((id: string) => typeof id === 'string' && isUUID(id));

      if (existingAtletIds.length > 0 && activeKontingenId) {
        await supabase
          .from('silat_atlets')
          .update({ order_id: orderId })
          .in('id', existingAtletIds)
          .eq('kontingen_id', activeKontingenId);
      }

      const newAtlets = atlets.filter((a: any) => !isUUID(a.id || ''));
      if (newAtlets.length > 0) {
        const atletsPayload = newAtlets.map((item: any) => ({
          kontingen_id: activeKontingenId,
          order_id: orderId,
          nama: item.nama || '',
          asal_sekolah: item.asalSekolah || '',
          nik: item.nik || '',
          tanggal_lahir: item.tanggalLahir || new Date().toISOString().split('T')[0],
          umur: item.umur ? parseInt(String(item.umur), 10) : null,
          tinggi: item.tinggi ? parseInt(String(item.tinggi), 10) : null,
          berat: item.berat ? parseInt(String(item.berat), 10) : null,
          kota: item.kota || '',
          jenis_kelamin: item.jenisKelamin || 'Laki-Laki',
          tingkat_pendidikan: item.tingkatPendidikan || '',
          kategori_lomba: item.kategoriLomba || 'Tanding - Pemasalan',
          kategori_kelas_seni: item.kategoriKelasSeni || '',
          no_hp: item.noHp || '',
          email: item.email || '',
          foto_url: item.fotoUrl || null,
          kk_url: item.kkUrl || null,
          status: 'pending',
        }));

        await supabase.from('silat_atlets').insert(atletsPayload);
      }

      // 2b. Hubungkan Officials
      if (Array.isArray(officials) && officials.length > 0) {
        const existingOffIds = officials
          .map((o: any) => o.id)
          .filter((id: string) => typeof id === 'string' && isUUID(id));

        if (existingOffIds.length > 0 && activeKontingenId) {
          await supabase
            .from('silat_officials')
            .update({ order_id: orderId })
            .in('id', existingOffIds)
            .eq('kontingen_id', activeKontingenId);
        }

        const newOfficials = officials.filter((o: any) => !isUUID(o.id || ''));
        if (newOfficials.length > 0) {
          const officialsPayload = newOfficials.map((off: any) => ({
            kontingen_id: activeKontingenId,
            order_id: orderId,
            nama: off.nama || '',
            jabatan: off.jabatan || 'Official',
            nik: off.nik || '',
            tanggal_lahir: off.tanggalLahir || null,
            kota: off.kota || '',
            jenis_kelamin: off.jenisKelamin || 'Laki-Laki',
            no_hp: off.noHp || '',
            email: off.email || '',
            foto_url: off.fotoUrl || null,
            kk_url: off.kkUrl || null,
          }));
          await supabase.from('silat_officials').insert(officialsPayload);
        }
      }

      // 3. Simpan Record Transaksi Pembayaran
      await supabase.from('silat_payments').insert({
        order_id: orderId,
        txn_id: pakasirRes.txn_id,
        kontingen_id: activeKontingenId,
        kontingen_name: kontingen_name || session?.namaKontingen || 'Kontingen Silat DSC',
        pic_name: pic_name || '',
        pic_phone: pic_phone || '',
        total_atlet: atlets.length,
        subtotal: totalNominal,
        fee: adminFee,
        admin_fee: adminFee,
        total_payment: finalAmount,
        payment_method: payment_method,
        qr_string: pakasirRes.qr_string || null,
        va_number: pakasirRes.va_number || null,
        expired_at: pakasirRes.expired_at || null,
        status: 'pending',
        is_sandbox: pakasirRes.is_sandbox || false,
      });
    } catch (dbErr) {
      console.warn('Supabase insert warning for silat payment:', dbErr);
    }

    return NextResponse.json({
      success: true,
      data: {
        ...pakasirRes,
        order_id: orderId,
        kontingen_name: kontingen_name || session?.namaKontingen || 'Kontingen Silat DSC',
        pic_name: pic_name || '',
        pic_phone: pic_phone || '',
        total_atlet: atlets.length,
        subtotal: totalNominal,
        admin_fee: adminFee,
        total_payment: finalAmount,
      },
    });
  } catch (error: any) {
    console.error('Error creating silat Pakasir payment:', error);
    return NextResponse.json(
      { error: error.message || 'Terjadi kesalahan sistem saat membuat pembayaran.' },
      { status: 500 }
    );
  }
}
