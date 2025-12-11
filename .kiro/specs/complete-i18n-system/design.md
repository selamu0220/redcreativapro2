# Design Document - Complete i18n System

## Overview

The complete internationalization (i18n) system for Red Creativa Pro will provide comprehensive multi-language support across the entire application. The system is designed to be scalable, performant, and maintainable while ensuring a seamless user experience across all supported languages.

The design follows Next.js 13+ App Router patterns with server-side rendering support, implements lazy loading for optimal performance, and provides a centralized translation management system that integrates with existing application features.

## Architecture

### Core Architecture Pattern

The i18n system follows a **Provider-Consumer** pattern with **Server-Side Rendering** support:

```
┌─────────────────────────────────────────────────────────────┐
│                    Browser/Client                           │
├─────────────────────────────────────────────────────────────┤
│  Language Selector → Language Provider → UI Components     │
│                           ↓                                 │
│                    Translation Hook                         │
├─────────────────────────────────────────────────────────────┤
│                    Next.js App Router                       │
├─────────────────────────────────────────────────────────────┤
│  Middleware → Language Detection → Route Localization       │
├─────────────────────────────────────────────────────────────┤
│                    Translation Engine                       │
│  ┌─────────────────┬─────────────────┬─────────────────┐   │
│  │  Static Files   │   Dynamic API   │   Cache Layer   │   │
│  │   (JSON/TS)     │   Integration   │   (Memory/Redis)│   │
│  └─────────────────┴─────────────────┴─────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### Language Support Strategy

**Supported Languages (Phase 1):**
- Spanish (es) - Default/Primary
- English (en) 
- French (fr)
- German (de)
- Chinese Simplified (zh)

**Rationale:** These languages cover major markets and provide good testing coverage for different text directions, character sets, and formatting requirements.

## Components and Interfaces

### 1. Language Detection and Routing

**Middleware Component (`middleware.ts`)**
```typescript
interface LanguageDetectionConfig {
  supportedLocales: string[];
  defaultLocale: string;
  cookieName: string;
  headerPriority: boolean;
}
```

**Design Decision:** Use Next.js middleware for server-side language detection to ensure SEO-friendly URLs and proper initial page rendering.

**Detection Priority:**
1. URL path segment (`/es/dashboard`)
2. User preference cookie
3. Accept-Language header
4. Default to Spanish (es)

### 2. Translation Management System

**Translation Provider (`app/contexts/LanguageContext.tsx`)**
```typescript
interface LanguageContextType {
  currentLanguage: string;
  setLanguage: (lang: string) => void;
  t: (key: string, params?: Record<string, any>) => string;
  isLoading: boolean;
  availableLanguages: Language[];
}

interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  rtl: boolean;
}
```

**Translation Hook (`hooks/useTranslation.ts`)**
```typescript
interface TranslationHook {
  t: (key: string, params?: Record<string, any>) => string;
  currentLanguage: string;
  changeLanguage: (lang: string) => Promise<void>;
  formatDate: (date: Date) => string;
  formatNumber: (num: number) => string;
  formatCurrency: (amount: number, currency?: string) => string;
}
```

### 3. File Structure and Organization

**Translation Files Structure:**
```
public/locales/
├── es/
│   ├── common.json          # Buttons, navigation, common UI
│   ├── auth.json           # Authentication forms and messages
│   ├── dashboard.json      # Dashboard specific content
│   ├── email-generator.json # AI email generation interface
│   ├── templates.json      # Template management
│   ├── errors.json         # Error messages
│   └── seo.json           # Meta tags and SEO content
├── en/
│   └── [same structure]
├── fr/
│   └── [same structure]
├── de/
│   └── [same structure]
└── zh/
    └── [same structure]
```

**Design Decision:** Modular file organization allows for lazy loading of specific sections and easier maintenance by feature teams.

### 4. Dynamic Content Integration

**AI Content Generation Integration**
```typescript
interface AIContentRequest {
  prompt: string;
  language: string;
  contentType: 'email' | 'document' | 'template';
  userPreferences: UserLocalePreferences;
}

interface UserLocalePreferences {
  language: string;
  dateFormat: string;
  numberFormat: string;
  currency: string;
  timezone: string;
}
```

**Template System Integration**
```typescript
interface LocalizedTemplate {
  id: string;
  name: Record<string, string>;        // Localized names
  description: Record<string, string>; // Localized descriptions
  content: Record<string, string>;     // Localized content
  category: Record<string, string>;    // Localized categories
}
```

## Data Models

### 1. Translation Data Model

```typescript
interface TranslationNamespace {
  namespace: string;
  language: string;
  translations: Record<string, string | TranslationWithParams>;
  lastUpdated: Date;
  version: string;
}

interface TranslationWithParams {
  text: string;
  params?: string[];
  pluralization?: {
    zero?: string;
    one: string;
    few?: string;
    many?: string;
    other: string;
  };
}
```

### 2. User Language Preferences

```typescript
interface UserLanguagePreference {
  userId: string;
  preferredLanguage: string;
  dateFormat: 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD';
  numberFormat: 'US' | 'EU' | 'SPACE';
  currency: string;
  timezone: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### 3. SEO Localization Model

```typescript
interface LocalizedSEOData {
  path: string;
  language: string;
  title: string;
  description: string;
  keywords: string[];
  hreflangAlternates: HreflangAlternate[];
  openGraph: {
    title: string;
    description: string;
    locale: string;
  };
}

interface HreflangAlternate {
  language: string;
  url: string;
}
```

## Error Handling

### 1. Translation Missing Strategy

**Fallback Hierarchy:**
1. Requested translation key in current language
2. Same key in default language (Spanish)
3. Translation key itself (for development debugging)
4. Generic "Translation missing" message

**Implementation:**
```typescript
function getTranslation(key: string, language: string): string {
  const translation = translations[language]?.[key];
  if (translation) return translation;
  
  const fallback = translations['es']?.[key];
  if (fallback) return fallback;
  
  if (process.env.NODE_ENV === 'development') {
    console.warn(`Missing translation: ${key} for language: ${language}`);
    return `[${key}]`;
  }
  
  return 'Translation not available';
}
```

### 2. Language Loading Errors

**Error Boundaries:** Implement React Error Boundaries specifically for translation loading failures to prevent complete application crashes.

**Retry Strategy:** Implement exponential backoff for failed translation file loads with fallback to cached versions.

### 3. Dynamic Content Generation Errors

**Language-Specific Error Messages:** All error messages must be localized and contextually appropriate for the user's selected language.

## Testing Strategy

### 1. Unit Testing

**Translation Function Tests:**
- Test translation key resolution
- Test parameter interpolation
- Test pluralization rules
- Test fallback mechanisms

**Component Tests:**
- Test language switching functionality
- Test translation hook integration
- Test formatting functions (dates, numbers, currency)

### 2. Integration Testing

**End-to-End Language Switching:**
- Test complete user journey in each supported language
- Test URL routing with language prefixes
- Test SEO meta tag generation
- Test dynamic content generation in different languages

**Performance Testing:**
- Test translation file loading times
- Test memory usage with multiple languages loaded
- Test cache effectiveness

### 3. Accessibility Testing

**Screen Reader Compatibility:**
- Test with screen readers in different languages
- Verify proper language attributes on HTML elements
- Test RTL language support (future consideration)

**Keyboard Navigation:**
- Test language selector accessibility
- Verify focus management during language switches

## Performance Optimizations

### 1. Lazy Loading Strategy

**Translation Files:** Load translation namespaces only when needed:
```typescript
const loadTranslations = async (language: string, namespace: string) => {
  const translations = await import(`/public/locales/${language}/${namespace}.json`);
  return translations.default;
};
```

### 2. Caching Strategy

**Browser Cache:** Use service worker to cache translation files with versioning
**Memory Cache:** Keep frequently used translations in memory with LRU eviction
**CDN Cache:** Serve translation files from CDN with appropriate cache headers

### 3. Bundle Optimization

**Code Splitting:** Split translation logic into separate chunks
**Tree Shaking:** Remove unused translation keys during build
**Compression:** Use gzip/brotli compression for translation files

## SEO Implementation

### 1. URL Structure

**Pattern:** `/{language}/{path}`
- `/es/dashboard` (Spanish)
- `/en/dashboard` (English)
- `/fr/tableau-de-bord` (French - localized paths)

**Design Decision:** Use language prefixes for all routes to ensure clear language separation and better SEO indexing.

### 2. Hreflang Implementation

**Automatic Generation:** Generate hreflang tags for all pages with language alternatives
**Sitemap Integration:** Include all language versions in XML sitemap
**Canonical URLs:** Proper canonical URL handling for each language version

### 3. Meta Tag Localization

**Dynamic Meta Tags:** All meta titles, descriptions, and Open Graph tags must be fully localized
**Language-Specific Keywords:** SEO keywords adapted for each target market
**Structured Data:** Localize structured data markup for better search engine understanding

## Integration Points

### 1. Existing Authentication System

**User Preference Storage:** Extend user profile to include language preferences
**Session Management:** Maintain language preference across user sessions
**Registration Flow:** Allow language selection during user registration

### 2. AI Content Generation

**Prompt Localization:** Translate system prompts for AI content generation
**Output Language Control:** Ensure AI generates content in user's preferred language
**Template Integration:** Localize all email and document templates

### 3. Dashboard and Analytics

**Chart Localization:** Translate all chart labels, legends, and tooltips
**Date Range Pickers:** Use localized date formats and calendar systems
**Export Functions:** Generate reports in user's preferred language and format

### 4. Blog System Integration

**Content Management:** Support for multilingual blog posts
**Category Translation:** Localize blog categories and tags
**SEO Optimization:** Implement proper hreflang for blog content

This design provides a comprehensive, scalable, and maintainable internationalization system that addresses all requirements while maintaining optimal performance and user experience.