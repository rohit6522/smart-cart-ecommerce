import type { Metadata } from "next";
import Script from "next/script";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import { WishlistProvider } from "@/context/WishlistContext";
import { NotificationProvider } from "@/context/NotificationContext";
import NextTopLoader from "nextjs-toploader";
import ScrollToTop from "@/components/ScrollToTop";
import OfflineBanner from "@/components/OfflineBanner";

const fontSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-sans",
  display: "swap",
});

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
    url: "https://smartcart-frontend-g472.onrender.com/SmartCart.png",
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
    <html lang="en" className={fontSans.variable}>
      <body className={`${fontSans.className} font-sans antialiased bg-slate-50 text-slate-900 selection:bg-blue-600 selection:text-white min-h-screen flex flex-col`}>
         <ScrollToTop />
           <OfflineBanner />
        <NextTopLoader
          color="#2563eb"
          height={3}
          showSpinner={false}
          easing="ease"
          speed={300}
        />
        <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="beforeInteractive" />
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              <NotificationProvider>{children}</NotificationProvider>
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}