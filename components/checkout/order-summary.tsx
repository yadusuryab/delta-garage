import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { CartItem } from "@/lib/orderUtils";
import { Tag } from "lucide-react"; // Add this import

interface OrderSummaryProps {
  cartItems: CartItem[];
  shippingCharge: number;
  subtotal: number;
  totalAmount: number;
  paymentMethod: "online" | "cod";
  promoDiscount?: number; // Add this
  appliedPromo?: any; // Add this
}

export const OrderSummary = ({
  cartItems,
  shippingCharge,
  subtotal,
  totalAmount,
  paymentMethod,
  promoDiscount = 0, // Default value
  appliedPromo, // Add this
}: OrderSummaryProps) => {
  const isFreeShipping = appliedPromo?.discountType === 'freeShipping';
  
  const getPromoText = () => {
    if (!appliedPromo) return null;
    
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

  const promoText = getPromoText();

  return (
    <div className="space-y-4">
      <div className="space-y-4">
        {cartItems.map((item: any) => (
          <div key={item._id} className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-start gap-3">
                {item.images?.[0]?.asset?.url && (
                  <div className="relative w-12 h-12 rounded-md overflow-hidden border">
                    <img
                      src={item.images[0].asset.url}
                      alt={item.name}
                      className="object-cover w-full h-full"
                    />
                  </div>
                )}
                <div>
                  <h3 className="font-medium">{item.name}</h3>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {item.brand && (
                      <Badge variant="outline" className="text-xs">
                        {item.brand}
                      </Badge>
                    )}
                    {item.category?.name && (
                      <Badge variant="outline" className="text-xs">
                        {item.category?.name || 'deltagarage'}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="font-medium">
                ₹{((item.offerPrice || item.price) * (1)).toLocaleString('en-IN')}
              </p>
              <p className="text-sm text-muted-foreground">
                {item.orderQuantity} × ₹{(item.offerPrice || item.price).toLocaleString('en-IN')}
              </p>
            </div>
          </div>
        ))}
      </div>

      <Separator />

      {/* Promo Code Section */}
      {appliedPromo && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Tag className="h-4 w-4 text-green-600" />
              <span className="font-medium text-green-800">
                {appliedPromo.code}
              </span>
              <Badge 
                variant="outline" 
                className="bg-green-100 text-green-800 border-green-200 text-xs"
              >
                {promoText}
              </Badge>
            </div>
            <span className="font-medium text-green-800">
              -₹{promoDiscount.toLocaleString('en-IN')}
            </span>
          </div>
          {appliedPromo.description && (
            <p className="text-xs text-green-700 mt-2">
              {appliedPromo.description}
            </p>
          )}
        </div>
      )}

      {/* Price Breakdown */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Subtotal</span>
          <span>₹{subtotal.toLocaleString('en-IN')}</span>
        </div>
        
        {/* Promo Discount Line */}
        {promoDiscount > 0 && appliedPromo?.discountType !== 'freeShipping' && (
          <div className="flex items-center justify-between text-green-600">
            <div className="flex items-center gap-2">
              <span>Promo Discount</span>
              {promoText && (
                <Badge variant="outline" className="text-xs bg-green-50 text-green-700">
                  {promoText}
                </Badge>
              )}
            </div>
            <span className="font-medium">
              -₹{promoDiscount.toLocaleString('en-IN')}
            </span>
          </div>
        )}
        
        {/* Shipping Charges */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Shipping Charges</span>
            <Badge 
              variant="outline" 
              className={`text-xs ${
                isFreeShipping 
                  ? 'bg-green-100 text-green-800 border-green-200' 
                  : ''
              }`}
            >
              {isFreeShipping ? 'FREE' : paymentMethod === 'cod' ? 'COD' : 'Online Payment'}
            </Badge>
          </div>
          <span className={isFreeShipping ? 'text-green-600 font-medium' : ''}>
            {isFreeShipping ? (
              'FREE'
            ) : (
              `₹${shippingCharge.toLocaleString('en-IN')}`
            )}
          </span>
        </div>
        
        {/* Free Shipping Applied Notice */}
        {isFreeShipping && (
          <div className="text-sm text-green-600 bg-green-50 p-2 rounded-md">
            🎉 Free shipping applied! You saved ₹{shippingCharge.toLocaleString('en-IN')}
          </div>
        )}
      </div>

      <Separator />

      {/* Total Amount */}
      <div className="flex items-center justify-between font-medium text-lg pt-2">
        <div>
          <span>Total Amount</span>
          {appliedPromo && (
            <Badge 
              variant="outline" 
              className="ml-2 text-xs bg-green-50 text-green-700 border-green-200"
            >
              Promo Applied
            </Badge>
          )}
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold">
            ₹{totalAmount.toLocaleString('en-IN')}
          </div>
          {promoDiscount > 0 && (
            <div className="text-sm text-green-600 mt-1">
              You saved ₹{promoDiscount.toLocaleString('en-IN')}
            </div>
          )}
        </div>
      </div>

      {/* Shipping Progress Bar (Optional) */}
      {!isFreeShipping && subtotal < 1000 && (
        <div className="pt-4">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-muted-foreground">Free shipping on orders above ₹1,000</span>
            <span className="font-medium">
              ₹{subtotal.toLocaleString('en-IN')}/₹1,000
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-green-600 h-2 rounded-full" 
              style={{ width: `${Math.min((subtotal / 1000) * 100, 100)}%` }}
            ></div>
          </div>
          {subtotal < 1000 && (
            <p className="text-sm text-center text-muted-foreground mt-2">
              Add ₹{(1000 - subtotal).toLocaleString('en-IN')} more for free shipping
            </p>
          )}
        </div>
      )}
    </div>
  );
};