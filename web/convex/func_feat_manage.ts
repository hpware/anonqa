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

/**export const getThreadsAuthToken = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const data = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .collect();
    return data[0].threads_auth_token;
  },
});
 */

/*export const addUserIntoTeam = mutation({
  args: {
    userId: v.string(),
    teamId: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("userId"), args.teamId))
      .collect();
    if (existing[0].controlableUsers.includes(args.teamId)) {
      return {
        success: false,
        message: "User exists.",
      };
    }
    const newUserList = [...existing[0].controlableUsers, args.userId];
    await ctx.db.replace("users", {
      controlableUsers: newUserList,
    });
  },
}); */

export const createJoinCode = mutation({
  args: { teamId: v.string() },
  handler: async (ctx, args) => {
    const code = crypto.randomUUID();
    await ctx.db.insert("joinCodes", {
      code,
      teamId: args.teamId,
      used: false,
    });
    return code;
  },
});
