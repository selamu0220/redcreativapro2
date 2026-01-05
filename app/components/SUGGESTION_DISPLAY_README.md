# Suggestion Display System

## Overview

The Suggestion Display System provides inline AI suggestions with accept/reject controls, implementing suggestion queuing to prevent overwhelming users with too many suggestions at once.

**Requirements Implemented:** 1.2, 1.4, 13.1

## Components

### 1. SuggestionDisplay

Main component that manages the display of AI suggestions.

**Features:**
- Displays up to 3 suggestions at a time (configurable)
- Queues additional suggestions automatically
- Handles keyboard shortcuts (Tab/Esc)
- Shows queue status and count
- Manages suggestion lifecycle

**Props:**
```typescript
interface SuggestionDisplayProps {
  suggestions: Suggestion[];      // Array of suggestions to display
  onAccept: (suggestion: Suggestion) => void;  // Called when suggestion accepted
  onReject: (suggestion: Suggestion) => void;  // Called when suggestion rejected
  maxVisible?: number;            // Max suggestions to show (default: 3)
  className?: string;             // Additional CSS classes
}
```

**Usage:**
```tsx
<SuggestionDisplay
  suggestions={suggestions}
  onAccept={handleAccept}
  onReject={handleReject}
  maxVisible={3}
/>
```

### 2. SuggestionCard

Individual suggestion card with visual indicators and controls.

**Features:**
- Type-specific visual styling (grammar, style, SEO, clarity)
- Shows original and suggested text side-by-side
- Displays explanation and confidence score
- Accept/reject buttons
- Highlights first suggestion for keyboard shortcuts

**Props:**
```typescript
interface SuggestionCardProps {
  suggestion: Suggestion;         // The suggestion to display
  onAccept: () => void;          // Called when accept button clicked
  onReject: () => void;          // Called when reject button clicked
  isFirst?: boolean;             // Whether this is the first suggestion
}
```

### 3. SuggestionQueue

Queue management class for handling suggestion display logic.

**Features:**
- Priority-based ordering (grammar > clarity > style > SEO)
- Automatic deduplication
- FIFO rotation when queue is full
- Type-based filtering and counting

**API:**
```typescript
const queue = new SuggestionQueue(maxVisible);

// Add suggestions
queue.addSuggestions(suggestions);
queue.addSuggestion(suggestion);

// Get suggestions
const visible = queue.getVisible();        // Get visible suggestions
const queued = queue.getQueuedCount();     // Get count of queued suggestions
const total = queue.getTotalCount();       // Get total count

// Remove suggestions
queue.remove(suggestionId);
queue.clear();

// Filter by type
const grammarSugs = queue.getByType('grammar');
const counts = queue.getCountByType();
```

## Visual Indicators

Each suggestion type has distinct visual styling:

### Grammar (Red)
- Icon: MessageSquare
- Color: Red
- Priority: Highest (4)
- Use: Correctness issues, spelling, punctuation

### Clarity (Blue)
- Icon: Lightbulb
- Color: Blue
- Priority: High (3)
- Use: Comprehension issues, wordiness, complexity

### Style (Purple)
- Icon: Sparkles
- Color: Purple
- Priority: Medium (2)
- Use: Tone, voice, word choice improvements

### SEO (Green)
- Icon: Search
- Color: Green
- Priority: Lower (1)
- Use: Keyword optimization, meta tags, links

## Keyboard Shortcuts

The system supports keyboard shortcuts for quick interaction:

- **Tab**: Accept the first (highlighted) suggestion
- **Esc**: Reject the first (highlighted) suggestion

Shortcuts work regardless of cursor position when suggestions are visible.

## Queuing Behavior

To prevent overwhelming users, the system implements intelligent queuing:

1. **Maximum Visible**: Only 3 suggestions shown at once (configurable)
2. **Priority Ordering**: Grammar issues shown first, then clarity, style, and SEO
3. **Confidence Sorting**: Within same type, higher confidence shown first
4. **Position Sorting**: Within same confidence, earlier in text shown first
5. **Automatic Rotation**: When a suggestion is accepted/rejected, next queued suggestion appears

## Integration Example

```tsx
import { useState } from "react";
import { SuggestionDisplay } from "./components/SuggestionDisplay";
import { Suggestion } from "./lib/real-time-analysis-engine";

function MyEditor() {
  const [content, setContent] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);

  const handleAccept = (suggestion: Suggestion) => {
    // Apply suggestion to content
    const before = content.substring(0, suggestion.position.start);
    const after = content.substring(suggestion.position.end);
    const newContent = before + suggestion.suggestedText + after;
    setContent(newContent);

    // Remove from suggestions
    setSuggestions(prev => prev.filter(s => s.id !== suggestion.id));

    // Log for learning
    console.log('Accepted:', suggestion.type, suggestion.confidence);
  };

  const handleReject = (suggestion: Suggestion) => {
    // Remove from suggestions
    setSuggestions(prev => prev.filter(s => s.id !== suggestion.id));

    // Log for learning
    console.log('Rejected:', suggestion.type, suggestion.confidence);
  };

  return (
    <div>
      <textarea value={content} onChange={e => setContent(e.target.value)} />
      
      {suggestions.length > 0 && (
        <SuggestionDisplay
          suggestions={suggestions}
          onAccept={handleAccept}
          onReject={handleReject}
        />
      )}
    </div>
  );
}
```

## Testing

The system includes comprehensive tests:

```bash
npm test -- app/lib/__tests__/suggestion-display-system.test.tsx --run
```

**Test Coverage:**
- ✓ Queue management (add, remove, prioritize)
- ✓ Visual rendering of suggestions
- ✓ Accept/reject button functionality
- ✓ Type-specific visual indicators
- ✓ Confidence score display
- ✓ Keyboard shortcut handling

## Demo

A demo component is available for testing and showcasing:

```tsx
import { SuggestionDisplayDemo } from "./components/SuggestionDisplayDemo";

// In your page
<SuggestionDisplayDemo />
```

The demo includes:
- 6 mock suggestions of different types
- Interactive accept/reject functionality
- Statistics tracking
- Reset capability
- Feature documentation

## Performance Considerations

- **Non-blocking**: Suggestion display doesn't block editor input
- **Efficient rendering**: Only visible suggestions are rendered
- **Memory management**: Automatic cleanup of processed suggestions
- **Debounced updates**: Queue updates are batched to prevent excessive re-renders

## Accessibility

- **Keyboard navigation**: Full keyboard support with Tab/Esc
- **Visual indicators**: Clear type-specific colors and icons
- **Focus management**: First suggestion is highlighted for keyboard users
- **Screen reader support**: Semantic HTML with proper ARIA labels

## Future Enhancements

Potential improvements for future iterations:

1. **Inline display**: Show suggestions directly in the editor at cursor position
2. **Batch operations**: Accept/reject multiple suggestions at once
3. **Suggestion filtering**: Filter by type (show only grammar, etc.)
4. **Custom shortcuts**: Allow users to configure keyboard shortcuts
5. **Suggestion history**: View previously accepted/rejected suggestions
6. **Learning system**: Adapt suggestions based on user preferences
7. **Undo/redo**: Undo accepted suggestions
8. **Suggestion preview**: Preview how text will look before accepting

## Related Files

- `app/components/SuggestionDisplay.tsx` - Main display component
- `app/components/SuggestionCard.tsx` - Individual suggestion card
- `app/lib/suggestion-queue.ts` - Queue management logic
- `app/lib/real-time-analysis-engine.ts` - Suggestion generation
- `app/escritor-ia/components/EnhancedAIWriterEditor.tsx` - Integration point
- `app/lib/__tests__/suggestion-display-system.test.tsx` - Test suite
- `app/components/SuggestionDisplayDemo.tsx` - Demo component
