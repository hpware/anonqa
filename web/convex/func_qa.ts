import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { v4 as uuidv4 } from "uuid";
import { requireServerSecret, requireTeamAccess } from "./auth";

// server-to-server only (called after captcha + AI moderation), see convex/auth.ts
export const qa = mutation({
  args: {
    toUser: v.string(),
    msg: v.string(),
    status: v.boolean(),
    secret: v.string(),
  },
  handler: async (ctx, args) => {
    await requireServerSecret(args.secret);
    const team = await ctx.db
      .query("users")
      .withIndex("by_userId", (q) => q.eq("userId", args.toUser))
      .unique();
    if (!team || team.deleted) throw new Error("Team not found.");
    if (!args.msg.trim() || args.msg.length > 2000)
      throw new Error("Invalid message.");
    await ctx.db.insert("qas", {
      answered: false,
      msg: args.msg,
      msgId: uuidv4(),
      toUser: args.toUser,
      moderation: args.status,
    });
  },
});

export const getAllToUser = query({
  args: { teamId: v.string(), session: v.string() },
  handler: async (ctx, args) => {
    // anonymous messages may only be read by members of the receiving team
    await requireTeamAccess(ctx, args.session, args.teamId);
    return ctx.db
      .query("qas")
      .filter((q) => q.eq(q.field("toUser"), args.teamId))
      .collect();
  },
});

export const getViaId = query({
  args: { id: v.string(), session: v.string() },
  handler: async (ctx, args) => {
    const data = await ctx.db
      .query("qas")
      .filter((q) => q.eq(q.field("msgId"), args.id))
      .collect();
    if (data.length === 0) {
      return [];
    }
    // only members of the team that received this message may read it
    await requireTeamAccess(ctx, args.session, data[0].toUser);
    return data;
  },
});

export const saveQAFinalAnswer = mutation({
  args: {
    msgId: v.string(),
    teamId: v.string(),
    answer: v.string(),
    type: v.string(),
    session: v.string(),
  },
  handler: async (ctx, args) => {
    await requireTeamAccess(ctx, args.session, args.teamId);
    const query = await ctx.db
      .query("qas")
      .filter((q) => q.eq(q.field("msgId"), args.msgId))
      .collect();
    if (query.length === 0) {
      return {
        success: false,
        msg: "MSGID does not exist",
      };
    }
    if (query[0].toUser !== args.teamId) {
      return {
        success: false,
        msg: "MSG does not match to this TEAMID",
      };
    }
    await ctx.db.patch(query[0]._id, {
      answered: true,
      answer: args.answer,
      type: args.type,
    });
    return {
      success: true,
      msg: "",
    };
  },
});

// Reserve a publication before calling Meta so concurrent clicks cannot post twice.
export const prepareThreadsPublication = mutation({
  args: {
    teamId: v.string(),
    msgId: v.string(),
    answer: v.string(),
    session: v.string(),
    secret: v.string(),
  },
  handler: async (ctx, args) => {
    await requireServerSecret(args.secret);
    await requireTeamAccess(ctx, args.session, args.teamId);
    const message = await ctx.db
      .query("qas")
      .withIndex("msgId", (q) => q.eq("msgId", args.msgId))
      .unique();
    if (!message || message.toUser !== args.teamId)
      throw new Error("Message not found in this team.");
    if (message.threadsPublication?.phase === "published")
      return {
        success: true as const,
        completed: true as const,
        url: message.linkedPosts?.url,
        postId: message.threadsPublication.postId!,
      };
    if (
      message.threadsPublication &&
      !(
        message.threadsPublication.phase === "preparing" &&
        (message.threadsPublication.startedAt ?? 0) < Date.now() - 120000
      )
    )
      return {
        success: false as const,
        message:
          "This question has a pending publication. Check Threads before retrying to avoid duplicate posts.",
      };
    const text = `Q: ${message.msg}\n\nA: ${args.answer}`;
    if (!args.answer.trim() || new TextEncoder().encode(text).length > 500)
      return {
        success: false as const,
        message:
          "The question and answer together must fit within 500 UTF-8 bytes for Threads.",
      };
    const attemptId = uuidv4();
    await ctx.db.patch(message._id, {
      threadsPublication: {
        attemptId,
        startedAt: Date.now(),
        answer: args.answer,
        phase: "preparing",
      },
    });
    return {
      success: true as const,
      completed: false as const,
      attemptId,
      text,
    };
  },
});

// Finish an authorized operation even if the session expires while Meta responds.
export const updateThreadsPublication = mutation({
  args: {
    msgId: v.string(),
    attemptId: v.string(),
    secret: v.string(),
    phase: v.union(
      v.literal("cancel"),
      v.literal("rejected"),
      v.literal("publishing"),
      v.literal("published"),
    ),
    postId: v.optional(v.string()),
    url: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireServerSecret(args.secret);
    const message = await ctx.db
      .query("qas")
      .withIndex("msgId", (q) => q.eq("msgId", args.msgId))
      .unique();
    const publication = message?.threadsPublication;
    if (!message || !publication || publication.attemptId !== args.attemptId)
      throw new Error("Publication no longer matches.");
    if (args.phase === "cancel" || args.phase === "rejected") {
      if (args.phase === "rejected" && publication.phase !== "publishing")
        throw new Error("Only a rejected publishing attempt can be cleared.");
      if (args.phase === "cancel" && publication.phase !== "preparing")
        throw new Error("Cannot cancel a post that may have been published.");
      await ctx.db.patch(message._id, { threadsPublication: undefined });
    } else if (args.phase === "publishing") {
      if (publication.phase !== "preparing")
        throw new Error("Publication already started.");
      await ctx.db.patch(message._id, {
        threadsPublication: { ...publication, phase: "publishing" },
      });
    } else {
      if (!args.postId || !args.url)
        throw new Error("Published post details are required.");
      if (
        publication.phase !== "publishing" &&
        !(
          publication.phase === "published" &&
          publication.postId === args.postId
        )
      )
        throw new Error("Publication was not started or already completed.");
      await ctx.db.patch(message._id, {
        answered: true,
        answer: publication.answer,
        type: "threads",
        linkedPosts: { platform: "threads", url: args.url },
        threadsPublication: {
          ...publication,
          phase: "published",
          postId: args.postId,
        },
      });
    }
  },
});
