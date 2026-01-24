import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Info } from "lucide-react";

interface PaymentMethodProps {
  paymentMethod: "online" | "cod";
  handlePaymentChange: (method: "online" | "cod") => void;
  shippingCharge: number;
  isFreeShipping?: boolean; // Add this prop
}

export const PaymentMethod = ({
  paymentMethod,
  handlePaymentChange,
  shippingCharge,
  isFreeShipping = false, // Default value
}: PaymentMethodProps) => {
  const getShippingInfo = () => {
    if (isFreeShipping) {
      return {
        text: "Free shipping applied with promo code",
        badgeColor: "bg-green-100 text-green-800 border-green-200",
        badgeText: "FREE SHIPPING",
      };
    }
    
    if (paymentMethod === 'cod') {
      return {
        text: "Cash on Delivery available with additional shipping charge",
        badgeColor: "bg-orange-100 text-orange-800 border-orange-200",
        badgeText: "COD",
      };
    }
    
    return {
      text: "Pay online to save on shipping charges",
      badgeColor: "bg-blue-100 text-blue-800 border-blue-200",
      badgeText: "Online",
    };
  };

  const shippingInfo = getShippingInfo();

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">Payment Method</label>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              Shipping: {isFreeShipping ? (
                <span className="text-green-600 font-medium">FREE</span>
              ) : (
                `₹${shippingCharge.toLocaleString('en-IN')}`
              )}
            </span>
            <Badge 
              variant="outline" 
              className={`text-xs ${shippingInfo.badgeColor}`}
            >
              {shippingInfo.badgeText}
            </Badge>
          </div>
        </div>
        
        <Select 
          onValueChange={handlePaymentChange} 
          value={paymentMethod}
          disabled={isFreeShipping} // Disable if free shipping is applied
        >
          <SelectTrigger>
            <SelectValue placeholder="Select payment method" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="online">
              <div className="flex items-center justify-between w-full">
                <span>Online Payment</span>
                {/* {!isFreeShipping && (
                  <Badge variant="outline" className="text-xs">
                    ₹{paymentMethod === 'online' ? 80 : 100}
                  </Badge>
                )} */}
              </div>
            </SelectItem>
            <SelectItem value="cod">
              <div className="flex items-center justify-between w-full">
                <span>Cash on Delivery</span>
                {/* {!isFreeShipping && (
                  <Badge variant="outline" className="text-xs">
                    ₹{paymentMethod === 'cod' ? 100 : 80}
                  </Badge>
                )} */}
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
        
        {isFreeShipping && (
          <p className="text-xs text-green-600 mt-1">
            Payment method selection locked due to free shipping promo
          </p>
        )}
      </div>

      <div className="rounded-lg bg-muted/50 p-3 text-sm flex items-start gap-2">
        <Info className="h-4 w-4 mt-0.5 flex-shrink-0 text-muted-foreground" />
        <div>
          {isFreeShipping ? (
            <p className="text-green-700">
              🎉 Free shipping has been applied to your order!
            </p>
          ) : paymentMethod === 'cod' ? (
            <p>Cash on Delivery available with ₹20 additional shipping charge</p>
          ) : (
            <p>Pay online to save ₹20 on shipping charges</p>
          )}
          
          {!isFreeShipping && paymentMethod === 'cod' && (
            <p className="text-xs mt-1">
              Note: COD charges may vary based on product selection
            </p>
          )}
        </div>
      </div>
    </div>
  );
};