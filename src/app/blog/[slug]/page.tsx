"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Globe, ArrowLeft, Calendar, Volume2, BookOpen } from "lucide-react";

export default function BlogDetailPage() {
  const { slug } = useParams();
  const [lang, setLang] = useState<"en" | "fa">("en");
  const [post, setPost] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedLang = localStorage.getItem("farsi_lang");
    if (savedLang === "fa" || savedLang === "en") setLang(savedLang);

    if (slug) {
      fetch(`/api/blog/${slug}`)
        .then((res) => res.json())
        .then((data) => setPost(data))
        .catch(console.error)
        .finally(() => setIsLoading(false));
    }
  }, [slug]);

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
            <Link href="/blog" className="p-2 hover:bg-[#f4f2ec] rounded-xl transition-all">
              <ArrowLeft className="w-4 h-4 text-[#6b6a63]" />
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-12 flex-1">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-[#378add] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : !post || post.error ? (
          <div className="bg-white border border-[#e2e0d8] rounded-3xl p-12 text-center text-[#6b6a63]">
            <h2 className="text-xl font-bold mb-2">{lang === "fa" ? "مقاله مورد نظر یافت نشد" : "Article Not Found"}</h2>
            <Link href="/blog" className="text-xs text-[#185fa5] font-bold hover:underline">
              {lang === "fa" ? "بازگشت به لیست مقالات" : "Back to Blog List"}
            </Link>
          </div>
        ) : (
          <article className="bg-white border border-[#e2e0d8] rounded-3xl overflow-hidden shadow-sm space-y-8 p-8 sm:p-12">
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-xs text-[#6b6a63]">
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {new Date(post.createdAt).toLocaleDateString(lang === "fa" ? "fa-IR" : "en-US")}
                </span>
                <span className="text-[10px] bg-[#e6f1fb] text-[#185fa5] px-2.5 py-0.5 rounded-full font-bold uppercase">
                  Farsiyar Blog
                </span>
              </div>

              <h1 className="text-2xl sm:text-4xl font-extrabold text-[#1f1e1c] leading-tight">
                {lang === "fa" ? post.titleFa : post.titleEn}
              </h1>
            </div>

            {post.coverImage && (
              <img src={post.coverImage} alt={post.titleEn} className="w-full h-80 object-cover rounded-2xl border border-[#e2e0d8]" />
            )}

            {/* Audio Player if present */}
            {post.audioUrl && (
              <div className="bg-[#e6f1fb] border border-[#378add]/20 p-4 rounded-2xl space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-[#185fa5]">
                  <Volume2 className="w-4 h-4" />
                  <span>{lang === "fa" ? "پادکست / فایل صوتی مقاله:" : "Listen to Audio Podcast:"}</span>
                </div>
                <audio controls className="w-full h-10 accent-[#378add]">
                  <source src={post.audioUrl} type="audio/mpeg" />
                  Your browser does not support the audio element.
                </audio>
              </div>
            )}

            {/* Content Body */}
            <div className="prose max-w-none text-sm text-[#1f1e1c] leading-relaxed whitespace-pre-line border-t border-[#e2e0d8] pt-6">
              {lang === "fa" ? post.contentFa : post.contentEn}
            </div>
          </article>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-[#e2e0d8] py-6 text-center text-[#9a988f] text-xs">
        &copy; {new Date().getFullYear()} Farsiyar Persian Learning Platform.
      </footer>
    </div>
  );
}
