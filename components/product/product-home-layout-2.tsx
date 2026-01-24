'use client';
import React, { useEffect, useState, useMemo } from "react";
import { Button } from "../ui/button";
import { getProductsGroupedByCategory } from "@/lib/productQueries"; // Use new query
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import ProductCard3 from "./product-image-card-2";
import { ChevronRight, Sparkles, TrendingUp, RefreshCw } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

interface CategoryGroup {
  _id: string;
  name: string;
  slug: string;
  products: any[];
  productCount: number;
  description?: string;
  imageUrl?: string;
}

const ProductHomeGrid2 = () => {
  const [categoryGroups, setCategoryGroups] = useState<CategoryGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const groups = await getProductsGroupedByCategory(4, 6);
      
      if (!Array.isArray(groups)) {
        throw new Error("Failed to load categories");
      }
      
      setCategoryGroups(groups);
    } catch (err) {
      setError("Failed to load products");
      console.error(err);
      toast.error("Unable to load products. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  console.log(categoryGroups)

  // Skeleton loader
  if (loading && categoryGroups.length === 0) {
    return (
      <div className="container mx-auto px-4 my-10">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-200 rounded-lg animate-pulse">
              <div className="w-6 h-6"></div>
            </div>
            <div>
              <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-2"></div>
              <div className="h-4 w-64 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
          <div className="h-10 w-32 bg-gray-200 rounded animate-pulse"></div>
        </div>
        
        {[1, 2, 3].map(i => (
          <div key={i} className="mb-8">
            <div className="h-8 w-56 bg-gray-200 rounded mb-4 animate-pulse"></div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map(j => (
                <div key={j} className="bg-gray-100 rounded-lg h-64 animate-pulse"></div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (categoryGroups.length === 0 && !loading) {
    return (
      <div className="container mx-auto px-4 my-10 text-center">
        <div className="max-w-md mx-auto py-12">
          <TrendingUp className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            No products available
          </h3>
          <p className="text-gray-500 mb-6">
            Check back soon for our latest arrivals!
          </p>
          <Button onClick={fetchData} variant="outline" className="gap-2">
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
        </div>
      </div>
    );
  }
  return (
    <div className="container mx-auto px-4 my-10">
      {/* Featured Categories Header */}
      <div className="flex items-center justify-between mb-8">
     
        
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Accessories</h1>
         
          </div>
       
        
        <Link href="/products">
          <Button variant="ghost" className="gap-2 group">
            View All Products
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Button>
        </Link>
      </div>

      {/* Category Groups */}
      <div className="space-y-12">
        {categoryGroups.map((category, categoryIndex) => (
        
          <motion.div
            key={category._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: categoryIndex * 0.1 }}
            className="bg-card rounded-xl border p-2 md:p-6"
          >
            
            {/* Category Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-1 gap-1">
              <div>
                <div className="flex items-top p-2 justify-between gap-1">
                  <div>
                  <h2 className="text-xl md:text-2xl font-bold">
                    {category.name}
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">
                   {category.productCount}+ items
                  </p>
                  </div>
                  <Link href={`/products?category=${category?.slug}`}>
                <Button 
                  variant="outline" 
                  className="gap-2 group "
                  size={'sm'}
                >
                  Explore All
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
                </div>
              
                 
               
              </div>
              
           
            </div>

            {/* Products Grid */}
            <div className={cn(
              "grid gap-1",
              category.products.length === 1 ? "grid-cols-1 max-w-sm mx-auto" :
              category.products.length === 2 ? "grid-cols-1 sm:grid-cols-2 max-w-2xl mx-auto" :
              category.products.length === 3 ? "grid-cols-1 sm:grid-cols-2 md:grid-cols-3" :
              "grid-cols-2 sm:grid-cols-2 md:grid-cols-4"
            )}>
              {category.products.map((product, productIndex) => (
                <motion.div
                  key={product._id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: categoryIndex * 0.1 + productIndex * 0.05 }}
                  className="h-full"
                >
                  <ProductCard3 
                    product={product}
                    showCategory={false}
                  />
                </motion.div>
              ))}
            </div>

            {/* Show More Products */}
            {category.productCount > 4 && (
              <div className="pt-6  text-center">
                 <Link href={`/products?category=${category?.slug}`}>
                  <Button variant="ghost" size="sm" className="gap-2">
                    View all {category.productCount} products
                    <ChevronRight className="w-3 h-3" />
                  </Button>
                </Link>
                <p className="text-sm text-muted-foreground mb-3">
                  Plus {category.productCount - 4} more items in this category
                </p>
               
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Show All Categories CTA */}
      {categoryGroups.length > 0 && (
        <div className="mt-12 text-center">
          <div className="max-w-2xl mx-auto p-6 bg-gradient-to-r from-primary/5 to-primary/10 rounded-2xl">
            <h2 className="text-xl font-bold mb-3">
              Explore All Categories
            </h2>
            <p className="text-muted-foreground mb-6">
              Discover our complete range of automotive accessories and parts
            </p>
            <Link href="/categories">
              <Button size="lg" className="gap-3">
                Browse All Categories
                <ChevronRight className="w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductHomeGrid2;