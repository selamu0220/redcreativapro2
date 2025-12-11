# Design Document

## Overview

The current `app/[lang]/page.tsx` file contains a fundamental Next.js architecture conflict: it uses the "use client" directive while also exporting a `generateStaticParams()` function. This violates Next.js App Router rules where `generateStaticParams()` can only be used in server components, while "use client" creates a client component. This design addresses the separation of concerns by creating a proper server/client component architecture that maintains all existing functionality while enabling proper static generation for internationalized routes.

## Architecture

### Current Problem Analysis

The existing file structure creates several issues:
1. **Runtime Error**: Next.js throws an error when a client component tries to export `generateStaticParams()`
2. **Static Generation Failure**: The internationalized routes cannot be pre-generated at build time
3. **Architecture Violation**: Mixing server-side static generation with client-side interactivity in a single component

### Proposed Solution Architecture

The solution implements a **Server-Client Component Separation Pattern** with the following structure:

```
app/[lang]/
├── page.tsx (Server Component - handles static generation)
└── components/
    └── ClientHomePage.tsx (Client Component - handles interactivity)
```

**Design Decision Rationale**: This separation follows Next.js best practices by keeping server-side concerns (static generation, SEO, initial data) separate from client-side concerns (user interactions, state management, dynamic behavior).

## Components and Interfaces

### Server Component: `app/[lang]/page.tsx`

**Responsibilities:**
- Export `generateStaticParams()` for static route generation
- Handle language parameter extraction and validation
- Provide initial server-side rendering
- Pass language context to client component
- Handle SEO metadata and static content

**Interface:**
```typescript
interface ServerPageProps {
  params: Promise<{ lang: string }>;
}

// Server component exports
export async function generateStaticParams(): Promise<{ lang: string }[]>
export default function ServerPage(props: ServerPageProps): JSX.Element
```

**Key Features:**
- No "use client" directive (pure server component)
- Handles static generation for all supported languages
- Validates language parameters against supported languages
- Provides fallback to default language for invalid languages

### Client Component: `ClientHomePage.tsx`

**Responsibilities:**
- Handle all user interactions (modals, buttons, navigation)
- Manage client-side state (trial modes, UI state)
- Implement responsive behavior and device detection
- Handle client-side routing and navigation
- Manage theme switching and language switching

**Interface:**
```typescript
interface ClientHomePageProps {
  initialLang: LanguageCode;
}

export default function ClientHomePage(props: ClientHomePageProps): JSX.Element
```

**Key Features:**
- Contains "use client" directive
- Receives validated language from server component
- Maintains all existing functionality and user interactions
- Handles all React hooks and state management

### Language Configuration Integration

**Supported Languages Structure:**
```typescript
const SUPPORTED_LANGUAGES = {
  es: { code: 'es', name: 'Español', isDefault: true },
  en: { code: 'en', name: 'English', isDefault: false },
  de: { code: 'de', name: 'German', isDefault: false },
  fr: { code: 'fr', name: 'French', isDefault: false },
  zh: { code: 'zh', name: 'Chinese', isDefault: false }
}
```

## Data Models

### Language Parameter Model

```typescript
type LanguageCode = 'es' | 'en' | 'de' | 'fr' | 'zh';

interface LanguageParams {
  lang: LanguageCode;
}

interface ValidatedLanguageContext {
  currentLang: LanguageCode;
  isValidLanguage: boolean;
  fallbackApplied: boolean;
}
```

### Static Generation Model

```typescript
interface StaticParams {
  lang: string;
}

// Generated at build time for each supported language
const staticParams: StaticParams[] = [
  { lang: 'es' },
  { lang: 'en' },
  { lang: 'de' },
  { lang: 'fr' },
  { lang: 'zh' }
];
```

## Error Handling

### Language Validation Strategy

**Server-Side Validation:**
1. Extract language from URL parameters
2. Validate against `SUPPORTED_LANGUAGES` configuration
3. Apply fallback to `DEFAULT_LANGUAGE` if invalid
4. Pass validated language to client component

**Error Scenarios:**
- **Invalid Language Code**: Fallback to default language ('es')
- **Missing Language Parameter**: Fallback to default language
- **Malformed URL**: Let Next.js handle 404 routing

### Build-Time Error Prevention

**Static Generation Safeguards:**
- Validate all language codes against configuration
- Ensure all required translation files exist
- Prevent build failures from missing language resources

**TypeScript Compilation:**
- Strong typing for language codes
- Interface validation for component props
- Compile-time checking for server/client component separation

## Testing Strategy

### Unit Testing

**Server Component Tests:**
```typescript
describe('ServerPage', () => {
  test('generateStaticParams returns all supported languages', () => {
    const params = generateStaticParams();
    expect(params).toHaveLength(5);
    expect(params).toContainEqual({ lang: 'es' });
    expect(params).toContainEqual({ lang: 'en' });
  });

  test('validates language parameters correctly', async () => {
    const validParams = { params: Promise.resolve({ lang: 'en' }) };
    const result = await ServerPage(validParams);
    expect(result).toBeDefined();
  });

  test('handles invalid language with fallback', async () => {
    const invalidParams = { params: Promise.resolve({ lang: 'invalid' }) };
    const result = await ServerPage(invalidParams);
    expect(result).toBeDefined();
  });
});
```

**Client Component Tests:**
```typescript
describe('ClientHomePage', () => {
  test('renders with valid language', () => {
    render(<ClientHomePage initialLang="en" />);
    expect(screen.getByText(/Red Creativa Pro/)).toBeInTheDocument();
  });

  test('handles trial modal interactions', () => {
    render(<ClientHomePage initialLang="es" />);
    const demoButton = screen.getByText(/demo/i);
    fireEvent.click(demoButton);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  test('maintains responsive behavior', () => {
    render(<ClientHomePage initialLang="fr" />);
    // Test mobile/tablet responsive behavior
  });
});
```

### Integration Testing

**Static Generation Testing:**
- Verify all language routes are generated at build time
- Test middleware integration with generated routes
- Validate SEO metadata for each language variant

**End-to-End Testing:**
- Test complete user flows for each supported language
- Verify client-side functionality works after static generation
- Test language switching and navigation

### Performance Testing

**Static Generation Performance:**
- Measure build time impact of multiple language routes
- Verify bundle size optimization
- Test initial page load performance for each language

**Runtime Performance:**
- Measure client component hydration time
- Test responsive behavior performance
- Validate memory usage for state management

## Migration Strategy

### Implementation Steps

1. **Create Client Component**: Extract all client-side logic to `ClientHomePage.tsx`
2. **Refactor Server Component**: Keep only server-side logic in `page.tsx`
3. **Update Imports**: Ensure proper import paths and dependencies
4. **Test Integration**: Verify both components work together
5. **Validate Build**: Ensure static generation works correctly

### Backward Compatibility

**Preserved Functionality:**
- All existing user interactions remain identical
- No changes to user experience or interface
- All existing hooks and state management preserved
- Responsive behavior and device detection maintained

**URL Structure:**
- No changes to existing URL patterns
- All language routes continue to work as expected
- Middleware integration remains unchanged

### Rollback Plan

If issues arise during implementation:
1. **Immediate Rollback**: Revert to single-file structure temporarily
2. **Gradual Migration**: Implement changes incrementally
3. **Feature Flags**: Use conditional rendering during transition
4. **Monitoring**: Track build success and runtime errors

## Security Considerations

### Server-Side Security

**Language Parameter Validation:**
- Strict validation against allowed language codes
- Prevention of path traversal attacks through language parameters
- Sanitization of language input before processing

**Static Generation Security:**
- No sensitive data exposed in static generation
- Proper handling of environment variables
- Secure build-time configuration

### Client-Side Security

**State Management Security:**
- No sensitive data in client-side state
- Proper handling of user session data
- Secure communication with authentication hooks

**XSS Prevention:**
- Proper sanitization of dynamic content
- Safe handling of user-generated content in modals
- Secure implementation of language switching