import { handleAuth } from "@kinde-oss/kinde-auth-nextjs/server";
import { NextRequest } from "next/server";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ kindeAuth: string }> }
) {
  const params = await context.params;
  const handler = handleAuth();
  return handler(request, { params });
}
