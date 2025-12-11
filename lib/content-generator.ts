/**
 * Automated Content Creation System
 * Generates keyword-optimized content briefs and templates
 */

import { KeywordData, KeywordCluster } from "./keyword-research";

export interface ContentBrief {
  id: string;
  title: string;
  targetKeywords: string[];
  primaryKeyword: string;
  wordCount: number;
  outline: string[];
  metaDescription: string;
  headings: {
    h1: string;
    h2: string[];
    h3: string[];
  };
  internalLinks: string[];
  createdAt: Date;
}

export interface ContentTemplate {
  id: string;
  type: "blog" | "landing" | "product" | "category";
  structure: string[];
  keywordDensity: number;
  readabilityScore: number;
}

export class ContentGenerator {
  private templates: Map<string, ContentTemplate> = new Map();

  constructor() {
    this.initializeTemplates();
  }

  private initializeTemplates(): void {
    // Blog post template
    this.templates.set("blog", {
      id: "blog-template",
      type: "blog",
      structure: [
        "Introduction with primary keyword",
        "Problem identification",
        "Solution explanation",
        "Benefits and features",
        "Call to action",
      ],
      keywordDensity: 1.5,
      readabilityScore: 70,
    });

    // Landing page template
    this.templates.set("landing", {
      id: "landing-template",
      type: "landing",
      structure: [
        "Hero section with primary keyword",
        "Value proposition",
        "Features overview",
        "Social proof",
        "FAQ section",
        "Strong CTA",
      ],
      keywordDensity: 2.0,
      readabilityScore: 75,
    });
  }

  async generateContentBrief(
    cluster: KeywordCluster,
    contentType: "blog" | "landing" | "product" | "category" = "blog"
  ): Promise<ContentBrief> {
    const template = this.templates.get(contentType);
    if (!template) {
      throw new Error(`Template not found for type: ${contentType}`);
    }

    const primaryKeyword = cluster.primaryKeyword;
    const targetKeywords = cluster.keywords.map((k) => k.keyword);

    return {
      id: `brief-${Date.now()}`,
      title: this.generateTitle(primaryKeyword, contentType),
      targetKeywords,
      primaryKeyword,
      wordCount: this.calculateOptimalWordCount(cluster),
      outline: this.generateOutline(cluster, template),
      metaDescription: this.generateMetaDescription(primaryKeyword, cluster),
      headings: this.generateHeadings(cluster, template),
      internalLinks: this.suggestInternalLinks(cluster),
      createdAt: new Date(),
    };
  }

  private generateTitle(primaryKeyword: string, contentType: string): string {
    const titleTemplates = {
      blog: [
        `Complete Guide to ${primaryKeyword}`,
        `How to Master ${primaryKeyword} in 2024`,
        `${primaryKeyword}: Everything You Need to Know`,
        `Ultimate ${primaryKeyword} Tutorial`,
      ],
      landing: [
        `Best ${primaryKeyword} Solution`,
        `Professional ${primaryKeyword} Services`,
        `${primaryKeyword} Made Simple`,
        `Get Results with ${primaryKeyword}`,
      ],
      product: [
        `${primaryKeyword} - Premium Quality`,
        `Buy ${primaryKeyword} Online`,
        `${primaryKeyword} Collection`,
      ],
      category: [
        `${primaryKeyword} Category`,
        `Shop ${primaryKeyword}`,
        `${primaryKeyword} Products`,
      ],
    };

    const templates =
      titleTemplates[contentType as keyof typeof titleTemplates] ||
      titleTemplates.blog;
    return templates[Math.floor(Math.random() * templates.length)];
  }

  private calculateOptimalWordCount(cluster: KeywordCluster): number {
    const baseWordCount = 800;
    const keywordBonus = cluster.keywords.length * 50;
    const difficultyMultiplier = (cluster as any).difficulty > 70 ? 1.5 : 1.2;

    return Math.round((baseWordCount + keywordBonus) * difficultyMultiplier);
  }

  private generateOutline(
    cluster: KeywordCluster,
    template: ContentTemplate
  ): string[] {
    const outline = [...template.structure];

    // Add keyword-specific sections
    cluster.keywords.slice(1, 4).forEach((keyword) => {
      outline.splice(-1, 0, `Section about ${keyword.keyword}`);
    });

    return outline;
  }

  private generateMetaDescription(
    primaryKeyword: string,
    cluster: KeywordCluster
  ): string {
    const templates = [
      `Discover everything about ${primaryKeyword}. Complete guide with tips, strategies and best practices.`,
      `Learn ${primaryKeyword} with our comprehensive guide. Get results fast with proven methods.`,
      `Master ${primaryKeyword} today. Step-by-step guide with real examples and expert insights.`,
    ];

    let description = templates[Math.floor(Math.random() * templates.length)];

    // Ensure it's under 160 characters
    if (description.length > 160) {
      description = description.substring(0, 157) + "...";
    }

    return description;
  }

  private generateHeadings(
    cluster: KeywordCluster,
    template: ContentTemplate
  ): ContentBrief["headings"] {
    const primaryKeyword = cluster.primaryKeyword;
    const secondaryKeywords = cluster.keywords.slice(1, 6);

    return {
      h1: `Complete Guide to ${primaryKeyword}`,
      h2: [
        `What is ${primaryKeyword}?`,
        `Benefits of ${primaryKeyword}`,
        `How to Get Started with ${primaryKeyword}`,
        `Best Practices for ${primaryKeyword}`,
        "Conclusion",
      ],
      h3: secondaryKeywords.map((k) => `Understanding ${k.keyword}`),
    };
  }

  private suggestInternalLinks(cluster: KeywordCluster): string[] {
    // This would typically query your existing content database
    // For now, return suggested link patterns
    return [
      `/blog/${cluster.primaryKeyword.toLowerCase().replace(/\s+/g, "-")}`,
      `/guides/${cluster.primaryKeyword.toLowerCase().replace(/\s+/g, "-")}`,
      `/resources/${cluster.primaryKeyword.toLowerCase().replace(/\s+/g, "-")}`,
    ];
  }

  async generateMultipleBriefs(
    clusters: KeywordCluster[],
    contentType: "blog" | "landing" | "product" | "category" = "blog"
  ): Promise<ContentBrief[]> {
    const briefs: ContentBrief[] = [];

    for (const cluster of clusters) {
      try {
        const brief = await this.generateContentBrief(cluster, contentType);
        briefs.push(brief);
      } catch (error) {
        console.error(
          `Failed to generate brief for cluster ${cluster.primaryKeyword}:`,
          error
        );
      }
    }

    return briefs;
  }

  exportBriefsToMarkdown(briefs: ContentBrief[]): string {
    let markdown = "# Content Briefs\n\n";

    briefs.forEach((brief) => {
      markdown += `## ${brief.title}\n\n`;
      markdown += `**Primary Keyword:** ${brief.primaryKeyword}\n`;
      markdown += `**Target Keywords:** ${brief.targetKeywords.join(", ")}\n`;
      markdown += `**Word Count:** ${brief.wordCount}\n`;
      markdown += `**Meta Description:** ${brief.metaDescription}\n\n`;

      markdown += `### Outline\n`;
      brief.outline.forEach((section, index) => {
        markdown += `${index + 1}. ${section}\n`;
      });

      markdown += `\n### Headings Structure\n`;
      markdown += `**H1:** ${brief.headings.h1}\n`;
      markdown += `**H2 Tags:**\n`;
      brief.headings.h2.forEach((h2) => {
        markdown += `- ${h2}\n`;
      });

      markdown += `\n**H3 Tags:**\n`;
      brief.headings.h3.forEach((h3) => {
        markdown += `- ${h3}\n`;
      });

      markdown += `\n---\n\n`;
    });

    return markdown;
  }
}
