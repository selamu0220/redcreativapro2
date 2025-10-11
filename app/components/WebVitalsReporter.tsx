"use client";

import { useEffect } from "react";

export default function WebVitalsReporter() {
  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;

    // Dynamically import and initialize performance tracking with error handling
    import("../../lib/web-vitals")
      .then(({ initPerformanceTracking }) => {
        try {
          initPerformanceTracking();
        } catch (error) {
          console.warn('Failed to initialize performance tracking:', error);
        }
      })
      .catch((error) => {
        console.warn('Failed to load web-vitals module:', error);
      });
  }, []);

  // This component doesn't render anything
  return null;
}