import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Trash2, Plus, Minus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

interface CartItemProps {
  item: {
    _id: string;
    name: string;
    brand?: string;
    images: { asset: { url: string } }[] | { asset: { url: string } };
    offerPrice?: number;
    price: number;
    quantity: number;
    compatibility?: string;
    features?: string[];
  };
  onRemove: () => void;
}

export default function CartItem({ item, onRemove }: CartItemProps) {
  // Handle both array and single image cases
  const imageUrl = Array.isArray(item.images) 
    ? item.images[0]?.asset.url 
    : item.images?.asset.url;

  return (
    <div className="flex flex-col gap-2 w-full">
      {/* Main Product */}
      <div className="flex items-start w-full gap-4 rounded-lg border bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-950">
        {/* Product Image */}
        <div className="relative flex-shrink-0 w-20 h-20 rounded-md overflow-hidden">
          <Link href={`/p/${item._id}`}>
            <Image
              src={imageUrl || "/placeholder.svg"}
              alt={item.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 80px"
            />
          </Link>
        </div>

        {/* Product Details - Flex container that can grow and shrink */}
        <div className="flex-1 min-w-0"> {/* min-w-0 prevents flex item overflow */}
          <div className="flex flex-col h-full justify-between">
            <div>
              <Link href={`/p/${item._id}`}>
                <h3 className="text-lg font-medium truncate">{item.name}</h3>
              </Link>
              {item.brand && (
                <p className="text-sm text-muted-foreground truncate">{item.brand}</p>
              )}
              {item.compatibility && (
                <Badge variant="outline" className="mt-1 text-xs">
                  Compatible: {item.compatibility}
                </Badge>
              )}
            </div>

            {/* Features List - Only show if features exist */}
            {item.features && item.features.length > 0 && (
              <div className="mt-2">
                <h4 className="text-sm font-medium mb-1">Key Features:</h4>
                <ul className="text-xs text-muted-foreground list-disc pl-5 space-y-1">
                  {item.features.slice(0, 2).map((feature, index) => (
                    <li key={index} className="truncate">{feature}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Price and Remove Button - Flex column on the right */}
        <div className="flex flex-col items-end justify-between h-full gap-2">
          <div className="text-right min-w-[80px]">
            {item.offerPrice ? (
              <>
                <span className="font-medium whitespace-nowrap">
                  ₹{item.offerPrice.toLocaleString('en-IN')}
                </span>
                <span className="text-sm text-muted-foreground line-through whitespace-nowrap">
                  ₹{item.price.toLocaleString('en-IN')}
                </span>
              </>
            ) : (
              <span className="font-medium whitespace-nowrap">
                ₹{item.price.toLocaleString('en-IN')}
              </span>
            )}
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive"
            onClick={onRemove}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}