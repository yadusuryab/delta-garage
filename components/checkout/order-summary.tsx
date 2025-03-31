import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { CartItem } from "@/lib/orderUtils";

interface OrderSummaryProps {
  cartItems: CartItem[];
  shippingCharge: number;
  subtotal: number;
  totalAmount: number;
  paymentMethod: "online" | "cod";
}

export const OrderSummary = ({
  cartItems,
  shippingCharge,
  subtotal,
  totalAmount,
  paymentMethod,
}: OrderSummaryProps) => {
  const isFreeShipping = subtotal >= 1000;
  const amountNeededForFreeShipping = 1000 - subtotal;

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
                        {item.category.name}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="font-medium">
                ₹{((item.offerPrice || item.price) * (item.quantity || 1)).toLocaleString('en-IN')}
              </p>
              <p className="text-sm text-muted-foreground">
                {item.quantity || 1} × ₹{(item.offerPrice || item.price).toLocaleString('en-IN')}
              </p>
            </div>
          </div>
        ))}
      </div>

      <Separator />

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Subtotal</span>
          <span>₹{subtotal.toLocaleString('en-IN')}</span>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Shipping Charges</span>
            <Badge variant="outline" className="text-xs">
              {paymentMethod === 'cod' ? 'COD (+₹20)' : 'Online Payment'}
            </Badge>
          </div>
          <span>
            {isFreeShipping ? (
              <span className="text-green-600">FREE</span>
            ) : (
              `₹${shippingCharge.toLocaleString('en-IN')}`
            )}
          </span>
        </div>
      </div>

      <Separator />

      <div className="flex items-center justify-between font-medium text-lg">
        <span>Total Amount</span>
        <span>₹{totalAmount.toLocaleString('en-IN')}</span>
      </div>

      {!isFreeShipping && (
        <div className="text-sm text-muted-foreground text-center pt-2">
          Add ₹{amountNeededForFreeShipping > 0 ? amountNeededForFreeShipping.toLocaleString('en-IN') : '0'} more for free shipping
        </div>
      )}
      
      {paymentMethod === 'cod' && (
        <div className="text-sm text-orange-600 text-center pt-1">
          Cash on Delivery available with ₹20 additional charge
        </div>
      )}
    </div>
  );
};