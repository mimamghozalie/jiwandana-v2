import { ActiveTierResult } from '@/lib/pricing';
export type { BulkParticipant } from '@/lib/excel-template';

export interface PicData {
  group_name: string;
  pic_name: string;
  pic_email: string;
  pic_phone: string;
}

export interface BulkPaymentData {
  order_id: string;
  txn_id?: string;
  participant_count: number;
  raw_subtotal?: number;
  discount_amount?: number;
  promo_note?: string | null;
  subtotal: number;
  admin_fee_per_person: number;
  admin_fee: number;
  gateway_fee: number;
  admin_profit: number;
  fee: number;
  total_payment: number;
  payment_method: string;
  qr_string?: string | null;
  va_number?: string | null;
  payment_link?: string | null;
  expired_at: string;
  is_sandbox?: boolean;
  pic?: {
    name: string;
    email: string;
    phone: string;
    group_name?: string;
  };
  registration_ids?: string[];
  participants?: Array<{
    nama: string;
    kategori: string;
    no_bib?: string;
    priceAmount: number;
  }>;
}

export interface RouteCalculations {
  count7k: number;
  count12k: number;
  subtotal7k: number;
  subtotal12k: number;
  unitPrice7k: number;
  unitPrice12k: number;
  tierName7k: string;
  tierName12k: string;
  rawSubtotalTickets: number;
  isPromoActive: boolean;
  discountMultiplier: number;
  discountAmount: number;
  subtotalTickets: number;
  adminFee: number;
  estimatedGatewayFee: number;
  totalServiceFee: number;
  grandTotal: number;
  participantPriceMap: Record<number, { amount: number; tierName: string; categoryName: string }>;
}
