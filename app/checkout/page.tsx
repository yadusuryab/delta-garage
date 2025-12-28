"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import SHeading from "@/components/utils/section-heading";
import {
  calculateSubtotal,
  calculateTotalAmount,
  CartItem,
  validateForm,
} from "@/lib/orderUtils";
import { CustomerDetailsForm } from "@/components/checkout/checkout-form";
import { OrderSummary } from "@/components/checkout/order-summary";
import { PaymentMethod } from "@/components/checkout/payment-method";
import Transaction from "@/components/checkout/transaction-details";
import { createOrder, updateOrderPayment } from "@/lib/orderQueries";
import { Button } from "@/components/ui/button";
import { validatePromoCode, calculateTotals } from "@/lib/promoUtils";
import { PromoCodeInput } from "@/components/checkout/promo-code-input";

export default function CheckoutPage() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<"online" | "cod">("online");
  const [shippingCharge, setShippingCharge] = useState(0);
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
  
  // New state for promo code
  const [promoCode, setPromoCode] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<any>(null);
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [isValidatingPromo, setIsValidatingPromo] = useState(false);
  const [promoError, setPromoError] = useState("");

  useEffect(() => {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    setCartItems(cart);
    
    if (cart.length > 0) {
      const initialCharge = calculateShippingCharge("online", cart);
      setShippingCharge(initialCharge);
    }
    
    // Load saved promo code from localStorage
    const savedPromo = localStorage.getItem("appliedPromoCode");
    if (savedPromo) {
      const { code, discountAmount, promoData } = JSON.parse(savedPromo);
      setPromoCode(code);
      setPromoDiscount(discountAmount);
      setAppliedPromo(promoData);
    }
  }, []);

  const calculateShippingCharge = (method: "online" | "cod", items: CartItem[] = cartItems) => {
    if (items.length === 0) return method === "online" ? 80 : 100;
    
    let calculatedCharge = 0;
    
    if (method === "online") {
      calculatedCharge = Math.max(...items.map(item => item.prepaidCharge || 80));
    } else {
      calculatedCharge = Math.max(...items.map(item => item.codCharge || 100));
    }
    
    return calculatedCharge;
  };

  const handleApplyPromoCode = async () => {
    if (!promoCode.trim()) {
      setPromoError("Please enter a promo code");
      return;
    }

    setIsValidatingPromo(true);
    setPromoError("");

    const subtotal = calculateSubtotal(cartItems);
    const validation = await validatePromoCode(promoCode, cartItems, subtotal, true);

    if (validation.isValid && validation.discountAmount !== undefined) {
      setAppliedPromo(validation.promoCode);
      setPromoDiscount(validation.discountAmount);
      
      // Save to localStorage
      localStorage.setItem("appliedPromoCode", JSON.stringify({
        code: promoCode,
        discountAmount: validation.discountAmount,
        promoData: validation.promoCode
      }));
      
      // If free shipping promo, update shipping charge
      if (validation.promoCode?.discountType === 'freeShipping') {
        setShippingCharge(0);
      }
    } else {
      setPromoError(validation.message || "Invalid promo code");
      removePromoCode();
    }
    
    setIsValidatingPromo(false);
  };

  const removePromoCode = () => {
    setPromoCode("");
    setAppliedPromo(null);
    setPromoDiscount(0);
    setPromoError("");
    localStorage.removeItem("appliedPromoCode");
    
    // Reset shipping charge if it was free shipping
    const method = paymentMethod;
    const newShippingCharge = calculateShippingCharge(method, cartItems);
    setShippingCharge(newShippingCharge);
  };

  const handlePaymentChange = (method: "online" | "cod") => {
    setPaymentMethod(method);
    // Don't apply shipping charge if free shipping promo is active
    if (appliedPromo?.discountType !== 'freeShipping') {
      const newShippingCharge = calculateShippingCharge(method);
      setShippingCharge(newShippingCharge);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setCustomerDetails((prev) => ({ ...prev, [name]: value }));
  };

  const subtotal = calculateSubtotal(cartItems);
  const totals = calculateTotals(cartItems, promoDiscount, shippingCharge, 
    appliedPromo?.discountType === 'freeShipping');
  const totalAmount = totals.totalAmount;

  const onCheckout = async (transactionId?: string) => {
    if (!validateForm(customerDetails, cartItems)) return;
    if (paymentMethod === "online" && !transactionId) {
      alert("Please enter your transaction ID");
      return;
    }

    setIsLoading(true);

    try {
      // Enhanced order details with promo information
      const orderDetails: any = {
        customer: {
          name: customerDetails.name,
          email: customerDetails.email,
          phone: customerDetails.contact1,
          address: {
            street: customerDetails.address,
            district: customerDetails.district,
            state: customerDetails.state,
            pincode: customerDetails.pincode,
          },
        },
        products: cartItems.map((item: any) => ({
          productId: item._id,
          name: item.name,
          brand: item.brand,
          quantity: item.orderQuantity,
          price: item.offerPrice || item.price,
          image: item.images?.[0]?.asset?.url,
          codCharge: item.codCharge || 100,
          prepaidCharge: item.prepaidCharge || 80,
        })),
        payment: {
          method: paymentMethod,
          status: paymentMethod === "cod" ? "pending" : "completed",
          amount: totalAmount,
          transactionId: transactionId || null,
        },
        shipping: {
          charge: appliedPromo?.discountType === 'freeShipping' ? 0 : shippingCharge,
          status: "pending",
          method: paymentMethod === "cod" ? "COD" : "Prepaid",
        },
        // Add promo code details
        promoCode: appliedPromo ? {
          code: appliedPromo.code,
          discountAmount: promoDiscount,
          promoId: appliedPromo._id,
          discountType: appliedPromo.discountType,
        } : null,
        orderDate: new Date().toISOString(),
        status: "processing",
      };

      const order = await createOrder(orderDetails);

      if (order && paymentMethod === "online") {
        await updateOrderPayment(order._id, transactionId!);
        
        // Update promo code usage count
        if (appliedPromo) {
          await fetch('/api/update-promo-usage', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ promoId: appliedPromo._id }),
          });
        }
      }

      if (order) {
        // Clear cart and promo
        localStorage.removeItem("cart");
        localStorage.removeItem("appliedPromoCode");
        window.dispatchEvent(new Event("cartUpdated"));
        router.push(`${process.env.NEXT_PUBLIC_BASE_URL}/order/${order._id}`);
      } else {
        alert("Order not placed. Please try again later.");
      }
    } catch (error) {
      console.error("Checkout error:", error);
      alert("There was an error processing your order. Please try again.");
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
        <Button onClick={() => router.push("/products")} className="mt-4">
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

          {/* Add Promo Code Section */}
          <Card>
            <CardHeader>
              <CardTitle>Promo Code</CardTitle>
            </CardHeader>
            <CardContent>
              <PromoCodeInput
                promoCode={promoCode}
                setPromoCode={setPromoCode}
                appliedPromo={appliedPromo}
                promoDiscount={promoDiscount}
                isValidating={isValidatingPromo}
                promoError={promoError}
                onApply={handleApplyPromoCode}
                onRemove={removePromoCode}
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
                isFreeShipping={appliedPromo?.discountType === 'freeShipping'}
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
                shippingCharge={appliedPromo?.discountType === 'freeShipping' ? 0 : shippingCharge}
                subtotal={subtotal}
                totalAmount={totalAmount}
                paymentMethod={paymentMethod}
                promoDiscount={promoDiscount}
                appliedPromo={appliedPromo}
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