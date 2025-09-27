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

export const addUserIntoTeam = mutation({
  args: {
    userId: v.string(),
    teamId: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("userId"), args.teamId))
      .collect();
    if (!user) {
      return { success: false, message: "User not found." };
    }
    if (user[0].controlableUsers?.includes(args.userId)) {
      return { success: false, message: "User already in team." };
    }
    const newUserList = [...(user[0].controlableUsers || []), args.userId];
    await ctx.db.patch(user[0]._id, { controlableUsers: newUserList });
    return { success: true };
  },
});

export const createJoinCode = mutation({
  args: { teamId: v.string(), joinId: v.string() },
  handler: async (ctx, args) => {
    await ctx.db.insert("joinCodes", {
      code: args.joinId,
      teamId: args.teamId,
      used: false,
    });
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

    return rows.filter((row) => !row.used).map((row) => row.code);
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

export const setDataAsIgnored = mutation({
  args: { msgId: v.string() },
  handler: async (ctx, args) => {
    const data = await ctx.db
      .query("qas")
      .filter((q) => q.eq(q.field("msgId"), args.msgId))
      .collect();
    if (!data[0]) {
      throw new Error("id not found");
    }
    await ctx.db.patch(data[0]._id, {
      ignore: true,
    });
  },
});

export const getAllUserInfoInATeam = query({
  args: { teamId: v.string(), currentUserId: v.string() },
  handler: async (ctx, args) => {
    const getTeamViaId = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("userId"), args.teamId))
      .collect();
    const getControllerableUsers = getTeamViaId[0].controlableUsers;
    const userArray = await Promise.all(
      getControllerableUsers.map(async (usrid) => {
        const login = await ctx.db
          .query("login")
          .filter((q) => q.eq(q.field("userId"), usrid))
          .collect();
        if (
          login.length !== 0 &&
          !login[0].deleted &&
          login[0].userId !== args.currentUserId
        ) {
          return {
            userId: login[0].userId,
            email: login[0].email,
            fname: login[0].fname,
          };
        }
        return null;
      }),
    );
    /**[];
    for (const i in getControllerableUsers) {
      const query = await ctx.db
        .query("login")
        .filter((q) => q.eq(q.field("userId"), i))
        .collect();
      userArray.push(
        query
          .filter((i2) => i2.deleted)
          .map((i2) => {
            return {
              userId: i2.userId,
              email: i2.email,
              fname: i2.fname,
            };
          }),
      );
    }*/
    return userArray;
  },
});

export const setJoinCodeAsInvalid = mutation({
  args: { joinCode: v.string(), team_id: v.string() },
  handler: async (ctx, args) => {
    const query = await ctx.db
      .query("joinCodes")
      .filter((q) => q.eq(q.field("code"), args.joinCode))
      .collect();
    if (query.length === 0) {
      return;
    }
    if (query[0].teamId !== args.team_id) {
      return;
    }
    await ctx.db.patch(query[0]._id, {
      used: true,
    });
  },
});
