// app/orders/search/page.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { getOrdersByPhone } from "@/lib/orderQueries";

export default function OrderSearchPage() {
  const [phone, setPhone] = useState("");
  const [orders, setOrders] = useState<any[] | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async () => {
    if (!phone) return alert("Please enter a phone number.");
    setIsLoading(true);
    try {
      const orders = await getOrdersByPhone(phone);
      setOrders(orders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      alert("Failed to fetch orders. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="container mx-auto md:px-16 px-2">
      <h1 className="text-2xl font-bold mt-8">Search Orders by Phone</h1>
      <div className="mt-4 space-y-4">
        <div className="flex items-center gap-4">
          <Input
            type="text"
            placeholder="Enter phone number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          <Button onClick={handleSearch} disabled={isLoading}>
            {isLoading ? "Searching..." : "Search"}
          </Button>
        </div>

        {orders === undefined ? (
          <p className="text-muted-foreground">Enter a phone number to search for orders.</p>
        ) : orders.length === 0 ? (
          <p className="text-muted-foreground">No orders found for this phone number.</p>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <Card key={order._id}>
                <CardHeader>
                  <CardTitle>Order ID: {order._id}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Customer Name: {order.name}</p>
                  <p>Phone: {order.phone}</p>
                  <p>Status: {order.status}</p>
                  <p>Payment Method: {order.payment_method}</p>
                  <p>Order Date: {new Date(order._createdAt).toLocaleDateString()}</p>
                </CardContent>
                <CardContent>
                  <Link href={`/order/${order._id}`}>
                    <Button variant="secondary">View Order Details</Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}