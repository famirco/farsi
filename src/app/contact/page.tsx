"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Globe, ArrowLeft, Mail, MessageSquare, PhoneCall, ShieldCheck, CheckCircle2 } from "lucide-react";

export default function ContactPage() {
  const [lang, setLang] = useState<"en" | "fa">("en");
  const [pageData, setPageData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedLang = localStorage.getItem("farsi_lang");
    if (savedLang === "fa" || savedLang === "en") setLang(savedLang);

    fetch("/api/pages?key=contact")
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
        {/* Manual Payment & Contact Banner */}
        <div className="bg-[#e6f1fb] border border-[#378add]/20 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center sm:text-start">
            <span className="text-[10px] bg-[#378add] text-white px-2.5 py-0.5 rounded-full font-bold uppercase">
              {lang === "fa" ? "پرداخت و فعال‌سازی دستی" : "Manual Activation & Payment"}
            </span>
            <h2 className="text-xl font-bold text-[#1f1e1c]">
              {lang === "fa" ? "جهت باز کردن ترم‌ها و خرید بسته‌های آموزشی" : "Want to Unlock Premium Terms & Courses?"}
            </h2>
            <p className="text-xs text-[#185fa5] leading-relaxed">
              {lang === "fa" 
                ? "پرداخت‌های پلتفرم به صورت مستقیم با مدیریت هماهنگ می‌شوند. برای فعال‌سازی آنی حساب، با پشتیبانی تماس بگیرید." 
                : "Course payments are completed directly via manual admin confirmation. Contact support to activate your account."}
            </p>
          </div>
          <a
            href="mailto:support@farsiyar.com"
            className="px-6 py-3 bg-[#1f1e1c] hover:bg-black text-white rounded-xl text-xs font-bold transition-all shrink-0 shadow-sm"
          >
            {lang === "fa" ? "ارسال پیام به مدیریت" : "Contact Support"}
          </a>
        </div>

        <div className="bg-white border border-[#e2e0d8] rounded-3xl p-8 sm:p-12 shadow-sm space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-[#faeeda] text-[#854f0b] rounded-2xl">
              <MessageSquare className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] bg-[#e6f1fb] text-[#185fa5] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
                {lang === "fa" ? "پشتیبانی" : "Support"}
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1f1e1c] mt-1">
                {isLoading ? "..." : (lang === "fa" ? pageData?.titleFa : pageData?.titleEn)}
              </h1>
            </div>
          </div>

          <div className="prose-content text-xs sm:text-sm text-[#6b6a63] leading-relaxed border-t border-[#e2e0d8] pt-6 max-w-full overflow-hidden">
            {isLoading ? "Loading..." : (lang === "fa" ? pageData?.contentFa : pageData?.contentEn)}
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
