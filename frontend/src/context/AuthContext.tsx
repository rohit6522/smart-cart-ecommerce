"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { Role } from "@/types";

interface AuthUser {
  userId: number;
  name: string;
  email: string;
  role: Role;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  login: (token: string, user: AuthUser) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // On app load, restore session from cookies
    const token = Cookies.get("token");
    const userStr = Cookies.get("user");

    if (token && userStr) {
      try {
        setUser(JSON.parse(userStr));
      } catch {
        Cookies.remove("token");
        Cookies.remove("user");
      }
    }
    setLoading(false);
  }, []);

  const login = (token: string, userData: AuthUser) => {
    Cookies.set("token", token, { expires: 1 }); // 1 day
    Cookies.set("user", JSON.stringify(userData), { expires: 1 });
    setUser(userData);
  };

  const logout = () => {
    Cookies.remove("token");
    Cookies.remove("user");
    setUser(null);
    router.push("/login");
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}