import { NextResponse } from "next/server";

// Deprecated: Redirection to Clerk Pricing Table
export async function POST() {
  return NextResponse.json({ url: "/planes" });
}

export async function GET() {
  return NextResponse.redirect(new URL("/planes", process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"));
}
