"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Product } from "@/lib/types";
import { useCart } from "@/context/CartContext";
import { VegBadge } from "./VegBadge";
import { CustomizationModal } from "./CustomizationModal";
import { Clock, Plus, Minus } from "lucide-react";

export function ProductCard({ product }: { product: Product }) {
  const { items, addItem, updateQuantity } = useCart();
  const [modalOpen, setModalOpen] = useState(false);

  // Check if item is already in cart
  const cartEntries = items.filter((i) => i.productId === product.id);
  const totalInCart = cartEntries.reduce((sum, i) => sum + i.quantity, 0);

  const hasCustomizations =
    (product.variants && product.variants.length > 0) ||
    (product.addons && product.addons.length > 0);

  const handleAddClick = () => {
    if (hasCustomizations) {
      setModalOpen(true);
    } else {
      addItem(product);
    }
  };

  const handleIncrement = () => {
    if (hasCustomizations && cartEntries.length > 1) {
      setModalOpen(true);
    } else if (cartEntries.length > 0) {
      updateQuantity(cartEntries[0].id, 1);
    } else {
      handleAddClick();
    }
  };

  const handleDecrement = () => {
    if (cartEntries.length > 0) {
      updateQuantity(cartEntries[cartEntries.length - 1].id, -1);
    }
  };

  return (
    <>
      <div className="bg-white rounded-3xl p-4 border border-[#F8EBD2] shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between group card-hover relative">
        {/* Product Image */}
        <div className="relative w-full h-44 rounded-2xl overflow-hidden bg-[#F8EBD2] mb-3.5">
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />

          {/* Top Badges */}
          <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 z-10">
            <VegBadge size="md" />
            {product.badge && (
              <span className="bg-[#263719] text-[#F8EBD2] text-[10px] font-extrabold uppercase tracking-wide px-2 py-0.5 rounded-full shadow-xs backdrop-blur-xs">
                {product.badge}
              </span>
            )}
          </div>

          {/* Prep time badge */}
          <div className="absolute bottom-2.5 right-2.5 bg-black/60 backdrop-blur-md text-white text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
            <Clock className="w-3 h-3 text-[#DCE8C9]" />
            {product.prepTimeMinutes}m
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 flex flex-col">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-extrabold text-base text-[#263719] group-hover:text-[#34451F] transition-colors leading-snug">
              {product.name}
            </h3>
          </div>

          <p className="text-xs text-[#74776D] mt-1.5 line-clamp-2 leading-relaxed">
            {product.description}
          </p>

          {/* Price & Add to Cart Controls */}
          <div className="mt-4 pt-3 border-t border-[#F8EBD2] flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-[#74776D] block leading-none">
                Price
              </span>
              <span className="text-lg font-extrabold text-[#26291F]">
                ₹{product.price}
              </span>
            </div>

            {totalInCart > 0 ? (
              <div className="flex items-center gap-2 bg-[#34451F] text-white rounded-full p-1 shadow-xs">
                <button
                  onClick={handleDecrement}
                  className="w-7 h-7 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors active:scale-90"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="text-xs font-extrabold px-1 min-w-[16px] text-center">
                  {totalInCart}
                </span>
                <button
                  onClick={handleIncrement}
                  className="w-7 h-7 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors active:scale-90"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={handleAddClick}
                className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#DCE8C9] hover:bg-[#34451F] text-[#263719] hover:text-white text-xs font-extrabold tracking-wide shadow-xs transition-all active:scale-95 group/btn"
              >
                <span>ADD</span>
                <Plus className="w-3.5 h-3.5 transition-transform group-hover/btn:rotate-90" />
              </button>
            )}
          </div>

          {hasCustomizations && (
            <span className="text-[10px] text-[#6C472B] font-semibold text-right mt-1">
              Customizable
            </span>
          )}
        </div>
      </div>

      {hasCustomizations && (
        <CustomizationModal
          product={product}
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          onConfirm={(customization) => {
            addItem(product, 1, customization);
          }}
        />
      )}
    </>
  );
}
