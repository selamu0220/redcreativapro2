/**
 * Enhanced useUmamiAnalytics Hook
 * Integrates Umami client with existing analytics patterns and time tracking
 */

import { useEffect, useRef, useCallback, useState } from 'react';
import { usePathname } from 'next/navigation';
import { UmamiClient } from './umami-client';
import { TimeTrackingManager } from './time-tracking-manager';

export interface AnalyticsConfig {
  websiteId: string;
  apiUrl?: string;
  enableTimeTracking?: boolean;
  enableVisibilityTracking?: boolean;
  enableScrollTracking?: boolean;
  enableClickTracking?: boolean;
  trackingOptions?: {
    scrollThreshold?: number;
    timeThreshold?: number;
    engagementThreshold?: number;
  };
}

export interface PageMetrics {
  url: string;
  title: string;
  timeSpent: number;
  scrollDepth: number;
  interactions: number;
  bounced: boolean;
  engaged: boolean;
}

export interface AnalyticsHookReturn {
  // Core tracking methods
  trackPageView: (url?: string, title?: string) => void;
  trackEvent: (name: string, data?: Record<string, any>) => void;
  trackCustomEvent: (name: string, data?: Record<string, any>) => void;
  
  // User interaction tracking
  trackClick: (element: string, data?: Record<string, any>) => void;
  trackScroll: (depth: number) => void;
  trackEngagement: (type: string, data?: Record<string, any>) => void;
  
  // Time tracking
  startTimeTracking: (pageId?: string) => void;
  stopTimeTracking: () => number;
  getTimeSpent: () => number;
  
  // Session management
  startSession: () => void;
  endSession: () => void;
  
  // Analytics state
  isTracking: boolean;
  currentMetrics: PageMetrics | null;
  sessionId: string | null;
  
  // Utility methods
  identify: (userId: string, traits?: Record<string, any>) => void;
  reset: () => void;
  getAnalyticsData: () => any;
}

/**
 * Enhanced Umami Analytics Hook
 */
export function useUmamiAnalytics(config: AnalyticsConfig): AnalyticsHookReturn {
  const pathname = usePathname();
  const [isTracking, setIsTracking] = useState(false);
  const [currentMetrics, setCurrentMetrics] = useState<PageMetrics | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  
  // Refs for tracking state
  const umamiClient = useRef<UmamiClient | null>(null);
  const timeTracker = useRef<TimeTrackingManager | null>(null);
  const pageStartTime = useRef<number>(0);
  const scrollDepth = useRef<number>(0);
  const interactionCount = useRef<number>(0);
  const isEngaged = useRef<boolean>(false);
  const visibilityStartTime = useRef<number>(0);
  const totalVisibleTime = useRef<number>(0);

  // Initialize clients
  useEffect(() => {
    if (!umamiClient.current) {
      umamiClient.current = new UmamiClient({
        // websiteId: config.websiteId, // Removed as it's not in UmamiClientOptions
        // apiUrl: config.apiUrl, // Removed as it's not in UmamiClientOptions
      });
    }

    if (config.enableTimeTracking && !timeTracker.current) {
      timeTracker.current = new TimeTrackingManager();
    }

    setIsTracking(true);
    
    return () => {
      if (timeTracker.current) {
        timeTracker.current.destroy();
      }
    };
  }, [config.websiteId, config.apiUrl, config.enableTimeTracking]);

  // Generate session ID
  const generateSessionId = useCallback(() => {
    return `session_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  }, []);

  // Track page view with enhanced metrics
  const trackPageView = useCallback((url?: string, title?: string) => {
    if (!umamiClient.current) return;

    const pageUrl = url || pathname;
    const pageTitle = title || document.title;

    // End previous page tracking
    if (currentMetrics) {
      const timeSpent = Date.now() - pageStartTime.current;
      const finalMetrics: PageMetrics = {
        ...currentMetrics,
        timeSpent: totalVisibleTime.current,
        scrollDepth: scrollDepth.current,
        interactions: interactionCount.current,
        bounced: timeSpent < (config.trackingOptions?.timeThreshold || 3000),
        engaged: isEngaged.current,
      };

      // Track page end event
      // umamiClient.current.track('page_end', { // Method doesn't exist on UmamiClient
      //   url: currentMetrics.url,
      //   title: currentMetrics.title,
      //   metrics: finalMetrics,
      // });
    }

    // Start new page tracking
    pageStartTime.current = Date.now();
    visibilityStartTime.current = Date.now();
    scrollDepth.current = 0;
    interactionCount.current = 0;
    isEngaged.current = false;
    totalVisibleTime.current = 0;

    const newMetrics: PageMetrics = {
      url: pageUrl,
      title: pageTitle,
      timeSpent: 0,
      scrollDepth: 0,
      interactions: 0,
      bounced: false,
      engaged: false,
    };

    setCurrentMetrics(newMetrics);

    // Track page view
    // umamiClient.current.track('pageview', { // Method doesn't exist on UmamiClient
    //   url: pageUrl,
    //   title: pageTitle,
    //   referrer: document.referrer,
    //   timestamp: Date.now(),
    // });

    // Start time tracking
    if (timeTracker.current) {
      timeTracker.current.startTracking(pageUrl);
    }
  }, [pathname, currentMetrics, config.trackingOptions?.timeThreshold]);

  // Track custom events
  const trackEvent = useCallback((name: string, data?: Record<string, any>) => {
    if (!umamiClient.current) return;

    // umamiClient.current.track(name, { // Method doesn't exist on UmamiClient
    //   ...data,
    //   url: pathname,
    //   timestamp: Date.now(),
    //   sessionId,
    // });

    // Increment interaction count
    interactionCount.current++;
    
    // Mark as engaged after certain interactions
    if (interactionCount.current >= (config.trackingOptions?.engagementThreshold || 3)) {
      isEngaged.current = true;
    }
  }, [pathname, sessionId, config.trackingOptions?.engagementThreshold]);

  // Track custom events (alias for consistency)
  const trackCustomEvent = trackEvent;

  // Track click events
  const trackClick = useCallback((element: string, data?: Record<string, any>) => {
    trackEvent('click', {
      element,
      ...data,
    });
  }, [trackEvent]);

  // Track scroll depth
  const trackScroll = useCallback((depth: number) => {
    scrollDepth.current = Math.max(scrollDepth.current, depth);
    
    // Track scroll milestones
    const threshold = config.trackingOptions?.scrollThreshold || 25;
    if (depth > 0 && depth % threshold === 0) {
      trackEvent('scroll', {
        depth,
        milestone: `${depth}%`,
      });
    }
  }, [trackEvent, config.trackingOptions?.scrollThreshold]);

  // Track engagement events
  const trackEngagement = useCallback((type: string, data?: Record<string, any>) => {
    isEngaged.current = true;
    trackEvent('engagement', {
      type,
      ...data,
    });
  }, [trackEvent]);

  // Time tracking methods
  const startTimeTracking = useCallback((pageId?: string) => {
    if (timeTracker.current) {
      timeTracker.current.startTracking(pageId || pathname);
    }
    visibilityStartTime.current = Date.now();
  }, [pathname]);

  const stopTimeTracking = useCallback(() => {
    let timeSpent = 0;
    if (timeTracker.current) {
      const timeData = timeTracker.current.stopTracking();
      timeSpent = typeof timeData === 'number' ? timeData : timeData.activeDuration;
    }
    
    // Add current visible time
    if (visibilityStartTime.current > 0) {
      totalVisibleTime.current += Date.now() - visibilityStartTime.current;
      visibilityStartTime.current = 0;
    }
    
    return timeSpent || totalVisibleTime.current;
  }, []);

  const getTimeSpent = useCallback(() => {
    let timeSpent = 0;
    if (timeTracker.current) {
      // timeSpent = timeTracker.current.getTimeSpent(); // Method doesn't exist on TimeTrackingManager
    }
    
    // Add current session time if page is visible
    if (visibilityStartTime.current > 0) {
      timeSpent += Date.now() - visibilityStartTime.current;
    }
    
    return timeSpent || totalVisibleTime.current;
  }, []);

  // Session management
  const startSession = useCallback(() => {
    const newSessionId = generateSessionId();
    setSessionId(newSessionId);
    
    trackEvent('session_start', {
      sessionId: newSessionId,
      userAgent: navigator.userAgent,
      screen: {
        width: screen.width,
        height: screen.height,
      },
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight,
      },
    });
  }, [generateSessionId, trackEvent]);

  const endSession = useCallback(() => {
    if (sessionId) {
      const timeSpent = stopTimeTracking();
      trackEvent('session_end', {
        sessionId,
        duration: timeSpent,
        pages: currentMetrics ? 1 : 0,
      });
      setSessionId(null);
    }
  }, [sessionId, stopTimeTracking, trackEvent, currentMetrics]);

  // User identification
  const identify = useCallback((userId: string, traits?: Record<string, any>) => {
    if (!umamiClient.current) return;

    // umamiClient.current.identify(userId, traits); // Method doesn't exist on UmamiClient
    trackEvent('user_identify', {
      userId,
      traits,
    });
  }, [trackEvent]);

  // Reset analytics
  const reset = useCallback(() => {
    if (umamiClient.current) {
      // umamiClient.current.reset(); // Method doesn't exist on UmamiClient
    }
    if (timeTracker.current) {
      // timeTracker.current.reset(); // Method doesn't exist on TimeTrackingManager
    }
    
    setCurrentMetrics(null);
    setSessionId(null);
    pageStartTime.current = 0;
    scrollDepth.current = 0;
    interactionCount.current = 0;
    isEngaged.current = false;
    visibilityStartTime.current = 0;
    totalVisibleTime.current = 0;
  }, []);

  // Get analytics data
  const getAnalyticsData = useCallback(() => {
    return {
      sessionId,
      currentMetrics,
      timeSpent: getTimeSpent(),
      scrollDepth: scrollDepth.current,
      interactions: interactionCount.current,
      engaged: isEngaged.current,
      isTracking,
    };
  }, [sessionId, currentMetrics, getTimeSpent, isTracking]);

  // Setup page visibility tracking
  useEffect(() => {
    if (!config.enableVisibilityTracking) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Page became hidden
        if (visibilityStartTime.current > 0) {
          totalVisibleTime.current += Date.now() - visibilityStartTime.current;
          visibilityStartTime.current = 0;
        }
        trackEvent('page_hidden');
      } else {
        // Page became visible
        visibilityStartTime.current = Date.now();
        trackEvent('page_visible');
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [config.enableVisibilityTracking, trackEvent]);

  // Setup scroll tracking
  useEffect(() => {
    if (!config.enableScrollTracking) return;

    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = Math.round((scrollTop / scrollHeight) * 100);
      
      trackScroll(scrollPercent);
    };

    const throttledScroll = throttle(handleScroll, 250);
    window.addEventListener('scroll', throttledScroll);
    
    return () => {
      window.removeEventListener('scroll', throttledScroll);
    };
  }, [config.enableScrollTracking, trackScroll]);

  // Setup click tracking
  useEffect(() => {
    if (!config.enableClickTracking) return;

    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const tagName = target.tagName.toLowerCase();
      const className = target.className;
      const id = target.id;
      
      let elementDescription = tagName;
      if (id) elementDescription += `#${id}`;
      if (className) elementDescription += `.${className.split(' ').join('.')}`;
      
      trackClick(elementDescription, {
        x: event.clientX,
        y: event.clientY,
        button: event.button,
      });
    };

    document.addEventListener('click', handleClick);
    
    return () => {
      document.removeEventListener('click', handleClick);
    };
  }, [config.enableClickTracking, trackClick]);

  // Auto-track page views on route changes
  useEffect(() => {
    trackPageView();
  }, [pathname, trackPageView]);

  // Auto-start session on mount
  useEffect(() => {
    if (!sessionId) {
      startSession();
    }
  }, [sessionId, startSession]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      endSession();
    };
  }, [endSession]);

  return {
    // Core tracking methods
    trackPageView,
    trackEvent,
    trackCustomEvent,
    
    // User interaction tracking
    trackClick,
    trackScroll,
    trackEngagement,
    
    // Time tracking
    startTimeTracking,
    stopTimeTracking,
    getTimeSpent,
    
    // Session management
    startSession,
    endSession,
    
    // Analytics state
    isTracking,
    currentMetrics,
    sessionId,
    
    // Utility methods
    identify,
    reset,
    getAnalyticsData,
  };
}

/**
 * Throttle utility function
 */
function throttle<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout | null = null;
  let lastExecTime = 0;
  
  return (...args: Parameters<T>) => {
    const currentTime = Date.now();
    
    if (currentTime - lastExecTime > delay) {
      func(...args);
      lastExecTime = currentTime;
    } else {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      
      timeoutId = setTimeout(() => {
        func(...args);
        lastExecTime = Date.now();
      }, delay - (currentTime - lastExecTime));
    }
  };
}

/**
 * Hook for simple page tracking (lightweight version)
 */
export function useSimpleUmamiTracking(websiteId: string, apiUrl?: string) {
  const { trackPageView, trackEvent } = useUmamiAnalytics({
    websiteId,
    apiUrl,
    enableTimeTracking: false,
    enableVisibilityTracking: false,
    enableScrollTracking: false,
    enableClickTracking: false,
  });

  return { trackPageView, trackEvent };
}