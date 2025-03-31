"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ShoppingBag, CheckCircle } from "lucide-react";
import Link from "next/link";

interface AddToCartButtonProps {
  product: {
    _id: string;
    name: string; // Updated from productName to name
    category: {
      name: string;
      slug: string;
    };
    material: string;
    waterResistance: string;
    movementType: string;
    caseSize: string;
    images: { asset: { url: string } }[];
    description: string;
    price: number;
    offerPrice?: number; // Optional offer price
  };
}

export default function AddToCartButton({ product }: AddToCartButtonProps) {
  const [isInCart, setIsInCart] = useState(false);

  useEffect(() => {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    setIsInCart(cart.some((item: any) => item._id === product._id));
  }, [product._id]);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");

    if (!isInCart) {
      const updatedCart = [...cart, product];
      localStorage.setItem("cart", JSON.stringify(updatedCart));
      setIsInCart(true);
    }
  };

  return isInCart ? (
    <Link href="/my-cart">
      <Button variant="outline" className="w-full " size={'sm'}>
        <CheckCircle  /> View in Cart
      </Button>
    </Link>
  ) : (
    <Button onClick={handleAddToCart} className="w-full " size={'sm'}>
      <ShoppingBag  /> Add to Cart
    </Button>
  );
}
