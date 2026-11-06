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
      className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 font-semibold mb-4 transition-colors group"
    >
      <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-0.5" /> {label}
    </button>
  );
}