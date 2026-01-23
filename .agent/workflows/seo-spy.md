---
description: Analyze a competitor's blog strategy using Firecrawl
---

# SEO Competitor Spy Workflow

This workflow helps you analyze a competitor's website to understand their content strategy, keyword targeting, and structural SEO practices.

1. **Map the Competitor's Site**
   - Use `firecrawl_map` on the target URL (e.g., `https://competitor.com/blog`) to find all their pages.
   - Look for patterns in their URLs (e.g., `/blog/category/`, date structures).

2. **Select Top Content**
   - Identify 3-5 interesting article URLs from the map results.
   - **User Input**: Ask the user which specific URLs they want to analyze deeply if the list is long.

3. **Scrape & Analyze Structure**
   - For the selected URLs, use `firecrawl_scrape`.
   - **Focus on:**
     - `<title>` tag and `<meta name="description">`.
     - `<h1>` (Main Topic).
     - `<h2>` and `<h3>` (Subtopics / Content Outline).
     - Internal linking structure.

4. **Generate Report**
   - Compile the findings into a markdown report.
   - **Key Insights to include:**
     - What keywords are they targeting in headers?
     - Average content length (estimated).
     - How do they structure their intros?
     - What "gaps" exist that we can exploit?

// turbo
5. **Usage Example**
   - `Run the seo-spy workflow on https://backlinko.com/blog`
