'use client';

import { useEffect, useRef, useState } from 'react';
import { useAnalytics } from './useAnalytics';

interface EngagementConfig {
  trackScrollDepth?: boolean;
  trackTimeOnPage?: boolean;
  scrollThresholds?: number[];
  timeThresholds?: number[];
  pageName?: string;
}

export function usePageEngagement(config: EngagementConfig = {}) {
  const analytics = useAnalytics();
  const startTimeRef = useRef<number>(Date.now());
  const lastScrollDepthRef = useRef<number>(0);
  const timeThresholdsTrackedRef = useRef<Set<number>>(new Set());
  const scrollThresholdsTrackedRef = useRef<Set<number>>(new Set());
  const [isVisible, setIsVisible] = useState(true);

  const {
    trackScrollDepth = true,
    trackTimeOnPage = true,
    scrollThresholds = [25, 50, 75, 90, 100],
    timeThresholds = [10, 30, 60, 120, 300], // seconds
    pageName = 'Unknown Page'
  } = config;

  // Track scroll depth
  useEffect(() => {
    if (!trackScrollDepth) return;

    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const documentHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercentage = Math.round((scrollTop / documentHeight) * 100);

      // Update max scroll depth
      if (scrollPercentage > lastScrollDepthRef.current) {
        lastScrollDepthRef.current = scrollPercentage;
      }

      // Track scroll thresholds
      scrollThresholds.forEach(threshold => {
        if (scrollPercentage >= threshold && !scrollThresholdsTrackedRef.current.has(threshold)) {
          scrollThresholdsTrackedRef.current.add(threshold);
          // Only track valid scroll depth percentages
          if ([25, 50, 75, 90, 100].includes(threshold)) {
            analytics.trackScrollDepth(threshold as 25 | 50 | 75 | 90 | 100);
          }
        }
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [trackScrollDepth, scrollThresholds, pageName, analytics]);

  // Track time on page
  useEffect(() => {
    if (!trackTimeOnPage) return;

    const interval = setInterval(() => {
      if (!isVisible) return;

      const timeSpent = Math.floor((Date.now() - startTimeRef.current) / 1000);
      
      timeThresholds.forEach(threshold => {
        if (timeSpent >= threshold && !timeThresholdsTrackedRef.current.has(threshold)) {
          timeThresholdsTrackedRef.current.add(threshold);
          analytics.trackTimeOnPage();
        }
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [trackTimeOnPage, timeThresholds, pageName, isVisible, analytics]);

  // Track page visibility
  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsVisible(!document.hidden);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  // Track page unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      const timeSpent = Math.floor((Date.now() - startTimeRef.current) / 1000);
      const maxScrollDepth = lastScrollDepthRef.current;

      // Send final engagement metrics using time_on_page event
      analytics.trackTimeOnPage();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [pageName, analytics]);

  const getEngagementLevel = (timeSpent: number, scrollDepth: number): string => {
    if (timeSpent >= 120 && scrollDepth >= 75) return 'high';
    if (timeSpent >= 60 && scrollDepth >= 50) return 'medium';
    if (timeSpent >= 30 && scrollDepth >= 25) return 'low';
    return 'minimal';
  };

  const getCurrentEngagement = () => {
    const timeSpent = Math.floor((Date.now() - startTimeRef.current) / 1000);
    const maxScrollDepth = lastScrollDepthRef.current;
    
    return {
      timeSpent,
      maxScrollDepth,
      engagementLevel: getEngagementLevel(timeSpent, maxScrollDepth)
    };
  };

  return {
    getCurrentEngagement,
    trackFeatureInteraction: (featureName: string, action: string) => {
      analytics.trackFeatureInteraction(featureName, action);
    }
  };
}
