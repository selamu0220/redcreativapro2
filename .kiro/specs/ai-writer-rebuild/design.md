# Design Document: AI Writer Rebuild

## Overview

This design document outlines the complete rebuild of the AI Writer (Escritor de IA) system. The current implementation is broken with approximately 20 critical issues and an overly complex architecture. The new design follows a minimalist, stateless approach that eliminates database dependencies and focuses on direct API calls to AI providers with Clerk authentication.

**Core Design Principles:**
- **Simplicity First**: No database, no complex state management, no unnecessary abstractions
- **Stateless Architecture**: Content exists only in browser memory (localStorage for settings only)
- **Direct API Integration**: Straightforward HTTP calls to AI providers without middleware layers
- **Authentication Only**: Clerk handles user identity; no user data persistence beyond session

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Browser                               │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              Clerk Authentication                     │  │
│  └──────────────────────────────────────────────────────┘  │
│                           │                                  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │           AI Writer Component                         │  │
│  │  ┌────────────────┐  ┌──────────────────────────┐   │  │
│  │  │  Text Editor   │  │  Settings Panel          │   │  │
│  │  │  (React State) │  │  (localStorage)          │   │  │
│  │  └────────────────┘  └──────────────────────────┘   │  │
│  └──────────────────────────────────────────────────────┘  │
│                           │                                  │
│                           ▼                                  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │         Direct API Client                             │  │
│  │  • OpenAI API                                         │  │
│  │  • Anthropic API (future)                            │  │
│  │  • Google AI API (future)                            │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

**Design Rationale:**
- **No Backend Layer**: Eliminates complexity and potential points of failure
- **Client-Side Only**: Reduces latency and simplifies deployment
- **Provider Agnostic**: Easy to add new AI providers without architectural changes

### Component Structure

```
/app/escritor-ia/
├── page.tsx                    # Main route with auth guard
├── components/
│   ├── AIWriterEditor.tsx      # Main editor component
│   ├── SettingsPanel.tsx       # AI configuration UI
│   ├── ProviderSelector.tsx    # AI provider dropdown
│   └── LoadingIndicator.tsx    # Processing feedback
└── lib/
    ├── ai-client.ts            # Direct API calls
    ├── settings-manager.ts     # localStorage operations
    └── error-handler.ts        # Error message formatting
```

## Components and Interfaces

### 1. Authentication Guard

**Purpose**: Protect the AI Writer route and provide user context

**Interface**:
```typescript
interface AuthGuardProps {
  children: React.ReactNode;
}

interface UserContext {
  email: string;
  userId: string;
  isAuthenticated: boolean;
}
```

**Implementation Details**:
- Uses Clerk's `useAuth()` hook to check authentication status
- Redirects to `/sign-in` if user is not authenticated
- Passes user email to child components for identification
- No database queries or user data persistence

**Design Decision**: We use Clerk exclusively for authentication because it handles all security concerns (session management, token refresh, etc.) without requiring our own backend infrastructure.

### 2. AI Writer Editor Component

**Purpose**: Main text editing interface with AI improvement capabilities

**Interface**:
```typescript
interface AIWriterEditorProps {
  userEmail: string;
}

interface EditorState {
  content: string;
  isProcessing: boolean;
  error: string | null;
}
```

**State Management**:
- `content`: Stored in React state (useState)
- `isProcessing`: Boolean flag for loading state
- `error`: Error message string or null

**Key Features**:
- Simple textarea or basic rich text editor
- "Improve with AI" button (disabled during processing)
- "Copy All" button for easy content extraction
- Warning banner: "Content is not saved automatically"
- Character count display

**Design Decision**: We use React state instead of a state management library (Redux, Zustand) because the state is simple and localized to a single component. This reduces bundle size and complexity.

### 3. Settings Panel Component

**Purpose**: Configure AI provider and parameters

**Interface**:
```typescript
interface SettingsPanelProps {
  onSettingsChange: (settings: AISettings) => void;
}

interface AISettings {
  provider: 'openai' | 'anthropic' | 'google';
  model: string;
  temperature: number;
  apiKey?: string;
  usePersonalKey: boolean;
}
```

**Persistent Settings** (stored in localStorage):
- Selected AI provider
- Selected model
- Temperature value (0.0 - 1.0)
- User's personal API key (if provided)
- Flag indicating personal vs system key

**UI Elements**:
- Provider dropdown (OpenAI, Anthropic, Google)
- Model selector (filtered by provider)
- Temperature slider (0 = Precise, 1 = Creative)
- API key input field with show/hide toggle
- "Use my own API key" checkbox
- "Clear saved settings" button

**Design Decision**: Settings are stored in localStorage rather than a database because:
1. No backend infrastructure required
2. Settings are user-specific and don't need to be shared
3. Faster access (no network requests)
4. Privacy-friendly (data stays on user's device)

### 4. AI Client Module

**Purpose**: Handle direct API calls to AI providers

**Interface**:
```typescript
interface AIClientConfig {
  provider: string;
  model: string;
  temperature: number;
  apiKey: string;
}

interface AIRequest {
  content: string;
  instruction: string;
}

interface AIResponse {
  improvedContent: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
  };
}

async function improveContent(
  request: AIRequest,
  config: AIClientConfig
): Promise<AIResponse>
```

**Implementation Strategy**:

**OpenAI Integration**:
```typescript
// Direct fetch call to OpenAI API
const response = await fetch('https://api.openai.com/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${apiKey}`
  },
  body: JSON.stringify({
    model: config.model,
    messages: [
      {
        role: 'system',
        content: 'You are a helpful writing assistant. Improve the following text while maintaining its core message.'
      },
      {
        role: 'user',
        content: request.content
      }
    ],
    temperature: config.temperature
  }),
  signal: AbortSignal.timeout(30000) // 30 second timeout
});
```

**Error Handling**:
- Network errors: "Connection error. Check your internet."
- 401 Unauthorized: "Invalid API key. Check your settings."
- 429 Rate Limit: "Rate limit exceeded. Try again in a moment."
- 500 Server Error: "AI service unavailable. Try again later."
- Timeout: "Request timed out. Try again."

**Design Decision**: We use native `fetch` instead of a library like Axios because:
1. Fetch is built into modern browsers (no extra dependency)
2. Our needs are simple (just POST requests)
3. AbortSignal.timeout provides built-in timeout handling

### 5. Settings Manager Module

**Purpose**: Handle localStorage operations for user settings

**Interface**:
```typescript
interface StoredSettings {
  provider: string;
  model: string;
  temperature: number;
  apiKey?: string;
  usePersonalKey: boolean;
}

function saveSettings(settings: StoredSettings): void
function loadSettings(): StoredSettings | null
function clearSettings(): void
function hasPersonalApiKey(): boolean
```

**localStorage Keys**:
- `ai-writer-settings`: JSON string of all settings
- Key format: `ai-writer-settings` (single key for all settings)

**Default Values**:
```typescript
const DEFAULT_SETTINGS: StoredSettings = {
  provider: 'openai',
  model: 'gpt-4o-mini',
  temperature: 0.7,
  usePersonalKey: false
};
```

**Design Decision**: We store all settings in a single localStorage key as a JSON object rather than separate keys because:
1. Atomic updates (all settings change together)
2. Easier to clear all settings at once
3. Simpler to export/import settings in the future

## Data Models

### Editor Content Model

**Content is NOT persisted**. It exists only in React component state:

```typescript
interface EditorContent {
  text: string;           // Current editor content
  lastModified: Date;     // Timestamp of last edit (for UI only)
  characterCount: number; // Computed from text.length
}
```

**Design Decision**: No persistence model is needed because:
1. Users are responsible for copying their work
2. Eliminates database costs and complexity
3. Reduces privacy concerns (no content stored on servers)
4. Faster performance (no save operations)

### Settings Model

**Only settings are persisted** (in localStorage):

```typescript
interface AISettings {
  provider: 'openai' | 'anthropic' | 'google';
  model: string;
  temperature: number;
  apiKey?: string;
  usePersonalKey: boolean;
  lastUpdated: string; // ISO timestamp
}
```

**Model Validation**:
- `provider`: Must be one of the supported providers
- `model`: Must be valid for the selected provider
- `temperature`: Must be between 0.0 and 1.0
- `apiKey`: Optional, validated on first use
- `usePersonalKey`: Boolean flag

### API Request/Response Models

**Improvement Request**:
```typescript
interface ImprovementRequest {
  content: string;        // Text to improve
  provider: string;       // AI provider name
  model: string;          // Model identifier
  temperature: number;    // Creativity parameter
  apiKey: string;         // API key to use
}
```

**Improvement Response**:
```typescript
interface ImprovementResponse {
  success: boolean;
  improvedContent?: string;
  error?: {
    code: string;
    message: string;
    userMessage: string;
  };
  metadata?: {
    tokensUsed: number;
    processingTime: number;
  };
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Authentication Protection
*For any* unauthenticated user attempting to access /escritor-ia, the system should redirect to the Clerk sign-in page and prevent access to the editor interface.

**Validates: Requirements 1.1, 1.2**

### Property 2: Content State Isolation
*For any* editor session, content should exist only in component state and never be persisted to any storage mechanism (localStorage, database, or API).

**Validates: Requirements 8.1, 8.2, 8.3**

### Property 3: Settings Persistence Round-Trip
*For any* valid settings object, saving to localStorage and then loading should produce an equivalent settings object with all fields preserved.

**Validates: Requirements 4.2, 4.3, 5.2**

### Property 4: API Call Timeout
*For any* AI improvement request, if the API does not respond within 30 seconds, the system should abort the request and display a timeout error message.

**Validates: Requirements 9.3**

### Property 5: Error Message Clarity
*For any* error condition (network, authentication, validation), the system should display a user-friendly error message that explains the problem without exposing technical details.

**Validates: Requirements 6.1, 6.2, 6.3, 6.4**

### Property 6: Button State Consistency
*For any* AI improvement operation in progress, the "Improve with AI" button should be disabled and show a loading indicator until the operation completes or fails.

**Validates: Requirements 3.4, 3.5**

### Property 7: Settings Validation
*For any* settings update, if temperature is outside the range [0.0, 1.0] or provider is not supported, the system should reject the update and maintain previous valid settings.

**Validates: Requirements 10.3, 4.5**

### Property 8: API Key Security
*For any* API key stored in localStorage, it should be retrievable only by the same origin and never transmitted except in Authorization headers to the respective AI provider.

**Validates: Requirements 5.2, 5.3**

### Property 9: Content Replacement Atomicity
*For any* successful AI improvement response, the editor content should be replaced entirely with the improved version in a single operation (no partial updates).

**Validates: Requirements 3.2**

### Property 10: Session Cleanup
*For any* user logout event, the system should clear all component state and redirect to the home page, while preserving localStorage settings.

**Validates: Requirements 1.3**

## Error Handling

### Error Categories and Responses

**1. Authentication Errors**
- **Condition**: User not authenticated or session expired
- **User Message**: "Please sign in to use the AI Writer"
- **Action**: Redirect to Clerk sign-in page
- **Recovery**: Automatic after successful authentication

**2. Network Errors**
- **Condition**: No internet connection or DNS failure
- **User Message**: "Connection error. Check your internet connection."
- **Action**: Display error banner, keep content intact
- **Recovery**: User clicks "Improve with AI" again

**3. API Authentication Errors**
- **Condition**: Invalid or missing API key (401 response)
- **User Message**: "Invalid API key. Please check your settings."
- **Action**: Display error banner, open settings panel
- **Recovery**: User enters valid API key

**4. Rate Limit Errors**
- **Condition**: Too many requests (429 response)
- **User Message**: "Rate limit exceeded. Please wait a moment and try again."
- **Action**: Display error banner with countdown timer
- **Recovery**: Automatic retry after 60 seconds

**5. Content Validation Errors**
- **Condition**: Empty content or content too long
- **User Message**: "Please write some text first" or "Content is too long (max 10,000 characters)"
- **Action**: Display error banner, focus editor
- **Recovery**: User adds/reduces content

**6. Timeout Errors**
- **Condition**: API request exceeds 30 seconds
- **User Message**: "Request timed out. The AI service is taking too long. Please try again."
- **Action**: Abort request, display error banner
- **Recovery**: User clicks "Improve with AI" again

**7. Server Errors**
- **Condition**: AI provider returns 500-level error
- **User Message**: "AI service temporarily unavailable. Please try again in a few minutes."
- **Action**: Display error banner
- **Recovery**: User retries after waiting

**8. Unknown Errors**
- **Condition**: Unexpected error not matching above categories
- **User Message**: "An unexpected error occurred: [error message]"
- **Action**: Display error banner, log to console
- **Recovery**: User refreshes page or retries

### Error Display Strategy

**Error Banner Component**:
```typescript
interface ErrorBannerProps {
  message: string;
  type: 'error' | 'warning' | 'info';
  autoHide?: boolean;
  autoHideDelay?: number; // milliseconds
  onRetry?: () => void;
}
```

**Display Rules**:
- Errors appear at the top of the editor
- Auto-hide after 5 seconds for non-critical errors
- Critical errors (auth, API key) remain until resolved
- Only one error shown at a time (newest replaces oldest)
- Errors include retry button when applicable

**Design Decision**: We use a simple banner instead of modal dialogs because:
1. Modals interrupt the user's workflow
2. Banners allow users to see their content while reading the error
3. Auto-hide reduces UI clutter for transient errors

## Testing Strategy

### Dual Testing Approach

We will implement both **unit tests** and **property-based tests** to ensure comprehensive coverage:

- **Unit Tests**: Verify specific examples, edge cases, and error conditions
- **Property Tests**: Verify universal properties across all inputs using randomized testing

Both testing approaches are complementary and necessary for high confidence in correctness.

### Property-Based Testing Configuration

**Framework**: We will use **fast-check** (JavaScript/TypeScript property-based testing library)

**Configuration**:
- Minimum **100 iterations** per property test
- Each test tagged with: `Feature: ai-writer-rebuild, Property {N}: {property description}`
- Tests run on every commit via CI/CD

**Example Property Test Structure**:
```typescript
import fc from 'fast-check';

describe('Feature: ai-writer-rebuild, Property 3: Settings Persistence Round-Trip', () => {
  it('should preserve all settings fields after save and load', () => {
    fc.assert(
      fc.property(
        fc.record({
          provider: fc.constantFrom('openai', 'anthropic', 'google'),
          model: fc.string(),
          temperature: fc.float({ min: 0, max: 1 }),
          apiKey: fc.option(fc.string()),
          usePersonalKey: fc.boolean()
        }),
        (settings) => {
          saveSettings(settings);
          const loaded = loadSettings();
          expect(loaded).toEqual(settings);
        }
      ),
      { numRuns: 100 }
    );
  });
});
```

### Unit Testing Strategy

**Test Coverage Areas**:

1. **Authentication Guard**
   - Redirects unauthenticated users
   - Allows authenticated users
   - Passes correct user context

2. **Editor Component**
   - Updates content on user input
   - Disables button during processing
   - Displays character count correctly
   - Shows/hides error messages

3. **Settings Panel**
   - Saves settings to localStorage
   - Loads settings on mount
   - Validates temperature range
   - Handles missing localStorage gracefully

4. **AI Client**
   - Formats OpenAI requests correctly
   - Handles successful responses
   - Handles error responses (401, 429, 500)
   - Respects timeout configuration
   - Includes proper headers

5. **Settings Manager**
   - Saves and loads settings correctly
   - Returns null for missing settings
   - Clears settings completely
   - Handles corrupted localStorage data

6. **Error Handler**
   - Maps error codes to user messages
   - Provides appropriate recovery actions
   - Logs errors for debugging

**Testing Tools**:
- **Jest**: Test runner and assertion library
- **React Testing Library**: Component testing
- **MSW (Mock Service Worker)**: API mocking
- **fast-check**: Property-based testing

**Example Unit Test**:
```typescript
describe('AIWriterEditor', () => {
  it('should disable improve button while processing', async () => {
    const { getByText } = render(<AIWriterEditor userEmail="test@example.com" />);
    const button = getByText('Improve with AI');
    
    fireEvent.click(button);
    
    expect(button).toBeDisabled();
    expect(getByText('Processing...')).toBeInTheDocument();
  });
});
```

### Integration Testing

**End-to-End Scenarios**:
1. User signs in → accesses editor → improves text → copies result
2. User configures personal API key → improves text → verifies key is used
3. User encounters error → sees error message → retries successfully
4. User changes provider → selects model → adjusts temperature → improves text

**Testing Tool**: Playwright for browser automation

### Manual Testing Checklist

- [ ] Sign in with Clerk works correctly
- [ ] Editor accepts text input smoothly
- [ ] "Improve with AI" button triggers API call
- [ ] Loading indicator appears during processing
- [ ] Improved content replaces original content
- [ ] Settings persist across page reloads
- [ ] API key input shows/hides correctly
- [ ] Error messages display for various error types
- [ ] "Copy All" button copies content to clipboard
- [ ] Sign out clears state and redirects
- [ ] Mobile responsive design works
- [ ] Works in Chrome, Firefox, Safari

## Implementation Notes

### Technology Stack

- **Framework**: Next.js 14 (App Router)
- **Authentication**: Clerk
- **Styling**: Tailwind CSS
- **State Management**: React useState (no external library)
- **HTTP Client**: Native fetch API
- **Testing**: Jest + React Testing Library + fast-check

### File Structure

```
/app/escritor-ia/
├── page.tsx                 # Route with auth guard
├── components/
│   ├── AIWriterEditor.tsx   # Main editor (client component)
│   ├── SettingsPanel.tsx    # Settings UI (client component)
│   ├── ErrorBanner.tsx      # Error display (client component)
│   └── LoadingIndicator.tsx # Loading state (client component)
├── lib/
│   ├── ai-client.ts         # API calls
│   ├── settings-manager.ts  # localStorage operations
│   ├── error-handler.ts     # Error formatting
│   └── validators.ts        # Input validation
└── __tests__/
    ├── ai-writer-editor.test.tsx
    ├── settings-panel.test.tsx
    ├── ai-client.test.ts
    ├── settings-manager.test.ts
    └── properties/
        ├── auth-protection.property.test.ts
        ├── settings-persistence.property.test.ts
        ├── api-timeout.property.test.ts
        └── error-messages.property.test.ts
```

### Environment Variables

```bash
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Optional: System-wide API keys (fallback if user doesn't provide their own)
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
GOOGLE_AI_API_KEY=...
```

### Performance Considerations

**Optimization Strategies**:
1. **Code Splitting**: Editor component loaded only on /escritor-ia route
2. **Lazy Loading**: Settings panel loaded on demand (when user clicks settings icon)
3. **Debouncing**: Character count updates debounced to 300ms
4. **Memoization**: Settings object memoized to prevent unnecessary re-renders

**Expected Performance**:
- Initial page load: < 2 seconds
- Time to interactive: < 3 seconds
- API response time: 2-10 seconds (depends on AI provider)
- Settings save/load: < 50ms

### Security Considerations

**API Key Storage**:
- Stored in localStorage (not sessionStorage) for persistence
- Never transmitted except to AI provider APIs
- Not logged or sent to analytics
- User warned about security implications

**Content Security**:
- No content sent to our servers
- Content never logged or stored
- All processing happens client-side or at AI provider

**Authentication Security**:
- Clerk handles all auth security
- No custom auth logic
- Session tokens managed by Clerk
- Automatic token refresh

### Accessibility

**WCAG 2.1 AA Compliance**:
- Keyboard navigation for all controls
- ARIA labels for screen readers
- Focus indicators on interactive elements
- Sufficient color contrast (4.5:1 minimum)
- Error messages announced to screen readers
- Loading states announced to screen readers

**Keyboard Shortcuts**:
- `Ctrl/Cmd + Enter`: Trigger "Improve with AI"
- `Ctrl/Cmd + A`: Select all content
- `Ctrl/Cmd + C`: Copy content
- `Esc`: Close settings panel

### Internationalization

**Initial Release**: Spanish only (matches existing app language)

**Future Support**: English, Portuguese, French
- UI strings externalized to translation files
- Error messages translated
- Settings labels translated
- No content translation (user's content remains in original language)

## Migration Strategy

**Current System Deprecation**:
1. Deploy new AI Writer to `/escritor-ia-new` for testing
2. Run both versions in parallel for 1 week
3. Redirect `/escritor-ia` to new version
4. Remove old code after 2 weeks of stable operation

**User Communication**:
- In-app banner: "New AI Writer available! Simpler and faster."
- Email notification to active users
- Blog post explaining improvements

**No Data Migration Needed**: Current system has no user data to migrate

## Future Enhancements

**Phase 2 (Post-Launch)**:
- Support for Anthropic Claude models
- Support for Google Gemini models
- Custom improvement instructions (user-defined prompts)
- Tone selection (formal, casual, technical)
- Length control (shorter, longer, same)

**Phase 3 (Future)**:
- Multiple improvement suggestions (show 3 options)
- Diff view (show changes between original and improved)
- Undo/redo functionality
- Export to various formats (PDF, DOCX, Markdown)

**Not Planned**:
- Document persistence (by design)
- Collaboration features
- Version history
- Document organization/folders
