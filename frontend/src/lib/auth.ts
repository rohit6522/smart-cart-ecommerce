import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";
import connectToDatabase from "./mongodb";
import User, { IUser } from "@/models/User";

const JWT_SECRET = process.env.JWT_SECRET || "cartnova_trosto_super_secret_jwt_key_2026";
const TOKEN_EXPIRY = "7d";

export interface TokenPayload {
  userId: string;
  email: string;
  name: string;
  role: "customer" | "admin" | "delivery";
}

export function signToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch {
    return null;
  }
}

export async function getAuthSession(req?: NextRequest): Promise<TokenPayload | null> {
  let token: string | undefined;

  // 1. Check Authorization Bearer header
  if (req) {
    const authHeader = req.headers.get("authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    }
  }

  // 2. Check cookies
  if (!token) {
    try {
      const cookieStore = await cookies();
      token = cookieStore.get("token")?.value;
    } catch {
      // In non-server context
    }
  }

  if (!token) return null;
  return verifyToken(token);
}

export async function requireAuth(req?: NextRequest): Promise<IUser> {
  const session = await getAuthSession(req);
  if (!session) {
    throw new Error("Unauthorized: Please log in to continue");
  }

  await connectToDatabase();
  const user = await User.findById(session.userId);
  if (!user) {
    throw new Error("Unauthorized: User account no longer exists");
  }

  return user;
}

export async function requireAdmin(req?: NextRequest): Promise<IUser> {
  const user = await requireAuth(req);
  if (user.role !== "admin") {
    throw new Error("Forbidden: Admin access required");
  }
  return user;
}
