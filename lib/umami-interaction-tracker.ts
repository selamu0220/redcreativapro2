/**
 * Umami Interaction Tracker
 * Enhanced event tracking for user interactions with contextual data collection
 */

export interface InteractionContext {
  pageUrl: string;
  pageTitle: string;
  pageSection?: string;
  userType?: 'anonymous' | 'authenticated' | 'premium' | 'admin';
  sessionId?: string;
  timestamp: number;
  viewport: {
    width: number;
    height: number;
  };
  device: {
    type: 'desktop' | 'tablet' | 'mobile';
    userAgent: string;
  };
}

export interface ElementInfo {
  tagName: string;
  id?: string;
  className?: string;
  text?: string;
  href?: string;
  type?: string;
  name?: string;
  value?: string;
  ariaLabel?: string;
  dataAttributes?: Record<string, string>;
}

export interface InteractionEvent {
  category: 'interaction' | 'navigation' | 'engagement' | 'conversion' | 'business' | 'error';
  action: string;
  label?: string;
  value?: number;
  importance: 'low' | 'medium' | 'high' | 'critical';
  element?: ElementInfo;
  context: InteractionContext;
  properties?: Record<string, any>;
}

export interface FormInteractionData {
  formId?: string;
  formName?: string;
  fieldCount: number;
  completedFields: number;
  timeToComplete?: number;
  validationErrors?: string[];
  submissionMethod: 'click' | 'enter' | 'programmatic';
}

export interface ClickInteractionData {
  clickType: 'single' | 'double' | 'right';
  coordinates: { x: number; y: number };
  modifierKeys: {
    ctrl: boolean;
    alt: boolean;
    shift: boolean;
    meta: boolean;
  };
  timeFromPageLoad: number;
  scrollPosition: { x: number; y: number };
}

export interface ScrollInteractionData {
  scrollDepth: number;
  maxScrollDepth: number;
  scrollDirection: 'up' | 'down';
  scrollSpeed: number;
  timeOnPage: number;
}

/**
 * Event importance classification based on business value
 */
export const EventImportance = {
  // Critical business events
  CONVERSION: 'critical' as const,
  PURCHASE: 'critical' as const,
  SIGNUP: 'critical' as const,
  SUBSCRIPTION: 'critical' as const,
  
  // High value interactions
  FORM_SUBMIT: 'high' as const,
  CTA_CLICK: 'high' as const,
  FEATURE_USE: 'high' as const,
  ERROR_ENCOUNTER: 'high' as const,
  
  // Medium value interactions
  NAVIGATION: 'medium' as const,
  CONTENT_INTERACTION: 'medium' as const,
  SEARCH: 'medium' as const,
  FILTER_USE: 'medium' as const,
  
  // Low value interactions
  HOVER: 'low' as const,
  SCROLL: 'low' as const,
  FOCUS: 'low' as const,
  TOOLTIP_VIEW: 'low' as const,
};

/**
 * Enhanced Interaction Tracker for Umami Analytics
 */
export class UmamiInteractionTracker {
  private context: Partial<InteractionContext> = {};
  private sessionId: string;
  private pageLoadTime: number;
  private scrollDepthTracker: ScrollDepthTracker;
  private formTracker: FormTracker;
  private clickTracker: ClickTracker;
  private eventCallback?: (event: InteractionEvent) => Promise<void>;

  constructor(
    eventCallback?: (event: InteractionEvent) => Promise<void>,
    options: {
      enableAutoTracking?: boolean;
      trackScrollDepth?: boolean;
      trackFormInteractions?: boolean;
      trackClickDetails?: boolean;
      userType?: InteractionContext['userType'];
    } = {}
  ) {
    this.eventCallback = eventCallback;
    this.sessionId = this.generateSessionId();
    this.pageLoadTime = Date.now();
    
    // Initialize context
    this.updateContext({
      userType: options.userType || 'anonymous',
    });

    // Initialize sub-trackers
    this.scrollDepthTracker = new ScrollDepthTracker(this.trackScrollEvent.bind(this));
    this.formTracker = new FormTracker(this.trackFormEvent.bind(this));
    this.clickTracker = new ClickTracker(this.trackClickEvent.bind(this));

    // Setup auto-tracking if enabled
    if (options.enableAutoTracking !== false) {
      this.setupAutoTracking(options);
    }
  }

  /**
   * Update interaction context
   */
  updateContext(contextUpdate: Partial<InteractionContext>): void {
    this.context = {
      ...this.context,
      ...contextUpdate,
      timestamp: Date.now(),
    };
  }

  /**
   * Track a custom interaction event
   */
  async trackInteraction(
    category: InteractionEvent['category'],
    action: string,
    options: {
      label?: string;
      value?: number;
      importance?: InteractionEvent['importance'];
      element?: ElementInfo;
      properties?: Record<string, any>;
      pageSection?: string;
    } = {}
  ): Promise<void> {
    const event: InteractionEvent = {
      category,
      action,
      label: options.label,
      value: options.value,
      importance: options.importance || this.classifyImportance(category, action),
      element: options.element,
      context: this.buildContext(options.pageSection),
      properties: options.properties,
    };

    await this.sendEvent(event);
  }

  /**
   * Track button click with enhanced context
   */
  async trackButtonClick(
    button: HTMLButtonElement,
    additionalData?: Record<string, any>
  ): Promise<void> {
    const elementInfo = this.extractElementInfo(button);
    const clickData = this.clickTracker.getLastClickData();

    await this.trackInteraction('interaction', 'button_click', {
      label: elementInfo.text || elementInfo.ariaLabel || elementInfo.id,
      importance: this.classifyButtonImportance(button),
      element: elementInfo,
      properties: {
        button_type: button.type || 'button',
        form_id: button.form?.id,
        click_details: clickData,
        ...additionalData,
      },
    });
  }

  /**
   * Track link click with navigation context
   */
  async trackLinkClick(
    link: HTMLAnchorElement,
    additionalData?: Record<string, any>
  ): Promise<void> {
    const elementInfo = this.extractElementInfo(link);
    const isExternal = this.isExternalLink(link);
    const clickData = this.clickTracker.getLastClickData();

    await this.trackInteraction('navigation', 'link_click', {
      label: elementInfo.text || elementInfo.href,
      importance: isExternal ? 'medium' : 'low',
      element: elementInfo,
      properties: {
        is_external: isExternal,
        target: link.target,
        download: link.download,
        click_details: clickData,
        ...additionalData,
      },
    });
  }

  /**
   * Track form submission with completion data
   */
  async trackFormSubmission(
    form: HTMLFormElement,
    submissionData: Partial<FormInteractionData> = {}
  ): Promise<void> {
    const elementInfo = this.extractElementInfo(form);
    const formData = this.formTracker.getFormData(form);

    await this.trackInteraction('conversion', 'form_submit', {
      label: elementInfo.name || elementInfo.id || 'unnamed_form',
      importance: 'high',
      element: elementInfo,
      properties: {
        ...formData,
        ...submissionData,
      },
    });
  }

  /**
   * Track form field interaction
   */
  async trackFormFieldInteraction(
    field: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement,
    action: 'focus' | 'blur' | 'change' | 'input',
    additionalData?: Record<string, any>
  ): Promise<void> {
    const elementInfo = this.extractElementInfo(field);
    const formData = field.form ? this.formTracker.getFormData(field.form) : undefined;

    await this.trackInteraction('interaction', `form_field_${action}`, {
      label: elementInfo.name || elementInfo.id,
      importance: 'low',
      element: elementInfo,
      properties: {
        field_type: field.type || field.tagName.toLowerCase(),
        form_data: formData,
        ...additionalData,
      },
    });
  }

  /**
   * Track search interaction
   */
  async trackSearch(
    query: string,
    results?: {
      count: number;
      source: string;
      filters?: Record<string, any>;
    }
  ): Promise<void> {
    await this.trackInteraction('engagement', 'search', {
      label: query.length > 50 ? query.substring(0, 50) + '...' : query,
      importance: 'medium',
      properties: {
        query_length: query.length,
        has_results: results ? results.count > 0 : undefined,
        result_count: results?.count,
        search_source: results?.source,
        filters_applied: results?.filters,
      },
    });
  }

  /**
   * Track error occurrence
   */
  async trackError(
    errorType: 'javascript' | 'network' | 'validation' | 'user' | 'system',
    errorDetails: {
      message: string;
      code?: string;
      stack?: string;
      url?: string;
      lineNumber?: number;
      columnNumber?: number;
    }
  ): Promise<void> {
    await this.trackInteraction('error', `${errorType}_error`, {
      label: errorDetails.message,
      importance: 'high',
      properties: {
        error_code: errorDetails.code,
        error_url: errorDetails.url,
        error_line: errorDetails.lineNumber,
        error_column: errorDetails.columnNumber,
        stack_trace: errorDetails.stack?.substring(0, 500), // Limit stack trace size
      },
    });
  }

  /**
   * Track feature usage
   */
  async trackFeatureUsage(
    featureName: string,
    action: string,
    options: {
      success?: boolean;
      duration?: number;
      metadata?: Record<string, any>;
    } = {}
  ): Promise<void> {
    await this.trackInteraction('engagement', 'feature_use', {
      label: `${featureName}_${action}`,
      importance: 'medium',
      value: options.duration,
      properties: {
        feature_name: featureName,
        feature_action: action,
        success: options.success,
        duration_ms: options.duration,
        ...options.metadata,
      },
    });
  }

  /**
   * Track business conversion events
   */
  async trackConversion(
    conversionType: 'signup' | 'purchase' | 'subscription' | 'trial' | 'download',
    conversionData: {
      value?: number;
      currency?: string;
      planType?: string;
      source?: string;
      campaign?: string;
      metadata?: Record<string, any>;
    } = {}
  ): Promise<void> {
    await this.trackInteraction('business', conversionType, {
      importance: 'critical',
      value: conversionData.value,
      properties: {
        currency: conversionData.currency,
        plan_type: conversionData.planType,
        conversion_source: conversionData.source,
        campaign: conversionData.campaign,
        ...conversionData.metadata,
      },
    });
  }

  /**
   * Setup automatic event tracking
   */
  private setupAutoTracking(options: {
    trackScrollDepth?: boolean;
    trackFormInteractions?: boolean;
    trackClickDetails?: boolean;
  }): void {
    if (typeof document === 'undefined') {
      return;
    }

    // Track clicks on buttons and links
    document.addEventListener('click', this.handleAutoClick.bind(this), true);

    // Track form submissions
    document.addEventListener('submit', this.handleAutoFormSubmit.bind(this), true);

    // Track form field interactions if enabled
    if (options.trackFormInteractions !== false) {
      document.addEventListener('focus', this.handleAutoFormFocus.bind(this), true);
      document.addEventListener('blur', this.handleAutoFormBlur.bind(this), true);
    }

    // Track scroll depth if enabled
    if (options.trackScrollDepth !== false) {
      this.scrollDepthTracker.enable();
    }

    // Track JavaScript errors
    window.addEventListener('error', this.handleAutoError.bind(this));
    window.addEventListener('unhandledrejection', this.handleAutoPromiseRejection.bind(this));
  }

  /**
   * Handle automatic click tracking
   */
  private async handleAutoClick(event: MouseEvent): Promise<void> {
    const target = event.target as HTMLElement;
    
    if (target.tagName === 'BUTTON') {
      await this.trackButtonClick(target as HTMLButtonElement);
    } else if (target.tagName === 'A') {
      await this.trackLinkClick(target as HTMLAnchorElement);
    } else if (target.closest('button')) {
      // Handle clicks on elements inside buttons
      const button = target.closest('button') as HTMLButtonElement;
      await this.trackButtonClick(button);
    } else if (target.closest('a')) {
      // Handle clicks on elements inside links
      const link = target.closest('a') as HTMLAnchorElement;
      await this.trackLinkClick(link);
    }
  }

  /**
   * Handle automatic form submission tracking
   */
  private async handleAutoFormSubmit(event: SubmitEvent): Promise<void> {
    const form = event.target as HTMLFormElement;
    await this.trackFormSubmission(form);
  }

  /**
   * Handle automatic form focus tracking
   */
  private async handleAutoFormFocus(event: FocusEvent): Promise<void> {
    const target = event.target as HTMLElement;
    if (this.isFormField(target)) {
      await this.trackFormFieldInteraction(
        target as HTMLInputElement,
        'focus'
      );
    }
  }

  /**
   * Handle automatic form blur tracking
   */
  private async handleAutoFormBlur(event: FocusEvent): Promise<void> {
    const target = event.target as HTMLElement;
    if (this.isFormField(target)) {
      await this.trackFormFieldInteraction(
        target as HTMLInputElement,
        'blur'
      );
    }
  }

  /**
   * Handle automatic error tracking
   */
  private async handleAutoError(event: ErrorEvent): Promise<void> {
    await this.trackError('javascript', {
      message: event.message,
      url: event.filename,
      lineNumber: event.lineno,
      columnNumber: event.colno,
      stack: event.error?.stack,
    });
  }

  /**
   * Handle automatic promise rejection tracking
   */
  private async handleAutoPromiseRejection(event: PromiseRejectionEvent): Promise<void> {
    await this.trackError('javascript', {
      message: `Unhandled Promise Rejection: ${event.reason}`,
      stack: event.reason?.stack,
    });
  }

  /**
   * Track scroll events
   */
  private async trackScrollEvent(scrollData: ScrollInteractionData): Promise<void> {
    await this.trackInteraction('engagement', 'scroll', {
      importance: 'low',
      value: scrollData.scrollDepth,
      properties: scrollData,
    });
  }

  /**
   * Track form events
   */
  private async trackFormEvent(
    eventType: string,
    formData: FormInteractionData
  ): Promise<void> {
    await this.trackInteraction('interaction', eventType, {
      importance: 'medium',
      properties: formData,
    });
  }

  /**
   * Track click events
   */
  private async trackClickEvent(
    eventType: string,
    clickData: ClickInteractionData
  ): Promise<void> {
    await this.trackInteraction('interaction', eventType, {
      importance: 'low',
      properties: clickData,
    });
  }

  /**
   * Build complete interaction context
   */
  private buildContext(pageSection?: string): InteractionContext {
    const baseContext: InteractionContext = {
      pageUrl: typeof window !== 'undefined' ? window.location.href : '',
      pageTitle: typeof document !== 'undefined' ? document.title : '',
      pageSection,
      sessionId: this.sessionId,
      timestamp: Date.now(),
      viewport: this.getViewportSize(),
      device: this.getDeviceInfo(),
      ...this.context,
    };

    return baseContext;
  }

  /**
   * Extract element information for tracking
   */
  private extractElementInfo(element: HTMLElement): ElementInfo {
    const info: ElementInfo = {
      tagName: element.tagName.toLowerCase(),
      id: element.id || undefined,
      className: element.className || undefined,
      text: this.getElementText(element),
    };

    // Add specific attributes based on element type
    if (element instanceof HTMLAnchorElement) {
      info.href = element.href;
    }

    if (element instanceof HTMLInputElement) {
      info.type = element.type;
      info.name = element.name;
      info.value = element.type === 'password' ? '[REDACTED]' : element.value;
    }

    if (element instanceof HTMLButtonElement) {
      info.type = element.type;
      info.name = element.name;
    }

    if (element instanceof HTMLFormElement) {
      info.name = element.name;
    }

    // Add ARIA label
    info.ariaLabel = element.getAttribute('aria-label') || undefined;

    // Extract data attributes
    const dataAttributes: Record<string, string> = {};
    Array.from(element.attributes).forEach(attr => {
      if (attr.name.startsWith('data-')) {
        dataAttributes[attr.name] = attr.value;
      }
    });

    if (Object.keys(dataAttributes).length > 0) {
      info.dataAttributes = dataAttributes;
    }

    return info;
  }

  /**
   * Get element text content safely
   */
  private getElementText(element: HTMLElement): string | undefined {
    const text = element.textContent?.trim();
    if (!text) return undefined;
    
    // Limit text length and sanitize
    return text.length > 100 ? text.substring(0, 100) + '...' : text;
  }

  /**
   * Classify event importance based on category and action
   */
  private classifyImportance(
    category: InteractionEvent['category'],
    action: string
  ): InteractionEvent['importance'] {
    // Business events are always critical
    if (category === 'business' || category === 'conversion') {
      return 'critical';
    }

    // Error events are high importance
    if (category === 'error') {
      return 'high';
    }

    // Check specific actions
    if (action.includes('submit') || action.includes('purchase') || action.includes('signup')) {
      return 'high';
    }

    if (action.includes('click') || action.includes('search') || action.includes('feature')) {
      return 'medium';
    }

    return 'low';
  }

  /**
   * Classify button importance based on context
   */
  private classifyButtonImportance(button: HTMLButtonElement): InteractionEvent['importance'] {
    const text = button.textContent?.toLowerCase() || '';
    const className = button.className.toLowerCase();
    const type = button.type;

    // Critical buttons
    if (
      text.includes('buy') ||
      text.includes('purchase') ||
      text.includes('subscribe') ||
      text.includes('sign up') ||
      className.includes('cta') ||
      className.includes('primary')
    ) {
      return 'critical';
    }

    // High importance buttons
    if (
      type === 'submit' ||
      text.includes('submit') ||
      text.includes('save') ||
      text.includes('confirm') ||
      className.includes('submit')
    ) {
      return 'high';
    }

    // Medium importance buttons
    if (
      text.includes('search') ||
      text.includes('filter') ||
      text.includes('sort') ||
      className.includes('secondary')
    ) {
      return 'medium';
    }

    return 'low';
  }

  /**
   * Check if link is external
   */
  private isExternalLink(link: HTMLAnchorElement): boolean {
    if (!link.href) return false;
    
    try {
      const linkUrl = new URL(link.href);
      const currentUrl = new URL(window.location.href);
      return linkUrl.hostname !== currentUrl.hostname;
    } catch {
      return false;
    }
  }

  /**
   * Check if element is a form field
   */
  private isFormField(element: HTMLElement): boolean {
    return (
      element instanceof HTMLInputElement ||
      element instanceof HTMLTextAreaElement ||
      element instanceof HTMLSelectElement
    );
  }

  /**
   * Get viewport size
   */
  private getViewportSize(): { width: number; height: number } {
    if (typeof window === 'undefined') {
      return { width: 0, height: 0 };
    }

    return {
      width: window.innerWidth,
      height: window.innerHeight,
    };
  }

  /**
   * Get device information
   */
  private getDeviceInfo(): InteractionContext['device'] {
    if (typeof navigator === 'undefined') {
      return { type: 'desktop', userAgent: '' };
    }

    const userAgent = navigator.userAgent;
    let deviceType: 'desktop' | 'tablet' | 'mobile' = 'desktop';

    if (/Mobile|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)) {
      if (/iPad|Android(?!.*Mobile)/i.test(userAgent)) {
        deviceType = 'tablet';
      } else {
        deviceType = 'mobile';
      }
    }

    return {
      type: deviceType,
      userAgent,
    };
  }

  /**
   * Generate unique session ID
   */
  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Send event to callback
   */
  private async sendEvent(event: InteractionEvent): Promise<void> {
    if (this.eventCallback) {
      try {
        await this.eventCallback(event);
      } catch (error) {
        console.warn('[UmamiInteractionTracker] Failed to send event:', error);
      }
    }
  }
}

/**
 * Scroll Depth Tracker
 */
class ScrollDepthTracker {
  private maxScrollDepth = 0;
  private lastScrollTime = 0;
  private scrollTimer: NodeJS.Timeout | null = null;
  private enabled = false;
  private callback: (data: ScrollInteractionData) => void;

  constructor(callback: (data: ScrollInteractionData) => void) {
    this.callback = callback;
  }

  enable(): void {
    if (this.enabled || typeof window === 'undefined') return;
    
    this.enabled = true;
    window.addEventListener('scroll', this.handleScroll.bind(this), { passive: true });
  }

  disable(): void {
    if (!this.enabled) return;
    
    this.enabled = false;
    window.removeEventListener('scroll', this.handleScroll.bind(this));
    
    if (this.scrollTimer) {
      clearTimeout(this.scrollTimer);
      this.scrollTimer = null;
    }
  }

  private handleScroll(): void {
    const now = Date.now();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    
    const scrollDepth = Math.round((scrollTop + windowHeight) / documentHeight * 100);
    this.maxScrollDepth = Math.max(this.maxScrollDepth, scrollDepth);
    
    // Debounce scroll events
    if (this.scrollTimer) {
      clearTimeout(this.scrollTimer);
    }
    
    this.scrollTimer = setTimeout(() => {
      const scrollSpeed = this.lastScrollTime > 0 ? 
        Math.abs(scrollTop - (this.lastScrollTime || 0)) / (now - this.lastScrollTime) : 0;
      
      this.callback({
        scrollDepth,
        maxScrollDepth: this.maxScrollDepth,
        scrollDirection: scrollTop > (this.lastScrollTime || 0) ? 'down' : 'up',
        scrollSpeed,
        timeOnPage: now - (performance.timing?.navigationStart || now),
      });
      
      this.lastScrollTime = scrollTop;
    }, 250);
  }
}

/**
 * Form Tracker
 */
class FormTracker {
  private formStartTimes = new Map<HTMLFormElement, number>();
  private callback: (eventType: string, data: FormInteractionData) => void;

  constructor(callback: (eventType: string, data: FormInteractionData) => void) {
    this.callback = callback;
  }

  getFormData(form: HTMLFormElement): FormInteractionData {
    const formData = new FormData(form);
    const fields = Array.from(form.elements).filter(
      element => element instanceof HTMLInputElement || 
                element instanceof HTMLTextAreaElement || 
                element instanceof HTMLSelectElement
    );
    
    let completedFields = 0;
    const validationErrors: string[] = [];
    
    fields.forEach(field => {
      if (field instanceof HTMLInputElement || 
          field instanceof HTMLTextAreaElement || 
          field instanceof HTMLSelectElement) {
        if (field.value.trim()) {
          completedFields++;
        }
        
        if (!field.validity.valid) {
          validationErrors.push(field.validationMessage);
        }
      }
    });
    
    const startTime = this.formStartTimes.get(form);
    const timeToComplete = startTime ? Date.now() - startTime : undefined;
    
    return {
      formId: form.id,
      formName: form.name,
      fieldCount: fields.length,
      completedFields,
      timeToComplete,
      validationErrors: validationErrors.length > 0 ? validationErrors : undefined,
      submissionMethod: 'click', // Default, can be overridden
    };
  }

  trackFormStart(form: HTMLFormElement): void {
    if (!this.formStartTimes.has(form)) {
      this.formStartTimes.set(form, Date.now());
    }
  }
}

/**
 * Click Tracker
 */
class ClickTracker {
  private lastClickData: ClickInteractionData | null = null;
  private callback: (eventType: string, data: ClickInteractionData) => void;

  constructor(callback: (eventType: string, data: ClickInteractionData) => void) {
    this.callback = callback;
    
    if (typeof document !== 'undefined') {
      document.addEventListener('click', this.handleClick.bind(this), true);
      document.addEventListener('contextmenu', this.handleRightClick.bind(this), true);
      document.addEventListener('dblclick', this.handleDoubleClick.bind(this), true);
    }
  }

  getLastClickData(): ClickInteractionData | null {
    return this.lastClickData;
  }

  private handleClick(event: MouseEvent): void {
    this.lastClickData = this.createClickData(event, 'single');
  }

  private handleRightClick(event: MouseEvent): void {
    this.lastClickData = this.createClickData(event, 'right');
  }

  private handleDoubleClick(event: MouseEvent): void {
    this.lastClickData = this.createClickData(event, 'double');
  }

  private createClickData(event: MouseEvent, clickType: ClickInteractionData['clickType']): ClickInteractionData {
    return {
      clickType,
      coordinates: { x: event.clientX, y: event.clientY },
      modifierKeys: {
        ctrl: event.ctrlKey,
        alt: event.altKey,
        shift: event.shiftKey,
        meta: event.metaKey,
      },
      timeFromPageLoad: Date.now() - (performance.timing?.navigationStart || Date.now()),
      scrollPosition: {
        x: window.pageXOffset || document.documentElement.scrollLeft,
        y: window.pageYOffset || document.documentElement.scrollTop,
      },
    };
  }
}