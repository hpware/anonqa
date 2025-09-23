import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { filter } from "convex-helpers/server/filter";
import generateRandomString from "@/lib/randomGenString";
import { v4 as uuidv4 } from "uuid";

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
    const code = `skin_d_${generateRandomString(10)}`;
    await ctx.db.insert("joinCodes", {
      code,
      teamId: args.teamId,
      used: false,
    });
    return code;
  },
});

export const checkAbleToBeAccessed = query({
  args: { teamId: v.string(), userId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_userId", (q) => q.eq("userId", args.teamId))
      .unique();
    if (!user) return false; // or throw if this should never happen
    const controlable = user.controlableUsers ?? [];
    return controlable.includes(args.userId);
  },
});

export const getJoinCodeData = query({
  args: {
    teamId: v.string(),
  },
  handler: async (ctx, args) => {
    const rows = await ctx.db
      .query("joinCodes")
      .withIndex("teamId", (q) => q.eq("teamId", args.teamId))
      .collect();

    return rows.map((row) => row.code);
  },
});

export const createNewTeam = mutation({
  args: { team_handle: v.string(), team_name: v.string(), user_id: v.string() },
  handler: async (ctx, args) => {
    const teamId = uuidv4();
    await ctx.db.insert("users", {
      imageUrl: "/assets/default.png",
      displayName: args.team_name,
      controlableUsers: [args.user_id],
      userId: teamId,
      deleted: false,
      handle: args.team_handle,
      setCustomRandomMessages: false,
      pageType: "1",
      defaultMessages: [],
      customShortUrlSlug: "",
      onBoarded: true,
    });
    return teamId;
  },
});
