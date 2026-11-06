"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { Product, ProductVariant, ProductAddon } from "@/lib/types";

export interface CartItem {
  id: string; // unique item instance id
  productId: string;
  name: string;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
  imageUrl: string;
  customization?: {
    variant?: ProductVariant;
    addons?: ProductAddon[];
  };
}

interface CartContextType {
  items: CartItem[];
  addItem: (
    product: Product,
    quantity?: number,
    customization?: { variant?: ProductVariant; addons?: ProductAddon[] }
  ) => void;
  updateQuantity: (id: string, delta: number) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  itemCount: number;
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
  appliedCoupon: string | null;
  couponMessage: string | null;
  applyCoupon: (code: string) => Promise<{ success: boolean; message: string }>;
  removeCoupon: () => void;
  buildWhatsAppMessage: (customerAddress?: string) => string;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [couponDiscount, setCouponDiscount] = useState<number>(0);
  const [couponMessage, setCouponMessage] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load cart from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem("tss_cart_items");
      if (stored) {
        setItems(JSON.parse(stored));
      }
      const storedCoupon = localStorage.getItem("tss_coupon_code");
      if (storedCoupon) {
        setAppliedCoupon(storedCoupon);
      }
    } catch (e) {
      console.error("Failed to load cart from storage:", e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save cart to localStorage
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem("tss_cart_items", JSON.stringify(items));
      if (appliedCoupon) {
        localStorage.setItem("tss_coupon_code", appliedCoupon);
      } else {
        localStorage.removeItem("tss_coupon_code");
      }
    } catch (e) {
      console.error("Failed to save cart to storage:", e);
    }
  }, [items, appliedCoupon, isLoaded]);

  // Recalculate coupon if subtotal changes
  const subtotal = items.reduce((acc, item) => acc + item.totalPrice, 0);

  useEffect(() => {
    if (appliedCoupon && subtotal > 0) {
      fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: appliedCoupon, subtotal }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.valid) {
            setCouponDiscount(data.discount);
            setCouponMessage(data.message);
          } else {
            setAppliedCoupon(null);
            setCouponDiscount(0);
            setCouponMessage(data.message);
          }
        })
        .catch(() => {
          setCouponDiscount(0);
        });
    } else if (subtotal === 0) {
      setCouponDiscount(0);
    }
  }, [appliedCoupon, subtotal]);

  // Free delivery over ₹299
  const deliveryFee = subtotal >= 299 || subtotal === 0 ? 0 : 30;
  const total = Math.max(0, subtotal + deliveryFee - couponDiscount);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const addItem = (
    product: Product,
    quantity = 1,
    customization?: { variant?: ProductVariant; addons?: ProductAddon[] }
  ) => {
    let unitPrice = product.price;
    if (customization?.variant) {
      unitPrice = customization.variant.price;
    }
    if (customization?.addons && customization.addons.length > 0) {
      const addonsSum = customization.addons.reduce((sum, a) => sum + a.price, 0);
      unitPrice += addonsSum;
    }

    // Determine uniqueness based on variant and addons
    const customKey = `${product.id}-${customization?.variant?.id || "default"}-${
      customization?.addons?.map((a) => a.id).sort().join(",") || "none"
    }`;

    setItems((prev) => {
      const existingIdx = prev.findIndex(
        (i) =>
          `${i.productId}-${i.customization?.variant?.id || "default"}-${
            i.customization?.addons?.map((a) => a.id).sort().join(",") || "none"
          }` === customKey
      );

      if (existingIdx !== -1) {
        const updated = [...prev];
        const newQty = updated[existingIdx].quantity + quantity;
        updated[existingIdx] = {
          ...updated[existingIdx],
          quantity: newQty,
          totalPrice: updated[existingIdx].unitPrice * newQty,
        };
        return updated;
      }

      const newItem: CartItem = {
        id: `cart-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        productId: product.id,
        name: product.name,
        unitPrice,
        quantity,
        totalPrice: unitPrice * quantity,
        imageUrl: product.imageUrl,
        customization,
      };
      return [...prev, newItem];
    });
  };

  const updateQuantity = (id: string, delta: number) => {
    setItems((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const newQty = item.quantity + delta;
            if (newQty <= 0) return null;
            return {
              ...item,
              quantity: newQty,
              totalPrice: item.unitPrice * newQty,
            };
          }
          return item;
        })
        .filter((item): item is CartItem => item !== null)
    );
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const clearCart = () => {
    setItems([]);
    setAppliedCoupon(null);
    setCouponDiscount(0);
    setCouponMessage(null);
  };

  const applyCoupon = async (code: string) => {
    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: code.trim(), subtotal }),
      });
      const data = await res.json();
      if (data.valid) {
        setAppliedCoupon(code.trim().toUpperCase());
        setCouponDiscount(data.discount);
        setCouponMessage(data.message);
        return { success: true, message: data.message };
      } else {
        return { success: false, message: data.message || "Invalid coupon" };
      }
    } catch {
      return { success: false, message: "Error validating coupon" };
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponDiscount(0);
    setCouponMessage(null);
  };

  const buildWhatsAppMessage = (customerAddress?: string) => {
    let msg = `*🌿 New Order from The Sprouts Spot Website*\n\n`;
    items.forEach((item, idx) => {
      msg += `${idx + 1}. *${item.name}* x ${item.quantity} — ₹${item.totalPrice}\n`;
      if (item.customization?.variant) {
        msg += `   _Variant: ${item.customization.variant.name}_\n`;
      }
      if (item.customization?.addons && item.customization.addons.length > 0) {
        msg += `   _Add-ons: ${item.customization.addons.map((a) => a.name).join(", ")}_\n`;
      }
    });

    msg += `\n*Subtotal:* ₹${subtotal}`;
    if (deliveryFee > 0) {
      msg += `\n*Delivery Fee:* ₹${deliveryFee}`;
    } else {
      msg += `\n*Delivery Fee:* FREE`;
    }
    if (couponDiscount > 0) {
      msg += `\n*Discount (${appliedCoupon}):* -₹${couponDiscount}`;
    }
    msg += `\n*Total Payable:* ₹${total}\n\n`;

    if (customerAddress) {
      msg += `*Delivery Address:*\n${customerAddress}\n\n`;
    }
    msg += `_Please confirm my order and share estimated delivery time._`;
    return encodeURIComponent(msg);
  };

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        updateQuantity,
        removeItem,
        clearCart,
        itemCount,
        subtotal,
        deliveryFee,
        discount: couponDiscount,
        total,
        appliedCoupon,
        couponMessage,
        applyCoupon,
        removeCoupon,
        buildWhatsAppMessage,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
