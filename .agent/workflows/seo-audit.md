---
description: Audit a specific page for technical SEO issues
---

# SEO Single Page Audit Workflow

This workflow performs a quick technical SEO audit on a specific URL (yours or a competitor's) to identify optimization opportunities.

1. **Scrape Page Data**
   - Use `firecrawl_scrape` on the target URL.
   - Ensure `formats` includes `["markdown", "html"]` to see both content and structure.

2. **Technical Check**
   - **Title Tag**: Is it present? Is it between 30-60 characters?
   - **Meta Description**: Is it present? Is it compelling and under 160 characters?
   - **H1 Tag**: Is there exactly ONE H1 tag? Does it contain the primary keyword?
   - **Heading Hierarchy**: Are H2s and H3s nested correctly?
   - **Images**: Do images have `alt` text? (Check the HTML or use an LLM query on the scraped content).
   - **Content Length**: Is the content substantial enough for the topic?

3. **Optimization Recommendations**
   - detailed actionable list of fixes.
   - **Example**: "Change H1 from 'Welcome' to 'Expert SEO Services in Madrid'".

// turbo
4. **Usage Example**
   - `Run seo-audit on https://redcreativapro.com/blog/article-1`
