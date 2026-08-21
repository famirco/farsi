import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const parentUserId = searchParams.get("parentUserId");

  try {
    if (parentUserId) {
      const children = await prisma.user.findMany({
        where: { parentUserId },
        orderBy: { createdAt: "desc" },
      });
      return NextResponse.json(children);
    }

    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, unlockedUntilLessonId, accountType, whyLearning, password, username, parentUserId, skills, unlockedTerms, childProfile } = body;

    if (!userId && !username) {
      return NextResponse.json({ error: "User identifier is required" }, { status: 400 });
    }

    // New user creation
    if (!userId && username) {
      const newUser = await prisma.user.create({
        data: {
          username,
          password: password || "password",
          accountType: accountType || (parentUserId ? "CHILD" : "ADULT_HERITAGE"),
          parentUserId: parentUserId || null,
          childProfile: childProfile ? (typeof childProfile === "string" ? childProfile : JSON.stringify(childProfile)) : null,
          xp: 0,
          streak: 0,
        },
      });
      return NextResponse.json(newUser);
    }

    const updateData: any = {};
    if (unlockedUntilLessonId !== undefined) updateData.unlockedUntilLessonId = unlockedUntilLessonId || null;
    if (accountType !== undefined) updateData.accountType = accountType;
    if (whyLearning !== undefined) updateData.whyLearning = whyLearning;
    if (childProfile !== undefined) updateData.childProfile = typeof childProfile === "string" ? childProfile : JSON.stringify(childProfile);
    if (skills !== undefined) updateData.skills = typeof skills === "string" ? skills : JSON.stringify(skills);
    if (unlockedTerms !== undefined) updateData.unlockedTerms = typeof unlockedTerms === "string" ? unlockedTerms : JSON.stringify(unlockedTerms);

    const user = await prisma.user.update({
      where: { id: userId },
      data: updateData,
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error("Error updating user progress:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
