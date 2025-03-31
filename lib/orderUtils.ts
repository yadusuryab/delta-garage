export interface CartItem {
  _id: string;
  name: string;
  brand?: string;
  category?: {
    name: string;
    slug: string;
  };
  images: { asset: { url: string } }[];
  offerPrice?: number;
  price: number;
  quantity?: number;
  compatibility?: string;
  features?: string[];
  selectedSize?: number;
  freeProduct?: {
    _id: string;
    name: string;
    brand?: string;
    images: { asset: { url: string } }[];
    selectedSize?: number;
  } | null;
}

export const calculateSubtotal = (cartItems: CartItem[]): number => {
  return cartItems.reduce((total, item) => {
    const itemPrice = item.offerPrice || item.price;
    const quantity = item.quantity || 1;
    return total + (itemPrice * quantity);
  }, 0);
};

export const calculateTotalAmount = (
  subtotal: number, 
  shippingCharge: number,
  paymentMethod: 'online' | 'cod' = 'online'
): number => {
  // Apply COD charge if payment method is COD
  const finalShippingCharge = paymentMethod === 'cod' ? 
    Math.max(shippingCharge, 100) : // Ensure minimum ₹100 for COD
    shippingCharge;
  
  return subtotal + finalShippingCharge;
};

export const validateForm = (
  customerDetails: {
    name: string;
    email: string;
    contact1: string;
    address: string;
    district: string;
    state: string;
    pincode: string;
  }, 
  cartItems: CartItem[]
): boolean => {
  // Validate required fields
  const requiredFields = [
    customerDetails.name,
    customerDetails.email,
    customerDetails.contact1,
    customerDetails.address,
    customerDetails.district,
    customerDetails.state,
    customerDetails.pincode
  ];

  if (requiredFields.some(field => !field?.trim())) {
    alert("Please fill all the required fields.");
    return false;
  }

  // Validate phone number format
  if (!/^[6-9]\d{9}$/.test(customerDetails.contact1)) {
    alert("Please enter a valid 10-digit Indian phone number.");
    return false;
  }

  // Validate email format
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerDetails.email)) {
    alert("Please enter a valid email address.");
    return false;
  }

  // Validate pincode (6 digits)
  if (!/^\d{6}$/.test(customerDetails.pincode)) {
    alert("Please enter a valid 6-digit pincode.");
    return false;
  }

  // Validate cart
  if (cartItems.length === 0) {
    alert("Your cart is empty. Please add items to proceed.");
    return false;
  }

  return true;
};

// Additional utility function
export const calculateCartQuantity = (cartItems: CartItem[]): number => {
  return cartItems.reduce((total, item) => total + (item.quantity || 1), 0);
};