import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser } from "./users";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) return [];

    return await ctx.db
      .query("courses")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    code: v.string(),
    instructor: v.optional(v.string()),
    color: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");

    return await ctx.db.insert("courses", {
      userId: user._id,
      name: args.name,
      code: args.code,
      instructor: args.instructor,
      color: args.color,
    });
  },
});
