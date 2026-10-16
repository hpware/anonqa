import { afterAll, beforeEach, expect, mock, spyOn, test } from "bun:test";

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
