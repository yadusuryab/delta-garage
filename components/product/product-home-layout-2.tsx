'use client';
import React, { useEffect, useState, useRef, useCallback } from "react";
import { Button } from "../ui/button";
import { getAllProducts } from "@/lib/productQueries";
import Splash from "../utils/splash";
import { toast } from "sonner";
import ProductCard3 from "./product-image-card-2";

interface Product {
  _id: string;
  title: string;
  price: number;
  image: string;
}

const ProductHomeGrid2 = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const observerRef = useRef<HTMLDivElement | null>(null);

  const fetchProducts = useCallback(async () => {
    if (!hasMore || loading) return;

    try {
      setLoading(true);
      const newProducts = await getAllProducts(page);
      if (!Array.isArray(newProducts)) throw new Error("Invalid data");

      setProducts((prev) => [...prev, ...newProducts]);
      setHasMore(newProducts.length > 0);
      setPage((prev) => prev + 1);
    } catch (err) {
      setError("Failed to load products");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page, hasMore, loading]);

  // ✅ Load only once at first, not again via scroll
  useEffect(() => {
    fetchProducts(); // Only once
  }, []);

  useEffect(() => {
    if (error) toast(error);
  }, [error]);

  // ✅ Only start observing after first fetch (i.e. page > 1)
  useEffect(() => {
    if (!observerRef.current || !hasMore || page <= 1) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          fetchProducts();
        }
      },
      { threshold: 1.0 }
    );

    observer.observe(observerRef.current);
    return () => observer.disconnect();
  }, [fetchProducts, hasMore, page]);

  if (products.length === 0 && loading) return <Splash />;

  if (products.length === 0 && !loading) {
    return (
      <div className="p-4 text-center">
        <p className="font-bold text-sm">No Products Found.</p>
        <Button onClick={fetchProducts} className="mt-4" variant="outline">
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 my-10">
      <h2 className="mb-6 text-2xl font-bold">Latest</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {products.map((product:any,index) => (
          <div key={index} className="w-full">
            <ProductCard3 product={product} />
          </div>
        ))}
      </div>
      <div ref={observerRef} className="h-10" />
      {loading && <p className="text-center mt-4">Loading...</p>}
    </div>
  );
};

export default ProductHomeGrid2;
