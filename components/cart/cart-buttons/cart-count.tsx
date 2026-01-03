"use client";

import { useState, useEffect, memo } from "react";
import Link from "next/link";
import { ShoppingBagIcon } from "@heroicons/react/24/outline";
import { motion } from "framer-motion";

const CartButton = memo(({ className = "" }: { className?: string }) => {
  const [itemCount, setItemCount] = useState(0);

  useEffect(() => {
    // Efficient cart count observer
    const updateCartCount = () => {
      const cart = JSON.parse(localStorage.getItem("cart") || "[]");
      setItemCount(cart.length);
    };

    updateCartCount();
    
    // Listen for custom cart update events
    const handleCartUpdate = () => updateCartCount();
    window.addEventListener("cartUpdated", handleCartUpdate);
    
    // Listen for storage changes from other tabs
    window.addEventListener("storage", (e) => {
      if (e.key === "cart") updateCartCount();
    });

    return () => {
      window.removeEventListener("cartUpdated", handleCartUpdate);
      window.removeEventListener("storage", updateCartCount);
    };
  }, []);

  return (
    <Link href="/my-cart">
      <motion.button
        aria-label={`Shopping cart with ${itemCount} items`}
        className={`relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${className}`}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <ShoppingBagIcon className="w-6 h-6" />
        
        {itemCount > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-0 -right-0 bg-primary text-primary-foreground text-xs font-bold rounded-full w-3 h-3 flex items-center justify-center"
          >
            {itemCount > 99 ? "99+" : itemCount}
          </motion.div>
        )}
      </motion.button>
    </Link>
  );
});

CartButton.displayName = "CartButton";

export default CartButton;