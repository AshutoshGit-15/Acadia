import { query } from "./_generated/server";
import { getCurrentUser } from "./users";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) return [];

    const exams = await ctx.db
      .query("examSchedule")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    const examsWithCourses = await Promise.all(
      exams.map(async (exam) => {
        const course = await ctx.db.get(exam.courseId);
        return {
          ...exam,
          course: course,
        };
      })
    );

    return examsWithCourses.sort((a, b) => a.examDate - b.examDate);
  },
});