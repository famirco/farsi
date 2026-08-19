import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Default content fallback if not created yet in DB
const DEFAULT_PAGES: Record<string, { titleEn: string; titleFa: string; contentEn: string; contentFa: string }> = {
  about: {
    titleEn: "About Farsiyar",
    titleFa: "درباره فارسیار",
    contentEn: "Farsiyar is an interactive bilingual Persian learning platform designed specifically for heritage learners, diaspora families, and children worldwide. Our mission is to bridge language and cultural gaps through gamified micro-lessons, speech recognition, and authentic Persian stories.",
    contentFa: "فارسیار یک پلتفرم دو زبانه هوشمند برای آموزش زبان و فرهنگ اصیل ایرانی به فرزندان، زبان‌آموزان میراثی و ایرانیان مقیم خارج از کشور است. هدف ما پیوند دادن نسل‌ها از طریق درس‌های کوتاه تعاملی، تشخیص گفتار هوشمند و داستان‌های ایرانی است.",
  },
  contact: {
    titleEn: "Contact & Admin Support",
    titleFa: "تماس با ما و پشتیبانی مدیریت",
    contentEn: "Have questions about course subscriptions, account activation, or custom terms? Reach out directly to our admin team.\n\nEmail: support@farsiyar.com\nTelegram/WhatsApp: +1 (555) 019-2834\nWorking Hours: Monday - Friday, 9:00 AM - 6:00 PM EST",
    contentFa: "ارتباط مستقیم با مدیریت جهت فعال‌سازی حساب، خرید بسته‌های ویژه و پاسخ به سوالات آموزشی:\n\nایمیل پشتیبانی: support@farsiyar.com\nواتساپ / تلگرام پشتیبانی: ۰۱۹-۲۸۳۴ (۵۵۵) ۱+\nساعات پاسخگویی: شنبه تا چهارشنبه - ۹ صبح تا ۶ عصر",
  },
  privacy: {
    titleEn: "Privacy Policy & Terms of Service",
    titleFa: "قوانین و حریم خصوصی کاربران",
    contentEn: "Your privacy is important to us. Farsiyar collects only essential account data (username, streak, progress XP) to deliver personalized learning experiences. We do not sell your personal information or share voice recordings with third parties.",
    contentFa: "حفظ حریم خصوصی شما اولویت ماست. فارسیار تنها اطلاعات ضروری حساب کاربر (نام کاربری، امتیازات و پیشرفت درسی) را ذخیره می‌کند و اطلاعات یا صداهای ضبط شده به هیچ وجه با شخص ثالث به اشتراک گذاشته نمی‌شوند.",
  },
};

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const key = searchParams.get("key");

    if (key) {
      const page = await prisma.siteContent.findUnique({ where: { key } });
      if (page) return NextResponse.json(page);
      
      const fallback = DEFAULT_PAGES[key] || {
        titleEn: key.toUpperCase(),
        titleFa: key,
        contentEn: "Content coming soon...",
        contentFa: "محتوا به زودی اضافه می‌شود...",
      };
      return NextResponse.json({ key, ...fallback });
    }

    const allPages = await prisma.siteContent.findMany();
    return NextResponse.json(allPages);
  } catch (error: any) {
    console.error("Fetch site content error:", error);
    return NextResponse.json({ error: "Failed to fetch site content" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { key, titleEn, titleFa, contentEn, contentFa } = body;

    if (!key || !titleEn || !titleFa || !contentEn || !contentFa) {
      return NextResponse.json({ error: "Missing required page content fields" }, { status: 400 });
    }

    const updated = await prisma.siteContent.upsert({
      where: { key },
      update: { titleEn, titleFa, contentEn, contentFa },
      create: { key, titleEn, titleFa, contentEn, contentFa },
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error("Save site content error:", error);
    return NextResponse.json({ error: "Failed to save site content" }, { status: 500 });
  }
}
