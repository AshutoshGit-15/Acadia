import { v } from "convex/values";
import { mutation, query, internalQuery } from "./_generated/server";
import { getCurrentUser } from "./users";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) return [];

    return await ctx.db
      .query("alerts")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();
  },
});

export const listInternal = internalQuery({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("alerts").collect();
  },
});

export const markAsRead = mutation({
  args: {
    id: v.id("alerts"),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");

    const alert = await ctx.db.get(args.id);
    if (!alert || alert.userId !== user._id) {
      throw new Error("Alert not found");
    }

    await ctx.db.patch(args.id, {
      isRead: !alert.isRead,
    });
  },
});