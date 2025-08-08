import { query } from "./_generated/server";
import { v } from "convex/values";

export const users = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("handle"), args.slug))
      .collect();
  },
});

export const specialSelections = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("randomizer")
      .filter((q) => q.eq(q.field("userId"), args.slug))
      .collect();
  },
});
