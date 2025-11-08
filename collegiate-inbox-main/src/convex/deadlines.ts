import { v } from "convex/values";
import { mutation, query, internalQuery } from "./_generated/server";
import { getCurrentUser } from "./users";

export const list = query({
  args: {
    filter: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) return [];

    let deadlines = await ctx.db
      .query("deadlines")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    // Apply filters
    const now = Date.now();
    if (args.filter === "Today") {
      const todayStart = new Date().setHours(0, 0, 0, 0);
      const todayEnd = new Date().setHours(23, 59, 59, 999);
      deadlines = deadlines.filter(
        (d) => d.dueDate >= todayStart && d.dueDate <= todayEnd
      );
    } else if (args.filter === "This Week") {
      const weekEnd = now + 7 * 24 * 60 * 60 * 1000;
      deadlines = deadlines.filter((d) => d.dueDate >= now && d.dueDate <= weekEnd);
    }

    // Sort by due date
    return deadlines.sort((a, b) => a.dueDate - b.dueDate);
  },
});

// Internal version for MCP server
export const listInternal = internalQuery({
  args: {
    filter: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let deadlines = await ctx.db.query("deadlines").collect();

    const now = Date.now();
    if (args.filter === "Today") {
      const todayStart = new Date().setHours(0, 0, 0, 0);
      const todayEnd = new Date().setHours(23, 59, 59, 999);
      deadlines = deadlines.filter(
        (d) => d.dueDate >= todayStart && d.dueDate <= todayEnd
      );
    } else if (args.filter === "This Week") {
      const weekEnd = now + 7 * 24 * 60 * 60 * 1000;
      deadlines = deadlines.filter((d) => d.dueDate >= now && d.dueDate <= weekEnd);
    }

    return deadlines.sort((a, b) => a.dueDate - b.dueDate);
  },
});

export const create = mutation({
  args: {
    courseId: v.optional(v.id("courses")),
    title: v.string(),
    description: v.optional(v.string()),
    dueDate: v.number(),
    type: v.string(),
    priority: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");

    return await ctx.db.insert("deadlines", {
      userId: user._id,
      courseId: args.courseId,
      title: args.title,
      description: args.description,
      dueDate: args.dueDate,
      type: args.type,
      priority: args.priority,
      isCompleted: false,
      isSyncedToCalendar: false,
    });
  },
});

export const toggleComplete = mutation({
  args: {
    id: v.id("deadlines"),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");

    const deadline = await ctx.db.get(args.id);
    if (!deadline || deadline.userId !== user._id) {
      throw new Error("Deadline not found");
    }

    await ctx.db.patch(args.id, {
      isCompleted: !deadline.isCompleted,
    });
  },
});

export const markSyncedToCalendar = mutation({
  args: {
    id: v.id("deadlines"),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");

    const deadline = await ctx.db.get(args.id);
    if (!deadline || deadline.userId !== user._id) {
      throw new Error("Deadline not found");
    }

    await ctx.db.patch(args.id, {
      isSyncedToCalendar: true,
    });
  },
});