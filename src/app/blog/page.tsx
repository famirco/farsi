"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Globe, ArrowLeft, BookOpen, Calendar, ChevronRight, Sparkles, Volume2 } from "lucide-react";

export default function BlogListPage() {
  const [lang, setLang] = useState<"en" | "fa">("en");
  const [posts, setPosts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedLang = localStorage.getItem("farsi_lang");
    if (savedLang === "fa" || savedLang === "en") setLang(savedLang);

    fetch("/api/blog")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setPosts(data);
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  const toggleLanguage = () => {
    const nextLang = lang === "en" ? "fa" : "en";
    setLang(nextLang);
    localStorage.setItem("farsi_lang", nextLang);
  };

  return (
    <div className="min-h-screen bg-[#faf9f6] text-[#1f1e1c] flex flex-col justify-between" dir={lang === "fa" ? "rtl" : "ltr"}>
      {/* Header */}
      <header className="w-full border-b border-[#e2e0d8] bg-white/90 backdrop-blur-md sticky top-0 z-40 shadow-xs">
        <div className="max-w-6xl mx-auto px-6 py-3 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2.5 group">
            <img src="/logo.png" alt="Farsiyar Logo" className="w-8 h-8 object-contain" style={{ mixBlendMode: "multiply" }} />
            <span className="font-bold text-[#1f1e1c] text-lg tracking-tight">Farsiyar</span>
          </Link>

          <div className="flex items-center gap-3">
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-[#e2e0d8] bg-white hover:bg-[#f4f2ec] transition-colors text-xs font-semibold shadow-2xs cursor-pointer"
            >
              <Globe className="w-3.5 h-3.5 text-[#185fa5]" />
              <span>{lang === "en" ? "فارسی" : "English"}</span>
            </button>
            <Link href="/" className="p-2 hover:bg-[#f4f2ec] rounded-xl transition-all">
              <ArrowLeft className="w-4 h-4 text-[#6b6a63]" />
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-12 flex-1 space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-[10px] bg-[#e6f1fb] text-[#185fa5] px-3 py-1 rounded-full font-bold uppercase tracking-wider">
            {lang === "fa" ? "وبلاگ و مقالات آموزشی" : "Persian Learning Blog"}
          </span>
          <h1 className="text-3xl font-extrabold text-[#1f1e1c]">
            {lang === "fa" ? "مقالات، داستان‌ها و آیین‌های زبان فارسی" : "Articles, Stories & Cultural Insights"}
          </h1>
          <p className="text-xs sm:text-sm text-[#6b6a63]">
            {lang === "fa" ? "محتوای مفید آموزشی و فرهنگی برای یادگیری بهتر زبان فارسی" : "Guides, audio stories, and cultural tips for heritage learners."}
          </p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-[#378add] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : posts.length === 0 ? (
          <div className="bg-white border border-[#e2e0d8] rounded-3xl p-12 text-center text-[#6b6a63]">
            <BookOpen className="w-10 h-10 mx-auto mb-2 text-[#9a988f]" />
            <h3 className="font-bold text-base mb-1">{lang === "fa" ? "هنوز مقاله‌ای ثبت نشده است" : "No Blog Posts Yet"}</h3>
            <p className="text-xs">{lang === "fa" ? "به زودی مقالات جدید در پنل ادمین اضافه خواهند شد." : "New articles will be added via the Admin Panel soon."}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {posts.map((post) => (
              <article key={post.id} className="bg-white border border-[#e2e0d8] rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
                <div>
                  {post.coverImage ? (
                    <img src={post.coverImage} alt={post.titleEn} className="w-full h-48 object-cover" />
                  ) : (
                    <div className="w-full h-48 bg-gradient-to-tr from-[#e6f1fb] to-[#faeeda] flex items-center justify-center text-[#185fa5]">
                      <BookOpen className="w-12 h-12" />
                    </div>
                  )}
                  <div className="p-6 space-y-3">
                    <div className="flex items-center justify-between text-[11px] text-[#6b6a63]">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(post.createdAt).toLocaleDateString(lang === "fa" ? "fa-IR" : "en-US")}
                      </span>
                      {post.audioUrl && (
                        <span className="flex items-center gap-1 text-[#378add] font-bold">
                          <Volume2 className="w-3.5 h-3.5" />
                          <span>Audio</span>
                        </span>
                      )}
                    </div>
                    <h2 className="font-bold text-base text-[#1f1e1c] line-clamp-2">
                      {lang === "fa" ? post.titleFa : post.titleEn}
                    </h2>
                    <p className="text-xs text-[#6b6a63] line-clamp-3 leading-relaxed">
                      {lang === "fa" ? post.contentFa : post.contentEn}
                    </p>
                  </div>
                </div>

                <div className="px-6 pb-6 pt-0">
                  <Link
                    href={`/blog/${post.slug}`}
                    className="w-full py-2.5 bg-[#faf9f6] hover:bg-[#f4f2ec] text-[#1f1e1c] rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 border border-[#e2e0d8]"
                  >
                    <span>{lang === "fa" ? "مطالعه مقاله" : "Read Article"}</span>
                    <ChevronRight className={`w-4 h-4 ${lang === "fa" ? "rotate-180" : ""}`} />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-[#e2e0d8] py-6 text-center text-[#9a988f] text-xs">
        &copy; {new Date().getFullYear()} Farsiyar Persian Learning Platform.
      </footer>
    </div>
  );
}
