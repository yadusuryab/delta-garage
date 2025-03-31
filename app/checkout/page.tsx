"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

import SHeading from "@/components/utils/section-heading";
import { calculateSubtotal, calculateTotalAmount, CartItem, validateForm } from "@/lib/orderUtils";
import { CustomerDetailsForm } from "@/components/checkout/checkout-form";
import { OrderSummary } from "@/components/checkout/order-summary";
import { PaymentMethod } from "@/components/checkout/payment-method";
import { site } from "@/lib/site-config";
import Transaction from "@/components/checkout/transaction-details";
import { createOrder, updateOrderPayment } from "@/lib/orderQueries";
import { Button } from "@/components/ui/button";

export default function CheckoutPage() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<"online" | "cod">("online");
  const [shippingCharge, setShippingCharge] = useState(80); // Default to online shipping charge
  const [customerDetails, setCustomerDetails] = useState({
    name: "",
    email: "",
    contact1: "",
    address: "",
    district: "",
    state: "",
    pincode: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    setCartItems(cart);
  }, []);

  const subtotal = calculateSubtotal(cartItems);
  const totalAmount = calculateTotalAmount(subtotal, shippingCharge);

  const handlePaymentChange = (method: "online" | "cod") => {
    setPaymentMethod(method);
    // Update shipping charge based on payment method
    setShippingCharge(method === 'online' ? 80 : 100);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCustomerDetails(prev => ({ ...prev, [name]: value }));
  };

  const onCheckout = async (transactionId?: string) => {
    if (!validateForm(customerDetails, cartItems)) return;
    if (paymentMethod === 'online' && !transactionId) {
      alert('Please enter your transaction ID');
      return;
    }
  
    setIsLoading(true);
  
    try {
      // Enhanced order details with product information
      const orderDetails : any = {
        customer: {
          name: customerDetails.name,
          email: customerDetails.email,
          phone: customerDetails.contact1,
          address: {
            street: customerDetails.address,
            district: customerDetails.district,
            state: customerDetails.state,
            pincode: customerDetails.pincode
          }
        },
        products: cartItems.map((item:any) => ({
          productId: item._id,
          name: item.name,
          brand: item.brand,
          quantity: item.quantity || 1, // Ensure quantity is included
          price: item.offerPrice || item.price,
          image: item.images?.[0]?.asset?.url
        })),
        payment: {
          method: paymentMethod,
          status: paymentMethod === 'cod' ? 'pending' : 'completed',
          amount: totalAmount,
          transactionId: transactionId || null
        },
        shipping: {
          charge: shippingCharge,
          status: 'pending',
          method: paymentMethod === 'cod' ? 'COD' : 'Prepaid'
        },
        orderDate: new Date().toISOString(),
        status: 'processing'
      };
  
      const order = await createOrder(orderDetails);
      
      if (order && paymentMethod === 'online') {
        await updateOrderPayment(order._id, transactionId!);
      }

      // Clear cart on successful order
      if (order) {
        localStorage.removeItem("cart");
        window.dispatchEvent(new Event("cartUpdated"));
        router.push(`${process.env.NEXT_PUBLIC_BASE_URL}/order/${order._id}`);
      } else {
        alert('Order not placed. Please try again later.');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert('There was an error processing your order. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <main className="container mx-auto md:px-16 px-2 md:max-w-[700px]">
        <SHeading 
          title="Checkout" 
          description="Your cart is empty. Please add items to proceed." 
          nolink 
        />
        <Button 
          onClick={() => router.push('/products')}
          className="mt-4"
        >
          Browse Products
        </Button>
      </main>
    );
  }

  return (
    <main className="container mx-auto md:px-16 px-2 pb-2">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Customer Details</CardTitle>
            </CardHeader>
            <CardContent>
              <CustomerDetailsForm 
                customerDetails={customerDetails} 
                handleInputChange={handleInputChange} 
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Payment Method</CardTitle>
            </CardHeader>
            <CardContent>
              <PaymentMethod 
                paymentMethod={paymentMethod} 
                handlePaymentChange={handlePaymentChange} 
                shippingCharge={shippingCharge}
              />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <OrderSummary 
                cartItems={cartItems} 
                shippingCharge={shippingCharge} 
                subtotal={subtotal} 
                totalAmount={totalAmount} 
                paymentMethod={paymentMethod}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Complete Payment</CardTitle>
            </CardHeader>
            <CardContent>
              <Transaction 
                totalAmount={totalAmount} 
                paymentMethod={paymentMethod}  
                handleCheckout={onCheckout} 
                isLoading={isLoading} 
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}