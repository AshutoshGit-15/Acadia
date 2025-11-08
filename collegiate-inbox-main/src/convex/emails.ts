import { v } from "convex/values";
import { mutation, query, internalQuery } from "./_generated/server";
import { getCurrentUser } from "./users";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) return [];

    return await ctx.db
      .query("emails")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .collect();
  },
});

export const listByCategory = query({
  args: {
    category: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) return [];

    if (!args.category || args.category === "all") {
      return await ctx.db
        .query("emails")
        .withIndex("by_user", (q) => q.eq("userId", user._id))
        .order("desc")
        .collect();
    }

    return await ctx.db
      .query("emails")
      .withIndex("by_user_and_category", (q) => 
        q.eq("userId", user._id).eq("category", args.category)
      )
      .order("desc")
      .collect();
  },
});

export const listByCourse = query({
  args: {
    courseId: v.optional(v.id("courses")),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) return [];

    if (!args.courseId) {
      return await ctx.db
        .query("emails")
        .withIndex("by_user", (q) => q.eq("userId", user._id))
        .order("desc")
        .collect();
    }

    const allEmails = await ctx.db
      .query("emails")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .collect();

    return allEmails.filter(email => email.courseId === args.courseId);
  },
});

export const listImportant = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) return [];

    const allEmails = await ctx.db
      .query("emails")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .collect();

    const twoDaysAgo = Date.now() - (2 * 24 * 60 * 60 * 1000);
    return allEmails.filter(email => 
      !email.isRead || email.timestamp > twoDaysAgo
    ).slice(0, 10);
  },
});

export const markAsRead = mutation({
  args: {
    id: v.id("emails"),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");

    const email = await ctx.db.get(args.id);
    if (!email || email.userId !== user._id) {
      throw new Error("Email not found");
    }

    await ctx.db.patch(args.id, {
      isRead: !email.isRead,
    });
  },
});

export const generateSummary = mutation({
  args: {
    id: v.id("emails"),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");

    const email = await ctx.db.get(args.id);
    if (!email || email.userId !== user._id) {
      throw new Error("Email not found");
    }

    const message = email.message;
    const sentences = message.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const summary = sentences.slice(0, 2).join('. ') + '.';

    return {
      summary,
      keyPoints: [
        "Action required" + (message.toLowerCase().includes('deadline') ? ': Deadline mentioned' : ''),
        "From: " + email.from,
        "Received: " + new Date(email.timestamp).toLocaleDateString(),
      ].filter(Boolean),
    };
  },
});

// Internal version for MCP server
export const listInternal = internalQuery({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("emails").order("desc").collect();
  },
});