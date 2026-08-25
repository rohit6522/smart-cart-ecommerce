"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

interface BackButtonProps {
  href?: string; // if provided, navigates to a fixed path; otherwise goes back in history
  label?: string;
}

export default function BackButton({ href, label = "Back" }: BackButtonProps) {
  const router = useRouter();

  const handleClick = () => {
    if (href) {
      router.push(href);
    } else {
      router.back();
    }
  };

  return (
    <button
      onClick={handleClick}
      className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-4"
    >
      <ArrowLeft size={16} /> {label}
    </button>
  );
}