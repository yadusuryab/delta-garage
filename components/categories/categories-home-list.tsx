'use client'
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { getAllCategories } from "@/lib/vehicleQueries";
import { toast } from "sonner";
import Splash from "../utils/splash";
import SearchBar from "../utils/search-box";

 function CategoriesHomeList({className,flex_col,buttonClass,heading,buttonOnclick}:any) {
  const [vehicles, setVehicles] = useState<any[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const data: any = await getAllCategories();
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

  const displayedVehicles = vehicles || [];
  
  return (
    <div className={`p-8 ${className}`}>
   {!heading &&   <h2 className="mb-3 text-xl font-medium ">Best for your Car.</h2>}
      <div className={`flex flex-col max-h-screen overflow-y-scroll gap-3`}>
        {displayedVehicles.map((cat: any) => (
          
            <Link href={`/products?category=${cat.slug.current}`}>
              <Button onClick={buttonOnclick} className={`h-20 rounded-none text-2xl font-semibold ${buttonClass}`}>
                {cat.name}
              </Button>
            </Link>
        
        ))}
       {!heading && <SearchBar cat={true}/>}
      </div>
    </div>
  );
}

export default CategoriesHomeList;
