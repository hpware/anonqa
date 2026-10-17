import { internalMutation, mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { v4 as uuidv4 } from "uuid";
import { filter } from "convex-helpers/server/filter";
import {
  requireServerSecret,
  requireTeamAccess,
  requireValidSession,
} from "./auth";

// cron to remove users
export const removedeleted = internalMutation({
  args: {},
  handler: async (ctx) => {
    const usersToDelete = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("deleted"), true))
      .collect();

    for (const user of usersToDelete) {
      await ctx.db.delete(user._id);
      const codes = await ctx.db
        .query("joinCodes")
        .withIndex("teamId", (q) => q.eq("teamId", user.userId))
        .collect();
      for (const code of codes) await ctx.db.delete(code._id);
      const deleteMessages = await ctx.db
        .query("qas")
        .filter((q) => q.eq(q.field("toUser"), user.userId))
        .collect();
      for (const delMsg of deleteMessages) {
        await ctx.db.delete(delMsg._id);
      }
    }
    return;
  },
});

// internal check if the user exists.
export const doesUserNameExist = query({
  args: { username: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("handle"), args.username))
      .first();
    return !!user;
  },
});

export const data = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const result = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("handle"), args.slug))
      .collect();
    if (result.length === 0 || result[0].deleted) {
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
        customRandomMessages: result[0].customRandomMessages,
        userId: result[0].userId,
        defaultMessages: result[0].defaultMessages,
      },
    ];
  },
});

export const data_dash = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const result = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("userId"), args.slug))
      .collect();
    if (result.length === 0 || result[0].deleted) {
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
        customRandomMessages: result[0].customRandomMessages,
        userId: result[0].userId,
        defaultMessages: result[0].defaultMessages,
      },
    ];
  },
});

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

// for the login endpoint (server-to-server only, see convex/auth.ts)
export const checkAccountAndReturnPassword = query({
  args: { email: v.string(), secret: v.string() },
  handler: async (ctx, args) => {
    await requireServerSecret(args.secret);
    const query = await ctx.db
      .query("login")
      .filter((q) => q.eq(q.field("email"), args.email))
      .collect();
    if (query.length === 0) {
      return {
        valid: false,
        fname: null,
        userId: null,
        passwordHash: null,
      };
    }
    return {
      valid: true,
      fname: query[0].fname,
      userId: query[0].userId,
      passwordHash: query[0].passwordHashed,
    };
  },
});

// for the registering endpoint (server-to-server only, see convex/auth.ts)
export const lookUpAccountsByEmail = query({
  args: { email: v.string(), secret: v.string() },
  handler: async (ctx, args) => {
    await requireServerSecret(args.secret);
    return await ctx.db
      .query("login")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .unique();
  },
});

// server-to-server only, see convex/auth.ts
export const createLoginAccount = mutation({
  args: {
    email: v.string(),
    password: v.string(),
    fname: v.string(),
    secret: v.string(),
  },
  handler: async (ctx, args) => {
    await requireServerSecret(args.secret);
    try {
      const existing = await ctx.db
        .query("login")
        .withIndex("by_email", (q) => q.eq("email", args.email))
        .first();
      if (existing) return { success: false, userId: null };
      const generateUserID = uuidv4();
      await ctx.db.insert("login", {
        email: args.email,
        userId: generateUserID,
        fname: args.fname, // first name btw
        passwordHashed: args.password,
        deleted: false,
      });
      return {
        success: true,
        userId: generateUserID,
      };
    } catch (e) {
      console.log(e);
      return {
        success: false,
        userId: null,
      };
    }
  },
});

// server-to-server only (called after the caller authenticated the user), see convex/auth.ts
export const createSession = mutation({
  args: { userId: v.string(), secret: v.string() },
  handler: async (ctx, args) => {
    await requireServerSecret(args.secret);
    const sessionUuid = uuidv4();
    const oneDayFromNow = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await ctx.db.insert("session", {
      userAccount: args.userId,
      sessionId: sessionUuid,
      expires_at: Number(oneDayFromNow),
    });
    return {
      success: true,
      session: sessionUuid,
      expiresAt: oneDayFromNow.getTime(),
    };
  },
});

export const deleteExpiredSessions = internalMutation({
  handler: async (ctx, args) => {
    const sessionsToDelete = await ctx.db
      .query("session")
      .filter((q) => q.lte(q.field("expires_at"), Date.now())) // less than or equal
      .collect();
    for (const session of sessionsToDelete) {
      await ctx.db.delete(session._id);
    }
    return;
  },
});

export const verifySession = query({
  args: { currentSession: v.string() },
  handler: async (ctx, args) => {
    const checkSession = await ctx.db
      .query("session")
      .withIndex("by_session", (q) => q.eq("sessionId", args.currentSession))
      .unique();
    if (checkSession === null) {
      return { linked: false, userid: null };
    }
    if (checkSession.expires_at <= Date.now()) {
      return { linked: false, userid: null };
    }
    return {
      linked: checkSession.userAccount != null,
      userid: checkSession.userAccount ?? null,
    };
  },
});

export const getFname = query({
  args: { userId: v.string(), session: v.string() },
  handler: async (ctx, args) => {
    const sessionUserId = await requireValidSession(ctx, args.session);
    if (sessionUserId !== args.userId) {
      return null;
    }
    const query = await ctx.db
      .query("login")
      .withIndex("userId", (q) => q.eq("userId", args.userId))
      .unique();
    if (query === null) {
      return null;
    }
    return query?.fname;
  },
});

export const getTeamSlugViaTeamId = query({
  args: { teamId: v.string() },
  handler: async (ctx, args) => {
    const query = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("userId"), args.teamId))
      .collect();
    return query[0]?.handle ?? null;
  },
});

export const getDefaultPlaceholderAndDiceThingy = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const query = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("handle"), args.slug))
      .collect();
    if (!query.length || query[0].deleted)
      return { diceMode: false, dice: [], default: [], user: "" };
    return {
      diceMode: query[0].setCustomRandomMessages || false,
      dice: query[0].customRandomMessages || [],
      default: query[0].defaultMessages || [],
      user: query[0].handle,
    };
  },
});

export const checkIfJoinCodeIsValidAndIfItIsValidThenRevokeAkaInvlidsIt =
  mutation({
    args: { joinCode: v.string(), userId: v.string(), session: v.string() },
    handler: async (ctx, args) => {
      const sessionUserId = await requireValidSession(ctx, args.session);
      if (sessionUserId !== args.userId) {
        return {
          success: false,
          msg: "Unauthorized.",
          teamId: "",
        };
      }
      const fetchJoinCode = await ctx.db
        .query("joinCodes")
        .filter((q) => q.eq(q.field("code"), args.joinCode))
        .collect();
      if (fetchJoinCode.length === 0) {
        return {
          success: false,
          msg: "This code does not exist.",
          teamId: "",
        };
      }
      if (fetchJoinCode[0].used) {
        return {
          success: false,
          msg: "This code bas already been used.",
          teamId: "",
        };
      }
      const fetchCurrentTeamJoinedUsers = await ctx.db
        .query("users")
        .filter((q) => q.eq(q.field("userId"), fetchJoinCode[0].teamId))
        .collect();
      if (
        fetchCurrentTeamJoinedUsers.length === 0 ||
        fetchCurrentTeamJoinedUsers[0].deleted
      ) {
        return {
          success: false,
          msg: "Cannot find team that is connected with this join code.",
          teamId: "",
        };
      }
      if (
        fetchCurrentTeamJoinedUsers[0].controlableUsers.includes(args.userId)
      ) {
        return {
          success: false,
          msg: "You are already in this team! :?",
          teamId: fetchCurrentTeamJoinedUsers[0].userId,
        };
      }
      // then redeem the join code ig.
      await ctx.db.patch(fetchJoinCode[0]._id, {
        used: true,
      });
      const newControlableUsers = [
        ...fetchCurrentTeamJoinedUsers[0].controlableUsers,
        args.userId,
      ];
      await ctx.db.patch(fetchCurrentTeamJoinedUsers[0]._id, {
        controlableUsers: newControlableUsers,
      });
      return {
        success: true,
        msg: "Success",
        teamId: fetchCurrentTeamJoinedUsers[0].userId,
      };
    },
  });

export const saveNewUserSettings = mutation({
  args: {
    new_displayName: v.string(),
    new_handle: v.string(),
    new_imageUrl: v.string(),
    new_placeholder: v.array(v.string()),
    customRandomMessages: v.array(v.string()),
    teamId: v.string(),
    session: v.string(),
  },
  handler: async (ctx, args) => {
    await requireTeamAccess(ctx, args.session, args.teamId);
    const query = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("userId"), args.teamId))
      .collect();
    const handle = args.new_handle.trim();
    if (!/^[a-zA-Z0-9_-]{1,64}$/.test(handle) || !args.new_displayName.trim()) {
      throw new Error("Invalid display name or handle.");
    }
    const existing = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("handle"), handle))
      .first();
    if (existing && existing._id !== query[0]._id) {
      throw new Error("This handle is already in use.");
    }
    await ctx.db.patch(query[0]._id, {
      displayName: args.new_displayName.trim(),
      handle,
      imageUrl: args.new_imageUrl,
      defaultMessages: args.new_placeholder,
      customRandomMessages: args.customRandomMessages,
      setCustomRandomMessages: args.customRandomMessages.length > 0,
    });
  },
});

export const kickPersonFromTeam = mutation({
  args: {
    teamId: v.string(),
    userToBeKicked: v.string(),
    session: v.string(),
  },
  handler: async (ctx, args) => {
    await requireTeamAccess(ctx, args.session, args.teamId);
    const query = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("userId"), args.teamId))
      .collect();
    if (!query[0].controlableUsers.includes(args.userToBeKicked)) {
      return;
    }
    const newUserList = query[0].controlableUsers.filter(
      (i) => i !== args.userToBeKicked,
    );
    await ctx.db.patch(query[0]._id, {
      controlableUsers: newUserList,
    });
  },
});

export const deleteThisUser = mutation({
  args: { userId: v.string(), areyousure: v.string(), session: v.string() },
  handler: async (ctx, args) => {
    const sessionUserId = await requireValidSession(ctx, args.session);
    // a session may only delete the account it belongs to
    if (sessionUserId !== args.userId) {
      return {
        success: false,
        msg: "Unauthorized.",
      };
    }
    if (
      args.areyousure !== "YES I AM SURE I WANT TO DELETE MY ACCOUNT FOREVER"
    ) {
      return {
        success: false,
        msg: "not sincere enough.",
      };
    }
    const query = await ctx.db
      .query("login")
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .collect();
    if (query.length === 0) {
      return {
        success: false,
        msg: "USER NOT FOUND",
      };
    }
    try {
      await ctx.db.delete(query[0]._id);
      const teams = await ctx.db.query("users").collect();
      for (const team of teams) {
        if (!team.controlableUsers.includes(args.userId)) continue;
        const members = team.controlableUsers.filter(
          (id) => id !== args.userId,
        );
        await ctx.db.patch(team._id, {
          controlableUsers: members,
          deleted: team.deleted || members.length === 0,
        });
      }
      const sessionsToDelete = await ctx.db
        .query("session")
        .filter((q) => q.eq(q.field("userAccount"), args.userId))
        .collect();

      // Delete each session
      for (const session of sessionsToDelete) {
        await ctx.db.delete(session._id);
      }
      return {
        success: true,
        msg: "",
      };
    } catch (e: any) {
      console.error(e);
      return {
        success: false,
        msg: e.message,
      };
    }
  },
});

export const deleteThisTeam = mutation({
  args: { teamId: v.string(), areyousure: v.string(), session: v.string() },
  handler: async (ctx, args) => {
    await requireTeamAccess(ctx, args.session, args.teamId);
    if (args.areyousure !== "YES I AM SURE I WANT TO DELETE MY TEAM FOREVER") {
      return {
        success: false,
        msg: "not sincere enough.",
      };
    }
    const query = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("userId"), args.teamId))
      .collect();
    if (query.length === 0) {
      return {
        success: false,
        msg: "USER NOT FOUND",
      };
    }
    try {
      await ctx.db.patch(query[0]._id, {
        deleted: true,
      });
      return {
        success: true,
        msg: "",
      };
    } catch (e: any) {
      console.error(e);
      return {
        success: false,
        msg: e.message,
      };
    }
  },
});

export const revokeSession = mutation({
  args: { session: v.string() },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("session")
      .withIndex("by_session", (q) => q.eq("sessionId", args.session))
      .unique();
    if (session) await ctx.db.delete(session._id);
  },
});

// Password hashes are only returned to the Next.js server after session verification.
export const getAccountCredentials = query({
  args: { session: v.string(), secret: v.string() },
  handler: async (ctx, args) => {
    await requireServerSecret(args.secret);
    const userId = await requireValidSession(ctx, args.session);
    const account = await ctx.db
      .query("login")
      .withIndex("userId", (q) => q.eq("userId", userId))
      .unique();
    if (!account || account.deleted) throw new Error("Account not found.");
    return { email: account.email, passwordHash: account.passwordHashed };
  },
});

export const getAccountProfile = query({
  args: { session: v.string() },
  handler: async (ctx, args) => {
    const userId = await requireValidSession(ctx, args.session);
    const account = await ctx.db
      .query("login")
      .withIndex("userId", (q) => q.eq("userId", userId))
      .unique();
    if (!account || account.deleted) throw new Error("Account not found.");
    return { email: account.email, fname: account.fname };
  },
});

export const updateAccountCredentials = mutation({
  args: {
    session: v.string(),
    secret: v.string(),
    expectedPasswordHash: v.string(),
    expectedEmail: v.string(),
    email: v.optional(v.string()),
    passwordHash: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireServerSecret(args.secret);
    const userId = await requireValidSession(ctx, args.session);
    const account = await ctx.db
      .query("login")
      .withIndex("userId", (q) => q.eq("userId", userId))
      .unique();
    if (
      !account ||
      account.deleted ||
      account.passwordHashed !== args.expectedPasswordHash ||
      account.email !== args.expectedEmail
    ) {
      return {
        success: false as const,
        message: "Account changed. Please verify your current password again.",
      };
    }
    if (!args.email && !args.passwordHash)
      throw new Error("No changes supplied.");
    if (args.email) {
      if (
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(args.email) ||
        args.email.length > 320
      )
        throw new Error("Invalid email.");
      const accounts = await ctx.db.query("login").collect();
      if (
        accounts.some(
          (other) =>
            other._id !== account._id &&
            other.email.toLowerCase() === args.email!.toLowerCase(),
        )
      ) {
        return {
          success: false as const,
          message: "This email is already linked to an account.",
        };
      }
    }
    await ctx.db.patch(account._id, {
      ...(args.email ? { email: args.email } : {}),
      ...(args.passwordHash ? { passwordHashed: args.passwordHash } : {}),
    });
    const sessions = await ctx.db
      .query("session")
      .withIndex("by_account", (q) => q.eq("userAccount", userId))
      .collect();
    for (const session of sessions) await ctx.db.delete(session._id);
    const session = uuidv4();
    const expiresAt = Date.now() + 24 * 60 * 60 * 1000;
    await ctx.db.insert("session", {
      userAccount: userId,
      sessionId: session,
      expires_at: expiresAt,
    });
    return { success: true as const, session, expiresAt };
  },
});
