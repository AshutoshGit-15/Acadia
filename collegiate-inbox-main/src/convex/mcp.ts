"use node";

import { internalAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";

// MCP Server - Model Context Protocol for real-time data streaming
export const streamUpdates = internalAction({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args): Promise<any> => {
    // Fetch all relevant data for the user
    const [deadlines, alerts, emails, notifications, quizzes]: any[] = await Promise.all([
      ctx.runQuery(internal.deadlines.listInternal, { filter: undefined }),
      ctx.runQuery(internal.alerts.listInternal, {}),
      ctx.runQuery(internal.emails.listInternal, {}),
      ctx.runQuery(internal.notifications.listInternal, {}),
      ctx.runQuery(internal.quizzes.listInternal, {}),
    ]);

    return {
      timestamp: Date.now(),
      data: {
        deadlines,
        alerts,
        emails,
        notifications,
        quizzes,
      },
      metadata: {
        unreadCount: notifications.filter((n: any) => !n.isRead).length,
        urgentDeadlines: deadlines.filter((d: any) => {
          const hoursUntil = (d.dueDate - Date.now()) / (1000 * 60 * 60);
          return hoursUntil < 24 && hoursUntil > 0;
        }).length,
      },
    };
  },
});

export const refreshContext = internalAction({
  args: {},
  handler: async (ctx) => {
    // Trigger notification generation
    await ctx.runMutation(internal.notifications.generateClassNotifications, {});
    await ctx.runMutation(internal.notifications.generateDeadlineNotifications, {});
    
    return { success: true, timestamp: Date.now() };
  },
});
