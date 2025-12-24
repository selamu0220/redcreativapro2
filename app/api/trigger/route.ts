import { NextResponse } from "next/server";

// Trigger.dev v3 handles tasks background processing automatically.
// This route is not strictly required for v3 unless you're using it for specific webhooks.
export async function POST() {
  return NextResponse.json({ message: "Trigger.dev v3 endpoint" });
}
