"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, Lock, Mail, ArrowRight, ShieldCheck, UserCheck } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "";
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Invalid credentials");
      }

      login(data.token, {
        id: data.user.id,
        userId: data.user.id,
        name: data.user.name,
        email: data.user.email,
        role: data.user.role,
        phone: data.user.phone,
        avatar: data.user.avatar,
      });

      if (redirect) {
        router.push(redirect);
      } else if (data.user.role === "admin") {
        router.push("/admin");
      } else {
        router.push("/");
      }
    } catch (err: any) {
      setError(err.message || "Failed to sign in. Please verify your email and password.");
    } finally {
      setLoading(false);
    }
  };

  const setDemoCredentials = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError("");
  };

  return (
    <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-100 p-8 sm:p-10">
      <div className="text-center mb-6">
        <Link href="/" className="inline-flex items-center gap-2 mb-3">
          <div className="w-9 h-9 rounded-xl bg-orange-600 flex items-center justify-center text-white font-black text-lg">
            C
          </div>
          <span className="font-extrabold text-2xl tracking-tight text-slate-900">
            CART<span className="text-orange-600">NOVA</span>
          </span>
        </Link>
        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">Welcome Back</h1>
        <p className="text-xs sm:text-sm text-slate-600 mt-1">
          Sign in to access your orders, saved cart, and wishlist
        </p>
      </div>

      {error && (
        <div className="mb-5 p-3.5 bg-red-50 border border-red-200 text-red-600 text-xs font-semibold rounded-xl">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Email Address
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="email"
              required
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-orange-500 focus:bg-white"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-bold text-slate-700">Password</label>
            <Link
              href="/forgot-password"
              className="text-xs font-semibold text-orange-600 hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type={showPassword ? "text" : "password"}
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-10 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-orange-500 focus:bg-white"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 px-4 bg-orange-600 hover:bg-orange-500 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-md shadow-orange-600/25 transition-all flex items-center justify-center gap-2 hover:scale-[1.01] disabled:opacity-50"
        >
          {loading ? "Authenticating..." : "Sign In to CartNova"}
        </button>
      </form>

      {/* Demo Account Quick Buttons */}
      <div className="mt-6 pt-5 border-t border-slate-100">
        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-600 text-center mb-2.5">
          Quick Demo Credentials
        </p>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setDemoCredentials("customer@cartnova.com", "Customer@123456")}
            className="p-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-orange-50 hover:border-orange-200 text-slate-700 hover:text-orange-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
          >
            <UserCheck className="w-3.5 h-3.5" /> Customer
          </button>
          <button
            type="button"
            onClick={() => setDemoCredentials("admin@cartnova.com", "Admin@123456")}
            className="p-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-orange-50 hover:border-orange-200 text-slate-700 hover:text-orange-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
          >
            <ShieldCheck className="w-3.5 h-3.5" /> Admin
          </button>
        </div>
      </div>

      <p className="text-center text-xs text-slate-600 mt-6">
        Don&rsquo;t have an account yet?{" "}
        <Link
          href={`/register${redirect ? `?redirect=${encodeURIComponent(redirect)}` : ""}`}
          className="font-bold text-orange-600 hover:underline"
        >
          Create an account
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-slate-50/70 flex flex-col font-sans">
      <Header />
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <Suspense fallback={<div className="p-8 text-center text-sm">Loading login...</div>}>
          <LoginForm />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
