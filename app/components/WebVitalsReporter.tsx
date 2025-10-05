"use client";

import { useEffect } from "react";
import { initPerformanceTracking } from "@/lib/web-vitals";

export default function WebVitalsReporter() {
  useEffect(() => {
    // Initialize performance tracking on client side
    initPerformanceTracking();
  }, []);

  // This component doesn't render anything
  return null;
}