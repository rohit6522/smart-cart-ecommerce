"use client";

import { Suspense, useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { loginUser, verifyOtp } from "@/lib/authApi";
import { useAuth } from "@/context/AuthContext";
import { getDashboardPath } from "@/lib/roleRedirect";
import { Role } from "@/types";
import { motion } from "framer-motion";
import {
  User,
  Truck,
  ShieldCheck,
  Mail,
  Lock,
  Eye,
  EyeOff,
} from "lucide-react";

type LoginRole = "USER" | "DELIVERY_BOY" | "ADMIN";

interface RoleTab {
  id: LoginRole;
  label: string;
  icon: typeof User;
  title: string;
  subtitle: string;
  emailPlaceholder: string;
}

const ROLE_TABS: RoleTab[] = [
  {
    id: "USER",
    label: "User",
    icon: User,
    title: "Welcome Back",
    subtitle: "Login to continue shopping smart within budget",
    emailPlaceholder: "you@example.com",
  },
  {
    id: "DELIVERY_BOY",
    label: "Delivery Boy",
    icon: Truck,
    title: "Delivery Partner Login",
    subtitle: "Sign in to manage and fulfill deliveries",
    emailPlaceholder: "delivery@smartcart.com",
  },
  {
    id: "ADMIN",
    label: "Admin",
    icon: ShieldCheck,
    title: "Admin Portal",
    subtitle: "Sign in to access admin console & inventory",
    emailPlaceholder: "admin@smartcart.com",
  },
];

function LoginForm() {
  const router = useRouter();
  const { login } = useAuth();
  const searchParams = useSearchParams();
  const notice = searchParams.get("notice");

  const roleParam = searchParams.get("role")?.toUpperCase();
  const initialRole: LoginRole =
    roleParam === "ADMIN" || roleParam === "DELIVERY_BOY" || roleParam === "USER"
      ? (roleParam as LoginRole)
      : "USER";

  const [selectedRole, setSelectedRole] = useState<LoginRole>(initialRole);
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [step, setStep] = useState<"credentials" | "otp">("credentials");
  const [otp, setOtp] = useState("");
  const [otpEmail, setOtpEmail] = useState("");
  const otpInputRef = useRef<HTMLInputElement>(null);

  const activeTabInfo =
    ROLE_TABS.find((t) => t.id === selectedRole) || ROLE_TABS[0];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
      const data = await loginUser(form);

      // Verify that user logged into the corresponding role tab
      if (data.role && data.role !== selectedRole) {
        const roleLabels: Record<Role, string> = {
          USER: "User",
          DELIVERY_BOY: "Delivery Boy",
          ADMIN: "Admin",
        };
        setError(
          `This account is registered as ${roleLabels[data.role]}. Please select the "${roleLabels[data.role]}" tab above to continue.`
        );
        return;
      }

      if (!data.requiresOtp && data.token) {
        // Direct login (non-admin or non-OTP users)
        login(data.token, {
          userId: data.userId!,
          name: data.name!,
          email: data.email,
          role: data.role as Role,
        });
        router.push(getDashboardPath(data.role as Role));
        return;
      }

      // Admin requiring OTP
      if (selectedRole !== "ADMIN") {
        setError(
          "This account requires Admin OTP verification. Please switch to the Admin tab."
        );
        return;
      }
      setOtpEmail(data.email);
      setStep("otp");
    } catch (err: any) {
      setError(
        err?.response?.data?.message || "Login failed. Check your credentials."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (step === "otp") {
      otpInputRef.current?.focus();
    }
  }, [step]);

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await verifyOtp(otpEmail, otp);
      login(data.token, {
        userId: data.userId,
        name: data.name,
        email: data.email,
        role: data.role,
      });
      router.push(getDashboardPath(data.role));
    } catch (err: any) {
      setError(err?.response?.data?.message || "Invalid OTP. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-12">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-[0_12px_40px_-10px_rgba(0,0,0,0.08)] border border-slate-200/80 p-6 sm:p-8">
        {/* Header with Title and Role Subtitle */}
        <div className="mb-5">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            {activeTabInfo.title}
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">
            {activeTabInfo.subtitle}
          </p>
        </div>

        {/* Role Selection Tabs */}
        {step === "credentials" && (
          <div className="bg-slate-100/90 p-1 rounded-2xl flex items-center gap-1 mb-6 border border-slate-200/60">
            {ROLE_TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = selectedRole === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    setSelectedRole(tab.id);
                    setError("");
                  }}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl text-xs sm:text-sm font-semibold transition-all relative ${
                    isActive
                      ? "text-slate-900 shadow-xs"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeRoleTab"
                      className="absolute inset-0 bg-white rounded-xl shadow-xs border border-slate-200/60"
                      transition={{
                        type: "spring",
                        stiffness: 450,
                        damping: 30,
                      }}
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-1.5 whitespace-nowrap">
                    <Icon
                      size={15}
                      className={
                        isActive ? "text-blue-600" : "text-slate-400"
                      }
                    />
                    <span>{tab.label}</span>
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {notice === "login-required" && (
          <div className="bg-blue-50 border border-blue-100 text-blue-700 text-sm px-4 py-3 rounded-xl mb-5 font-medium">
            Please login to add items to your cart or place an order.
          </div>
        )}

        {error && (
          <div className="bg-rose-50 border border-rose-200/60 text-rose-700 text-sm px-4 py-3 rounded-xl mb-5 font-medium">
            {error}
          </div>
        )}

        {step === "credentials" ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold tracking-wider text-slate-500 mb-1.5 uppercase">
                Email Address
              </label>
              <div className="relative">
                <Mail
                  size={18}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                />
                <input
                  type="email"
                  name="email"
                  placeholder={activeTabInfo.emailPlaceholder}
                  value={form.email}
                  onChange={handleChange}
                  required
                  className="w-full border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 text-slate-900 transition-all placeholder:text-slate-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold tracking-wider text-slate-500 mb-1.5 uppercase">
                Password
              </label>
              <div className="relative">
                <Lock
                  size={18}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={handleChange}
                  required
                  className="w-full border border-slate-300 rounded-xl pl-10 pr-11 py-2.5 text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 text-slate-900 transition-all placeholder:text-slate-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="text-right">
              <Link
                href="/forgot-password"
                className="text-xs sm:text-sm text-blue-600 hover:text-blue-700 font-semibold transition-colors"
              >
                Forgot Password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-semibold py-3 rounded-xl transition-all disabled:opacity-50 shadow-sm hover:shadow-md text-sm sm:text-base mt-2"
            >
              {loading
                ? "Signing in..."
                : selectedRole === "ADMIN"
                  ? "Continue to 2FA"
                  : "Sign In"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div className="bg-blue-50 border border-blue-100 text-blue-700 text-sm px-4 py-3 rounded-xl">
              We&apos;ve sent a 6-digit verification code to{" "}
              <strong>{otpEmail}</strong>. Enter it below to complete Admin
              login.
            </div>
            <input
              ref={otpInputRef}
              type="text"
              placeholder="••••••"
              value={otp}
              onChange={(e) =>
                setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
              }
              maxLength={6}
              required
              className="w-full border border-slate-300 rounded-xl px-4 py-3 text-center text-2xl tracking-[0.5em] font-mono focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 text-slate-900"
            />
            <button
              type="submit"
              disabled={loading || otp.length !== 6}
              className="w-full bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-semibold py-3 rounded-xl transition-all disabled:opacity-50 shadow-sm hover:shadow-md text-sm sm:text-base"
            >
              {loading ? "Verifying..." : "Verify & Sign In"}
            </button>
            <button
              type="button"
              onClick={() => setStep("credentials")}
              className="w-full text-sm text-slate-500 hover:text-slate-800 font-medium py-2 transition-colors"
            >
              ← Back to login
            </button>
          </form>
        )}

        {/* Context-aware Bottom Links */}
        {selectedRole === "USER" && (
          <>
            <p className="text-center text-sm text-slate-500 mt-7">
              Don&apos;t have an account?{" "}
              <Link
                href="/register"
                className="text-blue-600 font-semibold hover:text-blue-700 transition-colors"
              >
                Register
              </Link>
            </p>

            <p className="text-center text-xs text-slate-400 mt-3">
              Just browsing?{" "}
              <Link
                href="/"
                className="text-blue-600 hover:underline font-medium"
              >
                Explore products without logging in
              </Link>
            </p>
          </>
        )}

        {selectedRole === "DELIVERY_BOY" && (
          <p className="text-center text-sm text-slate-500 mt-7">
            Want to join our delivery fleet?{" "}
            <Link
              href="/register"
              className="text-blue-600 font-semibold hover:text-blue-700 transition-colors"
            >
              Partner Registration
            </Link>
          </p>
        )}

        {selectedRole === "ADMIN" && (
          <div className="mt-7 text-center">
            <p className="text-xs text-slate-400 leading-relaxed">
              🔒 Admin console is restricted to authorized personnel. 2-Step
              Verification (OTP) is enforced.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center text-slate-400">
          Loading...
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
