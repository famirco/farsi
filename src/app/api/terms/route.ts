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
    const { action, termId, order, titleEn, titleFa } = body;

    const parsedOrder = parseNum(order);

    if (action === "CREATE_LEVEL") {
      if (!termId || !titleEn || !titleFa) {
        return NextResponse.json({ error: "Term ID and Titles are required" }, { status: 400 });
      }

      // Shift existing levels with order >= parsedOrder in descending order to avoid unique constraints
      const existingLevels = await prisma.level.findMany({
        where: { termId, order: { gte: parsedOrder } },
        orderBy: { order: "desc" },
      });

      await prisma.$transaction(
        existingLevels.map((l) =>
          prisma.level.update({
            where: { id: l.id },
            data: { order: l.order + 1 },
          })
        )
      );

      const level = await prisma.level.create({
        data: {
          termId,
          order: parsedOrder,
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

      // Shift existing terms with order >= parsedOrder in descending order to avoid unique constraints
      const existingTerms = await prisma.term.findMany({
        where: { order: { gte: parsedOrder } },
        orderBy: { order: "desc" },
      });

      await prisma.$transaction(
        existingTerms.map((t) =>
          prisma.term.update({
            where: { id: t.id },
            data: { order: t.order + 1 },
          })
        )
      );

      const term = await prisma.term.create({
        data: {
          order: parsedOrder,
          titleEn,
          titleFa,
        },
      });
      return NextResponse.json(term);
    }
  } catch (error: any) {
    console.error("Error in terms API:", error);
    // Prisma unique constraint violation code
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "Unique constraint failed: A Term or Level with this Order already exists." },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
