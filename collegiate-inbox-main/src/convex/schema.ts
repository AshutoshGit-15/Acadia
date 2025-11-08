import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { Infer, v } from "convex/values";

// default user roles
export const ROLES = {
  ADMIN: "admin",
  USER: "user",
  MEMBER: "member",
} as const;

export const roleValidator = v.union(
  v.literal(ROLES.ADMIN),
  v.literal(ROLES.USER),
  v.literal(ROLES.MEMBER),
);
export type Role = Infer<typeof roleValidator>;

const schema = defineSchema(
  {
    ...authTables,

    users: defineTable({
      name: v.optional(v.string()),
      image: v.optional(v.string()),
      email: v.optional(v.string()),
      emailVerificationTime: v.optional(v.number()),
      isAnonymous: v.optional(v.boolean()),
      role: v.optional(roleValidator),
      
      // Additional fields for academic tracking
      studentId: v.optional(v.string()),
      semester: v.optional(v.string()),
      department: v.optional(v.string()),
      year: v.optional(v.number()),
      gpa: v.optional(v.number()),
    }).index("email", ["email"]),

    courses: defineTable({
      userId: v.id("users"),
      name: v.string(),
      code: v.string(),
      instructor: v.optional(v.string()),
      color: v.string(),
    })
      .index("by_user", ["userId"])
      .index("by_user_and_code", ["userId", "code"]),

    deadlines: defineTable({
      userId: v.id("users"),
      courseId: v.optional(v.id("courses")),
      title: v.string(),
      description: v.optional(v.string()),
      dueDate: v.number(),
      type: v.string(),
      priority: v.string(),
      isCompleted: v.optional(v.boolean()),
      isSyncedToCalendar: v.optional(v.boolean()),
    })
      .index("by_user", ["userId"])
      .index("by_user_and_due_date", ["userId", "dueDate"]),

    alerts: defineTable({
      userId: v.id("users"),
      courseId: v.optional(v.id("courses")),
      type: v.string(),
      title: v.string(),
      message: v.string(),
      keyword: v.optional(v.string()),
      isRead: v.optional(v.boolean()),
    })
      .index("by_user", ["userId"]),

    emails: defineTable({
      userId: v.id("users"),
      courseId: v.optional(v.id("courses")),
      from: v.string(),
      subject: v.string(),
      message: v.string(),
      timestamp: v.number(),
      isRead: v.optional(v.boolean()),
      category: v.optional(v.string()), // "scholarship", "classes", "exam_timetable", "class_timetable", "notice", "results", "general"
    })
      .index("by_user", ["userId"])
      .index("by_user_and_timestamp", ["userId", "timestamp"])
      .index("by_user_and_category", ["userId", "category"]),

    documents: defineTable({
      userId: v.id("users"),
      courseId: v.optional(v.id("courses")),
      courseName: v.string(),
      courseCode: v.string(),
      name: v.string(),
      type: v.string(),
      date: v.string(),
      size: v.string(),
      url: v.optional(v.string()),
    })
      .index("by_user", ["userId"])
      .index("by_user_and_course", ["userId", "courseCode"]),

    classSchedules: defineTable({
      userId: v.id("users"),
      courseId: v.id("courses"),
      dayOfWeek: v.string(), // "Monday", "Tuesday", etc.
      startTime: v.string(), // "09:00"
      endTime: v.string(), // "10:30"
      room: v.string(),
      building: v.string(),
    })
      .index("by_user", ["userId"])
      .index("by_user_and_day", ["userId", "dayOfWeek"]),

    examSchedule: defineTable({
      userId: v.id("users"),
      courseId: v.id("courses"),
      examType: v.string(), // "midterm", "final", "quiz"
      examDate: v.number(),
      startTime: v.string(),
      endTime: v.string(),
      room: v.string(),
      building: v.string(),
      syllabus: v.optional(v.string()),
    })
      .index("by_user", ["userId"])
      .index("by_user_and_date", ["userId", "examDate"]),

    results: defineTable({
      userId: v.id("users"),
      courseId: v.id("courses"),
      semester: v.string(),
      grade: v.string(), // "A+", "A", "B+", etc.
      score: v.optional(v.number()),
      maxScore: v.optional(v.number()),
      credits: v.number(),
      gpa: v.number(),
      publishedDate: v.number(),
    })
      .index("by_user", ["userId"])
      .index("by_user_and_semester", ["userId", "semester"]),

    scholarships: defineTable({
      userId: v.id("users"),
      name: v.string(),
      amount: v.number(),
      semester: v.string(),
      status: v.string(), // "awarded", "pending", "rejected"
      awardedDate: v.optional(v.number()),
    })
      .index("by_user", ["userId"]),

    quizzes: defineTable({
      userId: v.id("users"),
      courseId: v.id("courses"),
      title: v.string(),
      description: v.optional(v.string()),
      dueDate: v.number(),
      duration: v.number(), // in minutes
      totalQuestions: v.number(),
      isCompleted: v.optional(v.boolean()),
      score: v.optional(v.number()),
    })
      .index("by_user", ["userId"])
      .index("by_user_and_course", ["userId", "courseId"]),

    quizQuestions: defineTable({
      quizId: v.id("quizzes"),
      question: v.string(),
      options: v.array(v.string()),
      correctAnswer: v.number(), // index of correct option
      points: v.number(),
    })
      .index("by_quiz", ["quizId"]),

    quizSubmissions: defineTable({
      userId: v.id("users"),
      quizId: v.id("quizzes"),
      answers: v.array(v.number()),
      score: v.number(),
      submittedAt: v.number(),
    })
      .index("by_user", ["userId"])
      .index("by_quiz", ["quizId"]),

    notifications: defineTable({
      userId: v.id("users"),
      title: v.string(),
      message: v.string(),
      type: v.string(), // "info", "warning", "success", "error"
      category: v.string(), // "academic", "financial", "administrative", "event"
      isRead: v.optional(v.boolean()),
      timestamp: v.number(),
    })
      .index("by_user", ["userId"])
      .index("by_user_and_timestamp", ["userId", "timestamp"]),
  },
  {
    schemaValidation: false,
  },
);

export default schema;