import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { updateOrderPaymentStatus } from '@/lib/orderQueries'; // Import your orderQueries

// Disable static evaluation for this route
export const dynamic = 'force-dynamic';

// Verify the signature
function verifySignature(ts: string, rawBody: string, secretKey: string): string {
  const body = ts + rawBody;
  return crypto.createHmac('sha256', secretKey).update(body).digest('base64');
}

// Handle POST requests to /api/cashfree-webhook
export async function POST(request: Request) {
  try {
    // Read the raw body
    const rawBody = await request.text();

    // Extract headers
    const ts = request.headers.get('x-webhook-timestamp');
    const signature = request.headers.get('x-webhook-signature');

    if (!ts || !signature) {
      return NextResponse.json({ error: 'Missing required headers' }, { status: 400 });
    }

    // Verify the signature
    const secretKey = process.env.CASHFREE_WEBHOOK_SECRET_KEY;
    if (!secretKey) {
      return NextResponse.json({ error: 'Webhook secret key not configured' }, { status: 500 });
    }

    const genSignature = verifySignature(ts, rawBody, secretKey);
    if (signature !== genSignature) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    // Parse the JSON body
    const body = JSON.parse(rawBody);

    // Extract payment details
    const { orderId, paymentStatus, paymentId } = body;

    if (!orderId || !paymentStatus || !paymentId) {
      return NextResponse.json({ error: 'Missing required fields in payload' }, { status: 400 });
    }

    // Update the payment status in Sanity
    await updateOrderPaymentStatus(orderId, {
      paymentStatus,
      paymentId,
      paymentDate: new Date().toISOString(), // Add payment date
    });

    console.log(`Payment status updated for order ${orderId}: ${paymentStatus}`);
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error in webhook handler:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}