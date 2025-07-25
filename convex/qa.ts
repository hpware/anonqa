import { mutation } from "./_generated/server";
import { v } from "convex/values";
import { v4 as uuidv4 } from "uuid";

export const qa = mutation({
  args: { toUser: v.string(), msg: v.string() },
  handler: async (ctx, args) => {
    await ctx.db.insert("qas", {
      answered: false,
      msg: args.msg,
      msgId: uuidv4(),
      toUser: args.toUser,
    });
  },
});

/**
 * [
  {
    answered: false,
    msg: "",
    msgId: "",
    toUser: "",
  },
]
 */
