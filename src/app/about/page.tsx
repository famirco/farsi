"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Globe, ArrowLeft, Heart, Award, Users, BookOpen } from "lucide-react";

export default function AboutPage() {
  const [lang, setLang] = useState<"en" | "fa">("en");
  const [pageData, setPageData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedLang = localStorage.getItem("farsi_lang");
    if (savedLang === "fa" || savedLang === "en") setLang(savedLang);

    fetch("/api/pages?key=about")
      .then((res) => res.json())
      .then((data) => setPageData(data))
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
      <main className="max-w-4xl mx-auto px-6 py-12 flex-1 space-y-8">
        <div className="bg-white border border-[#e2e0d8] rounded-3xl p-8 sm:p-12 shadow-sm space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-[#eaf3de] text-[#3b6d11] rounded-2xl">
              <Heart className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] bg-[#e6f1fb] text-[#185fa5] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
                {lang === "fa" ? "درباره پلتفرم" : "Our Mission"}
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1f1e1c] mt-1">
                {isLoading ? "..." : (lang === "fa" ? pageData?.titleFa : pageData?.titleEn)}
              </h1>
            </div>
          </div>

          <div className="prose text-xs sm:text-sm text-[#6b6a63] leading-relaxed whitespace-pre-line border-t border-[#e2e0d8] pt-6">
            {isLoading ? "Loading..." : (lang === "fa" ? pageData?.contentFa : pageData?.contentEn)}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-white border border-[#e2e0d8] rounded-3xl p-6 text-center space-y-2 shadow-sm">
            <div className="p-3 bg-[#e6f1fb] text-[#185fa5] rounded-2xl w-fit mx-auto"><BookOpen className="w-5 h-5" /></div>
            <h3 className="font-bold text-sm">{lang === "fa" ? "درس‌های تعاملی" : "Interactive Lessons"}</h3>
            <p className="text-xs text-[#6b6a63]">{lang === "fa" ? "طراحی شده با متد دولینگو" : "Bite-sized micro learning"}</p>
          </div>
          <div className="bg-white border border-[#e2e0d8] rounded-3xl p-6 text-center space-y-2 shadow-sm">
            <div className="p-3 bg-[#faeeda] text-[#854f0b] rounded-2xl w-fit mx-auto"><Award className="w-5 h-5" /></div>
            <h3 className="font-bold text-sm">{lang === "fa" ? "تشخیص گفتار" : "Speech AI"}</h3>
            <p className="text-xs text-[#6b6a63]">{lang === "fa" ? "ارزیابی تلفظ فارسی" : "Real-time voice feedback"}</p>
          </div>
          <div className="bg-white border border-[#e2e0d8] rounded-3xl p-6 text-center space-y-2 shadow-sm">
            <div className="p-3 bg-purple-50 text-purple-700 rounded-2xl w-fit mx-auto"><Users className="w-5 h-5" /></div>
            <h3 className="font-bold text-sm">{lang === "fa" ? "خانواده و کودکان" : "Family & Children"}</h3>
            <p className="text-xs text-[#6b6a63]">{lang === "fa" ? "پشتیبانی از چند اکانت" : "Multi-profile support"}</p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-[#e2e0d8] py-6 text-center text-[#9a988f] text-xs">
        &copy; {new Date().getFullYear()} Farsiyar Persian Learning Platform.
      </footer>
    </div>
  );
}
