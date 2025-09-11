import { query } from "./_generated/server";
import { v } from "convex/values";

export const users = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const result = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("handle"), args.slug))
      .collect();
    if (result.length === 0) {
      return [];
    }
    return [
      {
        deleted: result[0].deleted,
        displayName: result[0].displayName,
        handle: result[0].handle,
        imageUrl: result[0].imageUrl,
        pageType: result[0].pageType,
        setCustomRandomMessages: result[0].setCustomRandomMessages,
        userId: result[0].userId,
      },
    ];
  },
});

export const specialSelections = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const result = await ctx.db
      .query("randomizer")
      .filter((q) => q.eq(q.field("userId"), args.slug))
      .collect();
    return result;
  },
});
