import { afterAll, beforeEach, describe, expect, test } from "bun:test";
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
const originalSecret = process.env.CONVEX_SERVER_SECRET;
const secret = "test-server-secret";
afterAll(() => {
  if (originalSecret === undefined) delete process.env.CONVEX_SERVER_SECRET;
  else process.env.CONVEX_SERVER_SECRET = originalSecret;
});
beforeEach(async () => {
  process.env.CONVEX_SERVER_SECRET = secret;
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

describe("account credentials", () => {
  beforeEach(async () => {
    await t.run(async (ctx) => {
      await ctx.db.insert("login", {
        email: "owner@example.com",
        userId: "owner",
        fname: "Owner",
        passwordHashed: "old-hash",
      });
      await ctx.db.insert("login", {
        email: "other@example.com",
        userId: "other",
        fname: "Other",
        passwordHashed: "other-hash",
      });
      await ctx.db.insert("session", {
        sessionId: "other-device",
        userAccount: "owner",
        expires_at: Date.now() + 60000,
      });
    });
  });
  test("keeps hashes server-only and returns a safe account profile", async () => {
    await expect(
      t.query(api.func_users.getAccountCredentials, {
        session: "valid",
        secret: "wrong",
      }),
    ).rejects.toThrow("Unauthorized");
    expect(
      await t.query(api.func_users.getAccountProfile, { session: "valid" }),
    ).toEqual({ email: "owner@example.com", fname: "Owner" });
  });
  test("rejects duplicate emails and stale password verification", async () => {
    const args = {
      session: "valid",
      secret,
      expectedPasswordHash: "old-hash",
      expectedEmail: "owner@example.com",
      email: "OTHER@example.com",
    };
    expect(
      (await t.mutation(api.func_users.updateAccountCredentials, args)).success,
    ).toBe(false);
    expect(
      (
        await t.mutation(api.func_users.updateAccountCredentials, {
          ...args,
          email: "new@example.com",
          expectedPasswordHash: "stale",
        })
      ).success,
    ).toBe(false);
    expect(
      (await t.query(api.func_users.verifySession, { currentSession: "valid" }))
        .linked,
    ).toBe(true);
  });
  test("updates credentials atomically, rotates the current session, and revokes other devices", async () => {
    const result = await t.mutation(api.func_users.updateAccountCredentials, {
      session: "valid",
      secret,
      expectedPasswordHash: "old-hash",
      expectedEmail: "owner@example.com",
      email: "new@example.com",
      passwordHash: "new-hash",
    });
    expect(result.success).toBe(true);
    for (const session of ["valid", "other-device"])
      expect(
        (
          await t.query(api.func_users.verifySession, {
            currentSession: session,
          })
        ).linked,
      ).toBe(false);
    expect(
      await t.query(api.func_users.getAccountCredentials, {
        session: result.session,
        secret,
      }),
    ).toEqual({ email: "new@example.com", passwordHash: "new-hash" });
  });
});

describe("Threads", () => {
  const profile = {
    id: "123",
    name: "Owner",
    username: "owner",
    is_verified: false,
    threads_profile_picture_url: "https://example.com/avatar.png",
  };
  beforeEach(async () => {
    await t.mutation(api.func_feat_manage.saveThreadsConnection, {
      teamId: "team",
      session: "valid",
      secret,
      token: "private-token",
      expiresAt: Date.now() + 60000,
      profile,
    });
    await t.run((ctx) =>
      ctx.db.insert("qas", {
        toUser: "team",
        msgId: "question",
        msg: "How are you?",
        answered: false,
      }),
    );
  });
  test("never exposes tokens through browser queries and checks team access", async () => {
    for (const reference of [
      api.func_users.getTeams,
      api.func_feat_manage.getTeams,
    ]) {
      const teams = await t.query(reference, {
        userId: "owner",
        session: "valid",
      });
      expect(JSON.stringify(teams)).not.toContain("private-token");
    }
    const status = await t.query(api.func_feat_manage.threadsStatus, {
      teamId: "team",
      session: "valid",
    });
    expect(status.profile).toEqual(profile);
    expect(JSON.stringify(status)).not.toContain("private-token");
    await expect(
      t.query(api.func_feat_manage.getThreadsConnection, {
        teamId: "team",
        session: "valid",
        secret: "wrong",
      }),
    ).rejects.toThrow("Unauthorized");
    await expect(
      t.query(api.func_feat_manage.getThreadsConnection, {
        teamId: "team",
        session: "outsider",
        secret,
      }),
    ).rejects.toThrow("Unauthorized");
  });
  test("disconnect removes the saved token and profile", async () => {
    await t.mutation(api.func_feat_manage.disconnectThreads, {
      teamId: "team",
      session: "valid",
    });
    expect(
      await t.query(api.func_feat_manage.getThreadsConnection, {
        teamId: "team",
        session: "valid",
        secret,
      }),
    ).toBeNull();
    expect(
      (
        await t.query(api.func_feat_manage.threadsStatus, {
          teamId: "team",
          session: "valid",
        })
      ).connected,
    ).toBe(false);
  });
  test("concurrent publications reserve one post and repeated requests return the saved result", async () => {
    const args = {
      teamId: "team",
      msgId: "question",
      answer: "Great!",
      session: "valid",
      secret,
    };
    const reservations = await Promise.all([
      t.mutation(api.func_qa.prepareThreadsPublication, args),
      t.mutation(api.func_qa.prepareThreadsPublication, args),
    ]);
    expect(reservations.filter((result) => result.success)).toHaveLength(1);
    const reservation = reservations.find((result) => result.success);
    const attempt = {
      msgId: "question",
      attemptId: reservation.attemptId,
      secret,
    };
    await t.mutation(api.func_qa.updateThreadsPublication, {
      ...attempt,
      phase: "publishing",
    });
    await expect(
      t.mutation(api.func_qa.updateThreadsPublication, {
        ...attempt,
        phase: "cancel",
      }),
    ).rejects.toThrow("Cannot cancel");
    await t.mutation(api.func_qa.updateThreadsPublication, {
      ...attempt,
      phase: "published",
      postId: "456",
      url: "https://www.threads.com/@owner/post/example",
    });
    const [message] = await t.query(api.func_qa.getViaId, {
      id: "question",
      session: "valid",
    });
    expect(message.answer).toBe("Great!");
    expect(message.type).toBe("threads");
    expect(message.linkedPosts.url).toContain("/post/example");
    expect(
      await t.mutation(api.func_qa.prepareThreadsPublication, args),
    ).toEqual({
      success: true,
      completed: true,
      postId: "456",
      url: "https://www.threads.com/@owner/post/example",
    });
  });
  test("rejects oversize posts and unauthorized publications", async () => {
    const args = {
      teamId: "team",
      msgId: "question",
      answer: "😀".repeat(125),
      session: "valid",
      secret,
    };
    expect(
      (await t.mutation(api.func_qa.prepareThreadsPublication, args)).success,
    ).toBe(false);
    await expect(
      t.mutation(api.func_qa.prepareThreadsPublication, {
        ...args,
        session: "outsider",
      }),
    ).rejects.toThrow("Unauthorized");
  });
});

test("an abandoned preparation can be retried without letting the old request publish", async () => {
  await t.run((ctx) =>
    ctx.db.insert("qas", {
      toUser: "team",
      msgId: "abandoned",
      msg: "Question",
      answered: false,
      threadsPublication: {
        attemptId: "old-attempt",
        startedAt: Date.now() - 180000,
        answer: "Old",
        phase: "preparing",
      },
    }),
  );
  const result = await t.mutation(api.func_qa.prepareThreadsPublication, {
    teamId: "team",
    msgId: "abandoned",
    answer: "New",
    session: "valid",
    secret,
  });
  expect(result.success).toBe(true);
  await expect(
    t.mutation(api.func_qa.updateThreadsPublication, {
      msgId: "abandoned",
      attemptId: "old-attempt",
      phase: "publishing",
      secret,
    }),
  ).rejects.toThrow("no longer matches");
});
