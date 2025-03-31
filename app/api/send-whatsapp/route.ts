import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    // Parse the request body
    const {
      to,
      orderId,
      name,
      email,
      phone,
      address,
      products,
      payment_method,
      payment_status,
      payment_amount,
      shipping_charge,
      total_amount,
      order_date,
      notes,
    } = await request.json();

    console.log("Incoming request payload:", {
      to,
      orderId,
      name,
      email,
      phone,
      address,
      products,
      payment_method,
      payment_status,
      payment_amount,
      shipping_charge,
      total_amount,
      order_date,
      notes,
    });

    // Validate required fields
    if (!to || !orderId || !name || !phone || !address || !products || !payment_method || !payment_amount) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Ensure environment variables are set
    if (!process.env.WHATSAPP_PHONE_ID || !process.env.WHATSAPP_TOKEN) {
      console.error("WhatsApp environment variables are not set");
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    // Send WhatsApp template message to the customer
    const customerMessageResponse = await fetch(
      `https://graph.facebook.com/v21.0/${process.env.WHATSAPP_PHONE_ID}/messages`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          recipient_type: "individual",
          to,
          type: "template",
          template: {
            name: "footex_order",
            language: {
              code: "en_US",
            },
            components: [
              {
                type: "body",
                parameters: [
                  {
                    type: "text",
                    text: `from ${phone}`,
                  },
                  {
                    type: "text",
                    text: "soon", // Replace with the estimated delivery time if available
                  },
                ],
              },
              {
                type: "button",
                sub_type: "url",
                index: 0,
                parameters: [
                  {
                    type: "text",
                    text: `/order/${orderId}`,
                  },
                ],
              },
            ],
          },
        }),
      }
    );

    const customerMessageData = await customerMessageResponse.json();
    console.log("WhatsApp Template API Response:", customerMessageData);

    // Handle API errors for customer message
    if (!customerMessageResponse.ok) {
      console.error("WhatsApp Template API Error:", customerMessageData.error);
      return NextResponse.json(
        { error: customerMessageData.error?.message || "Failed to send WhatsApp template message" },
        { status: customerMessageResponse.status }
      );
    }

    // Create the detailed WhatsApp message for the store owner
    const storeOwnerMessageContent = `
New Order Received!

📦 *Order Summary:*
- Order ID: ${orderId}
- Customer Name: ${name}
- Customer Phone: ${phone}
- Customer Email: ${email}
- Shipping Address: ${address}
- Products: ${products}
- Payment Method: ${payment_method}
- Payment Status: ${payment_status}
- Payment Amount: ₹${payment_amount}
- Shipping Charge: ₹${shipping_charge}
- Total Amount: ₹${total_amount}
- Order Date: ${order_date}
- Notes: ${notes || "No additional notes"}

View order : ${process.env.NEXT_PUBLIC_BASE_URL}/order/${orderId}
    `;

    console.log("Sending WhatsApp message to store owner:", storeOwnerMessageContent);

    // Send the WhatsApp text message to the store owner
    const storeOwnerMessageResponse = await fetch(
      `https://graph.facebook.com/v21.0/${process.env.WHATSAPP_PHONE_ID}/messages`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          recipient_type: "individual",
          to: '+919495314108', // Ensure this environment variable is set
          type: "text",
          text: {
            body: storeOwnerMessageContent,
          },
        }),
      }
    );

    const storeOwnerMessageData = await storeOwnerMessageResponse.json();
    console.log("WhatsApp Text API Response for Store Owner:", storeOwnerMessageData);

    // Handle API errors for store owner message
    if (!storeOwnerMessageResponse.ok) {
      console.error("WhatsApp Text API Error for Store Owner:", storeOwnerMessageData.error);
      return NextResponse.json(
        { error: storeOwnerMessageData.error?.message || "Failed to send WhatsApp message to store owner" },
        { status: storeOwnerMessageResponse.status }
      );
    }

    // Return success response
    return NextResponse.json(
      { success: true, message: "WhatsApp messages sent successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in /api/send-whatsapp:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}