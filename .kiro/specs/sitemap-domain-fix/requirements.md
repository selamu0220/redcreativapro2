# Requirements Document

## Introduction

The current sitemap.xml file is generating URLs with the wrong domain (`redcreativapro.com`) instead of the correct domai  n (`www.redcreativa.pro`), causing Google Search Console to report "URL no permitida" errors for all 69 URLs in the sitemap. This prevents proper indexing and SEO performance.

## Requirements

### Requirement 1

**User Story:** As a website owner, I want my sitemap to use the correct domain URL so that Google Search Console can properly index all my pages.

#### Acceptance Criteria

1. WHEN the sitemap is generated THEN all URLs SHALL use `https://www.redcreativa.pro` as the base domain
2. WHEN Google Search Console reads the sitemap THEN it SHALL accept all URLs without "URL no permitida" errors
3. WHEN the sitemap is accessed at `/sitemap.xml` THEN it SHALL return valid XML with correct domain URLs

### Requirement 2

**User Story:** As a developer, I want the base URL to be configurable so that domain changes can be managed easily in the future.

#### Acceptance Criteria

1. WHEN the base URL needs to be changed THEN it SHALL be configurable through environment variables or a single configuration point
2. WHEN the application is deployed to different environments THEN the base URL SHALL automatically adapt to the correct domain
3. WHEN the sitemap is generated THEN it SHALL use the configured base URL consistently across all entries

### Requirement 3

**User Story:** As an SEO manager, I want the sitemap to maintain all current functionality while fixing the domain issue so that SEO performance is not affected.

#### Acceptance Criteria

1. WHEN the domain is fixed THEN all existing sitemap entries SHALL remain with the same paths and priorities
2. WHEN the sitemap is generated THEN it SHALL maintain the current structure with main pages and blog posts
3. WHEN the sitemap is updated THEN all priority levels and change frequencies SHALL remain unchanged
4. WHEN the fix is applied THEN the sitemap SHALL continue to be automatically generated with current date stamps