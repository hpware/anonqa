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
    threads_auth_token: v.optional(v.string()),
    threads: v.optional(
      v.object({
        id: v.string(),
        name: v.string(),
        is_verified: v.boolean(),
        username: v.string(),
        threads_profile_picture_url: v.string(),
      }),
    ),
    defaultMessages: v.array(v.string()),
    customShortUrlSlug: v.string(),
    onBoarded: v.optional(v.boolean()), // roll out to users.
  })
    .index("userId", ["userId", "handle"])
    .index("by_userId", ["userId"]),
  qas: defineTable({
    msgId: v.string(),
    toUser: v.string(), // teamId
    msg: v.string(),
    answered: v.boolean(),
    answer: v.optional(v.string()),
    linkedPosts: v.optional(
      v.object({
        platform: v.string(),
        url: v.optional(v.string()),
      }),
    ),
    moderation: v.optional(v.boolean()),
  }).index("msgId", ["msgId"]),
  login: defineTable({
    email: v.string(), // email
    userId: v.string(), // uuid
    fname: v.string(), // first name
    passwordHashed: v.string(), // argon2 + sha512'd password
    deleted: v.optional(v.boolean()),
  })
    .index("userId", ["userId"])
    .index("by_email", ["email"]),
  session: defineTable({
    userAccount: v.string(),
    sessionId: v.string(),
    expires_at: v.number(),
  })
    .index("by_session", ["sessionId"])
    .index("by_account", ["userAccount"]),
  //featuresOn: defineTable({}), // beta?
  joinCodes: defineTable({
    code: v.string(),
    teamId: v.string(),
    used: v.boolean(),
  })
    .index("code", ["code"])
    .index("teamId", ["teamId"]),
});
