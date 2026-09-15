"use client";

import Link from "next/link";
import { PackageX, Home } from "lucide-react";

export default function NotFound() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-5">
        <PackageX className="text-blue-400" size={36} />
      </div>
      <h1 className="text-3xl font-bold text-gray-900 mb-2">404</h1>
      <p className="text-lg font-medium text-gray-700 mb-1">Page Not Found</p>
      <p className="text-gray-500 mb-6 text-center max-w-sm">
        The page you&apos;re looking for doesn&apos;t exist or may have been moved.
      </p>
      <Link
        href="/"
        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-medium transition"
      >
        <Home size={16} /> Go to Homepage
      </Link>
    </main>
  );
}