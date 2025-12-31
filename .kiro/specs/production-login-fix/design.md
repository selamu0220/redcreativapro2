# Design Document: Production Login Fix

## Overview

This design addresses a critical syntax error in `LocalizationContext.tsx` that is preventing the application from loading in production. The error occurs in the currency symbol definition section where malformed string literals are breaking the JavaScript/TypeScript compilation.

The fix involves correcting the syntax error in the currency symbols object and ensuring proper fallback handling for currency formatting.

## Architecture

### Current Problem

The `LocalizationContext.tsx` file contains a syntax error in lines 118-120:

```typescript
const symbols: Record<CurrencyCode, string> = {
  MXN: '
</content>
<issues>
<issue-0>
Saw Hint: 'React' is declared but its value is never read.


mentM
</issue-0>
</issues>
</file>,  // ❌ SYNTAX ERROR: Incomplete string literal
  COP: '
</content>
<issues>
<issue-0>
Saw Hint: 'React' is declared but its value is never read.


mentM
</issue-0>
</issues>
</file>,  // ❌ SYNTAX ERROR: Incomplete string literal
  // ... more broken entries
}
```

This causes the entire React component tree to fail during compilation/runtime, triggering the Error Boundary and showing "¡Oops! Algo salió mal".

### Solution Architecture

The solution is straightforward:
1. Fix the syntax error by properly defining currency symbols
2. Ensure the fallback formatting logic is complete
3. Verify the build completes successfully

## Components and Interfaces

### Component: LocalizationContext

**Location:** `app/contexts/LocalizationContext.tsx`

**Responsibilities:**
- Provide localization context to the application
- Format currency values according to locale
- Handle fallback formatting when Intl.NumberFormat fails

**Key Function: formatCurrency**

```typescript
const formatCurrency = useCallback((amount: number): string => {
  try {
    // Primary: Use currency service
    return currencyService.formatCurrency(amount, currentConfig.currency, currentConfig.locale)
  } catch (error) {
    // Secondary: Use Intl.NumberFormat
    try {
      return new Intl.NumberFormat(currentConfig.locale, {
        style: 'currency',
        currency: currentConfig.currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
      }).format(amount)
    } catch (intlError) {
      // Tertiary: Manual fallback with symbols
      const symbols: Record<CurrencyCode, string> = {
        MXN: '$',
        COP: '$',
        ARS: '$',
        CLP: '$',
        PEN: 'S/',
        USD: '$',
        BRL: 'R$',
        EUR: '€'
      }
      
      const symbol = symbols[currentConfig.currency] || '$'
      return `${symbol}${amount.toLocaleString()}`
    }
  }
}, [currentConfig.currency, currentConfig.locale])
```

## Data Models

### CurrencyCode Type

```typescript
type CurrencyCode = 'MXN' | 'COP' | 'ARS' | 'CLP' | 'PEN' | 'USD' | 'BRL' | 'EUR'
```

### Currency Symbols Mapping

```typescript
const CURRENCY_SYMBOLS: Record<CurrencyCode, string> = {
  MXN: '$',      // Mexican Peso
  COP: '$',      // Colombian Peso
  ARS: '$',      // Argentine Peso
  CLP: '$',      // Chilean Peso
  PEN: 'S/',     // Peruvian Sol
  USD: '$',      // US Dollar
  BRL: 'R$',     // Brazilian Real
  EUR: '€'       // Euro
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Syntax Validity

*For any* TypeScript/JavaScript file in the project, the file should compile without syntax errors.

**Validates: Requirements 1.1**

### Property 2: Currency Symbol Completeness

*For any* valid CurrencyCode, the symbols object should contain a corresponding string value.

**Validates: Requirements 1.3**

### Property 3: Fallback Formatting Success

*For any* numeric amount and valid CurrencyCode, the formatCurrency function should return a non-empty string without throwing an exception.

**Validates: Requirements 3.1, 3.2**

### Property 4: Provider Initialization

*For any* application load, the LocalizationProvider should initialize without throwing exceptions.

**Validates: Requirements 2.3**

## Error Handling

### Syntax Error Prevention

- Use proper string literal syntax with complete quotes
- Validate TypeScript compilation before deployment
- Use ESLint/Prettier to catch syntax errors during development

### Runtime Error Handling

The `formatCurrency` function implements a three-tier fallback strategy:

1. **Primary:** Use `currencyService.formatCurrency()` (most robust)
2. **Secondary:** Use `Intl.NumberFormat` (browser native)
3. **Tertiary:** Manual formatting with symbol lookup (guaranteed to work)

Each tier catches errors and falls back to the next level, ensuring the function never throws an exception.

### Build-Time Validation

- Run `npm run build` to verify production build succeeds
- Check TypeScript compilation with `tsc --noEmit`
- Verify no console errors during development

## Testing Strategy

### Unit Tests

1. **Test currency symbol object completeness**
   - Verify all CurrencyCode values have corresponding symbols
   - Verify symbols are non-empty strings

2. **Test formatCurrency fallback chain**
   - Mock currencyService to throw error, verify Intl.NumberFormat is used
   - Mock both to throw errors, verify manual fallback is used
   - Verify function never throws exceptions

3. **Test LocalizationProvider mounting**
   - Verify provider mounts without errors
   - Verify context value is accessible to children

### Property-Based Tests

Property-based tests will validate universal properties across many generated inputs (minimum 100 iterations per test).

1. **Property Test: Currency formatting never throws**
   - Generate random amounts (positive, negative, zero, decimals)
   - Generate random valid CurrencyCodes
   - Verify formatCurrency always returns a string without throwing

2. **Property Test: Formatted currency contains symbol**
   - Generate random amounts and currencies
   - Verify formatted output contains the expected currency symbol

### Integration Tests

1. **Test full application load**
   - Start application in production mode
   - Verify no "¡Oops! Algo salió mal" error appears
   - Verify LocalizationProvider initializes successfully

2. **Test production build**
   - Run `npm run build`
   - Verify build completes without errors
   - Verify no TypeScript compilation errors

### Manual Testing

1. Load application in browser
2. Verify no console errors
3. Verify currency formatting displays correctly
4. Test with different locales/countries
