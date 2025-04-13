"use client";
import { useState, useEffect } from "react";
import CategoriesHomeList from "@/components/categories/categories-home-list";
import CategoryGrid from "@/components/categories/category-grid";
import ProductHomeGrid from "@/components/product/product-home-grid";
import ProductHomeList from "@/components/product/product-home-list";
import { Connect } from "@/components/sections/contact";
import { Faq } from "@/components/sections/faq";
import { FeaturesSection } from "@/components/sections/features";
import { Hero } from "@/components/sections/hero";
import Splash from "@/components/utils/splash";

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
          <Hero />
          <hr />
          {/* <CategoriesHomeList/> */}
          <CategoryGrid />
          <hr/>
          {/* <ProductHomeList/> */}
          <ProductHomeGrid />
          <Connect />
          <Faq />
          {/* <FeaturesSection />
          <Faq />
          <Connect /> */}
        </div>
      )}
    </div>
  );
}
