import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  mock,
  spyOn,
  test,
} from "bun:test";

const query = mock(async () => [{ userId: "team", deleted: false }]);
const mutation = mock(async () => undefined);
const completion = mock(async () => ({
  choices: [{ message: { content: "ALLOW" } }],
}));
mock.module("convex/nextjs", () => ({
  fetchQuery: query,
  fetchMutation: mutation,
}));
mock.module("../lib/openai", () => ({
  default: { chat: { completions: { create: completion } } },
}));
let cookieSession = "valid";
let cookieOAuth = "";
const cookieSet = mock((name, value) => {
  if (name === "threads_oauth") cookieOAuth = value;
});
mock.module("next/headers", () => ({
  cookies: async () => ({
    get: (name) =>
      name === "session" && cookieSession
        ? { value: cookieSession }
        : name === "threads_oauth" && cookieOAuth
          ? { value: cookieOAuth }
          : undefined,
    set: cookieSet,
  }),
}));
const { POST } = await import("../app/api/send_qa/route");
const originalCaptcha = process.env.NEXT_PUBLIC_CAPTCHA_FEAT;
beforeEach(() => {
  query.mockReset().mockResolvedValue([{ userId: "team", deleted: false }]);
  mutation.mockReset().mockResolvedValue(undefined);
  completion.mockClear();
  process.env.NEXT_PUBLIC_CAPTCHA_FEAT = "false";
});
afterAll(() => {
  if (originalCaptcha === undefined)
    delete process.env.NEXT_PUBLIC_CAPTCHA_FEAT;
  else process.env.NEXT_PUBLIC_CAPTCHA_FEAT = originalCaptcha;
  mock.restore();
});
const request = (body) =>
  new Request("http://localhost/api/send_qa", {
    method: "POST",
    body: JSON.stringify(body),
  });

test("CAPTCHA=false accepts messages without a token and saves before returning success", async () => {
  const response = await POST(request({ user: "sample", message: "Hello" }));
  expect(response.status).toBe(200);
  expect((await response.json()).success).toBe(true);
  expect(mutation).toHaveBeenCalledTimes(1);
});
test("CAPTCHA=true requires a token", async () => {
  process.env.NEXT_PUBLIC_CAPTCHA_FEAT = "true";
  const response = await POST(request({ user: "sample", message: "Hello" }));
  expect(response.status).toBe(400);
  expect(mutation).not.toHaveBeenCalled();
});
test("malformed JSON and invalid messages receive 400", async () => {
  const invalid = new Request("http://localhost/api/send_qa", {
    method: "POST",
    body: "{",
  });
  expect((await POST(invalid)).status).toBe(400);
  for (const body of [
    { user: "sample", message: " " },
    { message: "Hello" },
    { user: "sample", message: "x".repeat(2001) },
  ]) {
    expect((await POST(request(body))).status).toBe(400);
  }
  expect(completion).not.toHaveBeenCalled();
});
test("missing recipients are rejected before moderation", async () => {
  query.mockResolvedValue([]);
  expect(
    (await POST(request({ user: "missing", message: "Hello" }))).status,
  ).toBe(404);
  expect(completion).not.toHaveBeenCalled();
});
test("failed persistence never reports success", async () => {
  mutation.mockRejectedValue(new Error("Database unavailable"));
  const errorLog = spyOn(console, "error").mockImplementation(() => {});
  const response = await POST(request({ user: "sample", message: "Hello" }));
  errorLog.mockRestore();
  expect(response.status).toBe(503);
  expect((await response.json()).success).toBe(false);
});

const { getFunctionName } = await import("convex/server");
const argon2 = (await import("argon2")).default;
const { loginPassword } = await import("../lib/account");
const accountRoute = await import("../app/api/users/account/route");
const authorizeRoute =
  await import("../app/api/social/threads/authorize/route");
const callbackRoute =
  await import("../app/api/social/threads/authorize/callback/route");
const publishRoute = await import("../app/api/social/threads/publish/route");
const { createOAuthState, verifyOAuthState } = await import("../lib/threads");
const teamId = "00000000-0000-4000-8000-000000000001";
const msgId = "00000000-0000-4000-8000-000000000002";
const originalSecret = process.env.CONVEX_SERVER_SECRET;
const originalThreadsEnv = Object.fromEntries(
  ["THREADS_APP_ID", "THREADS_APP_SECRET", "THREADS_REDIRECT_URI"].map(
    (key) => [key, process.env[key]],
  ),
);
let passwordHash;
let fetchSpy;
let fetchDescriptor;
function mockFetch() {
  fetchDescriptor = Object.getOwnPropertyDescriptor(globalThis, "fetch");
  const replacement = mock();
  Object.defineProperty(globalThis, "fetch", {
    value: replacement,
    writable: true,
    configurable: true,
    enumerable: true,
  });
  return replacement;
}

describe("account and Threads routes", () => {
  beforeAll(async () => {
    passwordHash = await argon2.hash(loginPassword("existing password"));
  });
  beforeEach(() => {
    process.env.CONVEX_SERVER_SECRET = "test-server-secret";
    cookieSession = "valid";
    cookieOAuth = "";
    process.env.THREADS_APP_ID = "test-app-id";
    process.env.THREADS_APP_SECRET = "test-app-secret";
    process.env.THREADS_REDIRECT_URI =
      "https://anonqa.example/api/social/threads/authorize/callback";
    cookieSet.mockClear();
    query.mockImplementation(async (reference) => {
      switch (getFunctionName(reference)) {
        case "func_users:verifySession":
          return { linked: true, userid: "owner" };
        case "func_users:getAccountCredentials":
          return { email: "owner@example.com", passwordHash };
        case "func_feat_manage:checkAbleToBeAccessed":
          return true;
        case "func_feat_manage:getThreadsConnection":
          return {
            token: "private-token",
            expiresAt: Date.now() + 60000,
            profile: { id: "123", username: "owner" },
          };
        default:
          throw new Error("Unexpected query");
      }
    });
    mutation.mockImplementation(async (reference) => {
      switch (getFunctionName(reference)) {
        case "func_users:updateAccountCredentials":
          return {
            success: true,
            session: "rotated",
            expiresAt: Date.now() + 60000,
          };
        case "func_qa:prepareThreadsPublication":
          return {
            success: true,
            completed: false,
            attemptId: "attempt",
            text: "Q: Question\n\nA: Answer",
          };
        case "func_qa:updateThreadsPublication":
          return null;
        case "func_feat_manage:saveThreadsConnection":
          return null;
        default:
          throw new Error("Unexpected mutation");
      }
    });
  });
  afterEach(() => {
    if (fetchDescriptor)
      Object.defineProperty(globalThis, "fetch", fetchDescriptor);
    fetchDescriptor = undefined;
    fetchSpy = undefined;
    for (const [key, value] of Object.entries(originalThreadsEnv)) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
    if (originalSecret === undefined) delete process.env.CONVEX_SERVER_SECRET;
    else process.env.CONVEX_SERVER_SECRET = originalSecret;
  });
  const accountRequest = (body) =>
    new Request("http://localhost/api/users/account", {
      method: "POST",
      body: JSON.stringify(body),
    });
  const publishRequest = () =>
    new Request("http://localhost/api/social/threads/publish", {
      method: "POST",
      body: JSON.stringify({ teamId, msgId, answer: "Answer" }),
    });

  test("account changes require a session and the actual current password", async () => {
    cookieSession = "";
    expect(
      (
        await accountRoute.POST(
          accountRequest({
            currentPassword: "existing password",
            email: "new@example.com",
          }),
        )
      ).status,
    ).toBe(401);
    cookieSession = "valid";
    expect(
      (
        await accountRoute.POST(
          accountRequest({
            currentPassword: "wrong",
            email: "new@example.com",
          }),
        )
      ).status,
    ).toBe(403);
    expect(mutation).not.toHaveBeenCalled();
  });
  test("new passwords are stored in the existing login format and the cookie is rotated", async () => {
    const response = await accountRoute.POST(
      accountRequest({
        currentPassword: "existing password",
        newPassword: "a stronger password",
      }),
    );
    expect(response.status).toBe(200);
    const [, args] = mutation.mock.calls[0];
    expect(
      await argon2.verify(
        args.passwordHash,
        loginPassword("a stronger password"),
      ),
    ).toBe(true);
    expect(args.expectedPasswordHash).toBe(passwordHash);
    expect(cookieSet.mock.calls[0][0]).toBe("session");
    expect(cookieSet.mock.calls[0][1]).toBe("rotated");
    expect(cookieSet.mock.calls[0][2].httpOnly).toBe(true);
  });
  test("weak passwords and invalid emails fail before hashing or persistence", async () => {
    for (const body of [
      { newPassword: "short" },
      { newPassword: "            " },
      { email: "not-an-email" },
    ]) {
      expect(
        (
          await accountRoute.POST(
            accountRequest({ ...body, currentPassword: "existing password" }),
          )
        ).status,
      ).toBe(400);
    }
    expect(mutation).not.toHaveBeenCalled();
  });
  test("OAuth state rejects tampering, other sessions, mismatched state and expired requests", () => {
    const state = createOAuthState(teamId, "valid");
    expect(verifyOAuthState(state.cookie, state.nonce, "valid")).toEqual({
      teamId,
    });
    expect(() =>
      verifyOAuthState(state.cookie, state.nonce, "other-session"),
    ).toThrow("invalid");
    expect(() =>
      verifyOAuthState(state.cookie, "other-nonce", "valid"),
    ).toThrow("invalid");
    expect(() =>
      verifyOAuthState(state.cookie + "x", state.nonce, "valid"),
    ).toThrow("invalid");
    const time = spyOn(Date, "now").mockReturnValue(Date.now() + 601000);
    try {
      expect(() =>
        verifyOAuthState(state.cookie, state.nonce, "valid"),
      ).toThrow("expired");
    } finally {
      time.mockRestore();
    }
  });
  test("Threads publishes the server-rendered question and answer and saves the permalink", async () => {
    fetchSpy = mockFetch()
      .mockResolvedValueOnce(Response.json({ id: "456" }))
      .mockResolvedValueOnce(
        Response.json({
          permalink: "https://www.threads.com/@owner/post/example",
        }),
      );
    const response = await publishRoute.POST(publishRequest());
    expect(response.status).toBe(200);
    expect((await response.json()).url).toContain("/post/example");
    const [url, options] = fetchSpy.mock.calls[0];
    expect(url).toBe("https://graph.threads.net/v1.0/123/threads");
    expect(options.body.get("auto_publish_text")).toBe("true");
    expect(options.body.get("text")).toBe("Q: Question\n\nA: Answer");
    expect(options.headers.Authorization).toBe("Bearer private-token");
    expect(mutation.mock.calls.at(-1)[1].phase).toBe("published");
    expect(mutation.mock.calls.at(-1)[1].postId).toBe("456");
  });
  test("expired connections and missing team access cannot publish", async () => {
    query.mockImplementation(async (reference) => {
      switch (getFunctionName(reference)) {
        case "func_users:verifySession":
          return { linked: true, userid: "owner" };
        case "func_feat_manage:checkAbleToBeAccessed":
          return true;
        case "func_feat_manage:getThreadsConnection":
          return { token: "expired", expiresAt: 0 };
      }
    });
    expect((await publishRoute.POST(publishRequest())).status).toBe(409);
    expect(mutation).not.toHaveBeenCalled();
    query.mockImplementation(async (reference) =>
      getFunctionName(reference) === "func_users:verifySession"
        ? { linked: true, userid: "owner" }
        : false,
    );
    expect((await publishRoute.POST(publishRequest())).status).toBe(403);
    expect(mutation).not.toHaveBeenCalled();
  });
  test("an ambiguous publication failure stays locked instead of allowing duplicate retries", async () => {
    fetchSpy = mockFetch().mockRejectedValue(new Error("Connection lost"));
    const response = await publishRoute.POST(publishRequest());
    expect(response.status).toBe(502);
    expect((await response.json()).message).toContain("locked");
    expect(
      mutation.mock.calls.some(([, args]) =>
        ["cancel", "rejected"].includes(args.phase),
      ),
    ).toBe(false);
  });
  test("a definite Meta rejection releases the reservation for a corrected retry", async () => {
    fetchSpy = mockFetch().mockResolvedValue(
      Response.json(
        { error: { message: "Permission denied" } },
        { status: 400 },
      ),
    );
    expect((await publishRoute.POST(publishRequest())).status).toBe(502);
    expect(mutation.mock.calls.at(-1)[1].phase).toBe("rejected");
  });
  test("OAuth links a team using server-side token exchange and consumes the callback state", async () => {
    const start = await authorizeRoute.GET(
      new Request(
        `https://anonqa.example/api/social/threads/authorize?teamId=${teamId}`,
      ),
    );
    expect(start.status).toBe(303);
    const authorization = new URL(start.headers.get("location"));
    expect(authorization.origin).toBe("https://threads.com");
    expect(authorization.searchParams.get("scope")).toContain(
      "threads_content_publish",
    );
    const nonce = authorization.searchParams.get("state");
    fetchSpy = mockFetch()
      .mockResolvedValueOnce(Response.json({ access_token: "short-token" }))
      .mockResolvedValueOnce(
        Response.json({ access_token: "long-token", expires_in: 5184000 }),
      )
      .mockResolvedValueOnce(
        Response.json({ id: "123", username: "owner", name: "Owner" }),
      );
    const callback = new Request(
      `https://anonqa.example/api/social/threads/authorize/callback?state=${nonce}&code=authorization-code`,
    );
    const response = await callbackRoute.GET(callback);
    expect(response.status).toBe(303);
    expect(response.headers.get("location")).toBe(
      `https://anonqa.example/manage/${teamId}/settings?threads=connected`,
    );
    const [, saved] = mutation.mock.calls[0];
    expect(saved.token).toBe("long-token");
    expect(saved.teamId).toBe(teamId);
    expect(fetchSpy.mock.calls[0][1].body.get("code")).toBe(
      "authorization-code",
    );
    expect((await callbackRoute.GET(callback)).status).toBe(400);
    expect(fetchSpy).toHaveBeenCalledTimes(3);
  });
  test("cross-origin requests cannot change credentials or publish with a session cookie", async () => {
    const account = new Request("http://localhost/api/users/account", {
      method: "POST",
      headers: { Origin: "https://other.example" },
      body: JSON.stringify({
        currentPassword: "existing password",
        email: "new@example.com",
      }),
    });
    expect((await accountRoute.POST(account)).status).toBe(403);
    const publish = new Request("http://localhost/api/social/threads/publish", {
      method: "POST",
      headers: { Origin: "https://other.example" },
      body: JSON.stringify({ teamId, msgId, answer: "Answer" }),
    });
    expect((await publishRoute.POST(publish)).status).toBe(403);
    expect(mutation).not.toHaveBeenCalled();
  });
});
