import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-sans",
});

export const viewport: Viewport = {
  themeColor: "#34451F",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://thesproutspotv1.vercel.app"),
  title: "The Sprouts Spot | Fresh Homemade Vegetarian Food & Meal Delivery in Nimbahera",
  description:
    "Eat Healthy, Live Happy. Freshly prepared, hygienic home-kitchen vegetarian sandwiches, sprouts chaat, paneer specials, and wholesome daily meals delivered straight to your doorstep in Nimbahera, Rajasthan.",
  keywords: [
    "The Sprouts Spot",
    "Healthy vegetarian food delivery",
    "Nimbahera food delivery",
    "Rajasthan home kitchen",
    "Homemade meals Nimbahera",
    "Sprouts chaat",
    "Paneer specials",
    "Fresh food delivery Chittorgarh",
  ],
  authors: [{ name: "The Sprouts Spot Home Kitchen" }],
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/icon.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [
      { url: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
  },
  openGraph: {
    title: "The Sprouts Spot | Fresh Homemade Vegetarian Food & Meal Delivery in Nimbahera",
    description:
      "Eat Healthy, Live Happy. Freshly prepared, hygienic home-kitchen vegetarian sandwiches, sprouts chaat, paneer specials, and wholesome daily meals delivered straight to your doorstep in Nimbahera, Rajasthan.",
    siteName: "The Sprouts Spot",
    images: [
      {
        url: "/images/logo.jpg",
        width: 861,
        height: 859,
        alt: "The Sprouts Spot Logo",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "The Sprouts Spot",
    description:
      "Eat Healthy, Live Happy. Fresh Homemade Vegetarian Food & Meal Delivery in Nimbahera, Rajasthan.",
    images: ["/images/logo.jpg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${plusJakarta.variable} font-sans h-full`}>
      <body className="min-h-full flex flex-col bg-[#FBF8F0] text-[#26291F] selection:bg-[#DCE8C9] selection:text-[#263719] antialiased">
        <AuthProvider>
          <CartProvider>{children}</CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
