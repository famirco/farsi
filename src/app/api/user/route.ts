import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get("username");

  if (!username) {
    return NextResponse.json({ error: "Username is required" }, { status: 400 });
  }

  try {
    let user;
    try {
      user = await prisma.user.findUnique({
        where: { username },
      });
    } catch (dbErr: any) {
      if (dbErr?.code === "P2022" || dbErr?.message?.includes("childProfile")) {
        try {
          await prisma.$executeRawUnsafe(`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "childProfile" TEXT;`);
          user = await prisma.user.findUnique({ where: { username } });
        } catch (healErr) {
          throw dbErr;
        }
      } else {
        throw dbErr;
      }
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, xp, streak, lastActive, completedLessons } = body;

    if (!username) {
      return NextResponse.json({ error: "Username is required" }, { status: 400 });
    }

    const updateData: any = {};
    if (xp !== undefined) updateData.xp = xp;
    if (streak !== undefined) updateData.streak = streak;
    if (lastActive !== undefined) updateData.lastActive = new Date(lastActive);
    if (completedLessons !== undefined) updateData.completedLessons = JSON.stringify(completedLessons);

    const user = await prisma.user.update({
      where: { username },
      data: updateData,
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
