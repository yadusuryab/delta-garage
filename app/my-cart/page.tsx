"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import React, { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import CartItem from "@/components/cart/cart-item";
import SHeading from "@/components/utils/section-heading";

interface CartItem {
  _id: string;
  productName: string;
  brand: string;
  images: { asset: { url: string } }[];
  offerPrice?: number;
  price: number;
  quantity: number;
  compatibility?: string;
  features?: string[];
}

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  // Load cart from localStorage on page load
  useEffect(() => {
    const storedCart = localStorage.getItem("cart");
    if (storedCart) setCartItems(JSON.parse(storedCart));
  }, []);

  const removeFromCart = (id: string) => {
    const updatedCart = cartItems.filter((item) => item._id !== id);
    setCartItems(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
    window.dispatchEvent(new Event("cartUpdated"));
  };

  const updateQuantity = (id: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    const updatedCart = cartItems.map(item => 
      item._id === id ? { ...item, quantity: newQuantity } : item
    );
    setCartItems(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
    window.dispatchEvent(new Event("cartUpdated"));
  };

  const calculateSubtotal = () => 
    cartItems.reduce((total, item) => total + (item.offerPrice || item.price) , 0);

  return (
    <main className="container mx-auto md:px-16 px-2">
      <SHeading title="Your Cart" description="Confirm your Products and Proceed to Checkout." nolink />
      <div className="md:flex grid gap-6 w-full justify-between">
        <div className="w-full grid gap-4">
          {cartItems.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground text-lg font-semibold">Your cart is empty.</p>
              <Link href="/products">
                <Button variant="outline" className="mt-4">
                  Continue Shopping
                </Button>
              </Link>
            </div>
          ) : (
           // In your CartPage component, keep this part the same:
cartItems.map((item:any) => (
  <CartItem
    key={item._id}
    item={item}
    onRemove={() => removeFromCart(item._id)}
  />
))
          )}
        </div>
        
        {cartItems.length > 0 && (
          <div className="md:min-w-[350px] w-full">
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Subtotal ({cartItems.length} items)</span>
                  <span>₹{calculateSubtotal().toLocaleString('en-IN')}</span>
                </div>
                <Separator />
                <div className="flex items-center justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>₹{calculateSubtotal().toLocaleString('en-IN')}</span>
                </div>
              </CardContent>
              <CardFooter>
                <div className="grid gap-4 w-full">
                  <p className="text-sm text-muted-foreground">
                    <Badge variant={'secondary'}>Note</Badge> Shipping and taxes calculated at checkout.
                  </p>
                  <Link href="/checkout" className="w-full">
                    <Button className="w-full">Proceed to Checkout</Button>
                  </Link>
                  <Link href="/products">
                    <Button variant="outline" className="w-full">
                      Continue Shopping
                    </Button>
                  </Link>
                </div>
              </CardFooter>
            </Card>
          </div>
        )}
      </div>
    </main>
  );
}