"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";

export const LOGO_ASSET_PATH = "/images/logo.jpg";

export type LogoSize = "xs" | "sm" | "md" | "lg" | "xl" | "2xl";

const SIZE_MAP: Record<LogoSize, { px: number; sizeClass: string; textClass: string }> = {
  xs: { px: 28, sizeClass: "w-7 h-7", textClass: "text-sm" },
  sm: { px: 36, sizeClass: "w-9 h-9", textClass: "text-base" },
  md: { px: 48, sizeClass: "w-12 h-12", textClass: "text-xl sm:text-2xl" },
  lg: { px: 64, sizeClass: "w-16 h-16", textClass: "text-2xl" },
  xl: { px: 80, sizeClass: "w-20 h-20", textClass: "text-3xl" },
  "2xl": { px: 96, sizeClass: "w-24 h-24", textClass: "text-4xl" },
};

export interface LogoProps {
  size?: LogoSize;
  width?: number;
  height?: number;
  className?: string;
  imageClassName?: string;
  priority?: boolean;
  alt?: string;
  href?: string | null;
  withText?: boolean;
  theme?: "dark" | "light"; // "dark" = dark text on light bg (e.g. main navbar), "light" = light text on dark bg (e.g. footer, admin sidebar)
  title?: string;
  subtitle?: string;
  onClick?: () => void;
}

export function Logo({
  size = "md",
  width,
  height,
  className = "",
  imageClassName = "",
  priority = false,
  alt = "The Sprouts Spot Logo",
  href,
  withText = false,
  theme = "dark",
  title = "The Sprouts Spot",
  subtitle = "Eat Healthy, Live Happy",
  onClick,
}: LogoProps) {
  const config = SIZE_MAP[size] || SIZE_MAP.md;
  const dimension = width || config.px;
  const hDimension = height || dimension;

  const imageElement = (
    <div
      className={`relative rounded-full overflow-hidden shrink-0 shadow-xs select-none ${
        width ? "" : config.sizeClass
      } ${className}`}
      style={width ? { width: `${width}px`, height: `${hDimension}px` } : undefined}
    >
      <Image
        src={LOGO_ASSET_PATH}
        alt={alt}
        width={dimension}
        height={hDimension}
        priority={priority}
        className={`w-full h-full object-contain rounded-full transition-transform duration-200 ${imageClassName}`}
      />
    </div>
  );

  const content = withText ? (
    <div className="flex items-center gap-3">
      {imageElement}
      <div className="flex flex-col">
        <span
          className={`font-extrabold tracking-tight font-sans ${config.textClass} ${
            theme === "light" ? "text-white" : "text-[#263719]"
          }`}
        >
          {title}
        </span>
        {subtitle && (
          <span
            className={`text-xs font-semibold tracking-wide flex items-center gap-1 ${
              theme === "light" ? "text-[#DCE8C9]" : "text-[#6C472B]"
            }`}
          >
            {theme !== "light" && (
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#34451F]" />
            )}
            {subtitle}
          </span>
        )}
      </div>
    </div>
  ) : (
    imageElement
  );

  if (href) {
    return (
      <Link href={href} onClick={onClick} className="group inline-flex items-center">
        {content}
      </Link>
    );
  }

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className="group inline-flex items-center text-left">
        {content}
      </button>
    );
  }

  return content;
}

