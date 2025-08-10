import { internalMutation, mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { v4 as uuidv4 } from "uuid";

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

export const addUser = mutation({
  args: { username: v.string() },
  handler: async (ctx, args) => {
    const newUser = ctx.db
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
    return newUser;
  },
});
