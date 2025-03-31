"use client";
import * as React from "react";
import Image from "next/image";
import Link from "next/link";

import { isProductInCart } from "@/lib/cart";
import ImageCard from "../ui/image-card";
import AddToCartButton from "../cart/cart-buttons/add-to-cart";
import { Button } from "../ui/button";

export interface Product {
  _id: string;
  name: string; // Updated from productName to name
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
  offerPrice?: number; // Optional offer price
  soldOut: boolean; // Add soldOut field
}

export interface ProductCardProps {
  product: Product;
  className?: string;
  noLink?: boolean; // New option to disable linking
  onClick?: () => void; // Optional click handler for `noLink`
  ybg?: boolean; // Optional background styling
}

export default function ProductCard2({
  product,
  className = "",
  noLink = false,
  ybg = true,
  onClick,
}: ProductCardProps) {
  const { _id, name, category, images, price, offerPrice, soldOut } = product;
  const [isInCart, setIsInCart] = React.useState(false);

  // Check if the product is already in the cart on mount
  React.useEffect(() => {
    setIsInCart(isProductInCart(_id));

    const handleCartUpdate = () => {
      setIsInCart(isProductInCart(_id));
    };

    window.addEventListener("cartUpdated", handleCartUpdate);
    return () => window.removeEventListener("cartUpdated", handleCartUpdate);
  }, [_id]);

  const cardContent = (
    <div
      onClick={noLink ? onClick : undefined}
      className={`max-w-52 ${className} p-2 w-full rounded-xl relative bg-secondary`} // Add relative positioning
      style={{ cursor: "pointer" }} // Add pointer cursor if noLink is true
    >
      {/* Sold Out Badge */}
      {soldOut && (
        <div className="absolute top-2 right-2 bg-red-600 text-white text-xs px-2 py-1 rounded-full z-10">
          Sold Out
        </div>
      )}

      {/* Product Image Container */}
      <div className={`relative aspect-square h-44  ${soldOut ? "grayscale" : ""}`}>
        <Image
          className="object-cover rounded-xl"
          src={images[0]?.asset.url || "/placeholder-image.jpg"}
          alt={name}
          fill // Fill the container
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 40vw" // Responsive sizes
          priority={false} // Lazy load by default
        />
      </div>

      {/* Product Details */}
      <div className="font-semibold mt-2 text-sm grid gap-0">
        <h2 className="font-bold mb-0">{name}</h2>
        <p className="text-muted-foreground mt-0">{category.name}</p>
        <p className="text-lg">₹ {offerPrice || price} {offerPrice && <span className="line-through text-muted-foreground ">₹{price}</span>}</p>

        {/* Disable Add to Cart button if sold out */}
        {!soldOut ? (
          <AddToCartButton product={product} />
        ) : (
          <Button className="w-full rounded-sm" disabled>
            Sold Out
          </Button>
        )}
      </div>
    </div>
  );

  return noLink ? cardContent : <Link href={`/p/${_id}`}>{cardContent}</Link>;
}