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
import SkeletonCategory from "./SkeletonCategory";

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

  // Preload next chunk when user approaches end
  const LOAD_THRESHOLD = 100; // pixels from end

  // Fetch with proper error handling and caching
  const fetchCategories = useCallback(async () => {
    const cacheKey = "kspyn_categories_v2";
    const cacheTimestampKey = "kspyn_categories_timestamp";
    const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes
    
    try {
      // Check cache first
      const cached = localStorage.getItem(cacheKey);
      const timestamp = localStorage.getItem(cacheTimestampKey);
      
      if (cached && timestamp) {
        const isStale = Date.now() - parseInt(timestamp) > CACHE_DURATION;
        
        if (!isStale) {
          const data = JSON.parse(cached);
          setCategories(data);
          setLoading(false);
          
          // Refresh in background if stale
          if (isStale) {
            setTimeout(() => fetchCategories(), 0);
          }
          return;
        }
      }

      const data = await getAllCategories();
      
      if (!data || !Array.isArray(data)) {
        throw new Error("Invalid categories data");
      }

      // Optimize image data - strip unnecessary metadata
      const optimizedData = data.map(category => ({
        _id: category._id,
        name: category.name || 'Unknown Category',
        slug: category.slug?.current || 'uncategorized',
        description: `Explore our premium ${category.name || 'car'} accessories collection`,
        imageUrl: category.image?.asset?.url || null,
        imageDimensions: category.image?.asset?.metadata?.dimensions || null
      }));

      // Cache optimized data
      localStorage.setItem(cacheKey, JSON.stringify(optimizedData));
      localStorage.setItem(cacheTimestampKey, Date.now().toString());
      
      setCategories(optimizedData);
      
      // Preload category images in background
      setTimeout(() => {
        optimizedData.forEach(cat => {
          if (cat.imageUrl) {
            const img = new window.Image();
            img.src = cat.imageUrl;
          }
        });
      }, 0);
      
    } catch (err) {
      console.error('Category fetch error:', err);
      toast.error("Failed to load categories. Showing cached data if available.");
      
      // Try to use any cached data even if stale
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        try {
          setCategories(JSON.parse(cached));
        } catch (e) {
          setCategories([]);
        }
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
    
    // Cleanup
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

  // Memoized category features for performance
  const categoryFeatures = useMemo(() => 
    categories.map((category) => ({
      id: category._id,
      title: category.name,
      description: category.description,
      icon: CATEGORY_ICONS[category.name] || <IconCar aria-label="Car Accessories Icon" />,
      slug: category.slug,
      imageUrl: category.imageUrl,
      imageDimensions: category.imageDimensions,
      // Generate SEO-friendly alt text
      alt: `${category.name} car accessories | Premium auto parts`
    }))
  , [categories]);

  // Loading state
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 mt-5">
        <div className="flex overflow-x-hidden gap-4 pb-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonCategory key={i} />
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
      {/* SEO Heading (hidden visually but accessible) */}
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
              prefetch={index < 3} // Prefetch first 3 categories
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
                {/* Background Image with Lazy Loading */}
                {feature.imageUrl ? (
                  <div className="absolute inset-0">
                    <Image
                      src={feature.imageUrl}
                      alt={feature.alt}
                      fill
                      sizes="(max-width: 768px) 280px, 300px"
                      className="object-cover"
                      loading={index > 2 ? "lazy" : "eager"}
                      priority={index < 3}
                      quality={75}
                      placeholder="blur"
                      blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjFmMWYxIi8+PC9zdmc+"
                    />
                  </div>
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900" />
                )}

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

                {/* Content */}
                <div className="relative z-10 h-full p-6 flex flex-col justify-end">
                  <div className="flex items-center gap-3 mb-3">
                    <div className={cn(
                      "p-2 rounded-lg",
                      "bg-white/20 backdrop-blur-sm",
                      "group-hover/category:bg-blue-500/30",
                      "transition-colors duration-200"
                    )}>
                      <div className="text-white">
                        {feature.icon}
                      </div>
                    </div>
                    
                    {index < 3 && (
                      <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-blue-500/20 backdrop-blur-sm">
                        <IconSparkles className="w-3 h-3 text-blue-300" />
                        <span className="text-xs font-semibold text-blue-100">Popular</span>
                      </div>
                    )}
                  </div>

                  <h3 className="text-xl font-bold text-white mb-2 line-clamp-1">
                    {feature.title}
                  </h3>
                  
                  {/* <p className="text-sm text-gray-200 line-clamp-2">
                    {feature.description}
                  </p> */}

                  {/* Hidden SEO content */}
                  <div className="sr-only">
                    Shop {feature.title} accessories for your vehicle. Premium quality auto parts.
                  </div>
                </div>

                {/* Hover effect */}
                <div className={cn(
                  "absolute inset-0",
                  "bg-gradient-to-t from-blue-500/10 to-transparent",
                  "opacity-0 group-hover/category:opacity-100",
                  "transition-opacity duration-200"
                )} />
              </motion.div>
            </Link>
          ))}
        </div>

        {/* Scroll indicator dots (for mobile) */}
        {showScrollButtons && (
  <div className="flex justify-center mt-4 md:hidden px-4">
    <div className="relative w-full max-w-md">
      {/* Progress Bar Container */}
      <div 
        className="relative h-1.5 bg-secondary/20 rounded-full overflow-hidden cursor-pointer"
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
        {/* Static Track */}
        <div className="absolute inset-0" />
        
        {/* Animated Progress */}
        <motion.div
          className="absolute left-0 top-0 h-full bg-gradient-to-r from-primary via-primary/90 to-primary/80 rounded-full"
          initial={{ width: "0%" }}
          animate={{ 
            width: `${Math.min(
              (scrollPosition / (scrollContainerRef.current?.scrollWidth || 1)) * 100,
              100
            )}%` 
          }}
          transition={{ type: "spring", stiffness: 150, damping: 20 }}
        />
        
        {/* Draggable Handle */}
        <motion.div
          className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white border-2 border-primary rounded-full shadow-md cursor-grab active:cursor-grabbing"
          style={{ 
            left: `${Math.min(
              (scrollPosition / (scrollContainerRef.current?.scrollWidth || 1)) * 100,
              100
            )}%` 
          }}
          drag="x"
          dragConstraints={{ left: 0, right: 100 }}
          dragElastic={0}
          onDrag={(_, info) => {
            if (!scrollContainerRef.current) return;
            
            const containerWidth = scrollContainerRef.current.clientWidth;
            const percentage = (info.point.x - containerWidth / 2) / containerWidth;
            
            const maxScroll = scrollContainerRef.current.scrollWidth - containerWidth;
            const targetScroll = percentage * maxScroll;
            
            scrollContainerRef.current.scrollLeft = targetScroll;
          }}
        />
      </div>
      
      {/* Progress Text */}
      <div className="flex justify-between mt-2 text-xs text-muted-foreground">
        <span>Start</span>
        <span className="font-medium">
          {Math.round((scrollPosition / (scrollContainerRef.current?.scrollWidth || 1)) * 100)}%
        </span>
        <span>End</span>
      </div>
    </div>
  </div>
)}
      </div>
    </section>
  );
}