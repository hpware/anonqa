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
    setCustomRandomMessages: v.boolean(),
    pageType: v.string(), // FOR ONLY 1. basic (as default) 2. Confess mode 3. idk
  }).index("userId", ["userId", "handle"]),
  qas: defineTable({
    msgId: v.string(),
    toUser: v.string(), // userId
    msg: v.string(),
    answered: v.boolean(),
  }).index("msgId", ["msgId"]),
  randomizer: defineTable({
    userId: v.string(),
    messages: v.array(v.string()),
  }),
  loggedInUsers: defineTable({
    // Fields are optional
  }),
});
