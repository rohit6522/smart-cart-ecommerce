import { NextResponse } from "next/server";
import { seedDatabase } from "@/lib/seedData";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const result = await seedDatabase();
    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    console.error("Seed error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to seed database" },
      { status: 500 }
    );
  }
}

export async function POST() {
  try {
    const result = await seedDatabase();
    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    console.error("Seed error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to seed database" },
      { status: 500 }
    );
  }
}
