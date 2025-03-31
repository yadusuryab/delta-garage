'use client';
import Link from "next/link";
import React, { useEffect, useState, useRef, useCallback } from "react";
import { Button } from "../ui/button";
import { getAllShoes } from "@/lib/vehicleQueries";
import Splash from "../utils/splash";
import { toast } from "sonner";
import ProductCard from "./product-card";
import ProductCard2 from "./product-image-card";

function ProductHomeGrid() {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const loaderRef = useRef<HTMLDivElement | null>(null);
  const isFetching = useRef<boolean>(false); // To prevent multiple fetches

  const fetchVehicles = useCallback(async () => {
    if (isFetching.current) return; // Prevent multiple fetches
    isFetching.current = true;
    setLoading(true);

    try {
      const data: any = await getAllShoes();
      if (!data || !Array.isArray(data)) throw new Error("Invalid product data");

      // Append new products to the existing list
      const newProducts = data.slice((page - 1) * 6, page * 6);
      setVehicles((prev) => [...prev, ...newProducts]);
      setHasMore(data.length > page * 6); // Check if there are more products to load
    } catch (err) {
      setError("Failed to fetch vehicles.");
      console.error(err);
    } finally {
      setLoading(false);
      isFetching.current = false;
    }
  }, [page]);

  useEffect(() => {
    fetchVehicles();
  }, [fetchVehicles]);

  useEffect(() => {
    if (error) toast(error);
  }, [error]);

  // Infinite scroll logic
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const target = entries[0];
        if (target.isIntersecting && hasMore && !loading) {
          setPage((prev) => prev + 1); // Load the next page
        }
      },
      { threshold: 1.0 } // Trigger when the loader is fully visible
    );

    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }

    return () => {
      if (loaderRef.current) {
        observer.unobserve(loaderRef.current);
      }
    };
  }, [hasMore, loading]);

  if (loading && page === 1) return <Splash />;

  if (!vehicles || vehicles.length === 0) {
    return <p className="font-bold text-sm p-4">No Products Found, Please contact the Store for more Information.</p>;
  }

  return (
    <div className="p-4">
      <h2 className="mb-3 text-xl font-bold">Our Products.</h2>
      <div className="grid grid-cols-2 md:grid-cols-6 place-items-center gap-3">
        {vehicles.map((vehicle: any) => (
          <ProductCard2 key={vehicle._id} product={vehicle} className="md:min-w-full w-full" />
        ))}
      </div>

      {/* Loader for infinite scroll */}
      <div ref={loaderRef} className="flex justify-center p-4">
        {loading && <p>Loading more products...</p>}
        {!hasMore && <p>No more products to load.</p>}
      </div>
    </div>
  );
}

export default ProductHomeGrid;