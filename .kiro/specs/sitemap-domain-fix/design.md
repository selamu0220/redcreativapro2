# Design Document - Sitemap Domain Fix

## Overview
This document outlines the design and implementation approach for fixing the sitemap domain issue where URLs were being generated with `redcreativapro.com` instead of the correct `www.redcreativa.pro` domain.

## Problem Analysis
- Current sitemap hardcodes `https://redcreativapro.com` as the base URL
- Google Search Console reports "URL no permitida" errors for all 69 URLs
- No environment-based configuration for domain management

## Solution Design

### 1. Environment-Based Configuration
**Approach:** Use existing `NEXT_PUBLIC_APP_URL` environment variable for domain configuration

**Implementation:**
- Update `.env` and `.env.example` to use correct production domain
- Maintain localhost configuration in `.env.local` for development
- Implement smart domain resolution in sitemap generation

### 2. Sitemap Logic Enhancement
**Current Logic:**
```typescript
const baseUrl = 'https://redcreativapro.com'
```

**New Logic:**
```typescript
const envUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.redcreativa.pro'
const baseUrl = envUrl.includes('localhost') ? 'https://www.redcreativa.pro' : envUrl
```

**Benefits:**
- Always generates production URLs for sitemap regardless of environment
- Maintains development flexibility
- Provides fallback to correct domain
- Single configuration point for domain management

### 3. Environment Configuration Strategy

#### Production Environment (.env)
```
NEXT_PUBLIC_APP_URL=https://www.redcreativa.pro
```

#### Development Environment (.env.local)
```
NEXT_PUBLIC_APP_URL=http://localhost:3001
```

#### Example Configuration (.env.example)
```
NEXT_PUBLIC_APP_URL=https://www.redcreativa.pro
```

## Implementation Details

### Files Modified
1. **app/sitemap.ts** - Updated domain resolution logic
2. **.env** - Set correct production domain
3. **.env.example** - Updated example with correct domain
4. **.env.local** - Added clarifying comment

### Key Features
- **Environment Awareness:** Automatically detects localhost and uses production domain
- **Fallback Safety:** Defaults to correct domain if environment variable is missing
- **Development Friendly:** Maintains localhost functionality for development
- **Single Source of Truth:** All domain configuration through environment variables

## Testing Strategy

### Manual Testing
1. Verify sitemap generates correct URLs in development
2. Verify sitemap generates correct URLs in production
3. Test Google Search Console acceptance

### Automated Testing
- Build process validates sitemap generation
- Environment variable resolution testing

## Deployment Considerations

### Environment Variables
- Ensure production deployment has `NEXT_PUBLIC_APP_URL=https://www.redcreativa.pro`
- Verify Vercel/deployment platform environment configuration

### Rollback Plan
- Simple revert of sitemap.ts changes if issues arise
- Environment variable can be quickly updated

## Success Metrics
1. **Google Search Console:** Zero "URL no permitida" errors
2. **SEO Performance:** Maintained indexing of all 69 URLs
3. **Functionality:** All existing sitemap features preserved
4. **Configuration:** Easy domain management through environment variables

## Future Enhancements
- Consider adding domain validation
- Implement sitemap caching for performance
- Add monitoring for sitemap health checks