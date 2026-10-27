import { NextRequest, NextResponse } from 'next/server';
import { createPakasirTransaction } from '@/lib/pakasir';
import { getSilatCategoryPrice } from '@/components/silat/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { order_id, atlets, kontingen_name, pic_name, pic_phone, payment_method } = body;

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

    return NextResponse.json({
      success: true,
      data: {
        ...pakasirRes,
        order_id: orderId,
        kontingen_name: kontingen_name || 'Kontingen Silat DSC',
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
