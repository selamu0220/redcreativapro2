/**
 * Umami Interaction Tracker
 * Handles automatic tracking of user interactions with contextual data
 */

import { getUmamiClient } from './umami-client'

export interface InteractionContext {
  elementType: string
  elementText?: string
  elementId?: string
  elementClass?: string
  pageSection?: string
  userType?: 'anonymous' | 'authenticated' | 'premium' | 'admin'
  interactionCategory?: 'navigation' | 'engagement' | 'conversion' | 'content' | 'ui'
  importance?: 'low' | 'medium' | 'high' | 'critical'
}

export interface FormInteractionData {
  formId?: string
  formAction?: string
  formMethod?: string
  fieldCount?: number
  formName?: string
  pageSection?: string
  category?: string
  importance?: 'low' | 'medium' | 'high' | 'critical'
}

export interface InteractionEvent {
  type: 'click' | 'submit' | 'focus' | 'hover' | 'scroll' | 'resize' | 'keypress'
  target: Element
  timestamp: number
  context: InteractionContext
}

export interface UmamiInteractionTrackerOptions {
  enableAutoTracking?: boolean
  trackClicks?: boolean
  trackForms?: boolean
  trackScrolling?: boolean
  trackKeyboardEvents?: boolean
  debug?: boolean
}

/**
 * Interaction Tracker Class
 */
export class UmamiInteractionTracker {
  private isInitialized = false
  private trackedElements = new WeakSet<Element>()
  private eventListeners: Array<{ element: Element | Document | Window, event: string, handler: EventListener }> = []
  private options: {
    enableAutoTracking: boolean
    trackClicks: boolean
    trackForms: boolean
    trackScrolling: boolean
    trackKeyboardEvents: boolean
    debug: boolean
  }

  constructor(options: UmamiInteractionTrackerOptions = {}) {
    this.options = {
      enableAutoTracking: true,
      trackClicks: true,
      trackForms: true,
      trackScrolling: true,
      trackKeyboardEvents: false,
      debug: false,
      ...options
    }
  }

  initialize(): void {
    if (this.isInitialized || typeof document === 'undefined') {
      return
    }
    if (this.options.enableAutoTracking) {
      this.setupAutoTracking()
    }
    this.isInitialized = true
  }

  async trackInteraction(
    type: InteractionEvent['type'],
    element: Element,
    customContext?: Partial<InteractionContext>
  ): Promise<void> {
    const context = this.buildInteractionContext(element, customContext)
    const eventName = `${type}_${context.elementType}`

    try {
      const umamiClient = getUmamiClient()
      await umamiClient.trackEvent({
        name: eventName,
        data: {
          interaction_type: type,
          element_type: context.elementType,
          element_text: context.elementText,
          element_id: context.elementId,
          element_class: context.elementClass,
          page_section: context.pageSection,
          user_type: context.userType,
          category: context.interactionCategory,
          importance: context.importance,
          timestamp: Date.now(),
          page_url: typeof window !== 'undefined' ? window.location.href : '',
          page_title: typeof document !== 'undefined' ? document.title : '',
          viewport_size: typeof window !== 'undefined' ? `${window.innerWidth}x${window.innerHeight}` : '',
          scroll_position: typeof window !== 'undefined' ? window.scrollY : 0,
        }
      })
    } catch (error) {
      this.log('Failed to track interaction:', error)
    }
  }

  async trackButtonClick(
    button: HTMLButtonElement | HTMLAnchorElement,
    customContext?: Partial<InteractionContext>
  ): Promise<void> {
    const context: Partial<InteractionContext> = {
      interactionCategory: 'engagement',
      importance: this.determineButtonImportance(button),
      pageSection: this.getPageSection(button),
      ...customContext
    }
    await this.trackInteraction('click', button as Element, context)
  }

  async trackFormSubmission(
    form: HTMLFormElement,
    customContext?: Partial<FormInteractionData>
  ): Promise<void> {
    const formData = new FormData(form)
    const fieldCount = Array.from(formData.keys()).length

    try {
      const umamiClient = getUmamiClient()
      await umamiClient.trackEvent({
        name: 'form_submission',
        data: {
          form_id: form.id || 'unnamed',
          form_action: form.action || (typeof window !== 'undefined' ? window.location.href : ''),
          form_method: form.method || 'GET',
          field_count: fieldCount,
          form_name: form.name || form.id || 'unnamed',
          page_section: customContext?.pageSection,
          category: customContext?.category,
          importance: customContext?.importance,
          timestamp: Date.now(),
          page_url: typeof window !== 'undefined' ? window.location.href : '',
        }
      })
    } catch (error) {
      this.log('Failed to track form submission:', error)
    }
  }

  async trackScrollEngagement(scrollDepth: number): Promise<void> {
    const milestones = [25, 50, 75, 90, 100]
    const milestone = milestones.find(m => scrollDepth >= m && scrollDepth < m + 5)

    if (milestone) {
      try {
        const umamiClient = getUmamiClient()
        await umamiClient.trackEvent({
          name: 'scroll_depth',
          data: {
            scroll_depth: milestone,
            page_height: typeof document !== 'undefined' ? document.documentElement.scrollHeight : 0,
            viewport_height: typeof window !== 'undefined' ? window.innerHeight : 0,
            category: 'engagement',
            importance: milestone >= 75 ? 'medium' : 'low',
            timestamp: Date.now(),
            page_url: typeof window !== 'undefined' ? window.location.href : '',
          }
        })
      } catch (error) {
        this.log('Failed to track scroll engagement:', error)
      }
    }
  }

  async trackBusinessEvent(
    eventType: 'conversion' | 'subscription' | 'purchase' | 'signup' | 'login' | 'feature_use',
    eventData: {
      value?: number
      currency?: string
      plan_type?: string
      feature_name?: string
      user_id?: string
      properties?: Record<string, any>
    }
  ): Promise<void> {
    try {
      const umamiClient = getUmamiClient()
      await umamiClient.trackEvent({
        name: eventType,
        data: {
          event_type: eventType,
          value: eventData.value,
          currency: eventData.currency,
          plan_type: eventData.plan_type,
          feature_name: eventData.feature_name,
          user_id: eventData.user_id,
          category: 'conversion',
          importance: 'critical',
          timestamp: Date.now(),
          page_url: typeof window !== 'undefined' ? window.location.href : '',
          ...eventData.properties,
        }
      })
    } catch (error) {
      this.log('Failed to track business event:', error)
    }
  }

  private setupAutoTracking(): void {
    if (this.options.trackClicks) {
      this.setupClickTracking()
    }
    if (this.options.trackForms) {
      this.setupFormTracking()
    }
    if (this.options.trackScrolling) {
      this.setupScrollTracking()
    }
  }

  private setupClickTracking(): void {
    const clickHandler = (event: Event) => {
      const target = event.target as Element
      if (this.shouldTrackElement(target)) {
        this.trackInteraction('click', target).catch(error => {
          this.log('Auto-click tracking failed:', error)
        })
      }
    }
    document.addEventListener('click', clickHandler, { passive: true })
    this.eventListeners.push({ element: document, event: 'click', handler: clickHandler })
  }

  private setupFormTracking(): void {
    const submitHandler = (event: Event) => {
      const form = event.target as HTMLFormElement
      if (form.tagName === 'FORM') {
        this.trackFormSubmission(form).catch(error => {
          this.log('Auto-form tracking failed:', error)
        })
      }
    }
    document.addEventListener('submit', submitHandler, { passive: true })
    this.eventListeners.push({ element: document, event: 'submit', handler: submitHandler })
  }

  private setupScrollTracking(): void {
    let scrollTimeout: NodeJS.Timeout | null = null
    const scrollHandler = () => {
      if (scrollTimeout) {
        clearTimeout(scrollTimeout)
      }
      scrollTimeout = setTimeout(() => {
        const scrollDepth = this.calculateScrollDepth()
        this.trackScrollEngagement(scrollDepth).catch(error => {
          this.log('Auto-scroll tracking failed:', error)
        })
      }, 1000)
    }
    if (typeof window !== 'undefined') {
      window.addEventListener('scroll', scrollHandler, { passive: true })
      this.eventListeners.push({ element: window, event: 'scroll', handler: scrollHandler })
    }
  }

  private buildInteractionContext(
    element: Element,
    customContext?: Partial<InteractionContext>
  ): InteractionContext {
    const elementType = this.getElementType(element)
    const elementText = this.getElementText(element)
    const elementId = element.id || undefined
    const elementClass = element.className || undefined
    const pageSection = this.getPageSection(element)

    return {
      elementType,
      elementText,
      elementId,
      elementClass,
      pageSection,
      userType: this.getUserType(),
      interactionCategory: this.determineCategory(element),
      importance: this.determineImportance(element),
      ...customContext
    }
  }

  private shouldTrackElement(element: Element): boolean {
    if (this.trackedElements.has(element)) {
      return false
    }
    const trackableElements = ['BUTTON', 'A', 'INPUT', 'SELECT', 'TEXTAREA']
    const isTrackable = trackableElements.includes(element.tagName) ||
                       element.getAttribute('role') === 'button' ||
                       element.hasAttribute('onclick') ||
                       element.classList.contains('clickable')

    if (isTrackable) {
      this.trackedElements.add(element)
      setTimeout(() => this.trackedElements.delete(element), 1000)
    }
    return isTrackable
  }

  private getElementType(element: Element): string {
    if (element.tagName === 'BUTTON') return 'button'
    if (element.tagName === 'A') return 'link'
    if (element.tagName === 'INPUT') {
      const type = (element as HTMLInputElement).type
      return `input_${type}`
    }
    if (element.tagName === 'SELECT') return 'select'
    if (element.tagName === 'TEXTAREA') return 'textarea'
    if (element.getAttribute('role') === 'button') return 'role_button'
    return element.tagName.toLowerCase()
  }

  private getElementText(element: Element): string | undefined {
    const text = element.textContent?.trim() || 
                 (element as HTMLInputElement).value ||
                 element.getAttribute('aria-label') ||
                 element.getAttribute('title') ||
                 element.getAttribute('alt')
    return text && text.length > 0 && text.length < 100 ? text : undefined
  }

  private getPageSection(element: Element): string | undefined {
    let current = element.parentElement
    while (current) {
      if (current.tagName === 'HEADER') return 'header'
      if (current.tagName === 'NAV') return 'navigation'
      if (current.tagName === 'MAIN') return 'main'
      if (current.tagName === 'ASIDE') return 'sidebar'
      if (current.tagName === 'FOOTER') return 'footer'
      
      const className = current.className.toLowerCase()
      if (className.includes('header')) return 'header'
      if (className.includes('nav')) return 'navigation'
      if (className.includes('sidebar')) return 'sidebar'
      if (className.includes('footer')) return 'footer'
      if (className.includes('hero')) return 'hero'
      if (className.includes('content')) return 'content'
      
      current = current.parentElement
    }
    return undefined
  }

  private determineCategory(element: Element): InteractionContext['interactionCategory'] {
    const text = this.getElementText(element)?.toLowerCase() || ''
    const className = element.className.toLowerCase()
    const id = element.id.toLowerCase()

    if (text.includes('buy') || text.includes('purchase') || text.includes('subscribe') ||
        text.includes('sign up') || text.includes('register') || text.includes('login') ||
        className.includes('cta') || className.includes('convert')) {
      return 'conversion'
    }
    if (element.tagName === 'A' || text.includes('menu') || text.includes('nav') ||
        className.includes('nav') || id.includes('nav')) {
      return 'navigation'
    }
    if (text.includes('read') || text.includes('view') || text.includes('download') ||
        className.includes('content')) {
      return 'content'
    }
    if (text.includes('close') || text.includes('toggle') || text.includes('expand') ||
        className.includes('ui') || className.includes('control')) {
      return 'ui'
    }
    return 'engagement'
  }

  private determineImportance(element: Element): InteractionContext['importance'] {
    const text = this.getElementText(element)?.toLowerCase() || ''
    const className = element.className.toLowerCase()

    if (text.includes('buy') || text.includes('purchase') || text.includes('subscribe') ||
        text.includes('delete') || text.includes('confirm') ||
        className.includes('primary') || className.includes('cta')) {
      return 'critical'
    }
    if (text.includes('sign up') || text.includes('login') || text.includes('submit') ||
        className.includes('important') || className.includes('highlight')) {
      return 'high'
    }
    if (element.tagName === 'BUTTON' || text.includes('save') || text.includes('send')) {
      return 'medium'
    }
    return 'low'
  }

  private determineButtonImportance(button: HTMLButtonElement | HTMLAnchorElement): InteractionContext['importance'] {
    const text = button.textContent?.toLowerCase() || ''
    const className = button.className.toLowerCase()

    if (text.includes('buy') || text.includes('purchase') || className.includes('primary')) {
      return 'critical'
    }
    if (text.includes('sign up') || text.includes('subscribe')) {
      return 'high'
    }
    if (button.tagName === 'BUTTON') {
      return 'medium'
    }
    return 'low'
  }

  private getUserType(): InteractionContext['userType'] {
    return 'anonymous'
  }

  private calculateScrollDepth(): number {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      return 0
    }
    const scrollTop = window.scrollY
    const documentHeight = document.documentElement.scrollHeight
    const windowHeight = window.innerHeight
    const scrollableHeight = documentHeight - windowHeight

    if (scrollableHeight <= 0) return 100
    return Math.round((scrollTop / scrollableHeight) * 100)
  }

  destroy(): void {
    this.eventListeners.forEach(({ element, event, handler }) => {
      element.removeEventListener(event, handler)
    })
    this.eventListeners = []
    this.isInitialized = false
  }

  private log(...args: any[]): void {
    if (this.options.debug) {
      console.log('[UmamiInteractionTracker]', ...args)
    }
  }
}

let globalInteractionTracker: UmamiInteractionTracker | null = null

export function getUmamiInteractionTracker(options?: UmamiInteractionTrackerOptions): UmamiInteractionTracker {
  if (!globalInteractionTracker) {
    globalInteractionTracker = new UmamiInteractionTracker(options)
  }
  return globalInteractionTracker
}

export function initializeUmamiInteractionTracker(options?: UmamiInteractionTrackerOptions): UmamiInteractionTracker {
  const tracker = getUmamiInteractionTracker(options)
  tracker.initialize()
  return tracker
}