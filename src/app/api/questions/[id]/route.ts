import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { unlink } from "fs/promises";
import { join } from "path";

async function deleteLocalFiles(urls: string[]) {
  for (const url of urls) {
    if (url && url.startsWith("/uploads/")) {
      try {
        const filePath = join(process.cwd(), "public", url);
        await unlink(filePath);
      } catch (e) {
        console.error(`Failed to delete local file: ${url}`, e);
      }
    }
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { order, type, promptEn, promptFa, options, correctAnswer } = body;

    // Get current question state to find if images changed
    const currentQ = await prisma.question.findUnique({ where: { id } });
    if (currentQ) {
      const newOpts = typeof options === "string" ? JSON.parse(options || "[]") : (options || []);
      let oldOpts: string[] = [];
      try {
        oldOpts = JSON.parse(currentQ.options || "[]");
      } catch (e) {}

      // Delete old files that are not in the new options list
      const filesToDelete = oldOpts.filter(o => !newOpts.includes(o));
      await deleteLocalFiles(filesToDelete);
    }

    const question = await prisma.question.update({
      where: { id },
      data: {
        order: order !== undefined ? parseInt(String(order)) : undefined,
        type,
        promptEn,
        promptFa,
        options: typeof options === "string" ? options : JSON.stringify(options || []),
        correctAnswer,
      },
    });

    return NextResponse.json(question);
  } catch (error) {
    console.error("Error updating question:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const currentQ = await prisma.question.findUnique({ where: { id } });
    if (currentQ) {
      let oldOpts: string[] = [];
      try {
        oldOpts = JSON.parse(currentQ.options || "[]");
      } catch (e) {}
      
      // Delete all uploaded images for this question
      await deleteLocalFiles(oldOpts);
    }

    await prisma.question.delete({
      where: { id },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting question:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
