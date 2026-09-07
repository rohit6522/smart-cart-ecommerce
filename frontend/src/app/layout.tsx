import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import { WishlistProvider } from "@/context/WishlistContext";
import { NotificationProvider } from "@/context/NotificationContext";

export const metadata: Metadata = {
  title: "Smart Cart - Shop Smarter",
  description: "Smart Shopping Cart with Real-Time Budget Tracking",

  openGraph: {
    title: "Smart Cart - Shop Smarter",
    description: "Smart Shopping Cart with Real-Time Budget Tracking",
    url: "https://smartcart-frontend-g472.onrender.com/",
    siteName: "Smart Cart",
    type: "website",
    images: [
      {
        url: "https://smartcart-frontend-g472.onrender.com/preview.png",
        width: 1200,
        height: 630,
        alt: "Smart Cart - E-Commerce Web Application",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Script
          src="https://checkout.razorpay.com/v1/checkout.js"
          strategy="beforeInteractive"
        />

        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              <NotificationProvider>
                {children}
              </NotificationProvider>
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}