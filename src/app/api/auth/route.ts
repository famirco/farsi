import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json({ error: "Username and password are required" }, { status: 400 });
    }

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

    if (!user || user.password !== password) {
      return NextResponse.json({ error: "Invalid username or password" }, { status: 401 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Auth error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
