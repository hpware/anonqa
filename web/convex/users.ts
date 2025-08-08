import { internalMutation, query } from "./_generated/server";
import { v } from "convex/values";

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
