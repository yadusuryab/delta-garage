"use client";
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ShoppingBag, Percent, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Product {
  _id: string;
  name: string;
  category?: {
    name: string;
    slug: string;
  };
  brand?: string;
  images: { asset: { url: string; metadata?: { lqip?: string } } }[];
  price: number;
  offerPrice?: number;
  soldOut?: boolean;
  isNew?: boolean;
  isBestSeller?: boolean;
  rating?: number;
}

export interface ProductCardProps {
  product: Product;
  className?: string;
  noLink?: boolean;
  onClick?: () => void;
  compact?: boolean;
  showCategory?: boolean;
  priority?: boolean;
}

// Sanity image URL builder
const buildSanityImageUrl = (
  imageUrl: string,
  width: number = 600,
  height: number = 660,
  quality: number = 85
): string => {
  if (!imageUrl || !imageUrl.includes('cdn.sanity.io')) {
    return imageUrl || '/placeholder-product.jpg';
  }
  
  const baseUrl = imageUrl.split('?')[0];
  const params = new URLSearchParams({
    w: width.toString(),
    h: height.toString(),
    fit: 'crop',
    auto: 'format',
    q: quality.toString(),
  });
  
  return `${baseUrl}?${params.toString()}`;
};

export default function ProductCard({ 
  product,
  className = "",
  noLink = false,
  compact = false,
  showCategory = false,
  priority = false,
  onClick,
}: ProductCardProps) {
  const {
    _id,
    name,
    category,
    images,
    price,
    offerPrice,
    soldOut = false,
    isNew = false,
    isBestSeller = false,
    brand,
  } = product;

  const [imageLoaded, setImageLoaded] = React.useState(false);
  const [imageError, setImageError] = React.useState(false);

  // Get first image
  const firstImage = React.useMemo(() => {
    if (!images || !Array.isArray(images)) return null;
    return images[0];
  }, [images]);

  const baseImageUrl = React.useMemo(() => {
    if (!firstImage?.asset?.url) return '/placeholder-product.jpg';
    return firstImage.asset.url;
  }, [firstImage]);

  const lqip = React.useMemo(() => {
    if (firstImage?.asset?.metadata?.lqip) {
      return firstImage.asset.metadata.lqip;
    }
    
    const colors = ['#f8f8f8', '#f0f0f0', '#e8e8e8', '#f5f5f5'];
    const colorIndex = (_id?.charCodeAt?.(0) || 0) % colors.length;
    const color = colors[colorIndex];
    
    return `data:image/svg+xml;base64,${btoa(
      `<svg width="600" height="660" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="${color}"/></svg>`
    )}`;
  }, [firstImage, _id]);

  const discount = React.useMemo(() => 
    offerPrice ? Math.round(((price - offerPrice) / price) * 100) : 0, 
    [price, offerPrice]
  );

  const displayPrice = offerPrice || price;
  const displayTitle = name?.substring(0, 60) + (name?.length > 60 ? "..." : "");

  // Optimized image URL
  const optimizedImageUrl = React.useMemo(() => {
    if (!baseImageUrl || baseImageUrl === '/placeholder-product.jpg') {
      return baseImageUrl;
    }
    
    return buildSanityImageUrl(
      baseImageUrl,
      compact ? 400 : 600,
      compact ? 440 : 660,
      85
    );
  }, [baseImageUrl, compact]);

  // Event handlers
  const handleAddToCart = React.useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    window.dispatchEvent(new CustomEvent('addToCart', {
      detail: { 
        productId: _id, 
        name, 
        price: displayPrice, 
        image: baseImageUrl 
      }
    }));
  }, [_id, name, displayPrice, baseImageUrl]);

  const handleImageLoad = React.useCallback(() => {
    setImageLoaded(true);
    setImageError(false);
  }, []);

  const handleImageError = React.useCallback(() => {
    setImageError(true);
  }, []);

  // Card content
  const cardContent = (
    <motion.div 
      className={cn(
        "group flex flex-col rounded-xl bg-secondary relative",
        className
      )}
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      onClick={onClick}
      role="article"
      aria-label={`Product: ${name}`}
    >
      {/* Product Image Container */}
      <div className={cn(
        "relative  rounded-t-xl w-full overflow-hidden",
        compact ? "aspect-square" : "aspect-[1/1.1]"
      )}>
        {/* Placeholder */}
        {!imageLoaded && !imageError && (
          <div 
            className="absolute inset-0"
            style={{ 
              backgroundImage: `url(${lqip})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundColor: '#f8f8f8'
            }}
          />
        )}

        {/* Error State */}
        {imageError && (
          <div className="absolute inset-0 flex items-center justify-center bg-secondary rounded-xl">
            <div className="text-center p-4">
              <div className="w-12 h-12 mx-auto bg-gray-300 rounded-full mb-2" />
              <p className="text-xs text-gray-500">Image not available</p>
            </div>
          </div>
        )}

        {/* Main Image */}
        {!imageError && (
          <Image
            src={optimizedImageUrl}
            alt={name}
            fill
            sizes={`(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw`}
            className={cn(
              "w-full h-full object-cover transition-all duration-700",
              imageLoaded ? "opacity-100" : "opacity-0",
              "group-hover:scale-[1.02]"
            )}
            loading={priority ? "eager" : "lazy"}
            priority={priority}
            quality={85}
            placeholder="blur"
            blurDataURL={lqip}
            onLoad={handleImageLoad}
            onError={handleImageError}
            unoptimized={!optimizedImageUrl.includes('cdn.sanity.io')}
          />
        )}
        
        {/* Status Badges - Top Left */}
        <div className="absolute top-3 left-3 flex flex-col items-start gap-1 z-10">
          {isNew && !soldOut && (
            <div className="font-sans uppercase tracking-widest text-xs text-secondary-foreground font-medium px-2 py-1 bg-secondary/95 backdrop-blur-sm">
              New
            </div>
          )}
          {isBestSeller && !soldOut && (
            <div className="font-sans uppercase tracking-widest text-xs text-secondary-foreground font-medium px-2 py-1 bg-secondary/95 backdrop-blur-sm">
              Best Seller
            </div>
          )}
          {discount > 0 && !soldOut && (
            <div className="font-sans uppercase tracking-widest text-xs text-red-600 font-medium px-2 py-1 bg-secondary/95 backdrop-blur-sm flex items-center gap-1">
              <Percent className="w-3 h-3" />
              {discount}% OFF
            </div>
          )}
          {soldOut && (
            <div className="font-sans uppercase tracking-widest text-xs text-secondary font-medium px-3 py-1 bg-secondary-foreground/90 backdrop-blur-sm">
              Sold Out
            </div>
          )}
        </div>

        {/* Brand Badge - Top Right */}
        {brand && !soldOut && (
          <div className="absolute top-3 right-3 z-10">
            <div className="font-sans uppercase tracking-widest text-[10px] text-gray-600 font-medium px-2 py-1 bg-secondary/95 backdrop-blur-sm">
              {brand}
            </div>
          </div>
        )}

        {/* Quick Add to Cart - Bottom Center */}
        {!soldOut && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10">
            <motion.button
              onClick={handleAddToCart}
              aria-label={`Add ${name} to cart`}
              className={cn(
                "font-sans uppercase tracking-widest text-xs text-secondary-foreground font-medium bg-secondary px-4 py-2",
                "opacity-0 group-hover:opacity-100 transition-all duration-300",
                "flex items-center gap-2 shadow-sm hover:shadow-md"
              )}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ShoppingBag className="w-3 h-3" />
              Add to Cart
            </motion.button>
          </div>
        )}

        {/* Quick View Overlay */}
        {!soldOut && (
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-all duration-300" />
        )}
      </div>

      {/* Product Info */}
      <div className="flex flex-col flex-grow p-3">
        {/* Category - optional */}
        {showCategory && category?.name && (
          <p className="font-sans uppercase  text-[10px] text-gray-500 mb-1">
            {category.name}
          </p>
        )}

        {/* Product Name */}
        <h3 className="font-sans uppercase  text-sm text-secondary-foreground font-semibold tracking-tight leading-tight mb-2 line-clamp-2 min-h-[2.5rem]">
          {displayTitle}
        </h3>

        {/* Price Section */}
        <div className="flex items-center gap-2 mt-auto">
          {offerPrice && offerPrice < price ? (
            <>
              <span className="font-sans text-sm text-secondary-foreground font-medium">
                ₹{offerPrice.toLocaleString()}
              </span>
              <span className="font-sans text-xs text-gray-400 line-through font-medium">
                ₹{price.toLocaleString()}
              </span>
            </>
          ) : (
            <span className="font-sans text-sm text-secondary-foreground font-bold">
              ₹{price.toLocaleString()}
            </span>
          )}
          
          {/* Express Delivery Badge */}
          
        </div>
      </div>

      {/* SEO hidden content */}
      <div className="sr-only">
        <span>Product ID: {_id}</span>
        {category?.name && <span>Category: {category.name}</span>}
        <span>Price: ₹{price}</span>
        {offerPrice && <span>Discounted Price: ₹{offerPrice}</span>}
      </div>
    </motion.div>
  );

  // Return with or without link
  if (noLink) {
    return cardContent;
  }

  return (
    <Link 
      href={`/p/${_id}`}
      className="block h-full"
      prefetch={priority}
      aria-label={`View details for ${name}`}
    >
      {cardContent}
    </Link>
  );
}

// Memoize component for performance
export const MemoizedProductCard = React.memo(ProductCard);