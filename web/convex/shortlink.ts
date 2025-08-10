import { query } from "./_generated/server";
import { v } from "convex/values";
import { v4 as uuidv4 } from "uuid";

export const getTo = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const queryquery = await ctx.db
      .query("urls")
      .filter((q) => q.eq(q.field("toUser"), args.slug))
      .collect();
    if (queryquery.length === 0) {
      return null;
    }
    return queryquery[0].toUser;
  },
});
