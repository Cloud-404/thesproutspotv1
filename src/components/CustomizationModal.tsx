"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Product, ProductVariant, ProductAddon } from "@/lib/types";
import { VegBadge } from "./VegBadge";
import { X, Check } from "lucide-react";

interface CustomizationModalProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (customization: { variant?: ProductVariant; addons?: ProductAddon[] }) => void;
}

export function CustomizationModal({
  product,
  isOpen,
  onClose,
  onConfirm,
}: CustomizationModalProps) {
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | undefined>(
    product.variants && product.variants.length > 0 ? product.variants[0] : undefined
  );
  const [selectedAddons, setSelectedAddons] = useState<ProductAddon[]>([]);

  if (!isOpen) return null;

  const handleToggleAddon = (addon: ProductAddon) => {
    setSelectedAddons((prev) => {
      const exists = prev.some((a) => a.id === addon.id);
      if (exists) {
        return prev.filter((a) => a.id !== addon.id);
      } else {
        return [...prev, addon];
      }
    });
  };

  const currentPrice =
    (selectedVariant ? selectedVariant.price : product.price) +
    selectedAddons.reduce((sum, a) => sum + a.price, 0);

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-[#F8EBD2] animate-in zoom-in-95 duration-150">
        {/* Header Image */}
        <div className="relative h-48 w-full bg-[#F8EBD2]">
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className="object-cover rounded-t-3xl"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="absolute bottom-4 left-4 right-4 text-white">
            <div className="flex items-center gap-2 mb-1">
              <VegBadge size="md" />
              {product.badge && (
                <span className="bg-[#E27B38] text-white text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full">
                  {product.badge}
                </span>
              )}
            </div>
            <h3 className="font-bold text-xl drop-shadow-sm">{product.name}</h3>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <p className="text-xs text-[#74776D] leading-relaxed">
            {product.description}
          </p>

          {/* Variants Section */}
          {product.variants && product.variants.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-[#26291F]">Select Portion / Option</h4>
                <span className="text-[10px] uppercase font-bold text-[#6C472B] bg-[#F8EBD2] px-2 py-0.5 rounded-full">
                  Required
                </span>
              </div>
              <div className="space-y-2">
                {product.variants.map((variant) => {
                  const isSelected = selectedVariant?.id === variant.id;
                  return (
                    <label
                      key={variant.id}
                      onClick={() => setSelectedVariant(variant)}
                      className={`flex items-center justify-between p-3 rounded-2xl border cursor-pointer transition-all ${
                        isSelected
                          ? "border-[#34451F] bg-[#DCE8C9]/30"
                          : "border-neutral-200 hover:border-[#DCE8C9]"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                            isSelected
                              ? "border-[#34451F] bg-[#34451F]"
                              : "border-neutral-300"
                          }`}
                        >
                          {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </div>
                        <span className="text-xs font-semibold text-[#26291F]">
                          {variant.name}
                        </span>
                      </div>
                      <span className="text-xs font-bold text-[#34451F]">
                        ₹{variant.price}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {/* Add-ons Section */}
          {product.addons && product.addons.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-[#26291F]">Choose Add-ons</h4>
                <span className="text-[10px] text-[#74776D]">Optional</span>
              </div>
              <div className="space-y-2">
                {product.addons.map((addon) => {
                  const isChecked = selectedAddons.some((a) => a.id === addon.id);
                  return (
                    <label
                      key={addon.id}
                      onClick={() => handleToggleAddon(addon)}
                      className={`flex items-center justify-between p-3 rounded-2xl border cursor-pointer transition-all ${
                        isChecked
                          ? "border-[#34451F] bg-[#DCE8C9]/30"
                          : "border-neutral-200 hover:border-[#DCE8C9]"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-4 h-4 rounded-md border flex items-center justify-center ${
                            isChecked
                              ? "border-[#34451F] bg-[#34451F] text-white"
                              : "border-neutral-300"
                          }`}
                        >
                          {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                        <span className="text-xs font-semibold text-[#26291F]">
                          {addon.name}
                        </span>
                      </div>
                      <span className="text-xs font-bold text-[#6C472B]">
                        +₹{addon.price}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {/* Modal Footer */}
          <div className="pt-4 border-t border-neutral-100 flex items-center justify-between gap-4">
            <div>
              <span className="text-[10px] uppercase font-bold text-[#74776D] block">
                Item Total
              </span>
              <span className="text-lg font-extrabold text-[#26291F]">
                ₹{currentPrice}
              </span>
            </div>
            <button
              onClick={() => {
                onConfirm({
                  variant: selectedVariant,
                  addons: selectedAddons,
                });
                onClose();
              }}
              className="flex-1 py-3 px-6 rounded-full bg-[#34451F] hover:bg-[#263719] text-white text-xs font-bold tracking-wide shadow-md transition-all active:scale-95"
            >
              Add Item to Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
