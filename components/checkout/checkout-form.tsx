import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface CustomerDetailsFormProps {
  customerDetails: {
    name: string;
    email: string;
    contact1: string;
    address: string;
    district: string;
    state: string;
    pincode: string;
  };
  handleInputChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  errors?: {
    [key: string]: string;
  };
}

export const CustomerDetailsForm = ({
  customerDetails,
  handleInputChange,
  errors = {},
}: CustomerDetailsFormProps) => (
  <div className="space-y-4">
    {Object.keys(errors).length > 0 && (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Please fix the errors in the form before proceeding.
        </AlertDescription>
      </Alert>
    )}
    
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div className="space-y-2">
        <Label htmlFor="name">Name *</Label>
        <Input
          id="name"
          name="name"
          placeholder="Name"
          value={customerDetails.name}
          onChange={handleInputChange}
          required
          className={errors.name ? "border-red-500" : ""}
        />
        {errors.name && (
          <p className="text-sm text-red-500">{errors.name}</p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email *</Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="Email address"
          value={customerDetails.email}
          onChange={handleInputChange}
          required
          className={errors.email ? "border-red-500" : ""}
        />
        {errors.email && (
          <p className="text-sm text-red-500">{errors.email}</p>
        )}
      </div>
    </div>
    <div className="space-y-2">
      <Label htmlFor="contact1">Contact Number *</Label>
      <Input
        id="contact1"
        name="contact1"
        placeholder="Phone number"
        value={customerDetails.contact1}
        onChange={handleInputChange}
        required
        className={errors.contact1 ? "border-red-500" : ""}
      />
      {errors.contact1 && (
        <p className="text-sm text-red-500">{errors.contact1}</p>
      )}
    </div>
    <div className="space-y-2">
      <Label htmlFor="address">Address *</Label>
      <Textarea
        id="address"
        name="address"
        placeholder="Enter your address"
        value={customerDetails.address}
        onChange={handleInputChange}
        required
        className={errors.address ? "border-red-500" : ""}
      />
      {errors.address && (
        <p className="text-sm text-red-500">{errors.address}</p>
      )}
    </div>
    <div className="space-y-2">
      <Label htmlFor="district">District *</Label>
      <Input
        id="district"
        name="district"
        placeholder="District"
        value={customerDetails.district}
        onChange={handleInputChange}
        required
        className={errors.district ? "border-red-500" : ""}
      />
      {errors.district && (
        <p className="text-sm text-red-500">{errors.district}</p>
      )}
    </div>
    <div className="space-y-2">
      <Label htmlFor="state">State *</Label>
      <Input
        id="state"
        name="state"
        placeholder="State"
        value={customerDetails.state}
        onChange={handleInputChange}
        required
        className={errors.state ? "border-red-500" : ""}
      />
      {errors.state && (
        <p className="text-sm text-red-500">{errors.state}</p>
      )}
    </div>
    <div className="space-y-2">
      <Label htmlFor="pincode">Pincode *</Label>
      <Input
        id="pincode"
        name="pincode"
        placeholder="Pincode"
        value={customerDetails.pincode}
        onChange={handleInputChange}
        required
        className={errors.pincode ? "border-red-500" : ""}
      />
      {errors.pincode && (
        <p className="text-sm text-red-500">{errors.pincode}</p>
      )}
    </div>
  </div>
);