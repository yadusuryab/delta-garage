"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import SHeading from "@/components/utils/section-heading";
import {
  calculateSubtotal,
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
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Check } from "lucide-react";

type CheckoutStep = "details" | "promo" | "payment" | "review" | "complete";

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
  const [currentStep, setCurrentStep] = useState<CheckoutStep>("details");

  // Promo code state
  const [promoCode, setPromoCode] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<any>(null);
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [isValidatingPromo, setIsValidatingPromo] = useState(false);
  const [promoError, setPromoError] = useState("");

  // Steps data
  const steps: { id: CheckoutStep; title: string; description: string }[] = [
    { id: "details", title: "Customer Details", description: "Enter your information" },
    { id: "promo", title: "Promo Code", description: "Apply discount code" },
    { id: "payment", title: "Payment Method", description: "Choose payment option" },
    { id: "review", title: "Review Order", description: "Verify your order" },
    { id: "complete", title: "Complete", description: "Place order" },
  ];

  const currentStepIndex = steps.findIndex(step => step.id === currentStep);
  const progress = ((currentStepIndex + 1) / steps.length) * 100;

  useEffect(() => {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    setCartItems(cart);

    if (cart.length > 0) {
      const initialCharge = calculateShippingCharge("online", cart);
      setShippingCharge(initialCharge);
    }

    const savedPromo = localStorage.getItem("appliedPromoCode");
    if (savedPromo) {
      const { code, discountAmount, promoData } = JSON.parse(savedPromo);
      setPromoCode(code);
      setPromoDiscount(discountAmount);
      setAppliedPromo(promoData);
    }
  }, []);

  const calculateShippingCharge = (
    method: "online" | "cod",
    items: CartItem[] = cartItems
  ) => {
    if (items.length === 0) return method === "online" ? 80 : 100;

    let calculatedCharge = 0;

    if (method === "online") {
      calculatedCharge = Math.max(
        ...items.map((item) => item.prepaidCharge || 80)
      );
    } else {
      calculatedCharge = Math.max(
        ...items.map((item) => item.codCharge || 100)
      );
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
    const validation = await validatePromoCode(
      promoCode,
      cartItems,
      subtotal,
      true
    );

    if (validation.isValid && validation.discountAmount !== undefined) {
      setAppliedPromo(validation.promoCode);
      setPromoDiscount(validation.discountAmount);

      localStorage.setItem(
        "appliedPromoCode",
        JSON.stringify({
          code: promoCode,
          discountAmount: validation.discountAmount,
          promoData: validation.promoCode,
        })
      );

      if (validation.promoCode?.discountType === "freeShipping") {
        setShippingCharge(0);
      }
      
      // Auto proceed to next step
      setTimeout(() => goToNextStep(), 500);
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

    const method = paymentMethod;
    const newShippingCharge = calculateShippingCharge(method, cartItems);
    setShippingCharge(newShippingCharge);
  };

  const handlePaymentChange = (method: "online" | "cod") => {
    setPaymentMethod(method);
    if (appliedPromo?.discountType !== "freeShipping") {
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
  const totals = calculateTotals(
    cartItems,
    promoDiscount,
    shippingCharge,
    appliedPromo?.discountType === "freeShipping"
  );
  const totalAmount = totals.totalAmount;

  const goToNextStep = () => {
    const stepIds = steps.map(step => step.id);
    const currentIndex = stepIds.indexOf(currentStep);
    if (currentIndex < stepIds.length - 1) {
      setCurrentStep(stepIds[currentIndex + 1] as CheckoutStep);
    }
  };

  const goToPreviousStep = () => {
    const stepIds = steps.map(step => step.id);
    const currentIndex = stepIds.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(stepIds[currentIndex - 1] as CheckoutStep);
    }
  };

  const validateCurrentStep = () => {
    switch (currentStep) {
      case "details":
        const requiredFields = ["name", "email", "contact1", "address", "district", "state", "pincode"];
        const isValid = requiredFields.every(field => 
          customerDetails[field as keyof typeof customerDetails]?.trim()
        );
        if (!isValid) {
          alert("Please fill in all customer details");
          return false;
        }
        return true;
      
      case "payment":
        return true; // Always valid, user can choose payment method
      
      default:
        return true;
    }
  };

  const handleNextStep = () => {
    if (validateCurrentStep()) {
      goToNextStep();
    }
  };

  const onCheckout = async (transactionId?: string) => {
    if (!validateForm(customerDetails, cartItems)) return;
    if (paymentMethod === "online" && !transactionId) {
      alert("Please enter your transaction ID");
      return;
    }

    setIsLoading(true);

    try {
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
          charge:
            appliedPromo?.discountType === "freeShipping" ? 0 : shippingCharge,
          status: "pending",
          method: paymentMethod === "cod" ? "COD" : "Prepaid",
        },
        promoCode: appliedPromo
          ? {
              code: appliedPromo.code,
              discountAmount: promoDiscount,
              promoId: appliedPromo._id,
              discountType: appliedPromo.discountType,
            }
          : null,
        orderDate: new Date().toISOString(),
        status: "processing",
      };

      const order = await createOrder(orderDetails);

      if (order && paymentMethod === "online") {
        await updateOrderPayment(order._id, transactionId!);

        if (appliedPromo) {
          await fetch("/api/update-promo-usage", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ promoId: appliedPromo._id }),
          });
        }
      }

      if (order) {
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

  const renderStepContent = () => {
    switch (currentStep) {
      case "details":
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Badge variant="secondary">Step 1</Badge>
                Customer Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CustomerDetailsForm
                customerDetails={customerDetails}
                handleInputChange={handleInputChange}
              />
              <div className="flex justify-end mt-6">
                <Button onClick={handleNextStep} className="gap-2">
                  Continue to Promo Code
                  <ChevronRight size={16} />
                </Button>
              </div>
            </CardContent>
          </Card>
        );

      case "promo":
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Badge variant="secondary">Step 2</Badge>
                Apply Promo Code
              </CardTitle>
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
              <div className="flex justify-between mt-6">
                <Button variant="outline" onClick={goToPreviousStep} className="gap-2">
                  <ChevronLeft size={16} />
                  Back to Details
                </Button>
                <Button onClick={handleNextStep} className="gap-2">
                  Continue to Payment
                  <ChevronRight size={16} />
                </Button>
              </div>
            </CardContent>
          </Card>
        );

      case "payment":
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Badge variant="secondary">Step 3</Badge>
                Payment Method
              </CardTitle>
            </CardHeader>
            <CardContent>
              <PaymentMethod
                paymentMethod={paymentMethod}
                handlePaymentChange={handlePaymentChange}
                shippingCharge={shippingCharge}
                isFreeShipping={appliedPromo?.discountType === "freeShipping"}
              />
              <div className="flex justify-between mt-6">
                <Button variant="outline" onClick={goToPreviousStep} className="gap-2">
                  <ChevronLeft size={16} />
                  Back to Promo
                </Button>
                <Button onClick={handleNextStep} className="gap-2">
                  Review Order
                  <ChevronRight size={16} />
                </Button>
              </div>
            </CardContent>
          </Card>
        );

      case "review":
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Badge variant="secondary">Step 4</Badge>
                Review Your Order
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border rounded-lg">
                  <h3 className="font-semibold mb-2">Customer Details</h3>
                  <p><strong>Name:</strong> {customerDetails.name}</p>
                  <p><strong>Email:</strong> {customerDetails.email}</p>
                  <p><strong>Phone:</strong> {customerDetails.contact1}</p>
                  <p><strong>Address:</strong> {customerDetails.address}, {customerDetails.district}, {customerDetails.state} - {customerDetails.pincode}</p>
                </div>

                <div className="p-4 border rounded-lg">
                  <h3 className="font-semibold mb-2">Order Summary</h3>
                  <div className="max-h-64 overflow-y-auto">
                    {cartItems.map((item, index) => (
                      <div key={index} className="flex justify-between py-2 border-b last:border-0">
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-gray-600">Qty: {item.orderQuantity} × ₹{item.offerPrice || item.price}</p>
                        </div>
                        <p className="font-semibold">₹{(item.orderQuantity * (item.offerPrice || item.price)).toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>₹{subtotal.toFixed(2)}</span>
                    </div>
                    {promoDiscount > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Promo Discount:</span>
                        <span>-₹{promoDiscount.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>Shipping:</span>
                      <span>
                        {appliedPromo?.discountType === "freeShipping" ? (
                          <span className="text-green-600">Free</span>
                        ) : (
                          `₹${shippingCharge.toFixed(2)}`
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between text-lg font-bold border-t pt-2">
                      <span>Total:</span>
                      <span>₹{totalAmount.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 border rounded-lg">
                  <h3 className="font-semibold mb-2">Payment Method</h3>
                  <p className="capitalize">{paymentMethod === "cod" ? "Cash on Delivery" : "Online Payment"}</p>
                  {paymentMethod === "online" && (
                    <p className="text-sm text-gray-600 mt-1">
                      You will be redirected to payment gateway after review
                    </p>
                  )}
                </div>
              </div>

              <div className="flex justify-between mt-6">
                <Button variant="outline" onClick={goToPreviousStep} className="gap-2">
                  <ChevronLeft size={16} />
                  Back to Payment
                </Button>
                <Button onClick={handleNextStep} className="gap-2 bg-green-600 hover:bg-green-700">
                  Proceed to Payment
                  <ChevronRight size={16} />
                </Button>
              </div>
            </CardContent>
          </Card>
        );

      case "complete":
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Badge variant="secondary" className="bg-green-600">Step 5</Badge>
                Complete Payment
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-3 text-green-700">
                  <Check className="w-6 h-6" />
                  <div>
                    <p className="font-semibold">Order Summary</p>
                    <p className="text-sm">Please review your order details before payment</p>
                  </div>
                </div>
              </div>

              <OrderSummary
                cartItems={cartItems}
                shippingCharge={
                  appliedPromo?.discountType === "freeShipping"
                    ? 0
                    : shippingCharge
                }
                subtotal={subtotal}
                totalAmount={totalAmount}
                paymentMethod={paymentMethod}
                promoDiscount={promoDiscount}
                appliedPromo={appliedPromo}
              />

              <Transaction
                totalAmount={totalAmount}
                paymentMethod={paymentMethod}
                handleCheckout={onCheckout}
                isLoading={isLoading}
              />

              <div className="mt-6">
                <Button variant="outline" onClick={() => setCurrentStep("review")} className="gap-2">
                  <ChevronLeft size={16} />
                  Back to Review
                </Button>
              </div>
            </CardContent>
          </Card>
        );
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
      <SHeading
        title="Checkout"
        description="Complete your purchase in simple steps"
        nolink
      />

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between mb-2">
          <span className="text-sm font-medium">Step {currentStepIndex + 1} of {steps.length}</span>
          <span className="text-sm text-gray-600">{steps[currentStepIndex].title}</span>
        </div>
        <Progress value={progress} className="h-2" />
        
        {/* Step Indicators */}
        <div className="flex justify-between mt-4">
          {steps.map((step, index) => (
            <div key={step.id} className="flex flex-col items-center">
              <div className={`
                w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                ${index <= currentStepIndex 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-gray-200 text-gray-600'
                }
              `}>
                {index < currentStepIndex ? <Check size={16} /> : index + 1}
              </div>
              <span className="text-xs mt-2 text-center hidden sm:block">
                {step.title}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          {renderStepContent()}
        </div>

        <div className="space-y-4">
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="max-h-96 overflow-y-auto">
                  {cartItems.map((item, index) => (
                    <div key={index} className="flex items-center gap-3 py-3 border-b last:border-0">
                      <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center">
                        {item.images?.[0] ? (
                          <img 
                            src={item.images[0].asset?.url} 
                            alt={item.name}
                            className="w-full h-full object-cover rounded"
                          />
                        ) : (
                          <span className="text-xs text-gray-400">No image</span>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm line-clamp-1">{item.name}</p>
                        <p className="text-xs text-gray-600">{item.brand}</p>
                        <div className="flex justify-between items-center mt-1">
                          <p className="text-sm">Qty: {item.orderQuantity}</p>
                          <p className="font-semibold">
                            ₹{(item.orderQuantity * (item.offerPrice || item.price)).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-2 pt-2 border-t">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>₹{subtotal.toFixed(2)}</span>
                  </div>
                  
                  {promoDiscount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Promo Discount</span>
                      <span>-₹{promoDiscount.toFixed(2)}</span>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>
                      {appliedPromo?.discountType === "freeShipping" ? (
                        <span className="text-green-600">Free</span>
                      ) : (
                        `₹${shippingCharge.toFixed(2)}`
                      )}
                    </span>
                  </div>

                  <div className="flex justify-between text-lg font-bold pt-2 border-t">
                    <span>Total Amount</span>
                    <span>₹{totalAmount.toFixed(2)}</span>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <p className="text-sm text-gray-600 mb-2">Current Step:</p>
                  <div className="flex items-center gap-2">
                    <div className={`
                      w-3 h-3 rounded-full
                      ${currentStepIndex >= 0 ? 'bg-green-500' : 'bg-gray-300'}
                    `} />
                    <span className="font-medium">{steps[currentStepIndex].title}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{steps[currentStepIndex].description}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}