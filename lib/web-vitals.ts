"use client";

// Only import web-vitals on the client side
let webVitalsModule: any = null;

// Dynamically import web-vitals only on client side
const getWebVitals = async () => {
  if (typeof window === 'undefined') return null;
  
  if (!webVitalsModule) {
    try {
      webVitalsModule = await import('web-vitals');
    } catch (error) {
      console.warn('Failed to load web-vitals:', error);
      return null;
    }
  }
  
  return webVitalsModule;
};

// Web Vitals thresholds
const VITALS_THRESHOLDS = {
  CLS: { good: 0.1, poor: 0.25 },
  FCP: { good: 1800, poor: 3000 },
  LCP: { good: 2500, poor: 4000 },
  TTFB: { good: 800, poor: 1800 },
};

// Define Metric type locally to avoid import issues
type Metric = {
  name: string;
  value: number;
  id: string;
  delta: number;
};

// Performance rating function
function getPerformanceRating(metric: Metric): "good" | "needs-improvement" | "poor" {
  const threshold = VITALS_THRESHOLDS[metric.name as keyof typeof VITALS_THRESHOLDS];
  if (!threshold) return "good";
  
  if (metric.value <= threshold.good) return "good";
  if (metric.value <= threshold.poor) return "needs-improvement";
  return "poor";
}

// Send metrics to analytics
function sendToAnalytics(metric: Metric) {
  const rating = getPerformanceRating(metric);
  
  // Send to Google Analytics 4 if available
  if (typeof window !== "undefined" && typeof (window as any).gtag !== "undefined") {
    (window as any).gtag("event", metric.name, {
      event_category: "Web Vitals",
      event_label: metric.id,
      value: Math.round(metric.name === "CLS" ? metric.value * 1000 : metric.value),
      custom_map: {
        metric_rating: rating,
        metric_delta: metric.delta,
      },
    });
  }

  // Send to Vercel Analytics if available
  if (typeof window !== "undefined" && (window as any).va) {
    (window as any).va("track", "Web Vitals", {
      metric: metric.name,
      value: metric.value,
      rating,
      id: metric.id,
      delta: metric.delta,
    });
  }

  // Console log for development
  if (process.env.NODE_ENV === "development") {
    console.log(`[Web Vitals] ${metric.name}:`, {
      value: metric.value,
      rating,
      id: metric.id,
      delta: metric.delta,
    });
  }

  // Send to custom endpoint if needed
  if (process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT) {
    fetch(process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        metric: metric.name,
        value: metric.value,
        rating,
        id: metric.id,
        delta: metric.delta,
        url: window.location.href,
        timestamp: Date.now(),
      }),
    }).catch((error) => {
      console.error("Failed to send Web Vitals to analytics:", error);
    });
  }
}

// Initialize Web Vitals tracking
export async function initWebVitals() {
  if (typeof window === 'undefined') return;
  
  try {
    const webVitals = await getWebVitals();
    if (!webVitals) return;
    
    const { onCLS, onFCP, onLCP, onTTFB } = webVitals;
    
    // Check if functions exist before calling them
    if (typeof onCLS === 'function') {
      onCLS(sendToAnalytics);
    } else {
      console.warn('onCLS function not available from web-vitals');
    }
    
    if (typeof onFCP === 'function') {
      onFCP(sendToAnalytics);
    } else {
      console.warn('onFCP function not available from web-vitals');
    }
    
    if (typeof onLCP === 'function') {
      onLCP(sendToAnalytics);
    } else {
      console.warn('onLCP function not available from web-vitals');
    }
    
    if (typeof onTTFB === 'function') {
      onTTFB(sendToAnalytics);
    } else {
      console.warn('onTTFB function not available from web-vitals');
    }
  } catch (error) {
    console.error("Failed to initialize Web Vitals:", error);
  }
}

// Report Web Vitals with custom callback
export async function reportWebVitals(onPerfEntry?: (metric: any) => void) {
  if (typeof window === 'undefined') return;
  
  if (onPerfEntry && typeof onPerfEntry === "function") {
    try {
      const webVitals = await getWebVitals();
      if (!webVitals) return;
      
      const { onCLS, onFCP, onLCP, onTTFB } = webVitals;
      
      if (typeof onCLS === 'function') {
        onCLS(onPerfEntry);
      }
      if (typeof onFCP === 'function') {
        onFCP(onPerfEntry);
      }
      if (typeof onLCP === 'function') {
        onLCP(onPerfEntry);
      }
      if (typeof onTTFB === 'function') {
        onTTFB(onPerfEntry);
      }
    } catch (error) {
      console.error("Error in reportWebVitals:", error);
    }
  }
}

// Get current Web Vitals snapshot
export async function getWebVitalsSnapshot(): Promise<Record<string, number>> {
  if (typeof window === 'undefined') return {};
  
  return new Promise(async (resolve) => {
    const vitals: Record<string, number> = {};
    let metricsCollected = 0;
    const expectedMetrics = 4; // CLS, FCP, LCP, TTFB

    const collectMetric = (metric: Metric) => {
      vitals[metric.name] = metric.value;
      metricsCollected++;
      
      if (metricsCollected >= expectedMetrics) {
        resolve(vitals);
      }
    };

    try {
      const webVitals = await getWebVitals();
      if (!webVitals) {
        resolve(vitals);
        return;
      }
      
      const { onCLS, onFCP, onLCP, onTTFB } = webVitals;
      
      // Collect metrics with timeout
      const timeout = setTimeout(() => {
        resolve(vitals);
      }, 5000);

      if (typeof onCLS === 'function') {
        onCLS(collectMetric);
      }
      if (typeof onFCP === 'function') {
        onFCP(collectMetric);
      }
      if (typeof onLCP === 'function') {
        onLCP(collectMetric);
      }
      if (typeof onTTFB === 'function') {
        onTTFB(collectMetric);
      }
    } catch (error) {
      console.error("Error collecting Web Vitals snapshot:", error);
      resolve(vitals);
    }

    // Timeout after 5 seconds
    setTimeout(() => {
      resolve(vitals);
    }, 5000);
  });
}

// Performance observer for custom metrics
export function observePerformance() {
  if (typeof window === "undefined" || !("PerformanceObserver" in window)) {
    return;
  }

  // Observe navigation timing
  const navObserver = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      if (entry.entryType === "navigation") {
        const navEntry = entry as PerformanceNavigationTiming;
        
        // Custom metrics
        const metrics = {
          domContentLoaded: navEntry.domContentLoadedEventEnd - navEntry.domContentLoadedEventStart,
          domComplete: navEntry.domComplete - navEntry.fetchStart,
          loadComplete: navEntry.loadEventEnd - navEntry.loadEventStart,
        };

        // Send custom metrics
        Object.entries(metrics).forEach(([name, value]) => {
          if (value > 0) {
            sendToAnalytics({
              name: name as any,
              value,
              id: `custom-${name}-${Date.now()}`,
              delta: value,
              entries: [],
              rating: 'good',
              navigationType: 'navigate'
            } as Metric);
          }
        });
      }
    }
  });

  navObserver.observe({ entryTypes: ["navigation"] });

  // Observe resource timing for critical resources
  const resourceObserver = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      const resourceEntry = entry as PerformanceResourceTiming;
      
      // Track critical resources
      if (
        resourceEntry.name.includes("font") ||
        resourceEntry.name.includes("critical") ||
        resourceEntry.name.includes("above-fold")
      ) {
        const loadTime = resourceEntry.responseEnd - resourceEntry.requestStart;
        
        sendToAnalytics({
          name: "resource-load-time" as any,
          value: loadTime,
          id: `resource-${resourceEntry.name}-${Date.now()}`,
          delta: loadTime,
          entries: [resourceEntry],
          rating: 'good',
          navigationType: 'navigate'
        } as Metric);
      }
    }
  });

  resourceObserver.observe({ entryTypes: ["resource"] });
}

// Initialize everything
export async function initPerformanceTracking() {
  if (typeof window === "undefined") return;

  // Initialize Web Vitals
  await initWebVitals();

  // Start performance observation
  observePerformance();

  // Track page visibility changes
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") {
      // Send any pending metrics before page unload
      getWebVitalsSnapshot().then((vitals) => {
        console.log("Final Web Vitals snapshot:", vitals);
      });
    }
  });
}

const webVitalsExports = {
  initWebVitals,
  reportWebVitals,
  getWebVitalsSnapshot,
  observePerformance,
  initPerformanceTracking,
};

export default webVitalsExports;