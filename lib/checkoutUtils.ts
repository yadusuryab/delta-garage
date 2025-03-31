import { createOrder, updateOrderPaymentId } from "@/lib/orderQueries"; // Import the new function
import { CartItem } from "./orderUtils";

interface CustomerDetails {
  name: string;
  email: string;
  contact1: string;
  address: string;
  district: string;
  state: string;
  pincode: string;
}

interface OrderDetails {
  name: string;
  email: string;
  phone: string;
  products: {
    productId: string;
    quantity: number;
    size?: number;
    price: number;
  }[];
  payment_method: "online" | "cod";
  payment_status: string;
  payment_amount: number;
  shipping_charge: number;
  order_date: string;
  address: string;
  district: string;
  state: string;
  pincode: string;
  payment_id: string; // Add payment_id to the interface
}

export const handleCheckout = async (
  customerDetails: CustomerDetails,
  cartItems: CartItem[],
  paymentMethod: "online" | "cod",
  totalAmount: number,
  shippingCharge: number,
  router: any,
  setIsLoading: (loading: boolean) => void
) => {
  setIsLoading(true);

  const orderDetails: OrderDetails = {
    name: customerDetails.name,
    email: customerDetails.email,
    phone: customerDetails.contact1,
    products: cartItems.flatMap((item) => [
      {
        productId: item._id,
        quantity: 1,
        size: item.selectedSize,
        price: item.offerPrice || item.price,
      },
      
    ]),
    payment_method: paymentMethod,
    payment_status: paymentMethod === "online" ? "pending" : "cod",
    payment_amount: totalAmount,
    payment_id: "", // Initialize payment_id as empty
    shipping_charge: shippingCharge,
    order_date: new Date().toISOString(),
    address: customerDetails.address,
    district: customerDetails.district,
    state: customerDetails.state,
    pincode: customerDetails.pincode,
  };

  try {
    const orderResult = await createOrder(orderDetails);
    if (!orderResult) throw new Error("Failed to create order.");

    if (paymentMethod === "online") {
      await handleOnlinePayment(orderResult._id, totalAmount, customerDetails);
    } else {
      localStorage.removeItem("cart");
      window.dispatchEvent(new Event("cartUpdated"));
      router.push(`/order/${orderResult._id}`);
    }
  } catch (error) {
    console.error("Error during checkout:", error);
    alert("An error occurred during checkout. Please try again.");
  } finally {
    setIsLoading(false);
  }
};

export const handleOnlinePayment = async (
  orderId: string,
  totalAmount: number,
  customerDetails: CustomerDetails
) => {
  try {
    const response = await fetch("/api/create-cashfree-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: totalAmount,
        customer_details: {
          customer_id: customerDetails.contact1 || `guest_${Date.now()}`,
          customer_email: customerDetails.email,
          customer_phone: customerDetails.contact1,
        },
      }),
    });

    const data = await response.json();
    if (!data?.payment_session_id)
      throw new Error("Failed to create payment session.");

    // Update the payment_id in the order with the payment_session_id
    await updateOrderPaymentId(orderId, data.payment_session_id);

    // Load Cashfree script dynamically
    const script = document.createElement("script");
    script.src = "https://sdk.cashfree.com/js/v3/cashfree.js";
    script.onload = () => {
      const cashfree = new (window as any).Cashfree({ mode: process.env.NEXT_PUBLIC_CASHFREE_MODE });

      cashfree
        .checkout({
          paymentSessionId: data.payment_session_id,
          returnUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/order/${orderId}`,
        })
        .then((result: any) => {
          if (result.error) throw new Error(result.error.message);
          if (result.redirect) {
            console.log("Redirecting to payment page.");
          }
        })
        .catch((error: any) => {
          console.error("Cashfree Checkout Error:", error);
          alert("Payment failed. Please try again.");
        });
    };
    document.body.appendChild(script);
  } catch (error) {
    console.error("Error during payment:", error);
    alert("Payment failed. Please try again.");
  }
};
