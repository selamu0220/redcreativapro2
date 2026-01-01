import { handleAuth } from "@kinde-oss/kinde-auth-nextjs/server";
import { NextRequest } from "next/server";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ kindeAuth: string }> }
) {
  // Await params for Next.js 15+ compatibility
  await context.params;
  
  // handleAuth returns a handler function that we need to call
  const handler = handleAuth();
  return handler(request, context);
}
