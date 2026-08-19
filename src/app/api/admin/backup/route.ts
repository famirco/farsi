import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const [terms, levels, lessons, questions, users] = await Promise.all([
      prisma.term.findMany({ orderBy: { order: "asc" } }),
      prisma.level.findMany({ orderBy: { order: "asc" } }),
      prisma.lesson.findMany({ orderBy: { order: "asc" } }),
      prisma.question.findMany({ orderBy: { order: "asc" } }),
      prisma.user.findMany({ orderBy: { createdAt: "asc" } }),
    ]);

    const backupData = {
      version: "1.0",
      exportedAt: new Date().toISOString(),
      counts: {
        terms: terms.length,
        levels: levels.length,
        lessons: lessons.length,
        questions: questions.length,
        users: users.length,
      },
      data: {
        terms,
        levels,
        lessons,
        questions,
        users,
      },
    };

    const dateStr = new Date().toISOString().split("T")[0];
    const filename = `farsiyar_db_backup_${dateStr}.json`;

    return new NextResponse(JSON.stringify(backupData, null, 2), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error: any) {
    console.error("Backup export error:", error);
    return NextResponse.json(
      { error: "Failed to generate database backup", details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const backup = body.data || body;

    if (!backup.terms || !backup.levels || !backup.lessons || !backup.questions) {
      return NextResponse.json(
        { error: "Invalid backup file structure. Missing required database entities." },
        { status: 400 }
      );
    }

    const { terms, levels, lessons, questions, users = [] } = backup;

    // Use transaction to ensure atomic restore
    await prisma.$transaction(async (tx) => {
      // 1. Delete in reverse dependency order
      await tx.question.deleteMany({});
      await tx.lesson.deleteMany({});
      await tx.level.deleteMany({});
      await tx.term.deleteMany({});
      await tx.user.deleteMany({});

      // 2. Insert in dependency order
      if (terms.length > 0) {
        for (const term of terms) {
          await tx.term.create({
            data: {
              id: term.id,
              order: term.order,
              titleEn: term.titleEn,
              titleFa: term.titleFa,
            },
          });
        }
      }

      if (levels.length > 0) {
        for (const level of levels) {
          await tx.level.create({
            data: {
              id: level.id,
              termId: level.termId,
              order: level.order,
              titleEn: level.titleEn,
              titleFa: level.titleFa,
            },
          });
        }
      }

      if (lessons.length > 0) {
        for (const lesson of lessons) {
          await tx.lesson.create({
            data: {
              id: lesson.id,
              levelId: lesson.levelId,
              order: lesson.order,
              titleEn: lesson.titleEn,
              titleFa: lesson.titleFa,
              descEn: lesson.descEn,
              descFa: lesson.descFa,
              xpReward: lesson.xpReward ?? 10,
            },
          });
        }
      }

      if (questions.length > 0) {
        for (const question of questions) {
          await tx.question.create({
            data: {
              id: question.id,
              lessonId: question.lessonId,
              order: question.order,
              type: question.type,
              promptEn: question.promptEn,
              promptFa: question.promptFa,
              options: typeof question.options === "string" ? question.options : JSON.stringify(question.options || []),
              correctAnswer: question.correctAnswer,
            },
          });
        }
      }

      if (users.length > 0) {
        for (const user of users) {
          await tx.user.create({
            data: {
              id: user.id,
              username: user.username,
              password: user.password || "password",
              role: user.role || "USER",
              accountType: user.accountType || "ADULT_HERITAGE",
              parentUserId: user.parentUserId || null,
              whyLearning: user.whyLearning || null,
              xp: user.xp ?? 0,
              streak: user.streak ?? 0,
              lastActive: user.lastActive ? new Date(user.lastActive) : null,
              completedLessons: typeof user.completedLessons === "string" ? user.completedLessons : JSON.stringify(user.completedLessons || []),
              unlockedUntilLessonId: user.unlockedUntilLessonId || null,
              skills: typeof user.skills === "string" ? user.skills : JSON.stringify(user.skills || {}),
              unlockedTerms: typeof user.unlockedTerms === "string" ? user.unlockedTerms : JSON.stringify(user.unlockedTerms || []),
              createdAt: user.createdAt ? new Date(user.createdAt) : new Date(),
            },
          });
        }
      }
    });

    return NextResponse.json({
      success: true,
      message: "Database successfully restored from backup!",
      restoredCounts: {
        terms: terms.length,
        levels: levels.length,
        lessons: lessons.length,
        questions: questions.length,
        users: users.length,
      },
    });
  } catch (error: any) {
    console.error("Backup restore error:", error);
    return NextResponse.json(
      { error: "Failed to restore database from backup", details: error.message },
      { status: 500 }
    );
  }
}
