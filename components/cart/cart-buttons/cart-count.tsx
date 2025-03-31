"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const CartButton = () => {
  const [cartCount, setCartCount] = useState(0);

  // Function to update the cart count
  const updateCartCount = () => {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    setCartCount(cart.length);
  };

  useEffect(() => {
    // Initial update
    updateCartCount();

    // Listen for storage events (changes from other tabs/windows)
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === "cart") {
        updateCartCount();
      }
    };

    // Listen for custom events (changes within the same tab)
    const handleCustomEvent = () => {
      updateCartCount();
    };

    // Add event listeners
    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("cartUpdated", handleCustomEvent);

    // Cleanup event listeners
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("cartUpdated", handleCustomEvent);
    };
  }, []);

  return (
    <Link href="/my-cart">
      <Button className="relative" size="icon" variant="ghost">
        <ShoppingBag size={30} />
        {/* {cartCount > 0 && (
          <Badge
            className="absolute -top-2 -right-2 rounded-full"
            variant={"secondary"}
          >
            {cartCount}
          </Badge>
        )} */}
      </Button>
    </Link>
  );
};

export default CartButton;