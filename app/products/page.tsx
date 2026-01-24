"use client";
import React, { Suspense, useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { site } from "@/lib/site-config";
import { getAllProducts, searchProducts, getProductsByCategory } from "@/lib/productQueries";
import Loading from "@/components/utils/loading";
import ProductCard3 from "@/components/product/product-image-card-2";

function ProductList() {
  const [shoes, setShoes] = useState<any[]>([]);
  const [filteredShoes, setFilteredShoes] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchLoading, setSearchLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const searchParams = useSearchParams();
  const searchTerm = searchParams.get("search");
  const categorySlug = searchParams.get("category");

  // Initialize data and handle filtering in one effect
  useEffect(() => {
    const fetchAndFilterData = async () => {
      try {
        setLoading(true);
        
        // Fetch data only if not already fetched
        if (shoes.length === 0) {
          const shoesData: any = await getAllProducts();
          setShoes(shoesData);
        }

        // Apply filters
        if (searchTerm) {
          const searchResults: any = await searchProducts(searchTerm);
          setFilteredShoes(searchResults);
        } else if (categorySlug) {
          const categoryResults: any = await getProductsByCategory(categorySlug);
          setFilteredShoes(categoryResults || []);
        } else {
          setFilteredShoes(shoes);
        }
      } catch (err) {
        console.error("Error:", err);
        setError("Failed to fetch data. Please refresh the page.");
        toast.error("Failed to fetch data. Please refresh the page.");
      } finally {
        setLoading(false);
        setSearchLoading(false);
      }
    };

    fetchAndFilterData();
  }, [searchTerm, categorySlug]); // Remove shoes from dependencies

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (loading) return <Loading />;
  
  if (error) {
    return (
      <div className="text-center p-8">
        <p className="text-red-500">{error}</p>
        <Button 
          onClick={() => window.location.reload()} 
          className="mt-4"
        >
          Refresh Page
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div className="md:mx-28 mx-4">
        {searchTerm && (
          <h2 className="mt-5 font-bold">
            Search results for "{searchTerm}"
          </h2>
        )}
        
        {categorySlug && !searchTerm && (
          <h2 className="mt-5 font-bold">
            Category: {categorySlug}
          </h2>
        )}

        {searchLoading && <Loading />}

        {!searchLoading && filteredShoes.length === 0 ? (
          <div className="flex flex-col justify-center max-w-96 mx-auto space-y-4 py-12">
            <p className="text-center text-lg text-muted-foreground font-bold">
              Couldn't find what you're looking for? Contact us via WhatsApp.
            </p>
            <Link 
              href={`https://wa.me/${site.phone}?text=${encodeURIComponent("Hi")}`} 
              target="_blank"
              className="flex justify-center"
            >
              <Button className="bg-green-500 text-white hover:bg-green-600">
                Chat via WhatsApp
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-4 md:grid-cols-3 grid-cols-2 gap-4 mt-6">
            {filteredShoes.map((shoe) => (
              <ProductCard3 key={shoe._id} product={shoe} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<Loading />}>
      <ProductList />
    </Suspense>
  );
}