"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Trash2, Plus, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface CartItemProps {
  item: {
    _id: string;
    name: string;
    images: { asset: { url: string } }[];
    offerPrice?: number;
    price: number;
    orderQuantity: number;
  };
  onRemove: () => void;
  onQuantityChange: (quantity: number) => void;
}

export default function CartItem({ item, onRemove, onQuantityChange }: CartItemProps) {
  const imageUrl = item.images?.[0]?.asset?.url || "/placeholder.svg";
  const displayPrice = item.offerPrice || item.price;
  const totalPrice = displayPrice * item.orderQuantity;

  const handleDecrease = () => onQuantityChange(item.orderQuantity - 1);
  const handleIncrease = () => onQuantityChange(item.orderQuantity + 1);

  return (
    <div className="flex items-center gap-4 p-4 border-b">
      {/* Product Image */}
      <Link href={`/p/${item._id}`} className="flex-shrink-0">
        <div className="relative w-16 h-16 rounded overflow-hidden">
          <Image
            src={imageUrl}
            alt={item.name}
            fill
            className="object-cover"
            sizes="64px"
          />
        </div>
      </Link>

      {/* Product Details */}
      <div className="flex-1 min-w-0">
        <Link href={`/p/${item._id}`}>
          <h3 className="font-medium text-sm line-clamp-2 hover:underline">
            {item.name}
          </h3>
        </Link>
        
        <div className="flex items-center justify-between mt-2">
          {/* Quantity */}
          <div className="flex items-center border rounded">
            <button
              onClick={handleDecrease}
              disabled={item.orderQuantity <= 1}
              className="p-1 px-2 hover:bg-gray-50 disabled:opacity-30"
            >
              <Minus className="w-3 h-3" />
            </button>
            
            <span className="px-3 text-sm">{item.orderQuantity}</span>
            
            <button
              onClick={handleIncrease}
              className="p-1 px-2 hover:bg-gray-50"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>
          
          {/* Price */}
          <div className="font-medium">
            ₹{totalPrice.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Remove Button */}
      <button
        onClick={onRemove}
        className="text-gray-400 hover:text-red-500 transition-colors"
        aria-label="Remove item"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}