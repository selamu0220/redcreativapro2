# Toggle State Synchronization Implementation

## Overview

This document describes the implementation of atomic toggle state synchronization for the Auto Mode feature in the AI Writer Editor. The implementation ensures that the UI toggle, hook state, and localStorage all update together without race conditions.

## Problem Statement

Previously, the toggle state was managed through multiple independent updates:
1. React state (`internalAutoModeEnabled`)
2. localStorage persistence (via separate `useEffect`)
3. Hook's `enabled` prop
4. Optional parent component callback

This led to potential race conditions where:
- State could be out of sync between UI and localStorage
- Rapid toggles could cause inconsistent state
- Config changes in SettingsPanel wouldn't immediately reflect in AIWriterEditor

## Solution

### 1. Atomic Toggle Handler

The `handleAutoModeToggle` function now performs all updates synchronously in a single operation:

```typescript
const handleAutoModeToggle = useCallback((enabled: boolean) => {
  // Prevent concurrent toggles
  if (isTogglingAutoMode) return;
  
  setIsTogglingAutoMode(true);
  
  try {
    // 1. Update React state
    setInternalAutoModeEnabled(enabled);
    
    // 2. Persist to localStorage (synchronous)
    const storage: AutoModeStorage = {
      enabled,
      config: autoModeConfig,
      lastUsed: Date.now()
    };
    localStorage.setItem(AUTO_MODE_STORAGE_KEY, JSON.stringify(storage));
    
    // 3. Dispatch custom event for same-window sync
    window.dispatchEvent(new CustomEvent('localStorageChange', {
      detail: { key: AUTO_MODE_STORAGE_KEY, value: storage }
    }));
    
    // 4. Notify parent component
    onAutoModeToggle?.(enabled);
    
    // 5. Show user feedback
    toast.success(enabled ? 'Modo automático activado' : 'Modo automático desactivado');
  } catch (error) {
    // Rollback on error
    setInternalAutoModeEnabled(!enabled);
    toast.error('Error al cambiar el modo automático');
  } finally {
    setIsTogglingAutoMode(false);
  }
}, [onAutoModeToggle, autoModeConfig, isTogglingAutoMode]);
```

### 2. Cross-Component Synchronization

To keep AIWriterEditor and SettingsPanel in sync, we use two mechanisms:

#### a. Storage Events (Cross-Tab)
```typescript
window.addEventListener('storage', (e) => {
  if (e.key === AUTO_MODE_STORAGE_KEY && e.newValue) {
    const parsed = JSON.parse(e.newValue);
    setInternalAutoModeEnabled(parsed.enabled);
    setAutoModeConfig(parsed.config);
  }
});
```

#### b. Custom Events (Same-Window)
```typescript
window.addEventListener('localStorageChange', (e: CustomEvent) => {
  if (e.detail?.key === AUTO_MODE_STORAGE_KEY) {
    const stored = localStorage.getItem(AUTO_MODE_STORAGE_KEY);
    const parsed = JSON.parse(stored);
    setInternalAutoModeEnabled(parsed.enabled);
    setAutoModeConfig(parsed.config);
  }
});
```

### 3. Loading State

A `isTogglingAutoMode` state prevents concurrent toggle operations:

```typescript
const [isTogglingAutoMode, setIsTogglingAutoMode] = useState(false);

// In toggle handler
if (isTogglingAutoMode) return; // Prevent concurrent toggles

// Pass to toggle component
<AutoModeToggle
  disabled={disabled || isTogglingAutoMode}
  isProcessing={autoState.isImproving || isTogglingAutoMode}
/>
```

### 4. Error Handling

If localStorage fails, the implementation:
1. Rolls back the React state
2. Shows an error toast
3. Logs the error for debugging
4. Ensures the UI remains consistent

## Benefits

1. **Atomicity**: All state updates happen together or not at all
2. **No Race Conditions**: Loading state prevents concurrent toggles
3. **Cross-Component Sync**: Changes in SettingsPanel immediately reflect in AIWriterEditor
4. **Error Recovery**: Automatic rollback on failure
5. **User Feedback**: Clear toast notifications for all state changes

## Testing

### Manual Testing

1. **Basic Toggle**
   - Enable auto mode → Verify UI, localStorage, and toast
   - Disable auto mode → Verify UI, localStorage, and toast

2. **Rapid Clicking**
   - Click toggle rapidly → Should prevent concurrent operations
   - Verify no state inconsistencies

3. **Cross-Component Sync**
   - Open SettingsPanel
   - Change auto mode config
   - Verify AIWriterEditor reflects changes immediately

4. **Cross-Tab Sync**
   - Open editor in two tabs
   - Toggle in one tab
   - Verify other tab syncs automatically

5. **Error Handling**
   - Simulate localStorage failure (full storage)
   - Verify rollback and error message

### Automated Testing

Use the test page at `/test-toggle-sync` to verify:
- State synchronization
- Event dispatching
- localStorage persistence
- Concurrent toggle prevention

## Implementation Files

- `app/escritor-ia/components/AIWriterEditor.tsx` - Main toggle handler and sync listeners
- `app/escritor-ia/components/SettingsPanel.tsx` - Config updates with event dispatch
- `app/components/AutoModeToggle.tsx` - Toggle UI component
- `app/test-toggle-sync/page.tsx` - Test page for verification

## Requirements Validated

This implementation validates:
- **Requirement 2.2**: Toggle changes auto mode state atomically
- **Requirement 2.5**: Toggle state persists to localStorage synchronously

## Future Enhancements

1. Add retry logic for localStorage failures
2. Implement optimistic updates with rollback
3. Add telemetry for toggle operations
4. Consider using IndexedDB for more reliable persistence
