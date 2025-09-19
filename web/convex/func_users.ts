import { internalMutation, mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { v4 as uuidv4 } from "uuid";
import { filter } from "convex-helpers/server/filter";

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
      const deleteMessages = await ctx.db
        .query("qas")
        .filter((q) => q.eq(q.field("toUser"), user.handle))
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

// for the registering endpoint
export const addUser = internalMutation({
  args: { username: v.string() },
  handler: async (ctx, args) => {
    /**    const newUser = ctx.db
  .insert("users", {
    imageUrl: "",
    displayName: args.username,
    controlableUsers: [args.username],
    userId: uuidv4(),
    deleted: false,
    handle: args.username,
    setCustomRandomMessages: false,
    pageType: "basic",
  })
  .catch((err) => {
    console.error("Error inserting user:", err);
    throw new Error("Failed to create user");
  });
return newUser; */
    return [];
  },
});

export const getUserSocialLinkAccountStatus = query({
  args: { userid: v.string(), session: v.string() },
  handler: async (ctx, args) => {
    /**    const data = await ctx.db
      .query("linkAccountUsers")
      .filter((q) => q.eq(q.field("userid"), args.userid))
      .first();
    return data; */
    return [];
  },
});

export const data = query({
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
    /**    const result = await ctx.db
  .query("randomizer")
  .filter((q) => q.eq(q.field("userId"), args.slug))
  .collect();
return result; */
    return [];
  },
});

export const getTo = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    /**    const queryquery = await ctx.db
  .query("urls")
  .filter((q) => q.eq(q.field("toUser"), args.slug))
  .collect();
if (queryquery.length === 0) {
  return null;
}
return queryquery[0].toUser; */
    return [];
  },
});

export const getTeams = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const data = filter(ctx.db.query("users"), (doc) =>
      doc.controlableUsers.includes(args.userId),
    ).collect();
    return data;
  },
});

export const checkAccountAndReturnPassword = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
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

export const lookUpAccountsByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("login")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .unique();
  },
});

export const createLoginAccount = mutation({
  args: { email: v.string(), password: v.string(), fname: v.string() },
  handler: async (ctx, args) => {
    try {
      const generateUserID = uuidv4();
      await ctx.db.insert("login", {
        email: args.email,
        userId: generateUserID,
        fname: args.fname, // first name btw
        passwordHashed: args.password,
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

// todo
export const createTeamAccount = mutation({
  handler: async (ctx, args) => {},
});

export const createSession = mutation({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
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
