import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Trash2, Plus, Minus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { motion } from "framer-motion";

interface CartItemProps {
  item: {
    _id: string;
    name: string;
    brand?: string;
    images: { asset: { url: string } }[] | { asset: { url: string } };
    offerPrice?: number;
    price: number;
    quantity: number;
    orderQuantity: number;
    compatibility?: string;
    features?: string[];
  };
  onRemove?: () => void;
  onQuantityChange?: (newQuantity: number) => void;
}

export default function CartItem({ item, onRemove, onQuantityChange }: CartItemProps) {
  const imageUrl = Array.isArray(item.images) 
    ? item.images[0]?.asset.url 
    : item.images?.asset.url;

  const handleDecrease = () => {
    if (item.orderQuantity > 1) {
      onQuantityChange?.(item.orderQuantity - 1);
    }
  };

  const handleIncrease = () => {
    if (item.orderQuantity < item.quantity) {
      onQuantityChange?.(item.orderQuantity + 1);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full"
    >
      <div className="flex flex-col gap-2 w-full">
        {/* Main Product Card */}
        <motion.div 
          whileHover={{ y: -2 }}
          className="flex flex-col sm:flex-row items-start w-full gap-4 rounded-lg border bg-white p-4 shadow-sm transition-all hover:shadow-md dark:border-gray-700 dark:bg-gray-950"
        >
          {/* Product Image */}
          <motion.div 
            whileTap={{ scale: 0.95 }}
            className="relative flex-shrink-0 w-full sm:w-24 h-24 rounded-md overflow-hidden"
          >
            <Link href={`/p/${item._id}`}>
              <Image
                src={imageUrl || "/placeholder.svg"}
                alt={item.name}
                fill
                className="object-cover hover:scale-105 transition-transform duration-300"
                sizes="(max-width: 640px) 100vw, 96px"
              />
            </Link>
          </motion.div>

          {/* Product Details */}
          <div className="flex-1 min-w-0 w-full">
            <div className="flex flex-col h-full justify-between gap-3">
              <div>
                <Link href={`/p/${item._id}`}>
                  <motion.h3 
                    whileHover={{ color: "#000" }}
                    className="text-lg font-medium line-clamp-2 hover:underline"
                  >
                    {item.name}
                  </motion.h3>
                </Link>
                
                <div className="flex flex-wrap items-center gap-2 mt-1">
                  {item.brand && (
                    <motion.p 
                      whileHover={{ scale: 1.02 }}
                      className="text-sm text-muted-foreground"
                    >
                      {item.brand}
                    </motion.p>
                  )}
                  {item.compatibility && (
                    <Badge 
                      variant="outline" 
                      className="text-xs hover:bg-accent"
                    >
                      Compatible: {item.compatibility}
                    </Badge>
                  )}
                </div>
              </div>

              {item.features && item.features.length > 0 && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  className="overflow-hidden"
                >
                  <h4 className="text-sm font-medium mb-1">Key Features:</h4>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    {item.features.slice(0, 2).map((feature, index) => (
                      <motion.li 
                        key={index}
                        initial={{ x: -10, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-start gap-1"
                      >
                        <span>•</span>
                        <span className="line-clamp-2">{feature}</span>
                      </motion.li>
                    ))}
                  </ul>
                </motion.div>
              )}
            </div>
          </div>

          {/* Price, Quantity, and Actions */}
          <div className="flex sm:flex-col items-end sm:items-center justify-between gap-4 w-full sm:w-auto">
            {/* Price */}
            <motion.div 
              layout
              className="text-right sm:text-center min-w-[100px]"
            >
              {item.offerPrice ? (
                <>
                  <motion.p className="font-medium whitespace-nowrap">
                    ₹{(item.offerPrice * item.orderQuantity).toLocaleString('en-IN')}
                  </motion.p>
                  <motion.p 
                    className="text-sm text-muted-foreground line-through whitespace-nowrap"
                    initial={{ opacity: 0.7 }}
                    whileHover={{ opacity: 1 }}
                  >
                    ₹{(item.price * item.orderQuantity).toLocaleString('en-IN')}
                  </motion.p>
                </>
              ) : (
                <motion.p className="font-medium whitespace-nowrap">
                  ₹{(item.price * item.orderQuantity).toLocaleString('en-IN')}
                </motion.p>
              )}
            </motion.div>

            {/* Quantity Selector */}
            <motion.div 
              layout
              className="flex items-center gap-2 sm:gap-1"
            >
              <motion.button
                whileTap={{ scale: 0.9 }}
                whileHover={{ scale: 1.05, backgroundColor: "#f3f4f6" }}
                className="p-2 rounded-full"
                onClick={handleDecrease}
                disabled={item.orderQuantity <= 1}
              >
                <Minus className="h-3 w-3 sm:h-4 sm:w-4" />
              </motion.button>
              
              <motion.span 
                key={item.orderQuantity}
                initial={{ scale: 1.2 }}
                animate={{ scale: 1 }}
                className="text-sm w-6 text-center"
              >
                {item.orderQuantity}
              </motion.span>
              
              <motion.button
                whileTap={{ scale: 0.9 }}
                whileHover={{ scale: 1.05, backgroundColor: "#f3f4f6" }}
                className="p-2 rounded-full"
                onClick={handleIncrease}
                disabled={item.orderQuantity >= item.quantity}
              >
                <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
              </motion.button>
            </motion.div>

            {/* Remove Button */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onRemove}
              className="text-destructive p-2 rounded-full hover:bg-red-50"
              aria-label="Remove item"
            >
              <Trash2 className="h-4 w-4" />
            </motion.button>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}