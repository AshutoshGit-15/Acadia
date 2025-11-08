import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// Check for class schedule changes every 5 minutes
crons.interval(
  "check class updates",
  { minutes: 5 },
  internal.notifications.generateClassNotifications,
  {}
);

// Check for upcoming deadlines every 30 minutes
crons.interval(
  "check deadlines",
  { minutes: 30 },
  internal.notifications.generateDeadlineNotifications,
  {}
);

export default crons;
