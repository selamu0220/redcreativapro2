import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  tasks: defineTable({
    text: v.string(),
    isCompleted: v.boolean(),
  }),
  articles: defineTable({
    title: v.string(),
    slug: v.string(),
    content: v.string(), // HTML content
    excerpt: v.optional(v.string()),
    keywords: v.optional(v.array(v.string())),
    category: v.string(),
    publishedAt: v.string(), // ISO date string
    isPublished: v.boolean(),
    metaTitle: v.optional(v.string()),
    metaDescription: v.optional(v.string()),
  }).index("by_slug", ["slug"]),
});
