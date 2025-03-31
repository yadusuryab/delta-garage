"use client";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { getAllCategories } from "@/lib/vehicleQueries";
import { toast } from "sonner";
import Splash from "../utils/splash";
import SearchBar from "../utils/search-box";
import { ArrowRightCircle } from "lucide-react";

function CategoryGrid({
  className,
  flex_col,
  buttonClass,
  heading,
  buttonOnclick,
}: any) {
  const [Categories, setCategories] = useState<any[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data: any = await getAllCategories();
        if (!data || !Array.isArray(data))
          throw new Error("Invalid product data");
        setCategories(data);
      } catch (err) {
        setError("Failed to fetch Categories.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    if (error) toast(error);
  }, [error]);

  if (loading) return <Splash />;

  if (!Categories || Categories.length === 0) {
    return (
      <p className="font-bold text-sm p-4">
        Categories not found.
      </p>
    );
  }

  const displayedCategories = Categories || [];

  return (
    <div className={`p-4 ${className}`}>
      {!heading && (
        <h2 className="mb-3 text-xl font-bold ">Our Collections</h2>
      )}
      <div
        className={`grid  grid-cols-1 md:flex place-items-center w-full  gap-3`}
      >
        {displayedCategories.slice(0,3).map((cat: any) => (
          <Link
            href={`/products?category=${cat.slug.current}`}
            className="w-full"
            key={cat.slug.current}
          >
            <Button
              onClick={buttonOnclick}
              variant={"secondary"}
              className={`h-20 border rounded-2xl max-w-[400px] flex justify-between w-full text-xl font-semibold ${buttonClass}`}
            >
              <span className="truncate">{cat.name}</span>{" "}
              <span>
                <ArrowRightCircle />
              </span>
            </Button>
          </Link>
        ))}
        {!heading && <div className="w-full"><SearchBar cat={true} /></div>}
      </div>
    </div>
  );
}

export default CategoryGrid;
