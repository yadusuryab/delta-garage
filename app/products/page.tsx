"use client";
import React, { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { site } from "@/lib/site-config";
import { getAllShoes, searchShoes, getProductsByCategory } from "@/lib/vehicleQueries";
import Loading from "@/components/utils/loading";
import SHeading from "@/components/utils/section-heading";
import ProductCard from "@/components/product/product-card";
import ProductCard2 from "@/components/product/product-image-card";

function ProductList() {
  const [shoes, setShoes] = useState<any[]>([]);
  const [filteredShoes, setFilteredShoes] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchLoading, setSearchLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const searchParams = useSearchParams();
  const searchTerm = searchParams.get("search");
  const categorySlug = searchParams.get("category");
  useEffect(() => {
    // Scroll to the top when the component mounts
    window.scrollTo(0, 0);
  }, []);
  // Fetch all shoes initially
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const shoesData: any = await getAllShoes();
        setShoes(shoesData);
        setFilteredShoes(shoesData);
      } catch (err) {
        setError("Failed to fetch data.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, []);
 

  // Handle search and category updates
  useEffect(() => {
    if (searchTerm) {
      handleSearch(searchTerm);
    } else if (categorySlug) {
      handleCategoryFilter(categorySlug);
    } else {
      setFilteredShoes(shoes);
    }
  }, [searchTerm, categorySlug, shoes]);

  // Function to search products
  const handleSearch = async (keyword: string) => {
    setSearchLoading(true);
    try {
      const searchResults: any = await searchShoes(keyword);
      setFilteredShoes(searchResults);
    } catch (err) {
      console.error("Error searching products:", err);
    } finally {
      setSearchLoading(false);
    }
  };

  // Function to filter products by category
  const handleCategoryFilter = async (categorySlug: string) => {
    setSearchLoading(true);
    try {
      const categoryResults: any = await getProductsByCategory(categorySlug);
      setFilteredShoes(categoryResults || []);
    } catch (err) {
      console.error("Error filtering products by category:", err);
    } finally {
      setSearchLoading(false);
    }
  };

  if (loading) return <Loading />;
  if (error) return toast("Please refresh the page.");

  return (
    <div>
      <div className="md:mx-28 mx-4">
{searchTerm && <h2 className="mt-5 font-bold">Search results for {searchTerm}.</h2>}
        {searchLoading && <Loading />} {/* Show loader when searching or filtering */}

        {!searchLoading && filteredShoes.length === 0 ? (
          <div className="flex flex-col justify-center max-w-96 mx-auto space-y-4">
            <p className="text-center text-lg text-muted-foreground font-bold mt-6">
              Couldn't find what you're looking for? Contact us via WhatsApp.
            </p>
            <Link href={`https://wa.me/${site.phone}?text=${encodeURIComponent("Hi")}`} target="_blank">
              <div className="flex justify-center">
                <Button className="mx-auto bg-green-500 text-white hover:bg-green-600">
                  Chat via WhatsApp
                </Button>
              </div>
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-4 md:grid-cols-3 grid-cols-2 gap-4 mt-6">
            {filteredShoes.map((shoe) => (
              <ProductCard2 key={shoe._id} product={shoe} />
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