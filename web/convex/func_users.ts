import { internalMutation, mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { v4 as uuidv4 } from "uuid";
import { filter } from "convex-helpers/server/filter";
import { CanvasText } from "@/app/manage/[team]/answer/[slug]/canvasText";

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
        customRandomMessages: result[0].customRandomMessages,
        userId: result[0].userId,
        defaultMessages: result[0].defaultMessages,
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

export const getFname = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
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
    if (!query) return null;
    return query[0].handle;
  },
});

export const getDefaultPlaceholderAndDiceThingy = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const query = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("handle"), args.slug))
      .collect();
    if (!query) return { diceMode: false, dice: [], default: [], user: "" };
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
    args: { joinCode: v.string(), userId: v.string() },
    handler: async (ctx, args) => {
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
      if (fetchCurrentTeamJoinedUsers.length === 0) {
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
      ctx.db.patch(fetchJoinCode[0]._id, {
        used: true,
      });
      const newControlableUsers = [
        ...fetchCurrentTeamJoinedUsers[0].controlableUsers,
        args.userId,
      ];
      ctx.db.patch(fetchCurrentTeamJoinedUsers[0]._id, {
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
  },
  handler: async (ctx, args) => {
    const query = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("userId"), args.teamId))
      .collect();
    ctx.db.patch(query[0]._id, {
      displayName:
        args.new_displayName === query[0].displayName
          ? query[0].displayName
          : args.new_displayName,
      handle:
        args.new_handle === query[0].handle ? query[0].handle : args.new_handle,
      imageUrl:
        args.new_imageUrl === query[0].imageUrl
          ? query[0].imageUrl
          : args.new_imageUrl,
      defaultMessages:
        args.new_placeholder === query[0].defaultMessages
          ? query[0].defaultMessages
          : args.new_placeholder,
    });
  },
});

export const kickPersonFromTeam = mutation({
  args: { teamId: v.string(), userToBeKicked: v.string() },
  handler: async (ctx, args) => {
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
    ctx.db.patch(query[0]._id, {
      controlableUsers: newUserList,
    });
  },
});
