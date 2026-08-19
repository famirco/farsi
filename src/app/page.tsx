"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Globe, ArrowRight, Sparkles, Star, Award, BookOpen } from "lucide-react";

export default function Home() {
  const router = useRouter();
  const [lang, setLang] = useState<"en" | "fa">("en");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [savedUser, setSavedUser] = useState("");

  useEffect(() => {
    const user = localStorage.getItem("farsi_username");
    if (user) {
      setSavedUser(user);
    }
    const savedLang = localStorage.getItem("farsi_lang");
    if (savedLang === "fa" || savedLang === "en") {
      setLang(savedLang);
    }
  }, []);

  const toggleLanguage = () => {
    const nextLang = lang === "en" ? "fa" : "en";
    setLang(nextLang);
    localStorage.setItem("farsi_lang", nextLang);
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!username.trim() || !password.trim()) return;

    setIsLoading(true);
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: username.trim(),
          password: password.trim(),
        }),
      });

      if (res.ok) {
        const user = await res.json();
        localStorage.setItem("farsi_username", user.username);
        router.push("/dashboard");
      } else {
        const data = await res.json();
        setError(data.error || "Invalid username or password");
      }
    } catch (err) {
      console.error(err);
      setError("Server connection failed. Try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const t = {
    en: {
      welcome: "Welcome to Farsiyar",
      subWelcome: "Bilingual Persian Learning Platform",
      loginTitle: "Sign In",
      loginSubtitle: "Enter test credentials to start practicing",
      usernameLabel: "Username",
      passwordLabel: "Password",
      btnLabel: "Continue",
      errorMsg: "Invalid credentials (use student/student or admin/admin)",
      helpText: "Test Accounts: student/student (Student Role) or admin/admin (Admin Role)",
      feature1Title: "Duolingo-style Path",
      feature1Desc: "Bite-sized interactive lessons arranged in a visual roadmap.",
      feature2Title: "Voice Recognition",
      feature2Desc: "Speak Persian and get instant feedback on your pronunciation.",
      feature3Title: "Streaks & Gamification",
      feature3Desc: "Keep your daily streak alive and earn XP rewards as you learn.",
      badge: "Heritage Persian Platform",
    },
    fa: {
      welcome: "به فارسی یار خوش آمدید",
      subWelcome: "پلتفرم دو زبانه آموزش زبان فارسی",
      loginTitle: "ورود به سیستم",
      loginSubtitle: "نام کاربری و رمز عبور آزمایشی را وارد کنید",
      usernameLabel: "نام کاربری",
      passwordLabel: "رمز عبور",
      btnLabel: "ورود و ادامه",
      errorMsg: "نام کاربری یا رمز عبور اشتباه است (از student/student یا admin/admin استفاده کنید)",
      helpText: "حساب‌های آزمایشی: student/student (دانش‌آموز) یا admin/admin (مدیر)",
      feature1Title: "مسیر یادگیری مشابه دولینگو",
      feature1Desc: "درس‌های کوتاه و جذاب در یک نقشه راه بصری و سرگرم‌کننده.",
      feature2Title: "تشخیص گفتار هوشمند",
      feature2Desc: "فارسی صحبت کنید و بلافاصله بازخورد تلفظ خود را دریافت کنید.",
      feature3Title: "سیستم امتیاز و استریک",
      feature3Desc: "روزهای متوالی یادگیری خود را حفظ کنید و امتیاز (XP) بگیرید.",
      badge: "پلتفرم آموزش فارسی میراثی",
    },
  };

  return (
    <div className="min-h-screen bg-[#faf9f6] text-[#1f1e1c] flex flex-col justify-between">
      {/* Header */}
      <header className="w-full border-b border-[#e2e0d8] bg-white">
        <div className="max-w-5xl mx-auto px-6 py-2.5 flex justify-between items-center">
          <div></div>

          <div className="flex items-center gap-3">
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-[#e2e0d8] bg-white hover:bg-[#f4f2ec] transition-colors text-xs font-semibold"
            >
              <Globe className="w-3.5 h-3.5 text-[#185fa5]" />
              {lang === "en" ? "فارسی" : "English"}
            </button>
          </div>
        </div>
      </header>

      {/* Main Area */}
      <main className="max-w-5xl mx-auto w-full px-6 pt-0 pb-12 flex-1 flex flex-col md:flex-row items-start justify-center gap-12 mt-0">
        {/* Left Side: Info */}
        <div className={`flex-1 space-y-4 text-center ${lang === "fa" ? "md:text-right" : "md:text-left"}`}>
          {/* Large Logo above Welcome */}
          <div className="flex md:justify-start justify-center mt-0">
            <img 
              src="/logo.png" 
              alt="Farsiyar Big Logo" 
              className="w-56 h-56 object-contain" 
              style={{ mixBlendMode: "multiply" }}
            />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#e6f1fb] text-[#185fa5] text-xs font-semibold uppercase tracking-wider">
            <Star className="w-3.5 h-3.5 fill-[#185fa5]" />
            {t[lang].badge}
          </div>

          <h1 className="text-3xl md:text-5xl font-bold leading-tight">
            {t[lang].welcome}
          </h1>
          <p className={`text-[#6b6a63] text-sm md:text-base max-w-xl ${lang === "fa" ? "md:ml-auto" : ""}`}>
            {lang === "en" 
              ? "Learn Persian (Farsi) step-by-step with interactive quizzes, speaking practice, and gamified streaks. Perfect for diaspora family members!"
              : "زبان فارسی را قدم به قدم با آزمون‌های تعاملی، تمرین تلفظ و استریک‌های روزانه یاد بگیرید. عالی برای فرزندان و خانواده‌های مقیم خارج از کشور!"
            }
          </p>

          {/* Features */}
          <div className={`space-y-3 max-w-md pt-4 hidden md:block ${lang === "fa" ? "text-right md:ml-auto" : "text-left"}`}>
            <div className={`flex gap-3 ${lang === "fa" ? "flex-row-reverse" : ""}`}>
              <div className="p-2 bg-[#eaf3de] rounded-xl text-[#3b6d11] shrink-0"><BookOpen className="w-5 h-5" /></div>
              <div>
                <h4 className="font-bold text-sm">{t[lang].feature1Title}</h4>
                <p className="text-xs text-[#6b6a63]">{t[lang].feature1Desc}</p>
              </div>
            </div>
            <div className={`flex gap-3 ${lang === "fa" ? "flex-row-reverse" : ""}`}>
              <div className="p-2 bg-[#e6f1fb] rounded-xl text-[#185fa5] shrink-0"><Globe className="w-5 h-5" /></div>
              <div>
                <h4 className="font-bold text-sm">{t[lang].feature2Title}</h4>
                <p className="text-xs text-[#6b6a63]">{t[lang].feature2Desc}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Login Form Card */}
        <div className="phone border border-[#e2e0d8] shadow-md bg-white md:mt-16">
          <div className="text-center mb-6">
            <p className="font-bold text-lg mb-1">{t[lang].loginTitle}</p>
            <p className="text-xs text-[#6b6a63]">{t[lang].loginSubtitle}</p>
          </div>

          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className={`block text-xs font-semibold text-[#6b6a63] mb-1 ${lang === "fa" ? "text-right" : "text-left"}`}>{t[lang].usernameLabel}</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. student"
                className={`w-full px-3.5 py-2.5 rounded-xl border border-[#c9c7bd] bg-[#faf9f6] text-sm text-[#1f1e1c] focus:outline-none focus:border-[#378add] transition-all ${lang === "fa" ? "text-right" : "text-left"}`}
                required
              />
            </div>

            <div>
              <label className={`block text-xs font-semibold text-[#6b6a63] mb-1 ${lang === "fa" ? "text-right" : "text-left"}`}>{t[lang].passwordLabel}</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="e.g. student"
                className={`w-full px-3.5 py-2.5 rounded-xl border border-[#c9c7bd] bg-[#faf9f6] text-sm text-[#1f1e1c] focus:outline-none focus:border-[#378add] transition-all ${lang === "fa" ? "text-right" : "text-left"}`}
                required
              />
            </div>

            {error && (
              <p className="text-xs text-[#854f0b] bg-[#faeeda] p-2.5 rounded-xl border border-[#ba7517]/20 font-medium">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-[#1f1e1c] hover:bg-black text-white text-center rounded-xl font-semibold text-sm transition-all cursor-pointer shadow-sm"
            >
              {isLoading ? "..." : t[lang].btnLabel}
            </button>
          </form>

          <button
            type="button"
            onClick={() => router.push("/onboarding")}
            className="w-full py-3 bg-[#e6f1fb] hover:bg-[#d0e5f7] text-[#185fa5] text-center rounded-xl font-semibold text-sm transition-all cursor-pointer border border-[#378add]/20 mt-3"
          >
            {lang === "en" ? "New to Farsiyar? Onboarding & Test" : "ثبت‌نام و تعیین سطح جدید"}
          </button>



          {savedUser && (
            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={() => router.push("/dashboard")}
                className="text-xs text-[#185fa5] font-semibold hover:underline"
              >
                Go to Dashboard as {savedUser}
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 border-t border-[#e2e0d8] text-center text-[#9a988f] text-xs bg-white">
        &copy; <span style={{ fontFamily: 'Inter, sans-serif' }}>{new Date().getFullYear()}</span> Farsiyar Persian Learning App.
      </footer>
    </div>
  );
}
