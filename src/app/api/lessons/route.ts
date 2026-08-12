import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const lessons = await prisma.lesson.findMany({
      orderBy: { order: "asc" },
      include: {
        _count: {
          select: { questions: true },
        },
      },
    });
    return NextResponse.json(lessons);
  } catch (error) {
    console.error("Error fetching lessons:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

function parseNum(val: any): number {
  if (typeof val === "number") return val;
  if (!val) return 1;
  let str = String(val).trim();
  const p = ["۰","۱","۲","۳","۴","۵","۶","۷","۸","۹"];
  const a = ["٠","١","٢","٣","٤","٥","٦","٧","٨","٩"];
  for (let i = 0; i < 10; i++) {
    str = str.replace(new RegExp(p[i], 'g'), String(i)).replace(new RegExp(a[i], 'g'), String(i));
  }
  const parsed = parseInt(str, 10);
  return isNaN(parsed) ? 1 : parsed;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { levelId, order, titleEn, titleFa, descEn, descFa, xpReward } = body;

    if (!levelId || !titleEn || !titleFa) {
      return NextResponse.json({ error: "Level ID and Titles are required" }, { status: 400 });
    }

    const parsedOrder = parseNum(order);
    const parsedXp = parseNum(xpReward || 10);

    // Shift existing lessons with order >= parsedOrder in descending order to avoid unique constraints
    const existingLessons = await prisma.lesson.findMany({
      where: { levelId, order: { gte: parsedOrder } },
      orderBy: { order: "desc" },
    });

    await prisma.$transaction(
      existingLessons.map((les) =>
        prisma.lesson.update({
          where: { id: les.id },
          data: { order: les.order + 1 },
        })
      )
    );

    const lesson = await prisma.lesson.create({
      data: {
        levelId,
        order: parsedOrder,
        titleEn,
        titleFa,
        descEn: descEn || "",
        descFa: descFa || "",
        xpReward: parsedXp,
      },
    });

    return NextResponse.json(lesson);
  } catch (error: any) {
    console.error("Error creating lesson:", error);
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "Unique constraint failed: A Lesson with this Order already exists under this Level." },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
