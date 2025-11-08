import { v } from "convex/values";
import { mutation, query, internalMutation, internalQuery } from "./_generated/server";
import { getCurrentUser } from "./users";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) return [];

    return await ctx.db
      .query("notifications")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .take(50);
  },
});

export const listInternal = internalQuery({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("notifications").order("desc").take(50);
  },
});

export const listUnread = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) return [];

    const notifications = await ctx.db
      .query("notifications")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .collect();

    return notifications.filter(n => !n.isRead);
  },
});

export const markAsRead = mutation({
  args: {
    id: v.id("notifications"),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");

    const notification = await ctx.db.get(args.id);
    if (!notification || notification.userId !== user._id) {
      throw new Error("Notification not found");
    }

    await ctx.db.patch(args.id, {
      isRead: true,
    });
  },
});

export const markAllAsRead = mutation({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");

    const notifications = await ctx.db
      .query("notifications")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    for (const notification of notifications) {
      if (!notification.isRead) {
        await ctx.db.patch(notification._id, { isRead: true });
      }
    }
  },
});

export const generateClassNotifications = internalMutation({
  args: {},
  handler: async (ctx) => {
    // Simulate checking for class updates
    // In production, this would check against a schedule database
    const users = await ctx.db.query("users").collect();
    
    for (const user of users.slice(0, 5)) { // Limit to prevent spam
      if (Math.random() > 0.95) { // 5% chance of notification
        const courses = await ctx.db
          .query("courses")
          .withIndex("by_user", (q) => q.eq("userId", user._id))
          .take(1);
        
        if (courses.length > 0) {
          const course = courses[0];
          const notifType = Math.random() > 0.5 ? "CANCELLED" : "RESCHEDULED";
          
          await ctx.db.insert("notifications", {
            userId: user._id,
            title: `${notifType}: ${course.name}`,
            message: notifType === "CANCELLED" 
              ? `Today's ${course.name} class has been cancelled.`
              : `${course.name} class has been rescheduled to tomorrow at 2:00 PM.`,
            type: "warning",
            category: "academic",
            isRead: false,
            timestamp: Date.now(),
          });
        }
      }
    }
  },
});

export const generateDeadlineNotifications = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const oneDayFromNow = now + 24 * 60 * 60 * 1000;
    
    const deadlines = await ctx.db.query("deadlines").collect();
    
    for (const deadline of deadlines) {
      if (deadline.dueDate > now && deadline.dueDate < oneDayFromNow && !deadline.isCompleted) {
        const course = deadline.courseId ? await ctx.db.get(deadline.courseId) : null;
        
        await ctx.db.insert("notifications", {
          userId: deadline.userId,
          title: "Deadline Approaching",
          message: `${deadline.title} is due in less than 24 hours!`,
          type: "warning",
          category: "academic",
          isRead: false,
          timestamp: Date.now(),
        });
      }
    }
  },
});