"use client";

import { getAllCategories } from "@/lib/productQueries";
import { cn } from "@/lib/utils";
import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { toast } from "sonner";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { 
  IconChevronLeft, 
  IconChevronRight,
  IconBulb,
  IconCar,
  IconBrightnessUp,
  IconArmchair,
  IconSpeakerphone,
  IconBrandVolkswagen,
  IconManualGearbox,
  IconSparkles,
  IconClock
} from "@tabler/icons-react";

// SEO-friendly icons mapping (matches category names)
const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  "Lights & Flashers": <IconBulb aria-label="Lights and Flashers Icon" />,
  "Fog lamps": <IconBrightnessUp aria-label="Fog Lamps Icon" />,
  "Splitters, Skirtings & Diffusers": <IconCar aria-label="Body Kit Icon" />,
  "Spoilers": <IconCar aria-label="Spoiler Icon" />,
  "Car Interiors": <IconArmchair aria-label="Car Interiors Icon" />,
  "Horns, Sirens & Air Intakes": <IconSpeakerphone aria-label="Horns Icon" />,
  "German Car Accessories": <IconBrandVolkswagen aria-label="German Car Icon" />,
  "Gear Knobs, Hubs & Steerings": <IconManualGearbox aria-label="Steering Icon" />
};

export function CategoryDisplay() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [showScrollButtons, setShowScrollButtons] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout>(null);

  // Fetch categories
  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getAllCategories();
      
      if (!data || !Array.isArray(data)) {
        throw new Error("Invalid categories data");
      }
      
      setCategories(data);
      
    } catch (err) {
      console.error('Category fetch error:', err);
      toast.error("Failed to load categories.");
      setCategories([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
    
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [fetchCategories]);

  // Handle horizontal scrolling
  const scroll = useCallback((direction: 'left' | 'right') => {
    if (!scrollContainerRef.current) return;
    
    const container = scrollContainerRef.current;
    const scrollAmount = container.clientWidth * 0.8;
    
    const newPosition = direction === 'left' 
      ? Math.max(0, scrollPosition - scrollAmount)
      : Math.min(
          container.scrollWidth - container.clientWidth,
          scrollPosition + scrollAmount
        );
    
    container.scrollTo({ left: newPosition, behavior: 'smooth' });
    setScrollPosition(newPosition);
  }, [scrollPosition]);

  // Check if scroll buttons should be visible
  useEffect(() => {
    const checkScroll = () => {
      if (!scrollContainerRef.current) return;
      
      const { scrollWidth, clientWidth } = scrollContainerRef.current;
      setShowScrollButtons(scrollWidth > clientWidth);
    };
    
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [categories]);

  // Update scroll position on scroll
  const handleScroll = useCallback(() => {
    if (!scrollContainerRef.current) return;
    
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    
    debounceTimerRef.current = setTimeout(() => {
      setScrollPosition(scrollContainerRef.current?.scrollLeft || 0);
    }, 50);
  }, []);

  // Memoized category features
  const categoryFeatures = useMemo(() => 
    categories.map((category) => {
      // Get the slug - handle both slug.current and direct slug
      const slug = category.slug?.current || category.slug;
      
      return {
        id: category._id,
        title: category.name || 'Unknown Category',
        description: `Explore our ${category.name || 'car'} accessories collection`,
        icon: CATEGORY_ICONS[category.name] || <IconCar aria-label="Car Accessories Icon" />,
        slug: slug || 'uncategorized',
        imageUrl: category.image?.asset?.url || null,
        imageAlt: category.image?.alt || `${category.name} car accessories`,
        productCount: category.productCount || 0
      };
    })
  , [categories]);

  // Loading state
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 mt-5">
        <div className="flex overflow-x-hidden gap-4 pb-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="shrink-0 w-[280px] h-[180px] md:w-[300px] md:h-[200px] bg-gray-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!categories || categories.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 mt-5 text-center">
        <IconClock className="w-12 h-12 mx-auto text-gray-400 mb-4" />
        <p className="font-semibold text-gray-600">No categories available at the moment.</p>
        <p className="text-sm text-gray-500 mt-2">Please check back later.</p>
      </div>
    );
  }

  return (
    <section 
      ref={containerRef}
      aria-label="Product Categories"
      className="relative z-10 max-w-7xl mx-auto px-4 mt-5"
    >
      <h2 className="sr-only">Car Accessories Categories</h2>
      
      <div className="relative group">
        {/* Scroll buttons */}
        {showScrollButtons && (
          <>
            <button
              onClick={() => scroll('left')}
              aria-label="Scroll categories left"
              disabled={scrollPosition <= 0}
              className={cn(
                "absolute left-0 top-1/2 -translate-y-1/2 z-20",
                "bg-white/90 backdrop-blur-sm dark:bg-black/20",
                "border border-gray-200 dark:border-gray-700",
                "p-2 rounded-full shadow-lg",
                "transition-all duration-200",
                "hover:scale-105 active:scale-95",
                scrollPosition <= 0 && "opacity-50 cursor-not-allowed"
              )}
            >
              <IconChevronLeft className="w-5 h-5" />
            </button>

            <button
              onClick={() => scroll('right')}
              aria-label="Scroll categories right"
              className={cn(
                "absolute right-0 top-1/2 -translate-y-1/2 z-20",
                "bg-white/90 backdrop-blur-sm dark:bg-black/20",
                "border border-gray-200 dark:border-gray-700",
                "p-2 rounded-full shadow-lg",
                "transition-all duration-200",
                "hover:scale-105 active:scale-95"
              )}
            >
              <IconChevronRight className="w-5 h-5" />
            </button>
          </>
        )}

        {/* Horizontal scrolling container */}
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className={cn(
            "flex overflow-x-auto scrollbar-hide",
            "pb-4 gap-4",
            "snap-x snap-mandatory md:snap-none",
            "scroll-smooth"
          )}
          role="region"
          aria-label="Categories carousel"
        >
          {categoryFeatures.map((feature, index) => (
            <Link
              href={`/products?category=${feature.slug}`}
              key={feature.id}
              prefetch={index < 3}
              className="snap-start shrink-0"
              aria-label={`Browse ${feature.title} category`}
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                whileHover={{ y: -4 }}
                whileTap={{ scale: 0.98 }}
                className={cn(
                  "relative overflow-hidden rounded-2xl",
                  "w-[280px] h-[180px] md:w-[300px] md:h-[200px]",
                  "shadow-sm hover:shadow-lg",
                  "transition-shadow duration-200",
                  "group/category"
                )}
              >
                {/* Background Image */}
                {feature.imageUrl ? (
                  <div className="absolute inset-0">
                    <Image
                      src={feature.imageUrl}
                      alt={feature.imageAlt}
                      fill
                      sizes="(max-width: 768px) 280px, 300px"
                      className="object-cover"
                      loading={index > 2 ? "lazy" : "eager"}
                      priority={index < 3}
                      quality={75}
                    />
                  </div>
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200" />
                )}

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

                {/* Content */}
                <div className="relative z-10 h-full p-6 flex flex-col justify-end">
                  <div className="flex items-center gap-3 mb-3">
                    <div className={cn(
                      "p-2 rounded-lg",
                      "bg-white/20 backdrop-blur-sm",
                      "group-hover/category:bg-primary/30",
                      "transition-colors duration-200"
                    )}>
                      <div className="text-white">
                        {feature.icon}
                      </div>
                    </div>
                    
                    {feature.productCount > 0 && (
                      <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-primary/20 backdrop-blur-sm">
                        <IconSparkles className="w-3 h-3 text-primary-foreground" />
                        <span className="text-xs font-semibold text-primary-foreground">
                          {feature.productCount}+
                        </span>
                      </div>
                    )}
                  </div>

                  <h3 className="text-xl font-bold text-white mb-2 line-clamp-1">
                    {feature.title}
                  </h3>
                  
                  {/* Hidden SEO content */}
                  <div className="sr-only">
                    Shop {feature.title} accessories for your vehicle. Premium quality auto parts.
                  </div>
                </div>

                {/* Hover effect */}
                <div className={cn(
                  "absolute inset-0",
                  "bg-gradient-to-t from-primary/10 to-transparent",
                  "opacity-0 group-hover/category:opacity-100",
                  "transition-opacity duration-200"
                )} />
              </motion.div>
            </Link>
          ))}
        </div>

        {/* Scroll progress indicator */}
        {showScrollButtons && (
          <div className="flex justify-center mt-4 md:hidden px-4">
            <div className="relative w-full max-w-md">
              {/* Progress Bar Container */}
              <div 
                className="relative h-1.5 bg-gray-200 rounded-full overflow-hidden cursor-pointer"
                onClick={(e) => {
                  if (!scrollContainerRef.current) return;
                  
                  const rect = e.currentTarget.getBoundingClientRect();
                  const clickX = e.clientX - rect.left;
                  const percentage = clickX / rect.width;
                  
                  const maxScroll = scrollContainerRef.current.scrollWidth - scrollContainerRef.current.clientWidth;
                  const targetScroll = percentage * maxScroll;
                  
                  scrollContainerRef.current.scrollTo({
                    left: targetScroll,
                    behavior: 'smooth'
                  });
                }}
              >
                {/* Animated Progress */}
                <motion.div
                  className="absolute left-0 top-0 h-full bg-primary rounded-full"
                  animate={{ 
                    width: `${Math.min(
                      (scrollPosition / (scrollContainerRef.current?.scrollWidth || 1)) * 100,
                      100
                    )}%` 
                  }}
                  transition={{ type: "spring", stiffness: 150, damping: 20 }}
                />
              </div>
              
              {/* Progress Text */}
              <div className="flex justify-between mt-2 text-xs text-gray-500">
                <span>Scroll</span>
                <span className="font-medium">
                  {Math.round((scrollPosition / (scrollContainerRef.current?.scrollWidth || 1)) * 100)}%
                </span>
                <span>Explore</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}