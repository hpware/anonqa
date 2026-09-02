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
