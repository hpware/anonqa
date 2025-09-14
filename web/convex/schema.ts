import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    imageUrl: v.string(),
    displayName: v.string(),
    controlableUsers: v.array(v.string()),
    userId: v.string(),
    deleted: v.boolean(),
    handle: v.string(),
    setCustomRandomMessages: v.optional(v.boolean()),
    pageType: v.string(), // FOR ONLY 1. basic (as default) 2. Confess mode 3. idk
    threads_auth_token: v.string() || v.null(),
    threads:
      v.object({
        id: v.string(),
        name: v.string(),
        is_verified: v.boolean(),
        username: v.string(),
        threads_profile_picture_url: v.string(),
      }) || v.null(),
    defaultMessages: v.array(v.string()),
    customShortUrlSlug: v.string(),
  }).index("userId", ["userId", "handle"]),
  qas: defineTable({
    msgId: v.string(),
    toUser: v.string(), // userId
    msg: v.string(),
    answered: v.boolean(),
    linkedPosts: v.optional(v.number()),
  }).index("msgId", ["msgId"]),
  // legacy better auth stuff
  //loggedInUsers: defineTable({
  // Fields are optional
  //}),
  login: defineTable({
    email: v.string(),
    userId: v.string(),
    vuser: v.string(),
    passwordHashed: v.string(),
  }),
  featuresOn: defineTable({}),
});
