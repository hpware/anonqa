import { beforeEach, describe, expect, test } from "bun:test";
import { convexTest } from "convex-test";
import schema from "../convex/schema";
import { api, internal } from "../convex/_generated/api";

const modules = {
  "../convex/_generated/server.js": () =>
    import("../convex/_generated/server.js"),
  "../convex/func_users.ts": () => import("../convex/func_users"),
  "../convex/func_feat_manage.ts": () => import("../convex/func_feat_manage"),
  "../convex/func_qa.ts": () => import("../convex/func_qa"),
};
let t;
beforeEach(async () => {
  t = convexTest(schema, modules);
  await t.run(async (ctx) => {
    await ctx.db.insert("session", {
      userAccount: "owner",
      sessionId: "valid",
      expires_at: Date.now() + 60000,
    });
    await ctx.db.insert("session", {
      userAccount: "outsider",
      sessionId: "outsider",
      expires_at: Date.now() + 60000,
    });
    await ctx.db.insert("session", {
      userAccount: "owner",
      sessionId: "expired",
      expires_at: Date.now() - 1,
    });
    await ctx.db.insert("users", {
      userId: "team",
      handle: "sample",
      displayName: "Sample",
      imageUrl: "/assets/default.png",
      controlableUsers: ["owner"],
      deleted: false,
      pageType: "1",
      defaultMessages: [],
      customShortUrlSlug: "",
    });
  });
});

describe("custom messages", () => {
  test("rejects missing, expired, and non-member sessions", async () => {
    for (const session of ["", "expired", "outsider"]) {
      await expect(
        t.mutation(api.func_feat_manage.addNewCustomRandomDiceMessage, {
          teamId: "team",
          msg: "Hello",
          session,
        }),
      ).rejects.toThrow("Unauthorized");
    }
  });
  test("creates, deduplicates, and deletes messages and updates dice availability", async () => {
    const args = { teamId: "team", msg: "Hello", session: "valid" };
    expect(
      (
        await t.mutation(
          api.func_feat_manage.addNewCustomRandomDiceMessage,
          args,
        )
      ).success,
    ).toBe(true);
    expect(
      (
        await t.mutation(
          api.func_feat_manage.addNewCustomRandomDiceMessage,
          args,
        )
      ).success,
    ).toBe(false);
    let [user] = await t.query(api.func_users.data, { slug: "sample" });
    expect(user.customRandomMessages).toEqual(["Hello"]);
    expect(user.setCustomRandomMessages).toBe(true);
    await t.mutation(api.func_feat_manage.deleteCustomRandomDiceMessage, args);
    [user] = await t.query(api.func_users.data, { slug: "sample" });
    expect(user.customRandomMessages).toEqual([]);
    expect(user.setCustomRandomMessages).toBe(false);
  });
});

test("saving settings persists custom messages and rejects duplicate handles", async () => {
  const args = {
    teamId: "team",
    session: "valid",
    new_displayName: "Sample",
    new_handle: "sample",
    new_imageUrl: "/assets/default.png",
    new_placeholder: ["Ask me"],
    customRandomMessages: ["How are you?"],
  };
  await t.mutation(api.func_users.saveNewUserSettings, args);
  expect(
    (await t.query(api.func_users.data, { slug: "sample" }))[0]
      .customRandomMessages,
  ).toEqual(["How are you?"]);
  await expect(
    t.mutation(api.func_feat_manage.createNewTeam, {
      team_handle: "sample",
      team_name: "Duplicate",
      user_id: "owner",
      session: "valid",
    }),
  ).rejects.toThrow("already in use");
  await t.mutation(api.func_feat_manage.createNewTeam, {
    team_handle: "other",
    team_name: "Other",
    user_id: "owner",
    session: "valid",
  });
  await expect(
    t.mutation(api.func_users.saveNewUserSettings, {
      ...args,
      new_handle: "other",
    }),
  ).rejects.toThrow("already in use");
});

test("missing profiles return safe defaults", async () => {
  expect(
    await t.query(api.func_users.getTeamSlugViaTeamId, { teamId: "missing" }),
  ).toBeNull();
  expect(
    await t.query(api.func_users.getDefaultPlaceholderAndDiceThingy, {
      slug: "missing",
    }),
  ).toEqual({ diceMode: false, dice: [], default: [], user: "" });
});

test("deleted teams reject access, hide their public page, and remove messages by team ID", async () => {
  await t.run(async (ctx) => {
    const team = await ctx.db.query("users").first();
    await ctx.db.patch(team._id, { deleted: true });
    await ctx.db.insert("qas", {
      toUser: "team",
      msgId: "msg",
      msg: "Hello",
      answered: false,
    });
  });
  expect(await t.query(api.func_users.data, { slug: "sample" })).toEqual([]);
  await expect(
    t.query(api.func_qa.getAllToUser, { teamId: "team", session: "valid" }),
  ).rejects.toThrow("Unauthorized");
  await t.mutation(internal.func_users.removedeleted, {});
  expect(await t.run((ctx) => ctx.db.query("qas").collect())).toEqual([]);
});

test("logout revokes a session immediately", async () => {
  await t.mutation(api.func_users.revokeSession, { session: "valid" });
  expect(
    await t.query(api.func_users.verifySession, { currentSession: "valid" }),
  ).toEqual({ linked: false, userid: null });
  await expect(
    t.query(api.func_qa.getAllToUser, { teamId: "team", session: "valid" }),
  ).rejects.toThrow("Unauthorized");
});

test("account deletion removes memberships and schedules empty teams for deletion", async () => {
  await t.run((ctx) =>
    ctx.db.insert("login", {
      email: "owner@example.com",
      userId: "owner",
      fname: "Owner",
      passwordHashed: "hash",
      deleted: false,
    }),
  );
  expect(
    (
      await t.mutation(api.func_users.deleteThisUser, {
        userId: "owner",
        session: "valid",
        areyousure: "YES I AM SURE I WANT TO DELETE MY ACCOUNT FOREVER",
      })
    ).success,
  ).toBe(true);
  const team = await t.run((ctx) => ctx.db.query("users").first());
  expect(team.controlableUsers).toEqual([]);
  expect(team.deleted).toBe(true);
  expect(
    (await t.query(api.func_users.verifySession, { currentSession: "valid" }))
      .linked,
  ).toBe(false);
});

test("concurrent team creation cannot reserve the same handle twice", async () => {
  const args = {
    team_handle: "unique",
    team_name: "Unique",
    user_id: "owner",
    session: "valid",
  };
  const results = await Promise.allSettled([
    t.mutation(api.func_feat_manage.createNewTeam, args),
    t.mutation(api.func_feat_manage.createNewTeam, args),
  ]);
  expect(
    results.filter((result) => result.status === "fulfilled"),
  ).toHaveLength(1);
});
