"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function AccountRedirect() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/login?redirect=/account/profile");
      } else {
        router.push("/account/profile");
      }
    }
  }, [user, loading, router]);

  return <div className="p-12 text-center text-sm text-slate-500">Redirecting to profile...</div>;
}
