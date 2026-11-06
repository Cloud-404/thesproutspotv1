import React from "react";

export function VegBadge({ size = "md", className = "" }: { size?: "sm" | "md" | "lg"; className?: string }) {
  const sizeClasses = {
    sm: "w-3.5 h-3.5 p-[1px]",
    md: "w-4 h-4 p-[2px]",
    lg: "w-5 h-5 p-[2px]",
  };

  const dotClasses = {
    sm: "w-1.5 h-1.5",
    md: "w-2 h-2",
    lg: "w-2.5 h-2.5",
  };

  return (
    <div
      title="100% Pure Vegetarian"
      className={`inline-flex items-center justify-center border-[1.5px] border-[#2e7d32] rounded-[3px] bg-white ${sizeClasses[size]} ${className}`}
    >
      <div className={`rounded-full bg-[#2e7d32] ${dotClasses[size]}`} />
    </div>
  );
}
