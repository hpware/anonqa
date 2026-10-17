import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { filter } from "convex-helpers/server/filter";
import { v4 as uuidv4 } from "uuid";
import {
  requireServerSecret,
  requireTeamAccess,
  requireValidSession,
} from "./auth";

export const getTeams = query({
  args: { userId: v.string(), session: v.string() },
  handler: async (ctx, args) => {
    // only allow reading the team list of the session's own user
    const sessionUserId = await requireValidSession(ctx, args.session);
    if (sessionUserId !== args.userId) {
      return [];
    }
    const data = await filter(
      ctx.db.query("users"),
      (doc) => !doc.deleted && doc.controlableUsers.includes(args.userId),
    ).collect();
    return data.map(({ threads_auth_token, ...team }) => team);
  },
});

export const addUserIntoTeam = mutation({
  args: {
    userId: v.string(),
    teamId: v.string(),
    session: v.string(),
  },
  handler: async (ctx, args) => {
    await requireTeamAccess(ctx, args.session, args.teamId);
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("userId"), args.teamId))
      .collect();
    if (!user.length) {
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
  args: { teamId: v.string(), joinId: v.string(), session: v.string() },
  handler: async (ctx, args) => {
    await requireTeamAccess(ctx, args.session, args.teamId);
    await ctx.db.insert("joinCodes", {
      code: args.joinId,
      teamId: args.teamId,
      used: false,
    });
  },
});

export const checkAbleToBeAccessed = query({
  args: { teamId: v.string(), userId: v.string(), session: v.string() },
  handler: async (ctx, args) => {
    // the session must belong to the userId whose access we are checking
    const sessionUserId = await requireValidSession(ctx, args.session);
    if (sessionUserId !== args.userId) {
      return false;
    }
    const user = await ctx.db
      .query("users")
      .withIndex("by_userId", (q) => q.eq("userId", args.teamId))
      .unique();
    if (!user || user.deleted) return false; // or throw if this should never happen
    const controlable = user.controlableUsers ?? [];
    return controlable.includes(args.userId);
  },
});

export const getJoinCodeData = query({
  args: {
    teamId: v.string(),
    session: v.string(),
  },
  handler: async (ctx, args) => {
    await requireTeamAccess(ctx, args.session, args.teamId);
    const rows = await ctx.db
      .query("joinCodes")
      .withIndex("teamId", (q) => q.eq("teamId", args.teamId))
      .collect();

    return rows.filter((row) => !row.used).map((row) => row.code);
  },
});

export const createNewTeam = mutation({
  args: {
    team_handle: v.string(),
    team_name: v.string(),
    user_id: v.string(),
    session: v.string(),
  },
  handler: async (ctx, args) => {
    // a session may only create teams owned by itself
    const sessionUserId = await requireValidSession(ctx, args.session);
    if (sessionUserId !== args.user_id) {
      throw new Error("Unauthorized: cannot create a team for another user.");
    }
    if (
      !/^[a-zA-Z0-9_-]{1,64}$/.test(args.team_handle) ||
      !args.team_name.trim()
    ) {
      throw new Error("Invalid team name or handle.");
    }
    const existing = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("handle"), args.team_handle))
      .first();
    if (existing) throw new Error("This handle is already in use.");
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
  args: { msgId: v.string(), session: v.string() },
  handler: async (ctx, args) => {
    const data = await ctx.db
      .query("qas")
      .filter((q) => q.eq(q.field("msgId"), args.msgId))
      .collect();
    if (!data[0]) {
      throw new Error("id not found");
    }
    // only members of the team that received this message may ignore it
    await requireTeamAccess(ctx, args.session, data[0].toUser);
    await ctx.db.patch(data[0]._id, {
      ignore: true,
    });
  },
});

export const getAllUserInfoInATeam = query({
  args: { teamId: v.string(), currentUserId: v.string(), session: v.string() },
  handler: async (ctx, args) => {
    // member emails may only be read by members of the same team
    await requireTeamAccess(ctx, args.session, args.teamId);
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
  args: { joinCode: v.string(), team_id: v.string(), session: v.string() },
  handler: async (ctx, args) => {
    await requireTeamAccess(ctx, args.session, args.team_id);
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

export const addNewCustomRandomDiceMessage = mutation({
  args: { msg: v.string(), teamId: v.string(), session: v.string() },
  handler: async (ctx, args) => {
    await requireTeamAccess(ctx, args.session, args.teamId);
    const user = await ctx.db
      .query("users")
      .withIndex("by_userId", (q) => q.eq("userId", args.teamId))
      .unique();
    const msg = args.msg.trim();
    if (!msg || msg.length > 2000)
      throw new Error("Message must contain 1–2000 characters.");
    const messages = user!.customRandomMessages ?? [];
    if (messages.includes(msg))
      return { success: false, message: "Message already exists." };
    await ctx.db.patch(user!._id, {
      customRandomMessages: [...messages, msg],
      setCustomRandomMessages: true,
    });
    return { success: true, message: "" };
  },
});

export const deleteCustomRandomDiceMessage = mutation({
  args: { msg: v.string(), teamId: v.string(), session: v.string() },
  handler: async (ctx, args) => {
    await requireTeamAccess(ctx, args.session, args.teamId);
    const user = await ctx.db
      .query("users")
      .withIndex("by_userId", (q) => q.eq("userId", args.teamId))
      .unique();
    const messages = (user!.customRandomMessages ?? []).filter(
      (msg) => msg !== args.msg,
    );
    await ctx.db.patch(user!._id, {
      customRandomMessages: messages,
      setCustomRandomMessages: messages.length > 0,
    });
    return { success: true, message: "" };
  },
});

export const threadsStatus = query({
  args: { teamId: v.string(), session: v.string() },
  handler: async (ctx, args) => {
    await requireTeamAccess(ctx, args.session, args.teamId);
    const team = await ctx.db
      .query("users")
      .withIndex("by_userId", (q) => q.eq("userId", args.teamId))
      .unique();
    return {
      connected: !!team!.threads_auth_token && !!team!.threads,
      expired:
        !team!.threads_token_expires_at ||
        team!.threads_token_expires_at <= Date.now(),
      profile: team!.threads ?? null,
    };
  },
});

export const getThreadsConnection = query({
  args: { teamId: v.string(), session: v.string(), secret: v.string() },
  handler: async (ctx, args) => {
    await requireServerSecret(args.secret);
    await requireTeamAccess(ctx, args.session, args.teamId);
    const team = await ctx.db
      .query("users")
      .withIndex("by_userId", (q) => q.eq("userId", args.teamId))
      .unique();
    if (!team!.threads_auth_token || !team!.threads) return null;
    return {
      token: team!.threads_auth_token,
      profile: team!.threads,
      expiresAt: team!.threads_token_expires_at ?? 0,
    };
  },
});

export const saveThreadsConnection = mutation({
  args: {
    teamId: v.string(),
    session: v.string(),
    secret: v.string(),
    token: v.string(),
    expiresAt: v.number(),
    profile: v.object({
      id: v.string(),
      name: v.string(),
      username: v.string(),
      is_verified: v.boolean(),
      threads_profile_picture_url: v.string(),
    }),
  },
  handler: async (ctx, args) => {
    await requireServerSecret(args.secret);
    await requireTeamAccess(ctx, args.session, args.teamId);
    const team = await ctx.db
      .query("users")
      .withIndex("by_userId", (q) => q.eq("userId", args.teamId))
      .unique();
    await ctx.db.patch(team!._id, {
      threads_auth_token: args.token,
      threads: args.profile,
      threads_token_expires_at: args.expiresAt,
    });
  },
});

export const disconnectThreads = mutation({
  args: { teamId: v.string(), session: v.string() },
  handler: async (ctx, args) => {
    await requireTeamAccess(ctx, args.session, args.teamId);
    const team = await ctx.db
      .query("users")
      .withIndex("by_userId", (q) => q.eq("userId", args.teamId))
      .unique();
    await ctx.db.patch(team!._id, {
      threads_auth_token: undefined,
      threads: undefined,
      threads_token_expires_at: undefined,
    });
  },
});
