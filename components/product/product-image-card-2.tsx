"use client";
import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

export interface Product {
  _id: string;
  name: string;
  category: {
    name: string;
    slug: string;
  };
  material: string;
  waterResistance: string;
  movementType: string;
  caseSize: string;
  images: { asset: { url: string } }[];
  description: string;
  price: number;
  offerPrice?: number;
  soldOut: boolean;
}

export interface ProductCardProps {
  product: Product;
  className?: string;
  noLink?: boolean;
  onClick?: () => void;
  ybg?: boolean;
}

export default function ProductCard3({
  product,
  className = "",
  noLink = false,
  ybg = true,
  onClick,
}: ProductCardProps) {
  const { _id, name, category, images, price, offerPrice, soldOut } = product;
  const [isHovered, setIsHovered] = React.useState(false);



  const cardContent = (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ scale: 1.02 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onClick={noLink ? onClick : undefined}
      className={`${className} relative w-full overflow-hidden rounded-lg shadow-sm group`}
      style={{ aspectRatio: "3/4" }}
    >
      {/* Sold Out Overlay */}
      {soldOut && (
        <div className="absolute inset-0 bg-black bg-opacity-40 z-10 flex items-center justify-center">
          <span className="bg-white text-black px-3 py-1 rounded-full text-sm font-medium">
            Sold Out
          </span>
        </div>
      )}

      {/* Product Image with Zoom Effect */}
      <motion.div
        animate={{
          scale: isHovered ? 1.1 : 1.05, // Increased zoom on hover
        }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className={`absolute inset-0 ${soldOut ? "grayscale" : ""}`}
      >
        <Image
          src={images[0]?.asset.url || "/placeholder-image.jpg"}
          alt={name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition-opacity duration-300"
          priority={false}
          style={{ transform: isHovered ? 'scale(1.05)' : 'scale(1)' }} // Initial zoom
        />
      </motion.div>

      {/* Enhanced Gradient Overlay for Text Readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-90 group-hover:opacity-100 transition-opacity duration-300" />

      {/* Product Details - Positioned lower */}
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{
          y: isHovered ? 20 : 40, // Lower starting position
          opacity: isHovered ? 1 : 0.9
        }}
        transition={{ duration: 0.3 }}
        className="absolute bottom-0 left-0 right-0 p-5 text-white" // Increased padding
      >
        <h3 className="text-lg font-bold truncate">{name}</h3>
        <div className="flex items-center gap-2 mt-2">
          <span className="text-lg font-semibold">
            ₹{offerPrice || price}
          </span>
          {offerPrice && (
            <span className="text-sm line-through text-white/70">
              ₹{price}
            </span>
          )}
        </div>
        
        {/* Category Tag - Positioned lower */}
        <motion.span 
          className="inline-block mt-3 text-xs px-2 py-1 bg-white/20 backdrop-blur-sm rounded-full"
          initial={{ scale: 0 }}
          animate={{ scale: isHovered ? 1 : 0 }}
          transition={{ delay: 0.1 }}
        >
          {category.name}
        </motion.span>
      </motion.div>

      {/* Additional subtle shadow at the bottom for better text contrast */}
      <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-black/60 to-transparent" />
    </motion.div>
  );

  return noLink ? cardContent : (
    <Link href={`/p/${_id}`} className="block h-full">
      {cardContent}
    </Link>
  );
}