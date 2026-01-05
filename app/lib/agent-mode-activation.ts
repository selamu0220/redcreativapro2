/**
 * Agent Mode Activation System
 * 
 * Manages automatic activation of agent mode based on typing detection:
 * - Detects typing pauses (3-second threshold)
 * - Automatically activates agent mode when user stops typing
 * - Immediately deactivates when typing resumes
 * - Respects manual enable/disable via settings
 * 
 * Requirements: 2.1, 2.5, 3.2
 */

export interface AgentModeConfig {
  activationDelay: number; // Delay in ms before activating agent mode (default: 3000)
  enabled: boolean; // Whether agent mode is enabled
  autoActivate: boolean; // Whether to auto-activate on typing pause
}

export interface AgentModeStatus {
  isActive: boolean; // Whether agent mode is currently active
  isEnabled: boolean; // Whether agent mode feature is enabled
  autoActivate: boolean; // Whether auto-activation is enabled
  timeSinceLastTyping: number; // Time since last typing event in ms
  willActivateIn: number; // Time until activation in ms (0 if not pending)
}

export type AgentModeCallback = (isActive: boolean) => void;
export type TypingCallback = (isTyping: boolean) => void;
export type EnabledChangeCallback = (enabled: boolean) => void;

const DEFAULT_CONFIG: AgentModeConfig = {
  activationDelay: 3000, // 3 seconds as per requirements
  enabled: true,
  autoActivate: true
};

/**
 * Agent Mode Activation Manager
 * 
 * Handles the logic for detecting typing pauses and automatically
 * activating/deactivating agent mode based on user activity.
 */
export class AgentModeActivationManager {
  private config: AgentModeConfig;
  private isActive: boolean = false;
  private isTyping: boolean = false;
  private lastTypingTime: number = 0;
  private activationTimeoutId: NodeJS.Timeout | null = null;
  private statusUpdateIntervalId: NodeJS.Timeout | null = null;
  private agentModeCallback: AgentModeCallback | null = null;
  private typingCallback: TypingCallback | null = null;
  private enabledChangeCallback: EnabledChangeCallback | null = null;
  private keyboardShortcutEnabled: boolean = true;

  constructor(config: Partial<AgentModeConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Start the agent mode activation manager
   * 
   * @param agentModeCallback - Called when agent mode activates/deactivates
   * @param typingCallback - Called when typing starts/stops
   * @param enabledChangeCallback - Called when enabled state changes
   */
  start(
    agentModeCallback: AgentModeCallback,
    typingCallback?: TypingCallback,
    enabledChangeCallback?: EnabledChangeCallback
  ): void {
    this.agentModeCallback = agentModeCallback;
    this.typingCallback = typingCallback || null;
    this.enabledChangeCallback = enabledChangeCallback || null;

    // Start status update interval for UI updates
    this.statusUpdateIntervalId = setInterval(() => {
      // This allows UI to update countdown timers
    }, 100);

    console.log('Agent mode activation manager started', {
      activationDelay: this.config.activationDelay,
      enabled: this.config.enabled,
      autoActivate: this.config.autoActivate
    });
  }

  /**
   * Stop the agent mode activation manager
   */
  stop(): void {
    this.clearActivationTimeout();

    if (this.statusUpdateIntervalId) {
      clearInterval(this.statusUpdateIntervalId);
      this.statusUpdateIntervalId = null;
    }

    // Deactivate if currently active
    if (this.isActive) {
      this.deactivateAgentMode();
    }

    console.log('Agent mode activation manager stopped');
  }

  /**
   * Notify manager of typing activity
   * 
   * This should be called whenever the user types in the editor.
   * It will:
   * - Mark user as typing
   * - Deactivate agent mode if active
   * - Reset the activation timer
   */
  onTyping(): void {
    const wasTyping = this.isTyping;
    this.isTyping = true;
    this.lastTypingTime = Date.now();

    // Clear any pending activation
    this.clearActivationTimeout();

    // Deactivate agent mode immediately when typing resumes
    if (this.isActive) {
      this.deactivateAgentMode();
    }

    // Notify typing callback if state changed
    if (!wasTyping && this.typingCallback) {
      this.typingCallback(true);
    }

    // Schedule activation check after delay
    if (this.config.enabled && this.config.autoActivate) {
      this.scheduleActivation();
    }
  }

  /**
   * Manually activate agent mode
   * 
   * This bypasses the automatic activation logic and immediately
   * activates agent mode.
   */
  activateManually(): void {
    if (!this.config.enabled) {
      console.warn('Cannot activate agent mode: feature is disabled');
      return;
    }

    if (this.isActive) {
      console.warn('Agent mode is already active');
      return;
    }

    this.activateAgentMode();
  }

  /**
   * Manually deactivate agent mode
   */
  deactivateManually(): void {
    if (!this.isActive) {
      console.warn('Agent mode is not active');
      return;
    }

    this.deactivateAgentMode();
  }

  /**
   * Toggle agent mode enabled state
   * 
   * This is the primary method for keyboard shortcut (Shift+1) handling.
   * When disabled via toggle, automatic activation is prevented.
   * When enabled via toggle, automatic activation resumes.
   */
  toggleEnabled(): void {
    const newEnabled = !this.config.enabled;
    this.updateConfig({ enabled: newEnabled });

    // Notify callback
    if (this.enabledChangeCallback) {
      this.enabledChangeCallback(newEnabled);
    }

    console.log(`Agent mode ${newEnabled ? 'enabled' : 'disabled'} via toggle`);
  }

  /**
   * Set enabled state directly
   * 
   * @param enabled - Whether agent mode should be enabled
   */
  setEnabled(enabled: boolean): void {
    if (this.config.enabled === enabled) return;
    
    this.updateConfig({ enabled });

    // Notify callback
    if (this.enabledChangeCallback) {
      this.enabledChangeCallback(enabled);
    }

    console.log(`Agent mode ${enabled ? 'enabled' : 'disabled'}`);
  }

  /**
   * Check if agent mode is enabled
   */
  isEnabled(): boolean {
    return this.config.enabled;
  }

  /**
   * Update configuration
   * 
   * @param config - Partial configuration to update
   */
  updateConfig(config: Partial<AgentModeConfig>): void {
    const wasEnabled = this.config.enabled;
    const wasAutoActivate = this.config.autoActivate;

    this.config = { ...this.config, ...config };

    // Handle enable/disable
    if (wasEnabled && !this.config.enabled) {
      // Disabled: deactivate and clear timers
      this.clearActivationTimeout();
      if (this.isActive) {
        this.deactivateAgentMode();
      }
    } else if (!wasEnabled && this.config.enabled) {
      // Enabled: start activation logic if typing has stopped
      if (!this.isTyping && this.config.autoActivate) {
        this.scheduleActivation();
      }
    }

    // Handle auto-activate toggle
    if (wasAutoActivate && !this.config.autoActivate) {
      // Auto-activate disabled: clear pending activation
      this.clearActivationTimeout();
    } else if (!wasAutoActivate && this.config.autoActivate) {
      // Auto-activate enabled: schedule if not typing
      if (!this.isTyping && this.config.enabled) {
        this.scheduleActivation();
      }
    }

    console.log('Agent mode config updated:', this.config);
  }

  /**
   * Get current configuration
   */
  getConfig(): AgentModeConfig {
    return { ...this.config };
  }

  /**
   * Get current status
   */
  getStatus(): AgentModeStatus {
    const now = Date.now();
    const timeSinceLastTyping = this.lastTypingTime > 0 ? now - this.lastTypingTime : Infinity;
    
    let willActivateIn = 0;
    if (this.activationTimeoutId && !this.isActive && this.config.enabled && this.config.autoActivate) {
      willActivateIn = Math.max(0, this.config.activationDelay - timeSinceLastTyping);
    }

    return {
      isActive: this.isActive,
      isEnabled: this.config.enabled,
      autoActivate: this.config.autoActivate,
      timeSinceLastTyping,
      willActivateIn
    };
  }

  /**
   * Check if agent mode is currently active
   */
  isAgentModeActive(): boolean {
    return this.isActive;
  }

  /**
   * Check if user is currently typing
   */
  isUserTyping(): boolean {
    return this.isTyping;
  }

  /**
   * Get time since last typing event (in milliseconds)
   */
  getTimeSinceLastTyping(): number {
    if (this.lastTypingTime === 0) return Infinity;
    return Date.now() - this.lastTypingTime;
  }

  /**
   * Schedule agent mode activation after delay
   */
  private scheduleActivation(): void {
    // Clear any existing timeout
    this.clearActivationTimeout();

    // Schedule activation
    this.activationTimeoutId = setTimeout(() => {
      // Mark as no longer typing
      this.isTyping = false;

      // Notify typing callback
      if (this.typingCallback) {
        this.typingCallback(false);
      }

      // Activate agent mode if conditions are met
      if (this.config.enabled && this.config.autoActivate && !this.isActive) {
        this.activateAgentMode();
      }

      this.activationTimeoutId = null;
    }, this.config.activationDelay);
  }

  /**
   * Clear activation timeout
   */
  private clearActivationTimeout(): void {
    if (this.activationTimeoutId) {
      clearTimeout(this.activationTimeoutId);
      this.activationTimeoutId = null;
    }
  }

  /**
   * Activate agent mode
   */
  private activateAgentMode(): void {
    if (this.isActive) return;

    this.isActive = true;
    console.log('Agent mode activated');

    if (this.agentModeCallback) {
      this.agentModeCallback(true);
    }
  }

  /**
   * Deactivate agent mode
   */
  private deactivateAgentMode(): void {
    if (!this.isActive) return;

    this.isActive = false;
    console.log('Agent mode deactivated');

    if (this.agentModeCallback) {
      this.agentModeCallback(false);
    }
  }
}

/**
 * Create a singleton instance for global use
 */
let globalManager: AgentModeActivationManager | null = null;

/**
 * Get or create the global agent mode activation manager
 * 
 * @param config - Optional configuration
 * @returns Global manager instance
 */
export function getGlobalAgentModeManager(
  config?: Partial<AgentModeConfig>
): AgentModeActivationManager {
  if (!globalManager) {
    globalManager = new AgentModeActivationManager(config);
  } else if (config) {
    globalManager.updateConfig(config);
  }
  return globalManager;
}

/**
 * Destroy the global agent mode activation manager
 */
export function destroyGlobalAgentModeManager(): void {
  if (globalManager) {
    globalManager.stop();
    globalManager = null;
  }
}
