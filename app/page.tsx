"use client";
import { useState, useEffect } from "react";
import Splash from "@/components/utils/splash";
import { CategoryDisplay } from "@/components/categories/categories-display";
import ProductHomeGrid2 from "@/components/product/product-home-layout-2";

export default function Home() {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 100); // 5 seconds delay

    return () => clearTimeout(timer); // Cleanup function
  }, []);

  return (
    <div className="flex py-0 flex-col">
      {showSplash ? (
        <Splash />
      ) : (
        <div>
          <CategoryDisplay />
        
          {/* <CategoryGrid /> */}
         
          <ProductHomeGrid2 />
          {/* <Connect />
          <Faq /> */}
        </div>
      )}
    </div>
  );
}
