import { mutation } from "./_generated/server";
import { v } from "convex/values";

// Helper functions for generating synthetic data
const firstNames = ["Aarav", "Vivaan", "Aditya", "Arjun", "Sai", "Aryan", "Reyansh", "Ayaan", "Krishna", "Ishaan",
  "Ananya", "Diya", "Aadhya", "Saanvi", "Kiara", "Anika", "Navya", "Angel", "Pari", "Sara",
  "Rohan", "Kabir", "Shivansh", "Atharv", "Advait", "Dhruv", "Arnav", "Vihaan", "Rudra", "Shaurya",
  "Aarohi", "Myra", "Aanya", "Riya", "Shanaya", "Avni", "Prisha", "Ira", "Tara", "Zara"];

const lastNames = ["Sharma", "Verma", "Patel", "Kumar", "Singh", "Gupta", "Reddy", "Rao", "Nair", "Iyer",
  "Mehta", "Joshi", "Desai", "Shah", "Agarwal", "Bansal", "Malhotra", "Kapoor", "Chopra", "Bhatia"];

const departments = ["Computer Science", "Electronics", "Mechanical", "Civil", "Electrical", "Information Technology"];

const courses = [
  { name: "Data Structures & Algorithms", code: "CS201", instructor: "Prof. Sharma", color: "#4F46E5" },
  { name: "Database Management Systems", code: "CS301", instructor: "Dr. Patel", color: "#22C55E" },
  { name: "Operating Systems", code: "CS302", instructor: "Prof. Kumar", color: "#F59E0B" },
  { name: "Computer Networks", code: "CS303", instructor: "Dr. Singh", color: "#EF4444" },
  { name: "Software Engineering", code: "CS304", instructor: "Prof. Mehta", color: "#8B5CF6" },
  { name: "Machine Learning", code: "CS401", instructor: "Dr. Gupta", color: "#06B6D4" },
  { name: "Web Development", code: "CS305", instructor: "Prof. Reddy", color: "#EC4899" },
  { name: "Mobile App Development", code: "CS306", instructor: "Dr. Nair", color: "#10B981" },
];

const emailCategories = ["scholarship", "classes", "exam_timetable", "class_timetable", "notice", "results", "general"];

const scholarshipNames = [
  "Merit Scholarship",
  "Need-Based Grant",
  "Research Excellence Award",
  "Sports Achievement Scholarship",
  "Diversity Scholarship",
  "Dean's List Award",
];

const grades = ["A+", "A", "A-", "B+", "B", "B-", "C+", "C"];
const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

function generateEmail(firstName: string, lastName: string, studentId: string): string {
  return `${firstName.toLowerCase()}.${lastName.toLowerCase()}.${studentId}@university.edu`;
}

function generateStudentId(): string {
  return `STU${Math.floor(100000 + Math.random() * 900000)}`;
}

function randomChoice<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateGPA(): number {
  return parseFloat((2.5 + Math.random() * 1.5).toFixed(2));
}

export const generateSyntheticStudents = mutation({
  args: {
    count: v.number(),
  },
  handler: async (ctx, args) => {
    const count = Math.min(args.count, 100);
    const createdStudents = [];

    for (let i = 0; i < count; i++) {
      const firstName = randomChoice(firstNames);
      const lastName = randomChoice(lastNames);
      const studentId = generateStudentId();
      const email = generateEmail(firstName, lastName, studentId);
      const department = randomChoice(departments);
      const year = randomInt(1, 4);
      const semester = `Fall 2024`;
      const gpa = generateGPA();

      const userId = await ctx.db.insert("users", {
        name: `${firstName} ${lastName}`,
        email: email,
        studentId: studentId,
        department: department,
        semester: semester,
        year: year,
        gpa: gpa,
        role: "user",
      });

      const numCourses = randomInt(4, 6);
      const studentCourses = [];
      const selectedCourses = [...courses].sort(() => 0.5 - Math.random()).slice(0, numCourses);

      for (const course of selectedCourses) {
        const courseId = await ctx.db.insert("courses", {
          userId: userId,
          name: course.name,
          code: course.code,
          instructor: course.instructor,
          color: course.color,
        });
        studentCourses.push({ id: courseId, ...course });
      }

      for (const course of studentCourses) {
        const day = randomChoice(daysOfWeek);
        const startHour = randomInt(8, 16);
        const startTime = `${startHour.toString().padStart(2, '0')}:00`;
        const endTime = `${(startHour + 1).toString().padStart(2, '0')}:30`;

        await ctx.db.insert("classSchedules", {
          userId: userId,
          courseId: course.id,
          dayOfWeek: day,
          startTime: startTime,
          endTime: endTime,
          room: `Room ${randomInt(101, 599)}`,
          building: `Building ${randomChoice(['A', 'B', 'C', 'D'])}`,
        });
      }

      for (const course of studentCourses) {
        const examDate = new Date("2025-12-01").getTime() + randomInt(0, 20) * 24 * 60 * 60 * 1000;
        await ctx.db.insert("examSchedule", {
          userId: userId,
          courseId: course.id,
          examType: randomChoice(["midterm", "final"]),
          examDate: examDate,
          startTime: "09:00",
          endTime: "12:00",
          room: `Hall ${randomInt(1, 10)}`,
          building: "Examination Block",
          syllabus: `Chapters 1-${randomInt(5, 12)}`,
        });
      }

      for (const course of studentCourses) {
        const grade = randomChoice(grades);
        const gradePoints: Record<string, number> = {
          "A+": 4.0, "A": 4.0, "A-": 3.7, "B+": 3.3, "B": 3.0, "B-": 2.7, "C+": 2.3, "C": 2.0
        };

        await ctx.db.insert("results", {
          userId: userId,
          courseId: course.id,
          semester: semester,
          grade: grade,
          score: randomInt(60, 100),
          maxScore: 100,
          credits: 3,
          gpa: gradePoints[grade] || 2.0,
          publishedDate: Date.now() - randomInt(0, 30) * 24 * 60 * 60 * 1000,
        });
      }

      // Generate PDFs for each course
      for (const course of studentCourses) {
        const numDocs = randomInt(3, 8);
        const docTypes = ["Assignment", "Lecture Notes", "Test Paper", "Study Guide", "Lab Manual"];
        
        for (let d = 0; d < numDocs; d++) {
          const docType = randomChoice(docTypes);
          const docNum = randomInt(1, 10);
          
          await ctx.db.insert("documents", {
            userId: userId,
            courseId: course.id,
            courseName: course.name,
            courseCode: course.code,
            name: `${docType}_${docNum}.pdf`,
            type: "pdf",
            date: new Date(Date.now() - randomInt(0, 60) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            size: `${(Math.random() * 5 + 0.5).toFixed(1)} MB`,
            url: `https://example.com/docs/${course.code}/${docType}_${docNum}.pdf`,
          });
        }
      }

      // Generate quizzes for each course
      for (const course of studentCourses) {
        const numQuizzes = randomInt(2, 4);
        
        for (let q = 0; q < numQuizzes; q++) {
          const quizDate = new Date("2025-12-01").getTime() + randomInt(0, 30) * 24 * 60 * 60 * 1000;
          const quizId = await ctx.db.insert("quizzes", {
            userId: userId,
            courseId: course.id,
            title: `Quiz ${q + 1}: ${course.name}`,
            description: `Assessment covering chapters ${randomInt(1, 5)}-${randomInt(6, 10)}`,
            dueDate: quizDate,
            duration: randomInt(30, 90),
            totalQuestions: 10,
            isCompleted: Math.random() > 0.5,
            score: Math.random() > 0.5 ? randomInt(60, 100) : undefined,
          });

          // Generate questions for quiz
          for (let qn = 0; qn < 10; qn++) {
            await ctx.db.insert("quizQuestions", {
              quizId: quizId,
              question: `Question ${qn + 1} for ${course.name}`,
              options: [
                `Option A for question ${qn + 1}`,
                `Option B for question ${qn + 1}`,
                `Option C for question ${qn + 1}`,
                `Option D for question ${qn + 1}`,
              ],
              correctAnswer: randomInt(0, 3),
              points: 10,
            });
          }
        }
      }

      for (const course of studentCourses) {
        const day = randomChoice(daysOfWeek);
        const startHour = randomInt(8, 16);
        const startTime = `${startHour.toString().padStart(2, '0')}:00`;
        const endTime = `${(startHour + 1).toString().padStart(2, '0')}:30`;

        await ctx.db.insert("classSchedules", {
          userId: userId,
          courseId: course.id,
          dayOfWeek: day,
          startTime: startTime,
          endTime: endTime,
          room: `Room ${randomInt(101, 599)}`,
          building: `Building ${randomChoice(['A', 'B', 'C', 'D'])}`,
        });
      }

      for (const course of studentCourses) {
        const examDate = new Date("2025-12-01").getTime() + randomInt(0, 20) * 24 * 60 * 60 * 1000;
        await ctx.db.insert("examSchedule", {
          userId: userId,
          courseId: course.id,
          examType: randomChoice(["midterm", "final"]),
          examDate: examDate,
          startTime: "09:00",
          endTime: "12:00",
          room: `Hall ${randomInt(1, 10)}`,
          building: "Examination Block",
          syllabus: `Chapters 1-${randomInt(5, 12)}`,
        });
      }

      for (const course of studentCourses) {
        const grade = randomChoice(grades);
        const gradePoints: Record<string, number> = {
          "A+": 4.0, "A": 4.0, "A-": 3.7, "B+": 3.3, "B": 3.0, "B-": 2.7, "C+": 2.3, "C": 2.0
        };

        await ctx.db.insert("results", {
          userId: userId,
          courseId: course.id,
          semester: semester,
          grade: grade,
          score: randomInt(60, 100),
          maxScore: 100,
          credits: 3,
          gpa: gradePoints[grade] || 2.0,
          publishedDate: Date.now() - randomInt(0, 30) * 24 * 60 * 60 * 1000,
        });
      }

      const emailTemplates = [
        {
          category: "scholarship",
          from: "scholarships@university.edu",
          subject: "Scholarship Application Status Update",
          message: `Dear ${firstName}, Your application for the Merit Scholarship has been reviewed. You have been shortlisted for the next round.`,
        },
        {
          category: "classes",
          from: randomChoice(studentCourses).instructor.toLowerCase().replace(/\s+/g, '.') + "@university.edu",
          subject: "Class Schedule Update",
          message: `Hello students, Please note that tomorrow's class has been rescheduled to ${randomChoice(daysOfWeek)} at 2:00 PM.`,
        },
        {
          category: "exam_timetable",
          from: "examcell@university.edu",
          subject: "Final Examination Timetable Released",
          message: `Dear ${firstName}, The final examination timetable for ${semester} has been released.`,
        },
        {
          category: "results",
          from: "results@university.edu",
          subject: "Semester Results Published",
          message: `Dear ${firstName}, Your results for ${semester} have been published. Your CGPA is ${gpa}.`,
        },
      ];

      const numEmails = randomInt(5, 10);
      for (let j = 0; j < numEmails; j++) {
        const template = randomChoice(emailTemplates);
        const timestamp = Date.now() - randomInt(0, 30) * 24 * 60 * 60 * 1000;

        await ctx.db.insert("emails", {
          userId: userId,
          courseId: studentCourses.length > 0 ? randomChoice(studentCourses).id : undefined,
          from: template.from,
          subject: template.subject,
          message: template.message,
          timestamp: timestamp,
          isRead: Math.random() > 0.3,
          category: template.category,
        });
      }

      if (Math.random() > 0.7) {
        await ctx.db.insert("scholarships", {
          userId: userId,
          name: randomChoice(scholarshipNames),
          amount: randomInt(5000, 50000),
          semester: semester,
          status: randomChoice(["awarded", "pending"]),
          awardedDate: Date.now() - randomInt(0, 60) * 24 * 60 * 60 * 1000,
        });
      }

      const notificationTemplates = [
        {
          title: "Assignment Due Soon",
          message: "Your assignment for Data Structures is due in 2 days",
          type: "warning",
          category: "academic",
        },
        {
          title: "Fee Payment Reminder",
          message: "Your semester fee payment is pending. Last date: Nov 30",
          type: "warning",
          category: "financial",
        },
      ];

      for (let k = 0; k < 3; k++) {
        const notif = randomChoice(notificationTemplates);
        await ctx.db.insert("notifications", {
          userId: userId,
          title: notif.title,
          message: notif.message,
          type: notif.type,
          category: notif.category,
          isRead: Math.random() > 0.5,
          timestamp: Date.now() - randomInt(0, 7) * 24 * 60 * 60 * 1000,
        });
      }

      createdStudents.push({
        name: `${firstName} ${lastName}`,
        email: email,
        studentId: studentId,
        department: department,
      });
    }

    return {
      success: true,
      message: `Successfully created ${count} synthetic students with complete academic data including ${count * 20} PDFs and quizzes`,
      students: createdStudents,
    };
  },
});