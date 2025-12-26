"use client";

import { ConvexProvider, ConvexReactClient } from "convex/react";
import { ReactNode, useMemo } from "react";

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  const convex = useMemo(() => {
    const url = process.env.NEXT_PUBLIC_CONVEX_URL;
    if (!url) {
      console.error("NEXT_PUBLIC_CONVEX_URL is not defined");
      // Return a dummy client or handle it. Most Convex apps will crash anyway, 
      // but we avoid the module-level crash.
      return new ConvexReactClient("https://dummy.convex.cloud");
    }
    return new ConvexReactClient(url);
  }, []);

  return <ConvexProvider client={convex}>{children}</ConvexProvider>;
}
