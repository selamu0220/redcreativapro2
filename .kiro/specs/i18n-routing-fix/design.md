# Design Document

## Overview

This design addresses critical internationalization (i18n) routing issues in the Next.js application that are causing blank pages, broken language detection, and inconsistent URL structures. The solution implements a unified routing strategy using Next.js App Router with proper static generation, middleware configuration, and language provider setup.

The core issue stems from conflicting routing strategies where the application attempts to use both static and dynamic routing for the same paths, leading to build failures and runtime errors. This design establishes a single, coherent approach that leverages Next.js 13+ App Router capabilities with proper i18n support.

## Architecture

### Routing Strategy

**Decision:** Use Next.js App Router with dynamic segments and generateStaticParams
**Rationale:** This approach provides the best balance of static generation benefits with dynamic language support, eliminating the conflicts between static and dynamic routing strategies.

The architecture follows this structure:
```
app/
├── [lang]/
│   ├── layout.tsx          # Language-aware layout
│   ├── page.tsx           # Home page with language
│   ├── blog/
│   │   ├── page.tsx       # Blog listing
│   │   └── [slug]/
│   │       └── page.tsx   # Individual blog posts
│   └── [other-routes]/
├── middleware.ts          # Language detection and URL rewriting
├── not-found.tsx         # Global 404 handler
└── layout.tsx            # Root layout
```

### Language Detection Flow

1. **Initial Request:** Middleware intercepts all requests
2. **Language Detection:** Check URL prefix → cookies → Accept-Language header
3. **URL Rewriting:** Redirect to appropriate language-prefixed URL if needed
4. **Static Generation:** Pre-generate all language combinations at build time
5. **Runtime Rendering:** Serve pre-generated or dynamically rendered content

## Components and Interfaces

### Core Components

#### 1. Language Middleware
```typescript
// middleware.ts
interface LanguageMiddleware {
  detectLanguage(request: NextRequest): string;
  rewriteUrl(request: NextRequest, language: string): NextResponse;
  handleRedirects(request: NextRequest): NextResponse | null;
}
```

**Responsibilities:**
- Detect user's preferred language from URL, cookies, or headers
- Rewrite URLs to include language prefix when missing
- Handle redirects for root paths to language-specific paths
- Set language cookies for future visits

#### 2. Language Provider
```typescript
// app/lib/language/context.tsx
interface LanguageContextType {
  language: string;
  setLanguage: (lang: string) => void;
  t: (key: string, params?: Record<string, any>) => string;
  availableLanguages: string[];
}
```

**Responsibilities:**
- Provide language context to all components
- Handle language switching with URL updates
- Manage translation function access
- Prevent "useLanguage outside provider" errors

#### 3. Static Params Generator
```typescript
// app/[lang]/page.tsx
interface StaticParamsGenerator {
  generateStaticParams(): Promise<{ lang: string }[]>;
}
```

**Responsibilities:**
- Generate all supported language combinations at build time
- Ensure proper static generation for all routes
- Prevent dynamic/static routing conflicts

### Interface Definitions

#### Language Configuration
```typescript
interface LanguageConfig {
  defaultLanguage: string;
  supportedLanguages: string[];
  fallbackLanguage: string;
  cookieName: string;
  urlStrategy: 'prefix' | 'domain';
}
```

#### Translation Interface
```typescript
interface TranslationNamespace {
  [key: string]: string | TranslationNamespace;
}

interface TranslationLoader {
  loadNamespace(language: string, namespace: string): Promise<TranslationNamespace>;
  preloadLanguages(languages: string[]): Promise<void>;
}
```

## Data Models

### Language Configuration Model
```typescript
const LANGUAGE_CONFIG = {
  defaultLanguage: 'es',
  supportedLanguages: ['es', 'en', 'fr', 'de', 'zh'],
  fallbackLanguage: 'es',
  cookieName: 'preferred-language',
  urlStrategy: 'prefix' as const
};
```

### Route Generation Model
```typescript
interface RouteParams {
  lang: string;
  slug?: string;
  [key: string]: string | undefined;
}

interface StaticRoute {
  params: RouteParams;
  searchParams?: Record<string, string>;
}
```

### Translation Storage Model
```typescript
interface TranslationFile {
  namespace: string;
  language: string;
  translations: Record<string, any>;
  lastModified: Date;
}
```

## Error Handling

### Middleware Error Handling
- **Invalid Language Codes:** Redirect to default language with 302 status
- **Missing Translations:** Fall back to default language content
- **Routing Conflicts:** Log errors and serve fallback content

### Component Error Boundaries
```typescript
interface LanguageErrorBoundary {
  handleLanguageProviderError(error: Error): void;
  handleTranslationError(key: string, error: Error): string;
  handleRouteError(route: string, error: Error): void;
}
```

### Build-time Error Prevention
- **Static Generation Validation:** Ensure all language combinations are valid
- **Translation File Validation:** Check for missing keys and malformed JSON
- **Route Conflict Detection:** Prevent duplicate route definitions

## Testing Strategy

### Unit Testing
- **Language Detection Logic:** Test middleware language detection with various headers and cookies
- **Translation Functions:** Verify translation key resolution and fallback behavior
- **Route Generation:** Test generateStaticParams for all supported languages

### Integration Testing
- **End-to-End Language Switching:** Test complete user flow from language detection to content rendering
- **URL Rewriting:** Verify middleware correctly handles all URL patterns
- **Static Generation:** Ensure all language routes are properly pre-generated

### Performance Testing
- **Bundle Size Impact:** Monitor JavaScript bundle size with i18n implementation
- **Static Generation Time:** Measure build time impact of generating all language combinations
- **Runtime Performance:** Test language switching speed and memory usage

### Browser Compatibility Testing
- **Language Header Support:** Test Accept-Language header parsing across browsers
- **Cookie Handling:** Verify language preference persistence
- **URL Handling:** Test language-prefixed URLs in different browsers

## Implementation Considerations

### Next.js Configuration
**Decision:** Remove conflicting i18n configuration from next.config.js
**Rationale:** App Router with dynamic segments provides better control and eliminates the conflicts between Next.js built-in i18n and custom routing.

### Static vs Dynamic Generation
**Decision:** Use generateStaticParams for known language combinations, with fallback to dynamic rendering
**Rationale:** This provides optimal performance for common language combinations while maintaining flexibility for edge cases.

### SEO Considerations
- **Hreflang Tags:** Automatically generate hreflang tags for all language versions
- **Canonical URLs:** Set proper canonical URLs for each language version
- **Sitemap Generation:** Include all language variations in sitemap

### Performance Optimizations
- **Translation Lazy Loading:** Load translations on-demand to reduce initial bundle size
- **Language Detection Caching:** Cache language detection results to reduce middleware overhead
- **Static Asset Optimization:** Optimize language-specific assets and fonts