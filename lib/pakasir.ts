/**
 * Pakasir Payment Gateway - Server-side utility
 * API v2 Documentation: https://app.pakasir.com/docs
 */

const PAKASIR_API_KEY = process.env.PAKASIR_API_KEY || '';
const PAKASIR_PROJECT_SLUG = process.env.PAKASIR_PROJECT_SLUG || '';
const PAKASIR_BASE_URL = 'https://app.pakasir.com/api/v2';

export interface PakasirCreateTransactionRequest {
  method: 'qris' | 'payment_link' | 'bri_va' | 'bni_va' | 'mandiri_va' | 'cimb_niaga_va' | 'permata_va';
  amount: number;
}

export interface PakasirTransactionResponse {
  txn_id: string;
  project: string;
  order_id: string;
  amount: number;
  fee: number;
  total_payment: number;
  payment_method: string;
  qr_string?: string;
  va_number?: string;
  payment_link?: string;
  expired_at: string;
  is_sandbox: boolean;
}

export interface PakasirTransactionStatus {
  txn_id: string;
  order_id: string;
  amount: number;
  status: 'pending' | 'completed' | 'canceled';
  is_sandbox: boolean;
  completed_at?: string;
}

export interface PakasirWebhookPayload {
  txn_id: string;
  order_id: string;
  amount: number;
  is_sandbox: boolean;
  status: 'completed';
  completed_at: string;
}

/**
 * Create a new payment transaction via Pakasir API v2
 */
export async function createPakasirTransaction(
  orderId: string,
  payload: PakasirCreateTransactionRequest
): Promise<PakasirTransactionResponse> {
  const url = `${PAKASIR_BASE_URL}/create-transaction/${PAKASIR_PROJECT_SLUG}/${orderId}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Api-Key': PAKASIR_API_KEY,
    },
    body: JSON.stringify({
      method: payload.method,
      amount: payload.amount,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Pakasir API error (${response.status}): ${errorText}`);
  }

  return response.json();
}

/**
 * Check transaction status via Pakasir API v2
 */
export async function getPakasirTransactionStatus(
  txnId: string
): Promise<PakasirTransactionStatus> {
  const url = `${PAKASIR_BASE_URL}/transaction-status/${PAKASIR_PROJECT_SLUG}/${txnId}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'X-Api-Key': PAKASIR_API_KEY,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Pakasir status check error (${response.status}): ${errorText}`);
  }

  return response.json();
}

/**
 * Verify webhook secret from Pakasir
 */
export function verifyPakasirWebhook(secretHeader: string | null): boolean {
  const webhookSecret = (process.env.PAKASIR_WEBHOOK_SECRET || '').trim();
  if (!webhookSecret) return true; // Bypass check if not configured in env
  if (!secretHeader) return false;
  return secretHeader.trim() === webhookSecret;
}

/**
 * Convert price string like "250k" to number (250000)
 */
export function parsePriceToNumber(priceStr: string): number {
  const cleaned = priceStr.toLowerCase().replace(/[^0-9k]/g, '');
  if (cleaned.endsWith('k')) {
    return parseInt(cleaned.replace('k', ''), 10) * 1000;
  }
  return parseInt(cleaned, 10) || 0;
}
