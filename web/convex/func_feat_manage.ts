import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { filter } from "convex-helpers/server/filter";

export const getTeams = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const data = filter(ctx.db.query("users"), (doc) =>
      doc.controlableUsers.includes(args.userId),
    ).collect();
    return data;
  },
});
