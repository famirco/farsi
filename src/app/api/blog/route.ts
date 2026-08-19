import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const posts = await prisma.blogPost.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(posts);
  } catch (error: any) {
    console.error("Fetch blog posts error:", error);
    return NextResponse.json({ error: "Failed to fetch blog posts" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { titleEn, titleFa, contentEn, contentFa, coverImage, audioUrl, published = true } = body;

    if (!titleEn || !titleFa || !contentEn || !contentFa) {
      return NextResponse.json({ error: "Title and Content in both languages are required" }, { status: 400 });
    }

    // Generate unique slug from English title
    let slug = titleEn
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");
    
    if (!slug) slug = `post-${Date.now()}`;

    // Ensure unique slug
    const existing = await prisma.blogPost.findUnique({ where: { slug } });
    if (existing) {
      slug = `${slug}-${Date.now().toString().slice(-4)}`;
    }

    const post = await prisma.blogPost.create({
      data: {
        slug,
        titleEn,
        titleFa,
        contentEn,
        contentFa,
        coverImage: coverImage || null,
        audioUrl: audioUrl || null,
        published: Boolean(published),
      },
    });

    return NextResponse.json(post, { status: 201 });
  } catch (error: any) {
    console.error("Create blog post error:", error);
    return NextResponse.json({ error: "Failed to create blog post", details: error.message }, { status: 500 });
  }
}
