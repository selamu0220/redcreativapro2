import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Get all articles (for sitemap or list view)
export const list = query({
    args: {},
    handler: async (ctx) => {
        return await ctx.db.query("articles").filter((q) => q.eq(q.field("isPublished"), true)).collect();
    },
});

// Get single article by slug
export const getBySlug = query({
    args: { slug: v.string() },
    handler: async (ctx, args) => {
        const article = await ctx.db
            .query("articles")
            .withIndex("by_slug", (q) => q.eq("slug", args.slug))
            .first();
        return article;
    },
});

// Create or update article (internal use / seeding)
export const create = mutation({
    args: {
        title: v.string(),
        slug: v.string(),
        content: v.string(),
        excerpt: v.optional(v.string()),
        keywords: v.optional(v.array(v.string())),
        category: v.string(),
        publishedAt: v.string(),
        isPublished: v.boolean(),
        metaTitle: v.optional(v.string()),
        metaDescription: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        // Check if exists
        const existing = await ctx.db
            .query("articles")
            .withIndex("by_slug", (q) => q.eq("slug", args.slug))
            .first();

        if (existing) {
            return await ctx.db.patch(existing._id, args);
        } else {
            return await ctx.db.insert("articles", args);
        }
    },
});
