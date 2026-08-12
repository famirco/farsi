import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const terms = await prisma.term.findMany({
      orderBy: { order: "asc" },
      include: {
        levels: {
          orderBy: { order: "asc" },
          include: {
            lessons: {
              orderBy: { order: "asc" },
            },
          },
        },
      },
    });
    return NextResponse.json(terms);
  } catch (error) {
    console.error("Error fetching terms:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, termId, order, titleEn, titleFa } = body;

    if (action === "CREATE_LEVEL") {
      if (!termId || !titleEn || !titleFa) {
        return NextResponse.json({ error: "Term ID and Titles are required" }, { status: 400 });
      }
      const level = await prisma.level.create({
        data: {
          termId,
          order: parseInt(order) || 1,
          titleEn,
          titleFa,
        },
      });
      return NextResponse.json(level);
    } else {
      // Create Term
      if (!titleEn || !titleFa) {
        return NextResponse.json({ error: "Titles are required" }, { status: 400 });
      }
      const term = await prisma.term.create({
        data: {
          order: parseInt(order) || 1,
          titleEn,
          titleFa,
        },
      });
      return NextResponse.json(term);
    }
  } catch (error) {
    console.error("Error in terms API:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
