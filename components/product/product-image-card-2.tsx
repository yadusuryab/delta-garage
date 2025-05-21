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
  material?: string;
  waterResistance?: string;
  movementType?: string;
  caseSize?: string;
  images: { asset: { url: string } }[];
  description?: string;
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

  // Sanity image optimization query params
  const baseImageUrl = images[0]?.asset.url || "/placeholder-image.jpg";
  const optimizedImageUrl = `${baseImageUrl}?w=400&h=533&fit=crop&auto=format`;

  const cardContent = (
    <motion.div
      className={`${className} relative w-full overflow-hidden rounded-lg shadow-sm group cursor-pointer`}
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
      <Image
        src={optimizedImageUrl}
        alt={name}
        fill
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        className="object-cover"
        loading="lazy"
        priority={false}
        placeholder="blur"
        blurDataURL="/placeholder-image-blur.jpg" // you can replace this with your own small base64 img
      />

      {/* Gradient Overlay for readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-90" />

      {/* Product Details */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 p-5 text-white"
      >
        <h3 className="text-lg font-bold truncate">{name}</h3>
        <div className="flex items-center gap-2 mt-2">
          <span className="text-lg font-semibold">₹{offerPrice ?? price}</span>
          {offerPrice && (
            <span className="text-sm line-through text-white/70">₹{price}</span>
          )}
        </div>

        {/* Category Tag */}
        <span className="inline-block mt-3 text-xs px-2 py-1 bg-white/20 backdrop-blur-sm rounded-full">
          {category?.name || "deltagarage"}
        </span>
      </motion.div>

      {/* Bottom shadow gradient for better contrast */}
      <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-black/60 to-transparent" />
    </motion.div>
  );

  return noLink ? (
    cardContent
  ) : (
    <Link href={`/p/${_id}`} className="block h-full">
      {cardContent}
    </Link>
  );
}
