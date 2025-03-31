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
}

export const PaymentMethod = ({
  paymentMethod,
  handlePaymentChange,
  shippingCharge,
}: PaymentMethodProps) => (
  <div className="space-y-4">
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">Payment Method</label>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            Shipping: ₹{shippingCharge.toLocaleString('en-IN')}
          </span>
          <Badge variant="outline" className="text-xs">
            {paymentMethod === 'cod' ? 'COD' : 'Online'}
          </Badge>
        </div>
      </div>
      
      <Select onValueChange={handlePaymentChange} value={paymentMethod}>
        <SelectTrigger>
          <SelectValue placeholder="Select payment method" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="online">
            <div className="flex items-center justify-between w-full">
              <span>Online Payment</span>
              <span className="text-sm text-muted-foreground">₹80 shipping</span>
            </div>
          </SelectItem>
          <SelectItem value="cod">
            <div className="flex items-center justify-between w-full">
              <span>Cash on Delivery</span>
              <span className="text-sm text-muted-foreground">₹100 shipping</span>
            </div>
          </SelectItem>
        </SelectContent>
      </Select>
    </div>

    <div className="rounded-lg bg-muted/50 p-3 text-sm flex items-start gap-2">
      <Info className="h-4 w-4 mt-0.5 flex-shrink-0 text-muted-foreground" />
      <div>
        {paymentMethod === 'cod' ? (
          <p>Cash on Delivery available with ₹20 additional shipping charge</p>
        ) : (
          <p>Pay online to save ₹20 on shipping charges</p>
        )}
      </div>
    </div>
  </div>
);