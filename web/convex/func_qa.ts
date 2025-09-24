import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { v4 as uuidv4 } from "uuid";

export const qa = mutation({
  args: { toUser: v.string(), msg: v.string(), status: v.boolean() },
  handler: async (ctx, args) => {
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
  args: { user: v.string() },
  handler: async (ctx, args) => {
    return ctx.db
      .query("qas")
      .filter((q) => q.eq(q.field("toUser"), args.user))
      .collect();
  },
});

export const getViaId = query({
  args: { id: v.string() },
  handler: async (ctx, args) => {
    return ctx.db
      .query("qas")
      .filter((q) => q.eq(q.field("msgId"), args.id))
      .collect();
  },
});

export const saveQAFinalAnswer = mutation({
  args: {
    msgId: v.string(),
    teamId: v.string(),
    answer: v.string(),
    type: v.string(),
  },
  handler: async (ctx, args) => {
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
