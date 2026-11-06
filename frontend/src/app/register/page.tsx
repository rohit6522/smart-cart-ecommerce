"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { registerUser } from "@/lib/authApi";
import { useAuth } from "@/context/AuthContext";
import { getDashboardPath } from "@/lib/roleRedirect";
import { Role } from "@/types";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    address: "",
    role: "USER" as Role,
    referralCode: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setForm({
      ...form,
      [name]: name === "email" ? value.trim().toLowerCase() : value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await registerUser(form);
      login(data.token, {
        userId: data.userId,
        name: data.name,
        email: data.email,
        role: data.role,
      });
      router.push(getDashboardPath(data.role));
    } catch (err: any) {
      setError(
        err?.response?.data?.message || "Registration failed. Try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-12">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-[0_12px_40px_-10px_rgba(0,0,0,0.08)] border border-slate-200/80 p-8 sm:p-10">
        <h1 className="text-2xl sm:text-3xl font-bold mb-1.5 text-slate-900 tracking-tight">
          Create Account
        </h1>
        <p className="text-slate-500 mb-6 text-sm">
          Join Smart Cart and shop within budget
        </p>

        {error && (
          <div className="bg-rose-50 border border-rose-200/60 text-rose-700 text-sm px-4 py-3 rounded-xl mb-5 font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold tracking-wider text-slate-500 mb-1.5 uppercase">
              Full Name
            </label>
            <input
              type="text"
              name="name"
              placeholder="John Doe"
              value={form.name}
              onChange={handleChange}
              required
              className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 text-slate-900 transition-all placeholder:text-slate-400"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold tracking-wider text-slate-500 mb-1.5 uppercase">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              placeholder="name@example.com"
              value={form.email}
              onChange={handleChange}
              required
              className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 text-slate-900 transition-all placeholder:text-slate-400"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold tracking-wider text-slate-500 mb-1.5 uppercase">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="••••••••"
                value={form.password}
                onChange={handleChange}
                required
                className="w-full border border-slate-300 rounded-xl px-4 py-2.5 pr-11 text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 text-slate-900 transition-all placeholder:text-slate-400"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold tracking-wider text-slate-500 mb-1.5 uppercase">
              Phone Number
            </label>
            <input
              type="text"
              name="phone"
              placeholder="+91 98765 43210"
              value={form.phone}
              onChange={handleChange}
              className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 text-slate-900 transition-all placeholder:text-slate-400"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold tracking-wider text-slate-500 mb-1.5 uppercase">
              Address
            </label>
            <input
              type="text"
              name="address"
              placeholder="123 Street Name, City"
              value={form.address}
              onChange={handleChange}
              className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 text-slate-900 transition-all placeholder:text-slate-400"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold tracking-wider text-slate-500 mb-1.5 uppercase">
              I am a
            </label>
            <select
              name="role"
              value={form.role}
              onChange={handleChange}
              className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 text-slate-900 transition-all bg-white"
            >
              <option value="USER">Shopper</option>
              <option value="DELIVERY_BOY">Delivery Partner</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold tracking-wider text-slate-500 mb-1.5 uppercase">
              Referral Code (Optional)
            </label>
            <input
              type="text"
              name="referralCode"
              placeholder="e.g. SMART50"
              value={form.referralCode}
              onChange={handleChange}
              className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 text-slate-900 transition-all font-mono placeholder:font-sans placeholder:text-slate-400"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-semibold py-3 rounded-xl transition-all disabled:opacity-50 shadow-sm hover:shadow-md text-sm sm:text-base mt-2"
          >
            {loading ? "Creating account..." : "Register"}
          </button>
        </form>

        <p className="text-xs text-slate-400 text-center mt-4">
          By signing up, you agree to our{" "}
          <a
            href="/terms"
            target="_blank"
            className="text-blue-600 hover:underline font-medium"
          >
            Terms
          </a>{" "}
          and{" "}
          <a
            href="/privacy"
            target="_blank"
            className="text-blue-600 hover:underline font-medium"
          >
            Privacy Policy
          </a>
          .
        </p>

        <p className="text-center text-sm text-slate-500 mt-6">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-blue-600 font-semibold hover:text-blue-700 transition-colors"
          >
            Login
          </Link>
        </p>
      </div>
    </main>
  );
}
