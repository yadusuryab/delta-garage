import { client } from "@/sanityClient";

interface ProductDetail {
  productId: {
    _ref: string;
    _id:any;
    _type: "reference";
  };
  quantity: number;
  price: number;
  size?: number;
  key?: string;
  name?: string; // Added product name for easier reference
  image?: string; // Added product image URL for easier reference
}

interface Order {
  _id: string;
  _type: "order";
  _createdAt: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  district: string;
  state: string;
  pincode: string;
  productDetails: ProductDetail[];
  trackingId?: string;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  payment_method: "cod" | "online";
  payment_status: "pending" | "completed" | "failed" | "refunded";
  payment_amount: number;
  shipping_charge: number;
  order_date: string;
  transactionID?: number;
  payment_date?: string;
  notes?: string;
}

const generateUniqueKey = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 8);
};

export const createOrder = async (orderData: {
  customer: {
    name: string;
    email: string;
    phone: string;
    address: {
      street: string;
      district: string;
      state: string;
      pincode: string;
    };
  };
  products: Array<{
    productId: string;
    name: string;
    brand?: string;
    quantity: number;
    price: number;
    image?: string;
    size?: number;
  }>;
  payment: {
    method: "cod" | "online";
    status: "pending" | "completed";
    amount: number;
    transactionId?: string;
  };
  shipping: {
    charge: number;
    status: "pending" | "shipped" | "delivered";
  };
  status?: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  notes?: string;
}): Promise<Order | undefined> => {
  const productDetails = orderData.products.map(product => ({
    _type: "productDetail",
    productId: {
      _type: "reference",
      _ref: product.productId,
    },
    name: product.name,
    brand: product.brand,
    quantity: product.quantity,
    price: product.price,
    image: product.image,
    size: product.size,
    key: generateUniqueKey(),
  }));

  const orderDoc = {
    _type: "order",
    name: orderData.customer.name,
    email: orderData.customer.email,
    phone: orderData.customer.phone,
    address: orderData.customer.address.street,
    district: orderData.customer.address.district,
    state: orderData.customer.address.state,
    pincode: orderData.customer.address.pincode,
    productDetails,
    status: orderData.status || "pending",
    payment_method: orderData.payment.method,
    payment_status: orderData.payment.status,
    payment_amount: orderData.payment.amount,
    transactionID: orderData.payment.transactionId,
    shipping_charge: orderData.shipping.charge,
    shipping_status: orderData.shipping.status,
    order_date: new Date().toISOString(),
    _createdAt: new Date().toISOString(),
    notes: orderData.notes,
  };

  try {
    const createdOrder : any = await client.create(orderDoc);

    // Clear cart if order creation succeeds
    localStorage.removeItem("cart");
    window.dispatchEvent(new Event("cartUpdated"));

    return createdOrder;
  } catch (error) {
    console.error("Error creating order:", error);
    return undefined;
  }
};

export const getOrderById = async (orderId: string): Promise<Order | undefined> => {
  const query = `*[_type == "order" && _id == $orderId][0]{
    _id,
    _type,
    _createdAt,
    name,
    email,
    phone,
    address,
    district,
    state,
    pincode,
    productDetails[]{
      _key,
      productId->{
        _id,
        name,
        brand,
        images[0]{asset->{url}},
        price
      },
      quantity,
      price,
      size,
      key
    },
    trackingId,
    status,
    payment_method,
    payment_status,
    payment_amount,
    shipping_charge,
    order_date,
    payment_id,
    payment_date,
    notes
  }`;

  try {
    return await client.fetch(query, { orderId });
  } catch (error) {
    console.error("Error fetching order:", error);
    return undefined;
  }
};

export const getOrdersByPhone = async (phone: string): Promise<Order[]> => {
  const query = `*[_type == "order" && phone == $phone] | order(_createdAt desc){
    _id,
    _type,
    _createdAt,
    name,
    email,
    phone,
    address,
    district,
    state,
    pincode,
    productDetails[]{
      _key,
      productId->{
        _id,
        name,
        brand,
        images[0]{asset->{url}},
        price
      },
      quantity,
      price,
      size,
      key
    },
    trackingId,
    status,
    payment_method,
    payment_status,
    payment_amount,
    shipping_charge,
    order_date,
    payment_id,
    payment_date,
    notes
  }`;

  try {
    return await client.fetch(query, { phone });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return [];
  }
};

export const updateOrderPayment = async (
  orderId: string,
  updateData:any
): Promise<Order | undefined> => {
  try {
    const patch = client.patch(orderId);

    if (updateData.paymentId) patch.set({ payment_id: updateData.paymentId });
    if (updateData.paymentStatus) patch.set({ payment_status: updateData.paymentStatus });
    if (updateData.paymentDate) patch.set({ payment_date: updateData.paymentDate });
    if (updateData.status) patch.set({ status: updateData.status });
    if (updateData.trackingId) patch.set({ trackingId: updateData.trackingId });
    if (updateData.notes) patch.set({ notes: updateData.notes });

    return await patch.commit();
  } catch (error) {
    console.error("Error updating order:", error);
    return undefined;
  }
};