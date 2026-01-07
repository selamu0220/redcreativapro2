# Implementation Plan: Modo Automático del Escritor IA

## Overview

This implementation plan breaks down the integration of automatic text improvement into discrete, manageable tasks. The plan follows a phased approach: first integrating the existing hooks, then building UI components, adding configuration, implementing error handling, and finally coordinating all interactions.

## Tasks

- [x] 1. Integrate useOptimizedAutoImprovement hook into AIWriterEditor
  - Import and initialize the `useOptimizedAutoImprovement` hook in AIWriterEditor component
  - Connect the `onImprove` callback to the existing improvement function
  - Wire up `getCurrentContent` to return current editor content
  - Add typing event handler to textarea that calls `handleTyping()`
  - Test that auto-improvement triggers after 2 seconds of inactivity
  - _Requirements: 1.1, 1.2, 4.1, 4.2_

- [ ]* 1.1 Write property test for auto-improvement activation
  - **Property 1: Auto Mode Activation Consistency**
  - **Validates: Requirements 1.1, 1.2, 4.2**

- [ ]* 1.2 Write property test for typing detection debouncing
  - **Property 2: Typing Detection Debouncing**
  - **Validates: Requirements 4.1, 4.3**

- [x] 2. Create AutoModeToggle component
  - Create new component file `app/components/AutoModeToggle.tsx`
  - Implement toggle button with enabled/disabled states
  - Add visual indicators (green=on, gray=off, blue=processing, yellow=paused)
  - Add keyboard accessibility (Space/Enter to toggle)
  - Add ARIA labels for screen readers
  - _Requirements: 2.1, 2.2, 2.3, 2.4_

- [ ]* 2.1 Write unit tests for AutoModeToggle component
  - Test rendering in all states (enabled, disabled, processing, paused)
  - Test toggle callback is called correctly
  - Test keyboard accessibility
  - _Requirements: 2.1, 2.2, 2.3, 2.4_

- [x] 3. Create AutoModeIndicator component
  - Create new component file `app/components/AutoModeIndicator.tsx`
  - Display current status (Active, Processing, Paused, Disabled)
  - Show time since last improvement
  - Show improvement count
  - Add tooltip with detailed information
  - Use color-coded badges for status
  - _Requirements: 1.3, 5.1, 5.2, 5.3, 5.4, 5.5_

- [ ]* 3.1 Write unit tests for AutoModeIndicator component
  - Test status display for all states
  - Test time formatting
  - Test improvement count display
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [x] 4. Add auto mode state management to AIWriterEditor
  - Add state for auto mode enabled/disabled
  - Add state for tracking consecutive errors
  - Implement localStorage persistence for auto mode settings
  - Load saved settings on component mount
  - Save settings when auto mode is toggled
  - _Requirements: 2.5, 7.4_

- [ ]* 4.1 Write property test for state persistence round trip
  - **Property 6: State Persistence Round Trip**
  - **Validates: Requirements 2.5, 7.4**

- [x] 5. Integrate AutoModeToggle and AutoModeIndicator into editor header
  - Add AutoModeToggle to editor header next to character/word count
  - Add AutoModeIndicator to editor header
  - Update header layout to accommodate new components
  - Ensure responsive design on smaller screens
  - Test visual layout and spacing
  - _Requirements:   1.3, 2.1, 5.1_

- [x] 6. Implement manual and auto mode coordination
  - When manual "Mejorar con IA" button is clicked, pause auto mode for 5 seconds
  - Disable manual button when auto mode is processing
  - Resume auto mode automatically after manual improvement completes
  - Ensure no concurrent improvements (manual and auto)
  - _Requirements: 3.1, 3.2, 3.3, 3.4_

- [ ]* 6.1 Write property test for manual/auto coordination
  - **Property 3: Manual and Auto Mode Coordination**
  - **Validates: Requirements 3.2, 3.3**

- [ ]* 6.2 Write property test for processing state exclusivity
  - **Property 7: Processing State Exclusivity**
  - **Validates: Requirements 3.4**

- [x] 7. Checkpoint - Ensure basic auto mode functionality works
  - Ensure all tests pass, ask the user if questions arise.

- [x] 8. Create AutoModeSettings component
  - Create new component file `app/components/AutoModeSettings.tsx`
  - Add slider for delay configuration (1-10 seconds)
  - Add slider for minimum words (5-50 words)
  - Add slider for debounce delay (500-2000ms)
  - Add enable/disable toggle
  - Add reset to defaults button
  - Implement input validation for all settings
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [ ]* 8.1 Write property test for configuration bounds validation
  - **Property 8: Configuration Bounds Validation**
  - **Validates: Requirements 7.1, 7.2**

- [ ]* 8.2 Write unit tests for AutoModeSettings component
  - Test slider value changes
  - Test input validation
  - Test reset to defaults
  - Test onChange callback
  - _Requirements: 7.1, 7.2, 7.3, 7.5_

- [x] 9. Integrate AutoModeSettings into SettingsPanel
  - Add new "Auto Mode" section to existing SettingsPanel
  - Pass auto mode configuration to AutoModeSettings
  - Handle configuration changes and apply immediately
  - Persist configuration changes to localStorage
  - _Requirements: 7.3, 7.4_

- [x] 10. Implement minimum word count validation
  - Check word count before triggering auto-improvement
  - Use configured minimum words threshold 
  - Skip auto-improvement if content is below threshold
  - Update indicator to show "Content too short" when below threshold
  - _Requirements: 4.4_

- [ ]* 10.1 Write property test for minimum content threshold
  - **Property 4: Minimum Content Threshold**
  - **Validates: Requirements 4.4**

- [x] 11. Implement error tracking and recovery
  - Add state for tracking consecutive errors
  - Increment error counter on auto-improvement failure
  - Reset error counter on successful improvement
  - Show toast notification on first error
  - Show warning toast on second error
  - Disable auto mode for 30 seconds after third consecutive error
  - Re-enable auto mode automatically after cooldown
  - Show recovery notification when re-enabled
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

- [ ]* 11.1 Write property test for error recovery behavior
  - **Property 5: Error Recovery Behavior**
  - **Validates: Requirements 6.3, 6.4**

- [ ]* 11.2 Write unit tests for error tracking
  - Test error counter increments correctly
  - Test error counter resets on success
  - Test 30-second disable after 3 errors
  - Test automatic re-enable after cooldown
  - _Requirements: 6.1, 6.2, 6.3, 6.4_

- [x] 12. Add pause logic for import operations
  - Pause auto mode when import button is clicked
  - Resume auto mode 5 seconds after import completes
  - Show "Paused" indicator during pause
  - _Requirements: 8.1_

- [x] 13. Add pause logic for settings panel
  - Pause auto mode when settings panel is opened
  - Resume auto mode when settings panel is closed  
  - Ensure settings changes apply immediately
  - _Requirements: 8.4_

- [ ]* 13.1 Write property test for pause duration consistency
  - **Property 9: Pause Duration Consistency**
  - **Validates: Requirements 8.1, 8.4**

- [x] 14. Implement toggle state synchronization
  - Ensure UI toggle, hook state, and localStorage all update together
  - Prevent race conditions during toggle
  - Add loading state during toggle if needed
  - _Requirements: 2.2, 2.5_

- [ ]* 14.1 Write property test for toggle state synchronization
  - **Property 10: Toggle State Synchronization**
  - **Validates: Requirements 2.2, 2.5**

- [x] 15. Add comprehensive error logging
  - Log all errors to console with context
  - Include timestamp, error message, and stack trace
  - Include editor state at time of error
  - Include content length and word count
  - Include auto mode configuration
  - Include recent improvement history
  - _Requirements: 6.5_

- [x] 16. Final checkpoint - Comprehensive testing
  - Test all auto mode functionality end-to-end
  - Test error scenarios and recovery
  - Test settings persistence across page reloads
  - Test manual/auto coordination
  - Test pause/resume for import and settings
  - Verify no memory leaks or performance issues
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties
- Unit tests validate specific examples and edge cases
- The implementation builds incrementally, with each phase adding functionality
- All existing functionality (manual improvement button) remains unchanged
- Auto mode is disabled by default for backward compatibility
