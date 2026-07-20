import {
  Carrot, Cookie, Flame, Coffee, Heart, Home, Package, Baby,
  Smartphone, Shirt, Sparkles, ShoppingBasket, LucideIcon
} from "lucide-react";

interface CategoryStyle {
  icon: LucideIcon;
  bg: string;
}

const styles: Record<string, CategoryStyle> = {
  "Groceries": { icon: Carrot, bg: "bg-orange-50" },
  "Snacks & Biscuits": { icon: Cookie, bg: "bg-pink-50" },
  "Spices & Masalas": { icon: Flame, bg: "bg-red-50" },
  "Beverages & Drinks": { icon: Coffee, bg: "bg-blue-50" },
  "Personal Care": { icon: Heart, bg: "bg-purple-50" },
  "Household Essentials": { icon: Home, bg: "bg-lime-50" },
  "Instant & Packaged Food": { icon: Package, bg: "bg-teal-50" },
  "Baby Care": { icon: Baby, bg: "bg-pink-50" },
  "Electronics": { icon: Smartphone, bg: "bg-blue-50" },
  "Clothing": { icon: Shirt, bg: "bg-purple-50" },
  "Beauty": { icon: Sparkles, bg: "bg-pink-50" },
  "Home & Kitchen": { icon: Home, bg: "bg-lime-50" },
};

const fallback: CategoryStyle = { icon: ShoppingBasket, bg: "bg-gray-50" };

export const getCategoryStyle = (category: string): CategoryStyle => {
  return styles[category] || fallback;
};