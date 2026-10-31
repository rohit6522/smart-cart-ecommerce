"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";

export interface AuthUser {
  id?: string;
  userId?: string | number;
  name: string;
  email: string;
  role: "customer" | "admin" | "delivery" | "USER" | "ADMIN" | "DELIVERY_BOY";
  phone?: string;
  avatar?: string | null;
  profilePhoto?: string | null;
  budgetLimit?: number;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  login: (token: string, user: AuthUser) => void;
  logout: () => void;
  updateUser: (updatedData: Partial<AuthUser>) => void;
  updatePhoto: (photo: string) => void;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const refreshSession = async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          const formattedUser: AuthUser = {
            id: data.user.id,
            userId: data.user.id,
            name: data.user.name,
            email: data.user.email,
            role: data.user.role,
            phone: data.user.phone,
            avatar: data.user.avatar,
            budgetLimit: data.user.budgetLimit,
          };
          setUser(formattedUser);
          Cookies.set("user", JSON.stringify(formattedUser), { expires: 7 });
          return;
        }
      }
    } catch {
      // Ignore network errors on session refresh
    }
  };

  useEffect(() => {
    const token = Cookies.get("token");
    const userStr = Cookies.get("user");

    if (token && userStr) {
      try {
        const parsed = JSON.parse(userStr);
        setUser(parsed);
      } catch {
        Cookies.remove("token");
        Cookies.remove("user");
      }
    }

    refreshSession().finally(() => {
      setLoading(false);
    });
  }, []);

  const login = (token: string, userData: AuthUser) => {
    Cookies.set("token", token, { expires: 7 });
    Cookies.set("user", JSON.stringify(userData), { expires: 7 });
    setUser(userData);
  };

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // Ignore
    }
    Cookies.remove("token");
    Cookies.remove("user");
    setUser(null);
    router.push("/login");
  };

  const updateUser = (updatedData: Partial<AuthUser>) => {
    if (user) {
      const updated = { ...user, ...updatedData };
      setUser(updated);
      Cookies.set("user", JSON.stringify(updated), { expires: 7 });
    }
  };

  const updatePhoto = (photo: string) => {
    updateUser({ avatar: photo, profilePhoto: photo });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        updateUser,
        updatePhoto,
        refreshSession,
      }}
    >
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
