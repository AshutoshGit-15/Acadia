import { v } from "convex/values";
import { mutation, query, internalQuery } from "./_generated/server";
import { getCurrentUser } from "./users";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) return [];

    const quizzes = await ctx.db
      .query("quizzes")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    const quizzesWithCourses = await Promise.all(
      quizzes.map(async (quiz) => {
        const course = await ctx.db.get(quiz.courseId);
        return { ...quiz, course };
      })
    );

    return quizzesWithCourses.sort((a, b) => a.dueDate - b.dueDate);
  },
});

export const listInternal = internalQuery({
  args: {},
  handler: async (ctx) => {
    const quizzes = await ctx.db.query("quizzes").collect();

    const quizzesWithCourses = await Promise.all(
      quizzes.map(async (quiz) => {
        const course = await ctx.db.get(quiz.courseId);
        return { ...quiz, course };
      })
    );

    return quizzesWithCourses.sort((a, b) => a.dueDate - b.dueDate);
  },
});

export const getQuizWithQuestions = query({
  args: { quizId: v.id("quizzes") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");

    const quiz = await ctx.db.get(args.quizId);
    if (!quiz || quiz.userId !== user._id) {
      throw new Error("Quiz not found");
    }

    const questions = await ctx.db
      .query("quizQuestions")
      .withIndex("by_quiz", (q) => q.eq("quizId", args.quizId))
      .collect();

    const course = await ctx.db.get(quiz.courseId);

    return { ...quiz, questions, course };
  },
});

export const submitQuiz = mutation({
  args: {
    quizId: v.id("quizzes"),
    answers: v.array(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");

    const quiz = await ctx.db.get(args.quizId);
    if (!quiz || quiz.userId !== user._id) {
      throw new Error("Quiz not found");
    }

    const questions = await ctx.db
      .query("quizQuestions")
      .withIndex("by_quiz", (q) => q.eq("quizId", args.quizId))
      .collect();

    let score = 0;
    questions.forEach((q, idx) => {
      if (args.answers[idx] === q.correctAnswer) {
        score += q.points;
      }
    });

    await ctx.db.insert("quizSubmissions", {
      userId: user._id,
      quizId: args.quizId,
      answers: args.answers,
      score,
      submittedAt: Date.now(),
    });

    await ctx.db.patch(args.quizId, {
      isCompleted: true,
      score,
    });

    return { score, totalPoints: questions.reduce((sum, q) => sum + q.points, 0) };
  },
});