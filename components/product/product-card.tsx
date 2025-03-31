"use client";
import * as React from "react";
import Image from "next/image";
import { Eye, Gift } from "lucide-react";
import Link from "next/link";

import { isProductInCart } from "@/lib/cart";
import { Badge } from "../ui/badge";

export interface Product {
  _id: string;
  name: string; // Updated from productName to name
  category: {
    name: string;
    slug: {
      current: string;
    };
  }; // Updated to match categorySchema
  material: string; // Updated from shoeBrand to material
  waterResistance: string;
  movementType: string;
  caseSize: number;
  images: { asset: { url: string } }[];
  description: string;
  price: number;
  offerPrice?: number; // Updated from isOffer to offerPrice
}

export interface ProductCardProps {
  product: Product;
  className?: string;
  noLink?: boolean; // New option to disable linking
  onClick?: () => void; // Optional click handler for `noLink`
}

export default function ProductCard({
  product,
  className = "",
  noLink = true,
  onClick,
}: ProductCardProps) {
  const {
    _id,
    name,
    category,
    material,
    waterResistance,
    movementType,
    caseSize,
    images,
    offerPrice,
    price,
  } = product;
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
      className={`w-full border h-[500px] overflow-hidden group relative rounded-lg cursor-pointer ${className}`}
      onClick={noLink ? onClick : undefined} // Prevent navigation when `noLink` is true
    >
      {/* Product Image */}
      <div className="absolute inset-0 w-full h-full">
        <Image
          alt={name}
          src={images[0]?.asset.url || "/placeholder-image.jpg"}
          layout="fill"
          objectFit="cover"
          className="transition-transform transform group-hover:scale-110"
        />
      </div>

      {/* Overlay for Product Details */}
      <div className="absolute border top-2 left-2 right-2 rounded-md p-4 bg-background">
        <h2 className="text-lg font-semibold">{name.toUpperCase()}</h2>

        {/* Product Details */}
        <p className="text-xs text-muted-foreground">
          Material: {material} • Water Resistance: {waterResistance}
        </p>
        <p className="text-xs text-muted-foreground">
          Movement: {movementType} • Case Size: {caseSize}mm
        </p>
      </div>

      <div className="absolute bottom-2 left-2 right-2">
        {/* Product Details Link */}
        <Link href={`/p/${_id}`}>
          <Badge variant={"secondary"}>
            <Eye size={15} className="mr-1" />
            Details
          </Badge>
        </Link>

        {/* Category and Offer Badges */}
        <div className="flex items-center gap-1 my-1">
          <Badge variant="secondary">
            <span className="font-bold text-primary uppercase">
              {category.name} &nbsp;
            </span>
          </Badge>

          {offerPrice && (
            <Badge>
              <Gift size={15} className="mr-1" />
              Special Offer!
            </Badge>
          )}
        </div>

        {/* Price Section */}
        <div className="rounded-md p-2 border bg-background">
          <div className="flex justify-between items-center">
            <div className="flex items-center font-bold text-sm">
              {offerPrice ? (
                <div>
                  <span className="text-lg font-extrabold">
                    ₹{new Intl.NumberFormat("en-IN").format(offerPrice)}
                  </span>
                  <span className="text-sm font-extrabold ml-2 text-muted-foreground line-through">
                    ₹{new Intl.NumberFormat("en-IN").format(price)}
                  </span>
                  <span className="text-sm font-bold text-green-600 ml-2">
                    {Math.round(((price - offerPrice) / price) * 100)}% OFF
                  </span>
                </div>
              ) : (
                <span className="text-xl font-extrabold">
                  ₹{new Intl.NumberFormat("en-IN").format(price)}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return !noLink ? cardContent : <Link href={`/p/${_id}`}>{cardContent}</Link>;
}