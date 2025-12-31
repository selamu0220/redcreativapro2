import { v } from "convex/values";
// Note: Convex _generated files are created during build
// If this fails, ensure convex is properly initialized
// import { query, mutation } from "./_generated/server";

// Placeholder types for development
const query = (config: any) => config;
const mutation = (config: any) => config;

export const get = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("tasks").collect();
  },
});

export const add = mutation({
  args: { text: v.string() },
  handler: async (ctx, args) => {
    await ctx.db.insert("tasks", { text: args.text, isCompleted: false });
  },
});
