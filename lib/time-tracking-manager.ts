/**
 * Time Tracking Manager
 * Handles page time measurement with tab visibility detection and accurate duration tracking
 */

export interface TimeTrackingData {
  pageUrl: string;
  startTime: number;
  endTime?: number;
  totalDuration: number;
  activeDuration: number;
  isVisible: boolean;
  pausedAt?: number;
  resumedAt?: number;
}

export interface TimeTrackingOptions {
  enableVisibilityTracking?: boolean;
  minTrackingTime?: number; // Minimum time in ms to track
  maxTrackingTime?: number; // Maximum time in ms to track (prevents outliers)
  debug?: boolean;
}

export interface TimeTrackingEvents {
  onTimeUpdate?: (data: TimeTrackingData) => void;
  onVisibilityChange?: (isVisible: boolean, data: TimeTrackingData) => void;
  onTrackingStart?: (pageUrl: string) => void;
  onTrackingStop?: (data: TimeTrackingData) => void;
}

/**
 * Time tracking manager error types
 */
export class TimeTrackingError extends Error {
  constructor(message: string, public code?: string) {
    super(message);
    this.name = 'TimeTrackingError';
  }
}

/**
 * Time Tracking Manager Class
 * Manages accurate time tracking with tab visibility detection
 */
export class TimeTrackingManager {
  private currentTracking: TimeTrackingData | null = null;
  private options: Required<TimeTrackingOptions>;
  private events: TimeTrackingEvents;
  private visibilityChangeHandler: (() => void) | null = null;
  private beforeUnloadHandler: (() => void) | null = null;
  private updateInterval: NodeJS.Timeout | null = null;
  private isInitialized = false;

  constructor(options: TimeTrackingOptions = {}, events: TimeTrackingEvents = {}) {
    this.options = {
      enableVisibilityTracking: true,
      minTrackingTime: 1000, // 1 second minimum
      maxTrackingTime: 30 * 60 * 1000, // 30 minutes maximum
      debug: false,
      ...options,
    };
    this.events = events;
  }

  /**
   * Initialize the time tracking manager
   */
  initialize(): void {
    if (this.isInitialized) {
      this.log('Time tracking manager already initialized');
      return;
    }

    if (typeof window === 'undefined') {
      throw new TimeTrackingError('Time tracking manager can only be used in browser environment', 'BROWSER_ONLY');
    }

    this.setupEventListeners();
    this.isInitialized = true;
    this.log('Time tracking manager initialized');
  }

  /**
   * Start tracking time for a page
   */
  startTracking(pageUrl: string): void {
    if (!this.isInitialized) {
      this.initialize();
    }

    // Stop any existing tracking
    if (this.currentTracking) {
      this.stopTracking();
    }

    const now = Date.now();
    const isVisible = this.getVisibilityState();

    this.currentTracking = {
      pageUrl,
      startTime: now,
      totalDuration: 0,
      activeDuration: 0,
      isVisible,
      pausedAt: isVisible ? undefined : now,
    };

    // Start update interval for active tracking
    if (isVisible) {
      this.startUpdateInterval();
    }

    this.log('Started tracking for page:', pageUrl);
    this.events.onTrackingStart?.(pageUrl);
  }

  /**
   * Stop tracking and return final duration
   */
  stopTracking(): TimeTrackingData | null {
    if (!this.currentTracking) {
      this.log('No active tracking to stop');
      return null;
    }

    const now = Date.now();
    const tracking = this.currentTracking;

    // Calculate final durations
    this.updateDurations(now);
    tracking.endTime = now;

    // Stop update interval
    this.stopUpdateInterval();

    // Create final tracking data
    const finalData: TimeTrackingData = { ...tracking };
    
    // Clear current tracking
    this.currentTracking = null;

    this.log('Stopped tracking for page:', finalData.pageUrl, 'Duration:', finalData.totalDuration);
    this.events.onTrackingStop?.(finalData);

    return finalData;
  }

  /**
   * Pause tracking (called when tab becomes invisible)
   */
  pauseTracking(): void {
    if (!this.currentTracking || !this.currentTracking.isVisible) {
      return;
    }

    const now = Date.now();
    this.updateDurations(now);
    
    this.currentTracking.isVisible = false;
    this.currentTracking.pausedAt = now;
    
    // Stop update interval
    this.stopUpdateInterval();

    this.log('Paused tracking for page:', this.currentTracking.pageUrl);
    this.events.onVisibilityChange?.(false, this.currentTracking);
  }

  /**
   * Resume tracking (called when tab becomes visible)
   */
  resumeTracking(): void {
    if (!this.currentTracking || this.currentTracking.isVisible) {
      return;
    }

    const now = Date.now();
    
    this.currentTracking.isVisible = true;
    this.currentTracking.resumedAt = now;
    this.currentTracking.pausedAt = undefined;
    
    // Start update interval
    this.startUpdateInterval();

    this.log('Resumed tracking for page:', this.currentTracking.pageUrl);
    this.events.onVisibilityChange?.(true, this.currentTracking);
  }

  /**
   * Get current tracking duration
   */
  getCurrentDuration(): number {
    if (!this.currentTracking) {
      return 0;
    }

    const now = Date.now();
    this.updateDurations(now);
    return this.currentTracking.totalDuration;
  }

  /**
   * Get current tracking data
   */
  getCurrentTrackingData(): TimeTrackingData | null {
    if (!this.currentTracking) {
      return null;
    }

    const now = Date.now();
    this.updateDurations(now);
    return { ...this.currentTracking };
  }

  /**
   * Check if currently tracking
   */
  isTracking(): boolean {
    return this.currentTracking !== null;
  }

  /**
   * Check if tracking is active (visible)
   */
  isActivelyTracking(): boolean {
    return this.currentTracking !== null && this.currentTracking.isVisible;
  }

  /**
   * Destroy the time tracking manager
   */
  destroy(): void {
    // Stop any active tracking
    if (this.currentTracking) {
      this.stopTracking();
    }

    // Remove event listeners
    this.removeEventListeners();
    
    // Clear intervals
    this.stopUpdateInterval();
    
    this.isInitialized = false;
    this.log('Time tracking manager destroyed');
  }

  /**
   * Setup event listeners for visibility and page unload
   */
  private setupEventListeners(): void {
    if (!this.options.enableVisibilityTracking) {
      return;
    }

    // Visibility change handler
    this.visibilityChangeHandler = () => {
      const isVisible = this.getVisibilityState();
      
      if (isVisible) {
        this.resumeTracking();
      } else {
        this.pauseTracking();
      }
    };

    // Before unload handler to capture final time
    this.beforeUnloadHandler = () => {
      if (this.currentTracking) {
        this.stopTracking();
      }
    };

    // Add event listeners
    document.addEventListener('visibilitychange', this.visibilityChangeHandler);
    window.addEventListener('beforeunload', this.beforeUnloadHandler);
    window.addEventListener('pagehide', this.beforeUnloadHandler);
  }

  /**
   * Remove event listeners
   */
  private removeEventListeners(): void {
    if (this.visibilityChangeHandler) {
      document.removeEventListener('visibilitychange', this.visibilityChangeHandler);
      this.visibilityChangeHandler = null;
    }

    if (this.beforeUnloadHandler) {
      window.removeEventListener('beforeunload', this.beforeUnloadHandler);
      window.removeEventListener('pagehide', this.beforeUnloadHandler);
      this.beforeUnloadHandler = null;
    }
  }

  /**
   * Get current page visibility state
   */
  private getVisibilityState(): boolean {
    if (typeof document === 'undefined') {
      return true; // Assume visible in non-browser environments
    }

    return !document.hidden;
  }

  /**
   * Update duration calculations
   */
  private updateDurations(currentTime: number): void {
    if (!this.currentTracking) {
      return;
    }

    const tracking = this.currentTracking;
    
    // Calculate total duration
    tracking.totalDuration = currentTime - tracking.startTime;
    
    // Calculate active duration (only when visible)
    if (tracking.isVisible) {
      // If currently visible, add time since last resume or start
      const lastActiveStart = tracking.resumedAt || tracking.startTime;
      const activeTime = currentTime - lastActiveStart;
      
      // Only add active time if it's positive and reasonable
      if (activeTime > 0 && activeTime < 60000) { // Max 1 minute per update
        tracking.activeDuration += activeTime;
      }
      
      // Update resume time for next calculation
      tracking.resumedAt = currentTime;
    }

    // Apply limits
    if (tracking.totalDuration > this.options.maxTrackingTime) {
      tracking.totalDuration = this.options.maxTrackingTime;
    }
    
    if (tracking.activeDuration > this.options.maxTrackingTime) {
      tracking.activeDuration = this.options.maxTrackingTime;
    }
  }

  /**
   * Start update interval for active tracking
   */
  private startUpdateInterval(): void {
    if (this.updateInterval) {
      return;
    }

    this.updateInterval = setInterval(() => {
      if (this.currentTracking && this.currentTracking.isVisible) {
        const now = Date.now();
        this.updateDurations(now);
        this.events.onTimeUpdate?.(this.currentTracking);
      }
    }, 1000); // Update every second
  }

  /**
   * Stop update interval
   */
  private stopUpdateInterval(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }

  /**
   * Log debug messages
   */
  private log(...args: any[]): void {
    if (this.options.debug) {
      console.log('[TimeTrackingManager]', ...args);
    }
  }
}

/**
 * Global time tracking manager instance
 */
let globalTimeTrackingManager: TimeTrackingManager | null = null;

/**
 * Get or create global time tracking manager instance
 */
export function getTimeTrackingManager(
  options?: TimeTrackingOptions,
  events?: TimeTrackingEvents
): TimeTrackingManager {
  if (!globalTimeTrackingManager) {
    globalTimeTrackingManager = new TimeTrackingManager(options, events);
  }
  return globalTimeTrackingManager;
}

/**
 * Initialize global time tracking manager
 */
export function initializeTimeTracking(
  options?: TimeTrackingOptions,
  events?: TimeTrackingEvents
): TimeTrackingManager {
  const manager = getTimeTrackingManager(options, events);
  manager.initialize();
  return manager;
}

/**
 * Utility function to format duration for display
 */
export function formatDuration(milliseconds: number): string {
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) {
    return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  } else {
    return `${seconds}s`;
  }
}

/**
 * Utility function to check if duration meets minimum tracking requirements
 */
export function isValidTrackingDuration(
  duration: number,
  minTime: number = 1000
): boolean {
  return duration >= minTime;
}