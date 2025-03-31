'use client'
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { getAllShoes } from "@/lib/vehicleQueries";
import Splash from "../utils/splash";
import { toast } from "sonner";
import ProductCard from "./product-card";
import ProductCard2 from "./product-image-card";

function ProductHomeList() {
  const [vehicles, setVehicles] = useState<any[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const data: any = await getAllShoes();
        if (!data || !Array.isArray(data)) throw new Error("Invalid product data");
        setVehicles(data);
      } catch (err) {
        setError("Failed to fetch vehicles.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchVehicles();
  }, []);

  useEffect(() => {
    if (error) toast(error);
  }, [error]);

  if (loading) return <Splash />;

  if (!vehicles || vehicles.length === 0) {
    return <p className="font-bold text-sm p-4">No Products Found, Please contact the Store for more Information.</p>;
  }

  const displayedVehicles = vehicles?.slice(0, 6) || [];
  return (
    <div className="">
      <h2 className="mb-3 p-4 text-xl font-medium">The Best for You.</h2>
      <div className="flex overflow-scroll gap-3 ml-8">
      {displayedVehicles.slice(0, 4).map((vehicle: any) => (
            <ProductCard2 key={vehicle._id} product={vehicle} className="md:min-w-full min-w-80 w-full" />
          ))}
      </div>
    </div>
  );
}

export default ProductHomeList;
