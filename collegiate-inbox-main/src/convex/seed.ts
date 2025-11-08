import { mutation } from "./_generated/server";
import { getCurrentUser } from "./users";

export const seedData = mutation({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");

    // Create courses
    const courses = [
      { name: "Data Structures & Algorithms", code: "CS201", color: "#4F46E5", instructor: "Prof. Sharma" },
      { name: "Database Management Systems", code: "CS301", color: "#22C55E", instructor: "Dr. Patel" },
      { name: "Operating Systems", code: "CS302", color: "#F59E0B", instructor: "Prof. Kumar" },
      { name: "Computer Networks", code: "CS303", color: "#EF4444", instructor: "Dr. Singh" },
      { name: "Software Engineering", code: "CS304", color: "#8B5CF6", instructor: "Prof. Mehta" },
    ];

    const courseIds: Record<string, any> = {};
    for (const course of courses) {
      const id = await ctx.db.insert("courses", {
        userId: user._id,
        ...course,
      });
      courseIds[course.code] = id;
    }

    // Create deadlines
    const deadlines = [
      {
        courseCode: "CS201",
        title: "Assignment 3: Binary Search Trees",
        dueDate: new Date("2025-11-09T23:59:00").getTime(),
        priority: "high",
        description: "Implement BST operations including insertion, deletion, and traversal methods.",
        type: "assignment",
      },
      {
        courseCode: "CS301",
        title: "Project Milestone 2: Schema Design",
        dueDate: new Date("2025-11-10T17:00:00").getTime(),
        priority: "high",
        description: "Submit normalized database schema (up to 3NF) with ER diagram.",
        type: "project",
      },
      {
        courseCode: "CS302",
        title: "Lab Report: Process Scheduling",
        dueDate: new Date("2025-11-08T10:00:00").getTime(),
        priority: "urgent",
        description: "Analysis of Round Robin vs FCFS scheduling algorithms.",
        type: "lab",
      },
    ];

    for (const deadline of deadlines) {
      await ctx.db.insert("deadlines", {
        userId: user._id,
        courseId: courseIds[deadline.courseCode],
        title: deadline.title,
        description: deadline.description,
        dueDate: deadline.dueDate,
        type: deadline.type,
        priority: deadline.priority,
        isCompleted: false,
      });
    }

    // Create alerts
    const alerts = [
      {
        type: "urgent",
        title: "ROOM CHANGE: Operating Systems Lab",
        message: "Tomorrow's OS lab has been moved from Lab 3 to Lab 5 (Building B).",
        keyword: "ROOM CHANGE",
        courseCode: "CS302",
      },
      {
        type: "urgent",
        title: "CANCELLED: Software Engineering Lecture",
        message: "Friday's SE lecture is cancelled as Prof. Mehta is unwell.",
        keyword: "CANCELLED",
        courseCode: "CS304",
      },
    ];

    for (const alert of alerts) {
      await ctx.db.insert("alerts", {
        userId: user._id,
        courseId: courseIds[alert.courseCode],
        type: alert.type,
        title: alert.title,
        message: alert.message,
        keyword: alert.keyword,
        isRead: false,
      });
    }

    // Create emails
    const emailsData = [
      {
        courseCode: "CS201",
        from: "prof.sharma@university.edu",
        subject: "Assignment 3 Clarification",
        message: "Dear students, regarding Assignment 3 on Binary Search Trees, please note that you need to implement both iterative and recursive versions of the traversal methods. The deadline remains November 9th. Feel free to reach out during office hours if you have questions.",
        timestamp: Date.now() - 2 * 60 * 60 * 1000, // 2 hours ago
      },
      {
        courseCode: "CS301",
        from: "dr.patel@university.edu",
        subject: "Project Milestone 2 Guidelines",
        message: "Hello class, I've uploaded detailed guidelines for Milestone 2 of your database project. Please ensure your schema is normalized to at least 3NF and includes all required entities. Submit your ER diagram along with the SQL schema file.",
        timestamp: Date.now() - 5 * 60 * 60 * 1000, // 5 hours ago
      },
      {
        courseCode: "CS302",
        from: "prof.kumar@university.edu",
        subject: "Lab Report Submission Reminder",
        message: "This is a reminder that your Process Scheduling lab report is due tomorrow at 10 AM. Make sure to include comparative analysis charts and your observations on algorithm performance.",
        timestamp: Date.now() - 1 * 60 * 60 * 1000, // 1 hour ago
      },
    ];

    for (const emailData of emailsData) {
      await ctx.db.insert("emails", {
        userId: user._id,
        courseId: courseIds[emailData.courseCode],
        from: emailData.from,
        subject: emailData.subject,
        message: emailData.message,
        timestamp: emailData.timestamp,
        isRead: false,
        category: "classes", // Default category
      });
    }

    // Create documents
    const documents = [
      {
        courseName: "Data Structures & Algorithms",
        courseCode: "CS201",
        name: "Lecture_Notes_Week8_Trees.pdf",
        type: "pdf",
        date: "2025-11-05",
        size: "2.4 MB",
      },
      {
        courseName: "Database Management Systems",
        courseCode: "CS301",
        name: "Normalization_Tutorial.pptx",
        type: "pptx",
        date: "2025-11-06",
        size: "3.1 MB",
      },
    ];

    for (const doc of documents) {
      await ctx.db.insert("documents", {
        userId: user._id,
        courseId: courseIds[doc.courseCode],
        ...doc,
      });
    }

    // Create quizzes for each course
    for (const [courseCode, courseId] of Object.entries(courseIds)) {
      const quizDate = new Date("2025-12-15").getTime();
      const quizId = await ctx.db.insert("quizzes", {
        userId: user._id,
        courseId: courseId,
        title: `Quiz 1: ${courses.find(c => c.code === courseCode)?.name}`,
        description: `Assessment covering recent topics`,
        dueDate: quizDate,
        duration: 30,
        totalQuestions: 5,
        isCompleted: false,
      });

      // Generate questions for quiz
      const sampleQuestions = [
        {
          question: "What is the primary purpose of this course?",
          options: ["Option A", "Option B", "Option C", "Option D"],
          correctAnswer: 0,
          points: 10,
        },
        {
          question: "Which concept is most important in this subject?",
          options: ["Concept 1", "Concept 2", "Concept 3", "Concept 4"],
          correctAnswer: 1,
          points: 10,
        },
        {
          question: "How would you apply this knowledge?",
          options: ["Method A", "Method B", "Method C", "Method D"],
          correctAnswer: 2,
          points: 10,
        },
        {
          question: "What is the best practice for this topic?",
          options: ["Practice 1", "Practice 2", "Practice 3", "Practice 4"],
          correctAnswer: 1,
          points: 10,
        },
        {
          question: "Which tool is most commonly used?",
          options: ["Tool A", "Tool B", "Tool C", "Tool D"],
          correctAnswer: 3,
          points: 10,
        },
      ];

      for (const q of sampleQuestions) {
        await ctx.db.insert("quizQuestions", {
          quizId: quizId,
          question: q.question,
          options: q.options,
          correctAnswer: q.correctAnswer,
          points: q.points,
        });
      }
    }

    return { success: true, message: "Sample data created successfully!" };
  },
});