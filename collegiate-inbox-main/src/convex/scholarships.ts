import { query } from "./_generated/server";
import { getCurrentUser } from "./users";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) return [];

    return await ctx.db
      .query("scholarships")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();
  },
});