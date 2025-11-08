import { query } from "./_generated/server";
import { getCurrentUser } from "./users";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) return [];

    const results = await ctx.db
      .query("results")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    const resultsWithCourses = await Promise.all(
      results.map(async (result) => {
        const course = await ctx.db.get(result.courseId);
        return {
          ...result,
          course,
        };
      })
    );

    return resultsWithCourses;
  },
});
