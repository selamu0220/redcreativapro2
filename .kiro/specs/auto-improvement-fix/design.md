# Design Document: Modo Automático del Escritor IA

## Overview

This design document outlines the integration of automatic text improvement functionality into the AI Writer Editor. The system already has two well-implemented hooks (`useOptimizedAutoImprovement` and `useRealTimeAnalysis`) that provide the core functionality, but they are not currently integrated into the main editor component (`AIWriterEditor`). This design focuses on connecting these existing pieces and adding the necessary UI controls and state management to enable automatic text improvement.

The automatic mode will improve text every 2 seconds after the user stops typing, while maintaining compatibility with the existing manual improvement button. The design emphasizes user control, clear visual feedback, and graceful error handling.

## Architecture

### Component Hierarchy

```
AIWriterEditor (Enhanced)
├── AutoModeToggle (New)
├── AutoModeIndicator (New)
├── Textarea (Existing)
├── ActionBar (Existing)
│   ├── ManualImproveButton (Existing)
│   └── Other Actions (Existing)
└── SettingsPanel (Enhanced)
    └── AutoModeSettings (New)
```

### Hook Integration

The design leverages two existing hooks:

1. **useOptimizedAutoImprovement**: Manages automatic improvement logic, typing detection, and timing
2. **useRealTimeAnalysis**: Provides real-time content analysis (optional enhancement)

These hooks will be integrated into the main editor component with proper state synchronization and lifecycle management.

### State Management Flow

```
User Types → handleTyping() → useOptimizedAutoImprovement
                                    ↓
                            Debounce (1s) + Delay (2s)
                                    ↓
                            Check Conditions (minWords, enabled, not paused)
                                    ↓
                            Trigger Auto-Improvement
                                    ↓
                            Update UI State → Show Processing Indicator
                                    ↓
                            Call API → onImprove()
                                    ↓
                            Update Content → Increment Counter
```

## Components and Interfaces

### 1. Enhanced AIWriterEditor Component

**Purpose**: Main editor component with integrated automatic improvement

**New Props**:
```typescript
interface AIWriterEditorProps {
  // Existing props...
  content: string;
  onContentChange: (content: string) => void;
  onImprove: () => void;
  isProcessing: boolean;
  
  // New props for auto mode
  autoModeEnabled?: boolean;
  onAutoModeToggle?: (enabled: boolean) => void;
  autoModeConfig?: AutoImprovementConfig;
  onAutoModeConfigChange?: (config: Partial<AutoImprovementConfig>) => void;
}
```

**New State**:
```typescript
interface EditorState {
  // Auto mode state
  autoModeEnabled: boolean;
  autoModeState: AutoImprovementState;
  
  // Error tracking
  consecutiveErrors: number;
  lastErrorTime: number;
  
  // Configuration
  autoModeConfig: AutoImprovementConfig;
}
```

**Key Responsibilities**:
- Integrate `useOptimizedAutoImprovement` hook
- Manage auto mode toggle state
- Coordinate between manual and automatic improvements
- Handle typing events and pass to auto-improvement hook
- Display auto mode indicators
- Persist auto mode settings to localStorage

### 2. AutoModeToggle Component (New)

**Purpose**: UI control for enabling/disabling automatic mode

**Interface**:
```typescript
interface AutoModeToggleProps {
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
  disabled?: boolean;
  isProcessing?: boolean;
}
```

**Visual States**:
- **Enabled**: Green indicator, "Auto Mode: ON" label
- **Disabled**: Gray indicator, "Auto Mode: OFF" label
- **Processing**: Animated pulse, "Auto Mode: Processing" label
- **Paused**: Yellow indicator, "Auto Mode: Paused" label

**Location**: Editor header, next to character/word count

### 3. AutoModeIndicator Component (New)

**Purpose**: Display current auto mode status and metrics

**Interface**:
```typescript
interface AutoModeIndicatorProps {
  state: AutoImprovementState;
  config: AutoImprovementConfig;
  timeSinceLastImprovement: number;
}
```

**Display Information**:
- Current status (Active, Processing, Paused, Disabled)
- Time since last improvement
- Improvement count
- Next improvement countdown (when typing stops)

**Visual Design**:
- Compact badge in editor header
- Color-coded status (green=active, blue=processing, yellow=paused, gray=disabled)
- Tooltip with detailed information

### 4. AutoModeSettings Component (New)

**Purpose**: Configuration panel for auto mode behavior

**Interface**:
```typescript
interface AutoModeSettingsProps {
  config: AutoImprovementConfig;
  onChange: (config: Partial<AutoImprovementConfig>) => void;
  onReset: () => void;
}
```

**Configurable Options**:
- **Delay**: 1-10 seconds (slider)
- **Minimum Words**: 5-50 words (slider)
- **Debounce Delay**: 500-2000ms (slider)
- **Enable/Disable**: Toggle switch

**Location**: Inside existing SettingsPanel, new "Auto Mode" section

## Data Models

### AutoImprovementConfig

```typescript
interface AutoImprovementConfig {
  enabled: boolean;           // Master enable/disable
  delay: number;              // Delay after typing stops (ms)
  minWords: number;           // Minimum words to trigger
  maxRetries: number;         // Max consecutive error retries
  debounceDelay: number;      // Typing debounce delay (ms)
}
```

**Default Values**:
```typescript
{
  enabled: true,
  delay: 2000,        // 2 seconds
  minWords: 5,
  maxRetries: 3,
  debounceDelay: 1000 // 1 second
}
```

### AutoImprovementState

```typescript
interface AutoImprovementState {
  isTyping: boolean;          // User is currently typing
  isPaused: boolean;          // Auto mode temporarily paused
  isImproving: boolean;       // Currently improving content
  lastImprovement: number;    // Timestamp of last improvement
  improvementCount: number;   // Total improvements made
}
```

### LocalStorage Schema

```typescript
interface AutoModeStorage {
  enabled: boolean;
  config: AutoImprovementConfig;
  lastUsed: number;           // Timestamp
}
```

**Storage Key**: `redcreativa-auto-mode-settings`

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Auto Mode Activation Consistency

*For any* editor state where auto mode is enabled and content has minimum required words, when the user stops typing for the configured delay period, the system should trigger exactly one automatic improvement.

**Validates: Requirements 1.1, 1.2, 4.2**

### Property 2: Typing Detection Debouncing

*For any* sequence of typing events, when the user types within the debounce delay period, the auto-improvement timer should reset and no improvement should trigger until the full delay period elapses without typing.

**Validates: Requirements 4.1, 4.3**

### Property 3: Manual and Auto Mode Coordination

*For any* editor state where auto mode is active, when the user triggers manual improvement, the auto mode should pause for 5 seconds, then resume automatically.

**Validates: Requirements 3.2, 3.3**

### Property 4: Minimum Content Threshold

*For any* content with fewer than the configured minimum words, the auto-improvement system should not trigger, regardless of typing state or delay elapsed.

**Validates: Requirements 4.4**

### Property 5: Error Recovery Behavior

*For any* sequence of consecutive auto-improvement errors, when the error count reaches 3, the system should disable auto mode for 30 seconds, then re-enable it automatically.

**Validates: Requirements 6.3, 6.4**

### Property 6: State Persistence Round Trip

*For any* valid auto mode configuration, saving to localStorage then loading should produce an equivalent configuration with all settings preserved.

**Validates: Requirements 2.5, 7.4**

### Property 7: Processing State Exclusivity

*For any* editor state, the system should never have both manual improvement and auto improvement processing simultaneously.

**Validates: Requirements 3.4**

### Property 8: Configuration Bounds Validation

*For any* configuration update, all numeric values (delay, minWords, debounceDelay) should be constrained to their valid ranges and invalid values should be rejected.

**Validates: Requirements 7.1, 7.2**

### Property 9: Pause Duration Consistency

*For any* pause operation triggered by import, settings, or manual improvement, the pause duration should be exactly as specified and auto mode should resume automatically after that duration.

**Validates: Requirements 8.1, 8.4**

### Property 10: Toggle State Synchronization

*For any* auto mode toggle action, the UI toggle state, hook enabled state, and localStorage persisted state should all update synchronously to the same value.

**Validates: Requirements 2.2, 2.5**

## Error Handling

### Error Categories

1. **API Errors**: Network failures, timeout, rate limiting
2. **Content Errors**: Empty content, invalid format
3. **State Errors**: Invalid configuration, corrupted localStorage
4. **Timing Errors**: Race conditions, concurrent operations

### Error Recovery Strategy

**Consecutive Error Tracking**:
```typescript
interface ErrorTracker {
  consecutiveErrors: number;
  lastErrorTime: number;
  errorHistory: Array<{
    timestamp: number;
    error: Error;
    context: string;
  }>;
}
```

**Recovery Actions**:

1. **Single Error** (1st occurrence):
   - Log error to console
   - Show toast notification
   - Continue auto mode
   - Increment error counter

2. **Multiple Errors** (2nd occurrence):
   - Log error with context
   - Show warning toast
   - Continue auto mode
   - Increment error counter

3. **Persistent Errors** (3rd occurrence):
   - Log error with full history
   - Show error notification with details
   - Disable auto mode for 30 seconds
   - Reset error counter after cooldown

4. **Critical Errors** (localStorage corruption, invalid state):
   - Reset to default configuration
   - Clear corrupted data
   - Show recovery notification
   - Continue with defaults

### Error Notifications

**Toast Messages**:
- **Single Error**: "Auto-improvement failed. Retrying..."
- **Multiple Errors**: "Auto-improvement experiencing issues. Will retry."
- **Persistent Errors**: "Auto-improvement disabled temporarily due to repeated errors. Will resume in 30 seconds."
- **Recovery**: "Auto-improvement has been re-enabled."

### Error Logging

All errors should be logged with:
- Timestamp
- Error message and stack trace
- Editor state at time of error
- Content length and word count
- Auto mode configuration
- Recent improvement history

## Testing Strategy

### Unit Tests

**Component Tests**:
- AutoModeToggle renders correctly in all states
- AutoModeIndicator displays accurate information
- AutoModeSettings validates input ranges
- Configuration persistence to/from localStorage

**Hook Tests**:
- useOptimizedAutoImprovement state transitions
- Typing detection and debouncing
- Timer management and cleanup
- Error handling and recovery

**Integration Tests**:
- Manual and auto mode coordination
- Settings changes apply immediately
- Import/export pauses auto mode
- Error recovery flow

### Property-Based Tests

Each correctness property should be implemented as a property-based test with minimum 100 iterations:

**Test Configuration**:
```typescript
// Property test configuration
const propertyTestConfig = {
  iterations: 100,
  timeout: 5000,
  seed: undefined // Random seed for reproducibility
};
```

**Example Property Test**:
```typescript
// Property 1: Auto Mode Activation Consistency
test('Property 1: Auto mode triggers exactly once after delay', async () => {
  // Generate random valid configurations
  const config = generateRandomConfig();
  const content = generateRandomContent(config.minWords + 5);
  
  // Setup editor with auto mode enabled
  const { result } = renderHook(() => useOptimizedAutoImprovement({
    config,
    onImprove: mockImprove,
    getCurrentContent: () => content,
    enabled: true
  }));
  
  // Simulate typing stop
  act(() => {
    result.current.handleTyping();
  });
  
  // Wait for delay + debounce
  await waitFor(() => {
    expect(mockImprove).toHaveBeenCalledTimes(1);
  }, { timeout: config.delay + config.debounceDelay + 1000 });
  
  // Verify no additional calls
  await new Promise(resolve => setTimeout(resolve, 1000));
  expect(mockImprove).toHaveBeenCalledTimes(1);
});
```

**Property Test Tags**:
Each test should include a comment tag:
```typescript
// Feature: auto-improvement-fix, Property 1: Auto Mode Activation Consistency
```

### Manual Testing Checklist

- [ ] Enable auto mode, type text, verify improvement after 2 seconds
- [ ] Disable auto mode, verify no automatic improvements
- [ ] Type continuously, verify no improvement until typing stops
- [ ] Trigger manual improvement, verify auto mode pauses
- [ ] Change settings, verify immediate application
- [ ] Import file, verify auto mode pauses
- [ ] Cause 3 consecutive errors, verify 30-second disable
- [ ] Refresh page, verify settings persist
- [ ] Test with content below minimum words
- [ ] Test with empty content

## Implementation Notes

### Integration Steps

1. **Phase 1: Hook Integration**
   - Import `useOptimizedAutoImprovement` into AIWriterEditor
   - Connect typing events to `handleTyping()`
   - Wire up `onImprove` callback
   - Test basic auto-improvement flow

2. **Phase 2: UI Components**
   - Create AutoModeToggle component
   - Create AutoModeIndicator component
   - Add to editor header
   - Implement localStorage persistence

3. **Phase 3: Settings Panel**
   - Create AutoModeSettings component
   - Add to existing SettingsPanel
   - Implement configuration validation
   - Test settings changes

4. **Phase 4: Error Handling**
   - Implement error tracking
   - Add recovery logic
   - Create error notifications
   - Test error scenarios

5. **Phase 5: Coordination**
   - Implement manual/auto coordination
   - Add pause logic for import/settings
   - Test all interactions
   - Verify no race conditions

### Performance Considerations

**Memory Management**:
- The `useOptimizedAutoImprovement` hook already includes memory management via `useMemoryManager`
- All timeouts are tracked and cleaned up properly
- No additional memory management needed

**Debouncing**:
- Typing events are debounced at 1 second (configurable)
- Prevents excessive state updates
- Reduces unnecessary timer resets

**Optimization**:
- Use `useCallback` for all event handlers
- Memoize computed values with `useMemo`
- Avoid unnecessary re-renders with `React.memo` for child components

### Accessibility

**Keyboard Support**:
- Auto mode toggle: Space/Enter to toggle
- Settings panel: Tab navigation
- All controls keyboard accessible

**Screen Reader Support**:
- ARIA labels for all controls
- Status announcements for auto mode state changes
- Live region for improvement notifications

**Visual Indicators**:
- High contrast mode support
- Color-blind friendly status colors
- Clear text labels alongside icons

## Dependencies

### Existing Dependencies
- React hooks (useState, useEffect, useCallback, useRef)
- useOptimizedAutoImprovement hook (already implemented)
- useRealTimeAnalysis hook (already implemented)
- useMemoryManager hook (already implemented)
- Sonner toast library (already in use)
- Lucide icons (already in use)

### New Dependencies
None required - all functionality can be implemented with existing dependencies.

## Migration Strategy

Since this is adding new functionality rather than changing existing behavior:

1. **Default State**: Auto mode disabled by default for existing users
2. **Opt-in**: Users must explicitly enable auto mode
3. **Backward Compatibility**: Manual improvement button continues to work exactly as before
4. **No Breaking Changes**: All existing functionality remains unchanged

## Future Enhancements

Potential future improvements (not in current scope):

1. **Smart Delay**: Adjust delay based on typing speed
2. **Content-Aware Triggering**: Trigger on sentence/paragraph completion
3. **Improvement Preview**: Show preview before applying
4. **Undo/Redo**: Track improvement history
5. **A/B Testing**: Compare manual vs auto improvements
6. **Analytics**: Track auto mode usage and effectiveness
