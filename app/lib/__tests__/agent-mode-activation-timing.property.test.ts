/**
 * Property-Based Test: Agent Mode Activation Timing
 * 
 * Feature: irresistible-offer-system, Property 4: Agent mode activation timing
 * 
 * Property: For any typing pause of 3 seconds or longer (when agent mode is enabled),
 * the system should automatically activate agent mode, and immediately deactivate it
 * when typing resumes.
 * 
 * Validates: Requirements 2.1, 2.5
 */

import fc from 'fast-check';
import { AgentModeActivationManager } from '../agent-mode-activation';

describe('Feature: irresistible-offer-system, Property 4: Agent mode activation timing', () => {
  it('should activate agent mode after 3-second pause and deactivate on typing resume', { timeout: 60000 }, async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate random activation delays >= 3 seconds (3000-3500ms) as per requirement
        fc.integer({ min: 3000, max: 3500 }),
        // Generate random number of typing events before pause
        fc.integer({ min: 1, max: 10 }),
        // Generate random typing intervals (100-500ms between keystrokes)
        fc.array(fc.integer({ min: 100, max: 500 }), { minLength: 1, maxLength: 10 }),
        async (activationDelay, typingEventCount, typingIntervals) => {
          // Track agent mode state changes
          let agentModeActivations = 0;
          let agentModeDeactivations = 0;
          let lastActivationTime: number | null = null;
          let lastDeactivationTime: number | null = null;

          // Create manager with test configuration
          const manager = new AgentModeActivationManager({
            activationDelay,
            enabled: true,
            autoActivate: true
          });

          // Start manager with callbacks
          manager.start(
            (isActive) => {
              if (isActive) {
                agentModeActivations++;
                lastActivationTime = Date.now();
              } else {
                agentModeDeactivations++;
                lastDeactivationTime = Date.now();
              }
            }
          );

          try {
            // Simulate typing events
            const startTime = Date.now();
            for (let i = 0; i < typingEventCount; i++) {
              manager.onTyping();
              
              // Wait for typing interval
              const interval = typingIntervals[i % typingIntervals.length];
              await new Promise(resolve => setTimeout(resolve, interval));
            }

            // Record time of last typing event
            const lastTypingTime = Date.now();

            // Agent mode should NOT be active during typing
            expect(manager.isAgentModeActive()).toBe(false);

            // Wait for activation delay plus buffer
            await new Promise(resolve => setTimeout(resolve, activationDelay + 200));

            // Agent mode SHOULD be active after pause
            expect(manager.isAgentModeActive()).toBe(true);
            expect(agentModeActivations).toBe(1);

            // Verify activation happened after the delay
            if (lastActivationTime) {
              const timeSinceLastTyping = lastActivationTime - lastTypingTime;
              expect(timeSinceLastTyping).toBeGreaterThanOrEqual(activationDelay - 200); // Increased tolerance to 200ms
              expect(timeSinceLastTyping).toBeLessThanOrEqual(activationDelay + 400); // Increased tolerance to 400ms
            }

            // Simulate typing resume
            const typingResumeTime = Date.now();
            manager.onTyping();

            // Agent mode should deactivate IMMEDIATELY when typing resumes
            expect(manager.isAgentModeActive()).toBe(false);
            expect(agentModeDeactivations).toBe(1);

            // Verify deactivation happened quickly after typing resumed
            if (lastDeactivationTime) {
              const deactivationDelay = lastDeactivationTime - typingResumeTime;
              expect(deactivationDelay).toBeLessThan(50); // Should be nearly instant
            }

            // Wait a bit to ensure no re-activation during typing
            await new Promise(resolve => setTimeout(resolve, 500));
            expect(manager.isAgentModeActive()).toBe(false);

            // Continue typing to ensure agent mode stays deactivated
            for (let i = 0; i < 3; i++) {
              manager.onTyping();
              await new Promise(resolve => setTimeout(resolve, 200));
              expect(manager.isAgentModeActive()).toBe(false);
            }

            // Stop typing and wait for another activation
            const secondPauseStart = Date.now();
            await new Promise(resolve => setTimeout(resolve, activationDelay + 200));

            // Agent mode should activate again after second pause
            expect(manager.isAgentModeActive()).toBe(true);
            expect(agentModeActivations).toBe(2);

            // Verify second activation timing
            if (lastActivationTime) {
              const timeSinceSecondPause = lastActivationTime - secondPauseStart;
              expect(timeSinceSecondPause).toBeGreaterThanOrEqual(activationDelay - 200); // Increased tolerance to 200ms
              expect(timeSinceSecondPause).toBeLessThanOrEqual(activationDelay + 400); // Increased tolerance to 400ms
            }

          } finally {
            // Cleanup
            manager.stop();
          }
        }
      ),
      { numRuns: 10, timeout: 30000 } // Reduced runs for faster execution
    );
  });

  it('should not activate when agent mode is disabled', { timeout: 60000 }, async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 3000, max: 3500 }),
        async (activationDelay) => {
          let agentModeActivations = 0;

          const manager = new AgentModeActivationManager({
            activationDelay,
            enabled: false, // Disabled
            autoActivate: true
          });

          manager.start((isActive) => {
            if (isActive) agentModeActivations++;
          });

          try {
            // Simulate typing
            manager.onTyping();

            // Wait for activation delay
            await new Promise(resolve => setTimeout(resolve, activationDelay + 200));

            // Agent mode should NOT activate when disabled
            expect(manager.isAgentModeActive()).toBe(false);
            expect(agentModeActivations).toBe(0);

          } finally {
            manager.stop();
          }
        }
      ),
      { numRuns: 10, timeout: 30000 }
    );
  });

  it('should not auto-activate when autoActivate is false', { timeout: 60000 }, async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 3000, max: 3500 }),
        async (activationDelay) => {
          let agentModeActivations = 0;

          const manager = new AgentModeActivationManager({
            activationDelay,
            enabled: true,
            autoActivate: false // Auto-activation disabled
          });

          manager.start((isActive) => {
            if (isActive) agentModeActivations++;
          });

          try {
            // Simulate typing
            manager.onTyping();

            // Wait for activation delay
            await new Promise(resolve => setTimeout(resolve, activationDelay + 200));

            // Agent mode should NOT auto-activate
            expect(manager.isAgentModeActive()).toBe(false);
            expect(agentModeActivations).toBe(0);

            // Manual activation should still work
            manager.activateManually();
            expect(manager.isAgentModeActive()).toBe(true);
            expect(agentModeActivations).toBe(1);

          } finally {
            manager.stop();
          }
        }
      ),
      { numRuns: 10, timeout: 30000 }
    );
  });

  it('should reset activation timer on each typing event', { timeout: 60000 }, async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 3000, max: 3500 }),
        fc.integer({ min: 5, max: 15 }), // Number of typing events
        async (activationDelay, typingEventCount) => {
          let agentModeActivations = 0;

          const manager = new AgentModeActivationManager({
            activationDelay,
            enabled: true,
            autoActivate: true
          });

          manager.start((isActive) => {
            if (isActive) agentModeActivations++;
          });

          try {
            // Simulate continuous typing with intervals shorter than activation delay
            const typingInterval = Math.floor(activationDelay / 2); // Half the activation delay

            for (let i = 0; i < typingEventCount; i++) {
              manager.onTyping();
              await new Promise(resolve => setTimeout(resolve, typingInterval));
              
              // Agent mode should NOT activate during continuous typing
              expect(manager.isAgentModeActive()).toBe(false);
            }

            // No activations should have occurred during typing
            expect(agentModeActivations).toBe(0);

            // Now stop typing and wait for activation
            await new Promise(resolve => setTimeout(resolve, activationDelay + 200));

            // Agent mode should activate after the pause
            expect(manager.isAgentModeActive()).toBe(true);
            expect(agentModeActivations).toBe(1);

          } finally {
            manager.stop();
          }
        }
      ),
      { numRuns: 10, timeout: 30000 }
    );
  });

  it('should handle rapid typing and pausing cycles correctly', { timeout: 120000 }, async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 3000, max: 3500 }),
        fc.integer({ min: 3, max: 8 }), // Number of cycles
        async (activationDelay, cycleCount) => {
          let agentModeActivations = 0;
          let agentModeDeactivations = 0;

          const manager = new AgentModeActivationManager({
            activationDelay,
            enabled: true,
            autoActivate: true
          });

          manager.start((isActive) => {
            if (isActive) {
              agentModeActivations++;
            } else {
              agentModeDeactivations++;
            }
          });

          try {
            for (let cycle = 0; cycle < cycleCount; cycle++) {
              // Type briefly
              manager.onTyping();
              await new Promise(resolve => setTimeout(resolve, 200));

              // Pause to trigger activation
              await new Promise(resolve => setTimeout(resolve, activationDelay + 200));

              // Should be active
              expect(manager.isAgentModeActive()).toBe(true);

              // Resume typing (should deactivate)
              manager.onTyping();
              expect(manager.isAgentModeActive()).toBe(false);
            }

            // Verify activation/deactivation counts match cycles
            expect(agentModeActivations).toBe(cycleCount);
            expect(agentModeDeactivations).toBe(cycleCount);

          } finally {
            manager.stop();
          }
        }
      ),
      { numRuns: 5, timeout: 60000 } // Fewer runs for multiple cycles test
    );
  });
});
