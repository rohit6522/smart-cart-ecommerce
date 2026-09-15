"use client";

import { useEffect } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";
import Link from "next/link";
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-5">
        <AlertTriangle className="text-red-400" size={36} />
      </div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Something went wrong</h1>
      <p className="text-gray-500 mb-6 text-center max-w-sm">
        An unexpected error occurred. Please try again, or head back to the homepage.
      </p>
      <div className="flex gap-3">
        <button
          onClick={reset}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium transition"
        >
          <RotateCcw size={16} /> Try Again
        </button>

        <Link
          href="/"
          className="flex items-center gap-2 border border-gray-300 text-gray-700 hover:bg-gray-50 px-5 py-2.5 rounded-lg font-medium transition"
        >
          Go Home
        </Link>
        
      </div>
    </main>
  );
}