import {
  Carrot, Cookie, Flame, Coffee, Heart, Home, Package, Baby,
  Smartphone, Shirt, Sparkles, ShoppingBasket, LucideIcon,
  Dumbbell, BookOpen, Puzzle, PawPrint, Sofa
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
  "Sports & Fitness": { icon: Dumbbell, bg: "bg-green-50" },
  "Books & Stationery": { icon: BookOpen, bg: "bg-yellow-50" },
  "Toys & Games": { icon: Puzzle, bg: "bg-indigo-50" },
  "Pet Supplies": { icon: PawPrint, bg: "bg-amber-50" },
  "Furniture": { icon: Sofa, bg: "bg-stone-50" },
};

const fallback: CategoryStyle = { icon: ShoppingBasket, bg: "bg-gray-50" };

export const getCategoryStyle = (category: string): CategoryStyle => {
  return styles[category] || fallback;
};