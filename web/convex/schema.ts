import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    user: v.string(),
    displayName: v.string(),
    controledUsers: v.array(v.string()),
    userId: v.string(),
    deleted: v.boolean(),
    handle: v.string(),
    pageType: v.string(), // FOR ONLY 1. basic (as default) 2. Confess mode 3. idk
  }).index("userId", ["userId", "user", "handle"]),
  qas: defineTable({
    msgId: v.string(),
    toUser: v.string(), // userId
    msg: v.string(),
    answered: v.boolean(),
  }).index("msgId", ["msgId"]),
});
