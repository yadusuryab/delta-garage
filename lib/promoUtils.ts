import { calculateSubtotal, CartItem } from "./orderUtils";

export interface PromoCode {
    _id: string;
    code: string;
    discountType: 'percentage' | 'fixed' | 'freeShipping';
    discountValue: number;
    minimumPurchase: number;
    maxDiscount?: number;
    validFrom: string;
    validUntil: string;
    usageLimit?: number;
    usedCount: number;
    userLimit?: number;
    applicableCategories?: Array<{ _id: string }>;
    excludedCategories?: Array<{ _id: string }>;
    applicableProducts?: Array<{ _id: string }>;
    excludedProducts?: Array<{ _id: string }>;
    isActive: boolean;
    oneTimeUse: boolean;
    newCustomersOnly: boolean;
    applyOnSaleItems: boolean;
  }
  
  export interface PromoValidationResult {
    isValid: boolean;
    message?: string;
    discountAmount?: number;
    promoCode?: PromoCode;
  }
  
  export interface CartTotals {
    subtotal: number;
    promoDiscount: number;
    shippingCharge: number;
    totalAmount: number;
  }
  
  export const validatePromoCode = async (
    code: string,
    cartItems: CartItem[],
    subtotal: number,
    isNewCustomer: boolean = true
  ): Promise<PromoValidationResult> => {
    try {
      // Fetch promo code from Sanity
      const response = await fetch(
        `/api/validate-promo?code=${encodeURIComponent(code)}`
      );
      const promoData = await response.json();
      
      if (!promoData.success) {
        return { isValid: false, message: promoData.message };
      }
      
      const promoCode = promoData.promoCode as PromoCode;
      
      // Check if promo is active
      if (!promoCode.isActive) {
        return { isValid: false, message: 'This promo code is no longer active' };
      }
      
      // Check validity dates
      const now = new Date();
      const validFrom = new Date(promoCode.validFrom);
      const validUntil = new Date(promoCode.validUntil);
      
      if (now < validFrom) {
        return { isValid: false, message: 'This promo code is not yet valid' };
      }
      if (now > validUntil) {
        return { isValid: false, message: 'This promo code has expired' };
      }
      
      // Check usage limits
      if (promoCode.usageLimit && promoCode.usedCount >= promoCode.usageLimit) {
        return { isValid: false, message: 'This promo code has reached its usage limit' };
      }
      
      // Check minimum purchase
      if (subtotal < promoCode.minimumPurchase) {
        return { 
          isValid: false, 
          message: `Minimum purchase of ₹${promoCode.minimumPurchase} required` 
        };
      }
      
      // Check if new customers only
      if (promoCode.newCustomersOnly && !isNewCustomer) {
        return { isValid: false, message: 'This promo code is for new customers only' };
      }
      
      // Check category/product restrictions
      const cartIsValid = validateCartAgainstPromo(cartItems, promoCode);
      if (!cartIsValid.isValid) {
        return { isValid: false, message: cartIsValid.message };
      }
      
      // Calculate discount amount
      const discountAmount = calculateDiscount(promoCode, subtotal, cartItems);
      
      return {
        isValid: true,
        discountAmount,
        promoCode
      };
    } catch (error) {
      console.error('Promo validation error:', error);
      return { isValid: false, message: 'Error validating promo code' };
    }
  };
  
  const validateCartAgainstPromo = (
    cartItems: CartItem[],
    promoCode: PromoCode
  ): { isValid: boolean; message?: string } => {
    // Check excluded products
    if (promoCode.excludedProducts && promoCode.excludedProducts.length > 0) {
      const excludedIds = promoCode.excludedProducts.map(p => p._id);
      const hasExcluded = cartItems.some(item => excludedIds.includes(item._id));
      if (hasExcluded) {
        return { isValid: false, message: 'Promo code cannot be applied to items in your cart' };
      }
    }
    
    // Check applicable products (if specified)
    if (promoCode.applicableProducts && promoCode.applicableProducts.length > 0) {
      const applicableIds = promoCode.applicableProducts.map(p => p._id);
      const allItemsApplicable = cartItems.every(item => applicableIds.includes(item._id));
      if (!allItemsApplicable) {
        return { isValid: false, message: 'Promo code only applies to specific products' };
      }
    }
    
    // Check excluded categories
    if (promoCode.excludedCategories && promoCode.excludedCategories.length > 0) {
      const excludedCategoryIds = promoCode.excludedCategories.map(c => c._id);
      const hasExcludedCategory = cartItems.some((item :any) => 
        item.category && excludedCategoryIds.includes(item.category._id)
      );
      if (hasExcludedCategory) {
        return { isValid: false, message: 'Promo code cannot be applied to items in excluded categories' };
      }
    }
    
    // Check applicable categories (if specified)
    if (promoCode.applicableCategories && promoCode.applicableCategories.length > 0) {
      const applicableCategoryIds = promoCode.applicableCategories.map(c => c._id);
      const allItemsInCategory = cartItems.every((item :any)=> 
        item.category && applicableCategoryIds.includes(item.category._id)
      );
      if (!allItemsInCategory) {
        return { isValid: false, message: 'Promo code only applies to specific categories' };
      }
    }
    
    return { isValid: true };
  };
  
  const calculateDiscount = (
    promoCode: PromoCode,
    subtotal: number,
    cartItems: CartItem[]
  ): number => {
    if (promoCode.discountType === 'freeShipping') {
      // Free shipping discount will be applied separately
      return 0;
    }
    
    if (promoCode.discountType === 'percentage') {
      let discountAmount = (subtotal * promoCode.discountValue) / 100;
      
      // Apply max discount limit if set
      if (promoCode.maxDiscount && discountAmount > promoCode.maxDiscount) {
        discountAmount = promoCode.maxDiscount;
      }
      
      return discountAmount;
    }
    
    // Fixed amount discount
    return promoCode.discountValue;
  };
  
  export const calculateTotals = (
    cartItems: CartItem[],
    promoDiscount: number = 0,
    shippingCharge: number = 0,
    isFreeShipping: boolean = false
  ): CartTotals => {
    const subtotal = calculateSubtotal(cartItems);
    const finalShippingCharge = isFreeShipping ? 0 : shippingCharge;
    const totalAmount = Math.max(0, subtotal - promoDiscount + finalShippingCharge);
    
    return {
      subtotal,
      promoDiscount,
      shippingCharge: finalShippingCharge,
      totalAmount
    };
  };