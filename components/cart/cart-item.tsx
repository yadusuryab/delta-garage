import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Trash2, Plus, Minus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

interface CartItemProps {
  item: {
    _id: string;
    name: string;  // Changed from 'name' to match your CartPage interface
    brand?: string;
    images: { asset: { url: string } }[];
    offerPrice?: number;
    price: number;
    quantity: number;
    compatibility?: string;
    features?: string[];
  };
  onRemove: () => void;
}

export default function CartItem({ item, onRemove }: any) {
  

  return (
    <div className="flex flex-col gap-2">
      {/* Main Product */}
      <div className="flex items-center w-full gap-4 rounded-lg border bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-950">
        {/* Product Image */}
        <div className="relative w-20 h-20 rounded-md overflow-hidden">
          {item.images && (
            <Link href={`/p/${item._id}`}>
              <Image
                src={item.images[0]?.asset.url || "/placeholder.svg"}
                alt={item.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 80px"
              />
            </Link>
          )}
        </div>

        {/* Product Details */}
        <div className="flex-1">
          <Link href={`/p/${item._id}`}>
            <h3 className="text-lg font-medium">{item.name}</h3>
          </Link>
          {item.brand && (
            <p className="text-sm text-muted-foreground">{item.brand}</p>
          )}
          {item.compatibility && (
            <Badge variant="outline" className="mt-1 text-xs">
              Compatible: {item.compatibility}
            </Badge>
          )}
        </div>

        {/* Quantity Controls */}
       
        {/* Price */}
        <div className="flex flex-col items-end min-w-[100px]">
          {item.offerPrice ? (
            <>
              <span className="font-medium">
                ₹{(item.offerPrice).toLocaleString('en-IN')}
              </span>
              <span className="text-sm text-muted-foreground line-through">
                ₹{(item.price).toLocaleString('en-IN')}
              </span>
            </>
          ) : (
            <span className="font-medium">
              ₹{(item.price).toLocaleString('en-IN')}
            </span>
          )}
        </div>

        {/* Remove Button */}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-destructive"
          onClick={onRemove}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      {/* Features List */}
      {item.features && item.features.length > 0 && (
        <div className="px-4 py-2 bg-muted/50 rounded-lg">
          <h4 className="text-sm font-medium mb-1">Key Features:</h4>
          <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1">
            {item.features.slice(0, 3).map((feature:any, index:any) => (
              <li key={index}>{feature}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}