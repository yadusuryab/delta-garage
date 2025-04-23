'use client';
import Link from "next/link";
import React, { useEffect, useState, useRef, useCallback } from "react";
import { Button } from "../ui/button";
import { getAllProducts } from "@/lib/productQueries";
import Splash from "../utils/splash";
import { toast } from "sonner";
import ProductCard3 from "./product-image-card-2";

function ProductHomeGrid2() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const loaderRef = useRef<HTMLDivElement | null>(null);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const data: any = await getAllProducts();
      
      if (!data || !Array.isArray(data)) {
        throw new Error("Invalid product data");
      }

      setProducts(data); // Set all products at once
      setHasMore(false); // Since we're fetching all at once
    } catch (err) {
      setError("Failed to fetch products.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    if (error) toast(error);
  }, [error]);

  if (loading) return <Splash />;

  if (!products || products.length === 0) {
    return (
      <div className="p-4 text-center">
        <p className="font-bold text-sm">
          No Products Found, Please contact the Store for more Information.
        </p>
        <Button 
          onClick={fetchProducts} 
          className="mt-4"
          variant="outline"
        >
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 my-10">
      <h2 className="mb-6 text-2xl font-bold">Latest</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {products.map((product: any) => (
          <div key={product._id} className="w-full">
            <ProductCard3 product={product} />
          </div>
        ))}
      </div>
    </div>
  );
}

export default ProductHomeGrid2;