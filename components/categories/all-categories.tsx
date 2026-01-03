"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getAllCategories } from "@/lib/productQueries";

export function AllCategoriesSection() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getAllCategories();
        if (data && Array.isArray(data)) {
          setCategories(data);
        }
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (loading) {
    return (
      <div className="py-12">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-2xl font-bold mb-8 text-center">Categories</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-20 bg-gray-100 rounded-lg animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (categories.length === 0) return null;

  return (
    <section className="py-12">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-2xl font-bold mb-8 text-center">Shop by Category</h2>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {categories.map((category) => (
            <Link
              key={category._id}
              href={`/products?category=${category.slug?.current || category.slug}`}
              className="group"
            >
              <div className="flex flex-col items-center p-4 border rounded-lg hover:border-primary hover:shadow-sm transition-all">
                {/* Category Image */}
                <div className="relative w-16 h-16 mb-3 rounded-full overflow-hidden bg-gray-50">
                  {category.image?.asset?.url ? (
                    <Image
                      src={category.image.asset.url}
                      alt={category.name}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform"
                      sizes="64px"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <div className="w-8 h-8 bg-gray-200 rounded-full" />
                    </div>
                  )}
                </div>
                
                {/* Category Name */}
                <h3 className="text-sm font-medium text-center line-clamp-2 group-hover:text-primary">
                  {category.name}
                </h3>
                
                {/* Product Count */}
                {category.productCount && (
                  <p className="text-xs text-gray-500 mt-1">
                    {category.productCount} items
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
        
        {/* View All Products */}
        <div className="mt-10 text-center">
          <Link href="/products">
            <Button variant="outline" className="gap-2 group">
              View All Products
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}