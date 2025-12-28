import { client } from '@/sanityClient';
import { NextResponse } from 'next/server';


export async function POST(request: Request) {
  try {
    const { promoId } = await request.json();

    if (!promoId) {
      return NextResponse.json(
        { success: false, message: 'Promo ID is required' },
        { status: 400 }
      );
    }

    // Increment the usedCount
    await client
      .patch(promoId)
      .inc({ usedCount: 1 })
      .commit();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Update promo usage error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    );
  }
}