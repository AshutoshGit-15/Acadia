import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser } from "./users";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) return [];

    const docs = await ctx.db
      .query("documents")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    // Group by course
    const grouped: Record<string, any[]> = {};
    for (const doc of docs) {
      if (!grouped[doc.courseCode]) {
        grouped[doc.courseCode] = [];
      }
      grouped[doc.courseCode].push(doc);
    }

    return Object.entries(grouped).map(([courseCode, items]) => ({
      course: items[0].courseName,
      course_code: courseCode,
      items: items,
    }));
  },
});
