# Design Document: Next-intl Language Slider

## Overview

Este diseño implementa un sistema completo de internacionalización usando next-intl con un slider de idiomas intuitivo en el header de la aplicación. El sistema aprovechará la estructura de traducciones existente y proporcionará una experiencia de usuario fluida para cambiar entre idiomas.

## Architecture

### Core Components

```
┌─────────────────────────────────────────┐
│              App Layout                 │
│  ┌─────────────────────────────────┐   │
│  │        Language Slider          │   │
│  │  [ES] [EN] [FR] [DE] [ZH] [PT] │   │
│  └─────────────────────────────────┘   │
│  ┌─────────────────────────────────┐   │
│  │     NextIntlClientProvider      │   │
│  │  ┌─────────────────────────┐   │   │
│  │  │    Page Components      │   │   │
│  │  │  (Auto-translated)      │   │   │
│  │  └─────────────────────────┘   │   │
│  └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

### Configuration Flow

```
next.config.ts → i18n/request.ts → NextIntlClientProvider → Components
```

## Components and Interfaces

### 1. Next-intl Configuration

**File: `i18n/request.ts`**
```typescript
interface RequestConfig {
  locale: string;
  messages: Record<string, any>;
}

interface LocaleConfig {
  locales: string[];
  defaultLocale: string;
  localeDetection: boolean;
}
```

### 2. Language Slider Component

**File: `app/components/LanguageSlider.tsx`**
```typescript
interface LanguageOption {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
}

interface LanguageSliderProps {
  currentLocale: string;
  onLanguageChange: (locale: string) => void;
  className?: string;
}
```

### 3. Language Context

**File: `app/lib/language/LanguageContext.tsx`**
```typescript
interface LanguageContextType {
  currentLocale: string;
  availableLocales: LanguageOption[];
  changeLanguage: (locale: string) => Promise<void>;
  isLoading: boolean;
}
```

### 4. Translation Hooks

```typescript
// Client Components
const t = useTranslations('namespace');

// Server Components  
const t = await getTranslations('namespace');
```

## Data Models

### Language Configuration

```typescript
const SUPPORTED_LOCALES = {
  es: {
    code: 'es',
    name: 'Español',
    nativeName: 'Español',
    flag: '🇪🇸'
  },
  en: {
    code: 'en', 
    name: 'English',
    nativeName: 'English',
    flag: '🇺🇸'
  },
  fr: {
    code: 'fr',
    name: 'Français', 
    nativeName: 'Français',
    flag: '🇫🇷'
  },
  de: {
    code: 'de',
    name: 'Deutsch',
    nativeName: 'Deutsch', 
    flag: '🇩🇪'
  },
  zh: {
    code: 'zh',
    name: 'Chinese',
    nativeName: '中文',
    flag: '🇨🇳'
  },
  pt: {
    code: 'pt',
    name: 'Português',
    nativeName: 'Português',
    flag: '🇵🇹'
  }
} as const;
```

### Translation File Structure

```
public/locales/
├── es/
│   ├── common.json
│   ├── dashboard.json
│   ├── auth.json
│   └── slider.json (new)
├── en/
│   ├── common.json
│   ├── dashboard.json  
│   ├── auth.json
│   └── slider.json (new)
└── ... (other locales)
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Language Persistence Round Trip
*For any* supported locale, when a user selects it and refreshes the page, the same locale should be active
**Validates: Requirements 5.1, 5.2**

### Property 2: Translation Consistency  
*For any* translation key that exists in the default locale, it should either exist in all other locales or fall back gracefully
**Validates: Requirements 4.4, 6.5**

### Property 3: Slider State Synchronization
*For any* language change through the slider, all components using translations should update to reflect the new locale
**Validates: Requirements 3.2, 6.3**

### Property 4: Locale Detection Accuracy
*For any* browser language setting, the system should either use that locale if supported or fall back to the default locale
**Validates: Requirements 5.3, 5.5**

### Property 5: Translation Hook Consistency
*For any* component using useTranslations or getTranslations with the same namespace and key, they should return equivalent translated content
**Validates: Requirements 6.1, 6.2**

## Error Handling

### Translation Fallbacks
- Missing translation keys → Show key name with warning
- Missing locale files → Fall back to default locale (Spanish)
- Invalid locale codes → Redirect to default locale
- Network errors loading translations → Use cached translations

### Slider Error States
- Failed language switch → Revert to previous language
- Invalid locale selection → Show error message
- Storage errors → Continue with session-only language preference

### Loading States
- Show skeleton loader while translations load
- Disable slider during language transitions
- Progressive enhancement for JavaScript-disabled users

## Testing Strategy

### Unit Tests
- Test individual translation functions
- Test language slider component interactions
- Test locale persistence mechanisms
- Test fallback behaviors

### Property-Based Tests
- Generate random locale combinations and verify consistency
- Test translation key resolution across all locales
- Verify round-trip persistence with random user sessions
- Test concurrent language changes

### Integration Tests
- Test full language switching flow
- Test server-side rendering with different locales
- Test client-side hydration with locale preferences
- Test routing integration (if implemented)

**Property Test Configuration:**
- Use Vitest with @fast-check/vitest for property-based testing
- Minimum 100 iterations per property test
- Each test tagged with: **Feature: next-intl-language-slider, Property {number}: {property_text}**

## Implementation Notes

### Performance Considerations
- Lazy load translation files for better initial load times
- Cache translations in memory to avoid repeated fetches
- Use React.memo for slider component to prevent unnecessary re-renders
- Implement translation preloading for common locales

### SEO Considerations  
- Implement hreflang tags for different language versions
- Ensure proper meta tags for each locale
- Consider implementing locale-based routing for better SEO
- Add structured data with language information

### Accessibility
- Ensure slider is keyboard navigable
- Provide proper ARIA labels for screen readers
- Support high contrast mode
- Ensure sufficient color contrast for language indicators

### Browser Compatibility
- Support for localStorage/cookies across all target browsers
- Graceful degradation for older browsers
- Progressive enhancement approach
- Polyfills for Intl APIs if needed