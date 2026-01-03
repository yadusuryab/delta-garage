'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { IconChevronLeft, IconChevronRight, IconX } from '@tabler/icons-react';
import { cn } from '@/lib/utils';
import { motion } from "framer-motion";


// Define your slides in an array for easier management
const HERO_SLIDES = [
  {
    id: 1,
    image: '/nc.png', // Move to public folder for better optimization
   
  },
  
];

// Preload critical images

  


export default function Hero() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [showNotification, setShowNotification] = useState(true);
  const autoplayRef = useRef<NodeJS.Timeout>(null);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  // Auto-rotate slides
  useEffect(() => {
    if (isLoaded && HERO_SLIDES.length > 1) {
      autoplayRef.current = setInterval(() => {
        setCurrentSlide(prev => (prev + 1) % HERO_SLIDES.length);
      }, 5000);
    }
    
    return () => {
      if (autoplayRef.current) {
        clearInterval(autoplayRef.current);
      }
    };
  }, [isLoaded]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        goToSlide(currentSlide - 1);
      } else if (e.key === 'ArrowRight') {
        goToSlide(currentSlide + 1);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentSlide]);

  const goToSlide = (index: number) => {
    const slideCount = HERO_SLIDES.length;
    const newIndex = ((index % slideCount) + slideCount) % slideCount;
    setCurrentSlide(newIndex);
    
    // Reset autoplay timer
    if (autoplayRef.current) {
      clearInterval(autoplayRef.current);
    }
    autoplayRef.current = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % HERO_SLIDES.length);
    }, 5000);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    const swipeThreshold = 50;
    const diff = touchStartX.current - touchEndX.current;
    
    if (Math.abs(diff) > swipeThreshold) {
      if (diff > 0) {
        goToSlide(currentSlide + 1); // Swipe left
      } else {
        goToSlide(currentSlide - 1); // Swipe right
      }
    }
  };

  const handleImageLoad = () => {
    setIsLoaded(true);
  };

  // Add structured data for SEO
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "KSPYN Car Accessories",
    "description": "Premium automotive accessories and parts",
    "image": HERO_SLIDES.map(slide => slide.image),
    "mainEntity": {
      "@type": "Car",
      "brand": {
        "@type": "Brand",
        "name": "Various Premium Brands"
      }
    }
  };

  if (HERO_SLIDES.length === 0) {
    return (
      <div className="w-full h-[400px] md:h-[500px] bg-gradient-to-r from-gray-100 to-gray-200 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800">Deltagarage Auto Parts</h1>
          <p className="text-gray-600 mt-2">Premium Car Accessories</p>
        </div>
      </div>
    );
  }

  const currentHero = HERO_SLIDES[currentSlide];

  return (
    <>
      {/* Add structured data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <section 
        aria-label="Hero banner"
        className="relative w-full h-[400px] md:h-[500px]  lg:h-[600px] overflow-hidden"
        role="region"
      >
        {/* Notification Banner */}
        {/* {showNotification && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-30 w-[90%] max-w-2xl">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-3 rounded-lg shadow-lg flex items-center justify-between animate-slideDown">
              <div className="flex items-center gap-2 text-sm md:text-base">
                <span className="font-semibold">🚚 Free Shipping</span>
                <span className="hidden md:inline">on orders above ₹999</span>
                <span className="md:hidden">Above ₹999</span>
              </div>
              <button
                onClick={() => setShowNotification(false)}
                aria-label="Close notification"
                className="p-1 hover:bg-white/20 rounded-full transition-colors"
              >
                <IconX className="w-4 h-4" />
              </button>
            </div>
          </div>
        )} */}

        {/* Hero Image with Lazy Background */}
        <div className="absolute inset-0 m-4 ">
          <Image
            src={currentHero.image}
            alt={'currentHero.alt'}
            fill
            sizes="100vw"
            priority={currentSlide === 0}
            loading={currentSlide === 0 ? "eager" : "lazy"}
            quality={85}
            className="object-cover rounded-2xl "
            onLoad={handleImageLoad}
            placeholder="blur"
            blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwMCIgaGVpZ2h0PSI2MDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iIzFmMjgzNSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IiNmZmYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5LUFlOIEF1dG8gUGFydHM8L3RleHQ+PC9zdmc+"
          />
          
          {/* Progressive loading overlay */}
          {!isLoaded && (
            <div className="absolute inset-0 bg-gradient-to-r from-gray-900 to-gray-800 animate-pulse" />
          )}
        </div>

        {/* Gradient Overlay */}
        <div className={cn(
          "absolute inset-0 bg-gradient-to-t",
        )} />

        {/* Content */}
        <div className="relative z-10 h-full flex flex-col justify-center items-center text-center px-4 md:px-8">
          {/* <motion.div
            key={currentSlide}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="max-w-4xl"
          >
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-4 md:mb-6">
              {currentHero.title}
            </h1>
            
            <p className="text-lg md:text-2xl lg:text-3xl text-gray-200 mb-6 md:mb-8">
              {currentHero.subtitle}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <a
                href={currentHero.ctaLink}
                className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                aria-label={`${currentHero.ctaText} - ${currentHero.title}`}
              >
                {currentHero.ctaText}
              </a>
              
              <a
                href="/categories"
                className="px-8 py-3 bg-transparent border-2 border-white text-white hover:bg-white/10 font-semibold rounded-lg transition-all duration-300 transform hover:scale-105"
                aria-label="Browse all categories"
              >
                Browse Categories
              </a>
            </div>
          </motion.div> */}

          {/* Trust Indicators */}
          {/* <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex items-center gap-6 text-sm text-white/80">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span>Premium Quality</span>
            </div>
            <div className="hidden md:flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span>Free Shipping</span>
            </div>
            <div className="hidden lg:flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span>Easy Returns</span>
            </div>
          </div> */}
        </div>

        {/* Navigation Arrows (only if multiple slides) */}
        {HERO_SLIDES.length > 1 && (
          <>
            <button
              onClick={() => goToSlide(currentSlide - 1)}
              aria-label="Previous slide"
              className="absolute left-4 top-1/2 transform -translate-y-1/2 z-20 p-2 bg-black/30 hover:bg-black/50 text-white rounded-full transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-white"
            >
              <IconChevronLeft className="w-6 h-6" />
            </button>
            
            <button
              onClick={() => goToSlide(currentSlide + 1)}
              aria-label="Next slide"
              className="absolute right-4 top-1/2 transform -translate-y-1/2 z-20 p-2 bg-black/30 hover:bg-black/50 text-white rounded-full transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-white"
            >
              <IconChevronRight className="w-6 h-6" />
            </button>
          </>
        )}

        {/* Slide Indicators */}
        {HERO_SLIDES.length > 1 && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20 flex gap-2">
            {HERO_SLIDES.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                aria-label={`Go to slide ${index + 1}`}
                className={cn(
                  "w-2 h-2 rounded-full transition-all duration-300",
                  index === currentSlide 
                    ? "w-8 bg-white" 
                    : "bg-white/50 hover:bg-white/75"
                )}
              />
            ))}
          </div>
        )}

        {/* Performance metrics (hidden) */}
        <div className="sr-only" aria-live="polite">
          Slide {currentSlide + 1} of {HERO_SLIDES.length}
        </div>
      </section>

      <style jsx global>{`
        @keyframes slideDown {
          from {
            transform: translateY(-100%) translateX(-50%);
            opacity: 0;
          }
          to {
            transform: translateY(0) translateX(-50%);
            opacity: 1;
          }
        }
        
        .animate-slideDown {
          animation: slideDown 0.5s ease-out;
        }
      `}</style>
    </>
  );
}

// You'll also need to install framer-motion for animations
// npm install framer-motion

// And update your lib/utils.ts to include:
// import { type ClassValue, clsx } from "clsx"
// import { twMerge } from "tailwind-merge"
// 
// export function cn(...inputs: ClassValue[]) {
//   return twMerge(clsx(inputs))
// }