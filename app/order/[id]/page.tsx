import CartItem from "@/components/cart/cart-item";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { getOrderById } from "@/lib/orderQueries";
import { site } from "@/lib/site-config";

import { IconBrandWhatsapp } from "@tabler/icons-react";
import Link from "next/link";

// Define the structure of the order details
interface Order {
  _id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  district: string;
  state: string;
  pincode: string;
  productDetails: {
    productId: {
      _id: string;
      productName: string;
      shoeBrand: string;
      images: { asset: { url: string } }[];
      price: number;
    };
    quantity: number;
    price: number;
    size?: number;
    key?: string;
  }[];
  trackingId?: string;
  status: string;
  payment_method: string;
  payment_status: string;
  payment_amount: number;
  shipping_charge: number;
  order_date: string;
  _createdAt: string;
  payment_id?: string;
  payment_date?: string;
  notes?: string;
}

// Generate a WhatsApp message for the order
const generateWhatsAppMessage = (order: Order) => {
  const orderDetails = order.productDetails
    .map((item, index) => `
      ${index + 1}. *${item.productId.productName}* - ₹${item.price}
      Brand: ${item.productId.shoeBrand}
      Quantity: ${item.quantity}
      Size: ${item.size || "N/A"}
    `)
    .join("\n");

  const message = `
    *Order Details* 🛍️
    ${orderDetails}

    *Order ID:* ${order._id}
    *Customer Name:* ${order.name}
    *Payment Method:* ${order.payment_method}
    *Status:* ${order.status}
    *My order page:* ${process.env.NEXT_PUBLIC_BASE_URL}/order/${order._id} 
    I need assistance with this order. Please help!
  `;

  return encodeURIComponent(message); // Encode the message for URL
};

export default async function OrderDetailsPage({ params }: any) {
  const resolvedParams = await params;
   const order = await getOrderById(resolvedParams.id);

  if (!order) {
    return (
      <div>
        <p className="text-muted-foreground mt-4 text-sm font-semibold">Order not Found.</p>
      </div>
    );
  }

  return (
    <main className="container mx-auto md:px-16 px-2">
      <h1 className="text-2xl font-bold">Order</h1>
      <div className="mt-4 space-y-4">
        {order.productDetails.length === 0 ? (
          <p className="text-muted-foreground mt-4 text-sm font-semibold">Your cart is empty.</p>
        ) : (
          order.productDetails.map((item) => (
            <CartItem
              key={item.productId._id}
              item={item.productId}
            />
          ))
        )}
      </div>
      {order.productDetails.length !== 0 && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Order Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p>Order ID: {order._id}</p>
            <p>Customer Name: {order.name}</p>
            <p>Payment Method: {order.payment_method}</p>
            <p>Status: <span className="text-bw">{order.status}</span></p>
            <Separator />
            <p>Shipping Address: {order.address}, {order.district}, {order.state} - {order.pincode}</p>
            <p>Order Date: {new Date(order.order_date).toLocaleString()}</p>
            <p>Payment Amount: ₹{order.payment_amount}</p>
            <p>Shipping Charge: ₹{order.shipping_charge}</p>
          </CardContent>
          <CardFooter>
            <div className="grid gap-2">
              <p className="italic">
                <Badge variant={"secondary"}>Contact</Badge>&nbsp;Reach out to us via WhatsApp by clicking the button below to know more about your order.
              </p>
              <Link
                href={`https://wa.me/${site.phone}?text=${generateWhatsAppMessage(order)}`}
                className="w-full"
                target="_blank"
              >
                <Button className="w-full"><IconBrandWhatsapp /> Chat Via Whatsapp</Button>
              </Link>
            </div>
          </CardFooter>
        </Card>
      )}
    </main>
  );
}