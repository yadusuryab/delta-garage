import { client } from '@/sanityClient';
import { NextResponse } from 'next/server';


export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');

  if (!code) {
    return NextResponse.json(
      { success: false, message: 'Promo code is required' },
      { status: 400 }
    );
  }

  try {
    const query = `*[_type == "promoCode" && code == $code][0] {
      _id,
      code,
      discountType,
      discountValue,
      minimumPurchase,
      maxDiscount,
      validFrom,
      validUntil,
      usageLimit,
      usedCount,
      userLimit,
      applicableCategories[]->{_id, name},
      excludedCategories[]->{_id, name},
      applicableProducts[]->{_id, name},
      excludedProducts[]->{_id, name},
      isActive,
      oneTimeUse,
      newCustomersOnly,
      applyOnSaleItems
    }`;

    const promoCode = await client.fetch(query, { code });

    if (!promoCode) {
      return NextResponse.json(
        { success: false, message: 'Invalid promo code' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, promoCode });
  } catch (error) {
    console.error('Promo validation error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    );
  }
}