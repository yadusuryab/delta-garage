"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Check, X, Info, Tag, ChevronDown, ChevronUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";

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
  const [showInstructions, setShowInstructions] = useState(false);

  const getDiscountText = () => {
    if (!appliedPromo) return "";
    
    switch (appliedPromo.discountType) {
      case 'percentage':
        return `${appliedPromo.discountValue}% discount applied`;
      case 'fixed':
        return `₹${appliedPromo.discountValue} discount applied`;
      case 'freeShipping':
        return 'Free shipping applied';
      default:
        return 'Discount applied';
    }
  };

  const getDiscountTypeIcon = () => {
    if (!appliedPromo) return <Tag className="h-4 w-4" />;
    
    switch (appliedPromo.discountType) {
      case 'freeShipping':
        return "🚚";
      case 'percentage':
        return "📊";
      case 'fixed':
        return "💰";
      default:
        return "🎁";
    }
  };

  // const renderInstructions = () => (
  //   <Card className="mt-4 border-dashed">
  //     <CardContent className="pt-4">
  //       <div className="space-y-3">
  //         <div className="flex items-center justify-between">
  //           <h4 className="font-semibold flex items-center gap-2">
  //             <Info className="h-4 w-4" />
  //             About Promo Codes
  //           </h4>
  //           <Button
  //             variant="ghost"
  //             size="sm"
  //             onClick={() => setShowInstructions(!showInstructions)}
  //             className="h-8"
  //           >
  //             {showInstructions ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
  //           </Button>
  //         </div>
          
  //         {showInstructions && (
  //           <div className="space-y-3 text-sm text-muted-foreground">
  //             <p>
  //               Promo codes help you save money on your order. Here's what you need to know:
  //             </p>
              
  //             <div className="space-y-2">
  //               <div className="flex items-start gap-2">
  //                 <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center mt-0.5">
  //                   <span className="text-xs">1</span>
  //                 </div>
  //                 <div>
  //                   <p className="font-medium text-foreground">Where to find promo codes?</p>
  //                   <p className="text-xs">
  //                     Check our newsletter, social media pages, or product pages for available codes
  //                   </p>
  //                 </div>
  //               </div>
                
  //               <div className="flex items-start gap-2">
  //                 <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center mt-0.5">
  //                   <span className="text-xs">2</span>
  //                 </div>
  //                 <div>
  //                   <p className="font-medium text-foreground">How to apply?</p>
  //                   <p className="text-xs">
  //                     Enter the code exactly as shown (case sensitive) and click Apply
  //                   </p>
  //                 </div>
  //               </div>
                
  //               <div className="flex items-start gap-2">
  //                 <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center mt-0.5">
  //                   <span className="text-xs">3</span>
  //                 </div>
  //                 <div>
  //                   <p className="font-medium text-foreground">Common issues</p>
  //                   <p className="text-xs">
  //                     Codes may have minimum order value, expiry dates, or product restrictions
  //                   </p>
  //                 </div>
  //               </div>
  //             </div>
              
  //             <Separator />
              
  //             <div className="bg-amber-50 border border-amber-200 rounded p-3">
  //               <p className="text-sm font-medium text-amber-800">
  //                 Don't have a promo code?
  //               </p>
  //               <p className="text-xs text-amber-700 mt-1">
  //                 No worries! You can still proceed with your order. Subscribe to our newsletter for future discounts.
  //               </p>
  //             </div>
  //           </div>
  //         )}
  //       </div>
  //     </CardContent>
  //   </Card>
  // );

  return (
    <div className="space-y-4">
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold flex items-center gap-2">
            <Tag className="h-4 w-4" />
            Apply Promo Code
          </h3>
          {!appliedPromo && (
            <Badge variant="outline" className="text-xs">
              Optional
            </Badge>
          )}
        </div>
        
        <p className="text-sm text-muted-foreground mb-3">
          Enter your discount code below. If you don't have one, you can skip this step.
        </p>
      </div>

      {!appliedPromo ? (
        <>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Input
                placeholder="e.g., SAVE10 or FREESHIP"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                className="pr-24"
              />
              {promoCode && (
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                  <Badge variant="outline" className="text-xs">
                    {promoCode.length}/12
                  </Badge>
                </div>
              )}
            </div>
            <Button 
              onClick={onApply} 
              disabled={isValidating || !promoCode.trim()}
              className="min-w-[80px]"
            >
              {isValidating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Apply"
              )}
            </Button>
          </div>
          
          <div className="flex justify-end">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setPromoCode("");
                setShowInstructions(true);
              }}
              className="text-xs h-8"
            >
              <Info className="h-3 w-3 mr-1" />
              How to get promo codes?
            </Button>
          </div>
        </>
      ) : (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center mt-0.5">
                  <span className="text-lg">{getDiscountTypeIcon()}</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-green-800">{appliedPromo.code}</span>
                    <Badge variant="outline" className="text-xs bg-green-100 border-green-300">
                      Active
                    </Badge>
                  </div>
                  <p className="text-sm text-green-600 mt-1">{getDiscountText()}</p>
                  
                  {appliedPromo.description && (
                    <p className="text-sm text-green-700 mt-2 bg-green-100 p-2 rounded">
                      {appliedPromo.description}
                    </p>
                  )}
                  
                  {appliedPromo.expiryDate && (
                    <p className="text-xs text-green-600 mt-2">
                      Valid until: {new Date(appliedPromo.expiryDate).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
              
              <div className="flex flex-col items-end gap-2">
                <Badge className="bg-green-600 hover:bg-green-700 text-white">
                  -₹{promoDiscount.toLocaleString('en-IN')}
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onRemove}
                  className="h-8 px-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <X className="h-3 w-3 mr-1" />
                  Remove
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      {promoError && (
        <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <X className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm">
            <p className="font-medium text-red-800">Invalid Promo Code</p>
            <p className="text-red-600 mt-1">{promoError}</p>
          </div>
        </div>
      )}
      
      {/* {renderInstructions()} */}
      
      {/* Skip Option */}
      {!appliedPromo && (
        <div className="pt-2 border-t">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Skip this step? Continue without discount
            </p>
            <Button
              variant="link"
              className="text-sm"
              onClick={() => {
                setPromoCode("");
                setShowInstructions(false);
              }}
            >
              Skip →
            </Button>
          </div>
        </div>
      )}
      
      {/* Stats for non-promo users */}
      {/* {!appliedPromo && !promoCode && (
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="p-2 bg-blue-50 border border-blue-100 rounded text-center">
            <p className="font-medium">New Customer?</p>
            <p className="text-blue-600">Use WELCOME10 for 10% off</p>
          </div>
          <div className="p-2 bg-green-50 border border-green-100 rounded text-center">
            <p className="font-medium">Large Order?</p>
            <p className="text-green-600">Use BULK15 for 15% off</p>
          </div>
        </div>
      )} */}
    </div>
  );
}