"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { 
  ShoppingBagIcon,
} from "@heroicons/react/24/outline";

const CartButton = ({ className }: { className?: string })=> {
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
    <Link href="/my-cart"className={`p-2 relative ${className}`}>
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <ShoppingBagIcon className="w-5 h-5 text-muted-foreground" />
                <motion.span 
                  className="absolute -top-1 -right-1 bg-black text-white text-xs rounded-full h-4 w-4 flex items-center justify-center"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring" }}
                >
                  {cartCount}
                </motion.span>
              </motion.div>
            </Link>
  );
};

export default CartButton;