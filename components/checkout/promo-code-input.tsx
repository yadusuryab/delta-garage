"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Check, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface PromoCodeInputProps {
  promoCode: string;
  setPromoCode: (code: string) => void;
  appliedPromo: any;
  promoDiscount: number;
  isValidating: boolean;
  promoError: string;
  onApply: () => void;
  onRemove: () => void;
}

export function PromoCodeInput({
  promoCode,
  setPromoCode,
  appliedPromo,
  promoDiscount,
  isValidating,
  promoError,
  onApply,
  onRemove
}: PromoCodeInputProps) {
  const getDiscountText = () => {
    if (!appliedPromo) return "";
    
    switch (appliedPromo.discountType) {
      case 'percentage':
        return `${appliedPromo.discountValue}% OFF`;
      case 'fixed':
        return `₹${appliedPromo.discountValue} OFF`;
      case 'freeShipping':
        return 'FREE SHIPPING';
      default:
        return '';
    }
  };

  return (
    <div className="space-y-4">
      {!appliedPromo ? (
        <div className="flex gap-2">
          <Input
            placeholder="Enter promo code"
            value={promoCode}
            onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
            className="flex-1"
          />
          <Button 
            onClick={onApply} 
            disabled={isValidating || !promoCode.trim()}
          >
            {isValidating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Apply"
            )}
          </Button>
        </div>
      ) : (
        <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2">
            <Check className="h-5 w-5 text-green-600" />
            <div>
              <div className="font-bold text-green-800">{appliedPromo.code}</div>
              <div className="text-sm text-green-600">{getDiscountText()}</div>
            </div>
          </div>
          <Badge variant="secondary" className="ml-2">
            -₹{promoDiscount}
          </Badge>
          <Button
        
            size="icon"
            onClick={onRemove}
            className="ml-2"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
      
      {promoError && (
        <div className="text-sm text-red-600">{promoError}</div>
      )}
      
      {appliedPromo?.description && (
        <div className="text-sm text-gray-600 p-2 bg-gray-50 rounded">
          {appliedPromo.description}
        </div>
      )}
    </div>
  );
}