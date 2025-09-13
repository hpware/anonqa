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

export const getUserSocialLinkAccountStatus = query({
  args: { userid: v.string(), session: v.string() },
  handler: async (ctx, args) => {
    const data = await ctx.db
      .query("linkAccountUsers")
      .filter((q) => q.eq(q.field("userid"), args.userid))
      .first();
    return data;
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
    const result = await ctx.db
      .query("randomizer")
      .filter((q) => q.eq(q.field("userId"), args.slug))
      .collect();
    return result;
  },
});
