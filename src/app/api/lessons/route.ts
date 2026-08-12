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

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { levelId, order, titleEn, titleFa, descEn, descFa, xpReward } = body;

    if (!levelId || !titleEn || !titleFa) {
      return NextResponse.json({ error: "Level ID and Titles are required" }, { status: 400 });
    }

    const lesson = await prisma.lesson.create({
      data: {
        levelId,
        order: parseInt(order) || 1,
        titleEn,
        titleFa,
        descEn: descEn || "",
        descFa: descFa || "",
        xpReward: parseInt(xpReward) || 10,
      },
    });

    return NextResponse.json(lesson);
  } catch (error) {
    console.error("Error creating lesson:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
