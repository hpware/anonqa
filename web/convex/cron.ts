import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

crons.daily(
  "Remove deleted users",
  { hourUTC: 16, minuteUTC: 0 },
  internal.func_users.removedeleted,
);

export default crons;
