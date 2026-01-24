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
  console.log(order.productDetails)
  const orderDetails = order.productDetails
    .map((item:any, index) => `
      ${index + 1}. *${item.productId.name}* - ₹${item.price}
      ${process.env.NEXT_PUBLIC_BASE_URL}/p/${item.productId._id}
    `)
    .join("\n");
console.log(orderDetails)
  const message = `
    *Order Details* 🛍️
    ${orderDetails}

    *Order ID:* ${order._id}
    *Customer Name:* ${order.name}
    *Payment Method:* ${order.payment_method}
    *My order page:* ${process.env.NEXT_PUBLIC_BASE_URL}/order/${order._id} 
    I need assistance with this order. Please help!
  `;
  console.log(message)
  return encodeURIComponent(message); // Encode the message for URL
};

export default async function OrderDetailsPage({ params }: any) {
  const resolvedParams = await params;
  const order: any = await getOrderById(resolvedParams.id);

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
          order.productDetails.map((item: any) => (
            <div key={item.productId._id} className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-start gap-3">
                  {item.productId.images?.asset?.url && (
                    <div className="relative w-12 h-12 rounded-md overflow-hidden border">
                      <img
                        src={item.productId?.images.asset.url}
                        alt={item.productId.name}
                        className="object-cover w-full h-full"
                      />
                    </div>
                  )}
                  <div>
                    <h3 className="font-medium">{item.productId.name}</h3>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {item.productId.brand && (
                        <Badge variant="outline" className="text-xs">
                          {item.productId.brand}
                        </Badge>
                      )}
                      {item.productId.category?.name && (
                        <Badge variant="outline" className="text-xs">
                          {item.productId.category?.name || 'deltagarage'}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="font-medium">
                  ₹{((item.productId.offerPrice || item.productId.price) * (1)).toLocaleString('en-IN')}
                </p>
                <p className="text-sm text-muted-foreground">
                  {item.productId.quantity} × ₹{(item.productId.offerPrice || item.productId.price).toLocaleString('en-IN')}
                </p>
              </div>
            </div>
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
            
            {/* Shipping and Tracking Section */}
            <div className="space-y-2">
              <h3 className="font-medium">Shipping Information</h3>
              <p>Shipping Address: {order.address}, {order.district}, {order.state} - {order.pincode}</p>
              
              {order.trackingId ? (
                <div className="mt-4">
                  <h4 className="font-medium">DTDC Tracking Information</h4>
                  <p>Tracking ID: {order.trackingId}</p>
                  <Button variant="outline" className="mt-2" asChild>
                    <Link 
                      href={`https://www.dtdc.in/tracking.asp?trackType=awb_no&txtCnNo=${order.trackingId}`} 
                      target="_blank"
                    >
                      Track Package on DTDC
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="mt-4">
                  <h4 className="font-medium">Tracking Information</h4>
                  <p className="text-muted-foreground">No tracking ID available yet.</p>
               
                </div>
              )}
            </div>
            
            <Separator />
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