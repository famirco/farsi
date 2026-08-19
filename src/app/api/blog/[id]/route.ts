import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const post = await prisma.blogPost.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
      },
    });

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    return NextResponse.json(post);
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to fetch post" }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { titleEn, titleFa, contentEn, contentFa, coverImage, audioUrl, published } = body;

    const updated = await prisma.blogPost.update({
      where: { id },
      data: {
        titleEn,
        titleFa,
        contentEn,
        contentFa,
        coverImage: coverImage || null,
        audioUrl: audioUrl || null,
        published: published !== undefined ? Boolean(published) : undefined,
      },
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error("Update blog post error:", error);
    return NextResponse.json({ error: "Failed to update post" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.blogPost.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Delete blog post error:", error);
    return NextResponse.json({ error: "Failed to delete post" }, { status: 500 });
  }
}
