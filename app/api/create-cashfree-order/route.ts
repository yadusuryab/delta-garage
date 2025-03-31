import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { amount, customer_details } = await req.json();

    if (!customer_details.customer_id) {
      // Generate a unique customer ID (you can use the phone number or email)
      customer_details.customer_id = `cust_${customer_details.contact1 || customer_details.email}`;
      customer_details.customer_phone = customer_details.contact1;
    }

    const response = await fetch("https://sandbox.cashfree.com/pg/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-client-id": process.env.CASHFREE_CLIENT_ID!,
        "x-client-secret": process.env.CASHFREE_CLIENT_SECRET!,
        "x-api-version": "2022-09-01",
      },
      body: JSON.stringify({
        order_amount: amount,
        order_currency: "INR",
        customer_details,
      }),
    });

    const data = await response.json();
    

    if (!data || !data.payment_session_id) {
      return NextResponse.json({ message: "Failed to create order" }, { status: 500 });
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Error creating Cashfree order:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
