"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Globe, ArrowRight, Sparkles, Star, Award, BookOpen, CheckCircle2, ChevronDown, HelpCircle, Layers, Mic, Users, ShieldCheck, Heart } from "lucide-react";

export default function Home() {
  const router = useRouter();
  const [lang, setLang] = useState<"en" | "fa">("en");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  useEffect(() => {
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
      subWelcome: "Master Persian Naturally Through Gamified Micro-Lessons",
      tagline: "Designed specifically for diaspora families, heritage adult learners, and children.",
      loginTitle: "Sign In",
      loginSubtitle: "Enter your account details to start practicing",
      usernameLabel: "Username",
      passwordLabel: "Password",
      btnLabel: "Continue",
      errorMsg: "Invalid credentials",
      helpText: "Enter your registered username and password",
      quickDashboard: "Continue to Dashboard as",
      badge: "HERITAGE PERSIAN PLATFORM",
      navCourses: "Courses",
      navMethodology: "Methodology",
      navWhy: "Why Farsiyar",
      navFaq: "FAQ",
      navBlog: "Blog",
      navAbout: "About Us",
      navContact: "Contact",
      navPrivacy: "Privacy",
      signInBtn: "Sign In",
      newToFarsi: "New to Farsiyar? Onboarding & Test",
      feature1Title: "Gamified Learning Path",
      feature1Desc: "Bite-sized interactive lessons arranged in a visual roadmap with rewards and daily streaks.",
      feature2Title: "Voice & Speech Recognition",
      feature2Desc: "Speak Persian and get instant feedback on your pronunciation with interactive tests.",
      feature3Title: "Heritage & Cultural Context",
      feature3Desc: "Learn conversational Persian alongside cultural stories, traditional terms, and family topics.",
      feature4Title: "Progress & Skill Analytics",
      feature4Desc: "Track your Listening, Speaking, Reading, and Writing breakdown in real time.",
      methodsTitle: "How Farsiyar Works",
      methodsSub: "A proven 3-step learning system tailored for heritage Persian learners",
      step1Title: "Placement & Assessment",
      step1Desc: "Custom onboarding questionnaire evaluates your background, alphabet knowledge, and home language usage.",
      step2Title: "Daily 5-Minute Micro-Lessons",
      step2Desc: "Complete interactive bite-sized quizzes: image matching, audio stories, sentence ordering, and voice exercises.",
      step3Title: "Real-World Speaking Fluency",
      step3Desc: "Build confidence to speak comfortably with family members, elders, and native speakers.",
      curriculumTitle: "Structured Course Curriculum",
      curriculumSub: "From absolute foundations to advanced heritage conversation",
      term1Title: "Term 1: Foundations & Alphabet",
      term1Desc: "Essential greetings, family members, everyday vocabulary, and conversational foundations.",
      term2Title: "Term 2: Express Yourself",
      term2Desc: "Home activities, food & cuisine, travel terms, and practical daily dialogues.",
      term3Title: "Term 3: Literature & Heritage",
      term3Desc: "Persian poetry traditions, Norouz cultural heritage, and advanced expression.",
      faqTitle: "Frequently Asked Questions",
      faqSub: "Everything you need to know about learning Persian on Farsiyar",
      faq1Q: "Who is Farsiyar designed for?",
      faq1A: "Farsiyar is crafted specifically for heritage Persian learners, diaspora family members, and children who want to connect with their roots or learn Persian from scratch.",
      faq2Q: "Do I need to know the Persian alphabet first?",
      faq2A: "No! Farsiyar includes both English transliteration and Persian script, allowing absolute beginners to start speaking from day one.",
      faq3Q: "How does the voice recognition speech practice work?",
      faq3A: "In speaking lessons, you listen to a native pronunciation audio and repeat it aloud into your microphone. Our AI engine verifies your response instantly.",
      faq4Q: "Can parents monitor their children's progress?",
      faq4A: "Yes! Parent accounts allow creating child profiles, tracking completed lessons, XP earnings, and unlocking course terms.",
      footerDesc: "Interactive bilingual Persian learning platform for heritage learners, diaspora families, and children worldwide.",
      footerCourse1: "Foundations & Alphabet",
      footerCourse2: "Daily Conversation",
      footerCourse3: "Heritage & Culture",
      footerPlatform: "Platform & Community",
      footerAccount: "Account & Access",
      footerCopyright: "Farsiyar Persian Learning App. All rights reserved.",
    },
    fa: {
      welcome: "به فارسی یار خوش آمدید",
      subWelcome: "آموزش هوشمند و گام‌به‌گام زبان فارسی برای تمام سنین",
      tagline: "طراحی ویژه برای خانواده‌های ایرانی خارج از کشور، زبان‌آموزان میراثی و کودکان.",
      loginTitle: "ورود به سیستم",
      loginSubtitle: "نام کاربری و رمز عبور خود را وارد کنید",
      usernameLabel: "نام کاربری",
      passwordLabel: "رمز عبور",
      btnLabel: "ورود و ادامه",
      errorMsg: "نام کاربری یا رمز عبور اشتباه است",
      helpText: "نام کاربری و رمز عبور ثبت شده خود را وارد کنید",
      quickDashboard: "ورود سریع به داشبورد به عنوان",
      badge: "پلتفرم آموزش فارسی میراثی",
      navCourses: "دوره‌های آموزشی",
      navMethodology: "روش آموزش",
      navWhy: "چرا فارسیار",
      navFaq: "سوالات متداول",
      navBlog: "وبلاگ",
      navAbout: "درباره ما",
      navContact: "تماس با ما",
      navPrivacy: "حریم خصوصی",
      signInBtn: "ورود به حساب",
      newToFarsi: "ثبت‌نام و تعیین سطح جدید",
      feature1Title: "مسیر یادگیری بازی‌وار",
      feature1Desc: "درس‌های کوتاه ۵ دقیقه‌ای همراه با سیستم استریک، امتیاز و نقشه راه بصری.",
      feature2Title: "تشخیص هوشمند تلفظ",
      feature2Desc: "فارسی صحبت کنید و بلافاصله بازخورد دقیق تلفظ خود را دریافت کنید.",
      feature3Title: "محتوای فرهنگی و اصیل",
      feature3Desc: "یادگیری مکالمات کاربردی همراه با داستان‌ها، اصطلاحات اصیل و موضوعات خانوادگی.",
      feature4Title: "تحلیل متمرکز مهارت‌ها",
      feature4Desc: "ارزیابی و گزارش لحظه‌ای از پیشرفت در مهارت‌های شنیداری، گفتاری و خوانداری.",
      methodsTitle: "نحوه کار فارسیار",
      methodsSub: "سیستم آموزش ۳ مرحله‌ای هماهنگ با نیازهای زبان‌آموزان میراثی",
      step1Title: "۱. تعیین سطح و ارزیابی اولیه",
      step1Desc: "پرسشنامه هوشمند آنبوردینگ سطح اولیه، میزان آشنایی با الفبا و زبان مادری شما را می‌سنجد.",
      step2Title: "۲. درس‌های روزانه ۵ دقیقه‌ای",
      step2Desc: "انجام تمرین‌های تعاملی شامل تطبیق تصویر، داستان صوتی، مرتب‌سازی کلمات و آزمون گفتاری.",
      step3Title: "۳. تسلط بر مکالمه واقعی",
      step3Desc: "ایجاد اعتماد به نفس برای گفتگو و مکالمه روان با اعضای خانواده و بزرگان.",
      curriculumTitle: "سرفصل‌ها و ترم‌های آموزشی",
      curriculumSub: "از پایه و الفبا تا مکالمات پیشرفته و ادبیات فارسی",
      term1Title: "ترم ۱: پایه‌ها و احوالپرسی",
      term1Desc: "آموزش سلام و احوالپرسی، اعضای خانواده، واژگان روزمره و جمله‌سازی‌های پایه.",
      term2Title: "ترم ۲: ابراز وجود و زندگی روزمره",
      term2Desc: "فعالیت‌های خانه، غذاها و فرهنگ سفره، سفر و گفتگوی روزمره کاربردی.",
      term3Title: "ترم ۳: ادبیات و فرهنگ ایران",
      term3Desc: "آشنایی با شعر و ادبیات اصیل، آیین‌های نوروز و اصطلاحات زبان فارسی.",
      faqTitle: "سوالات متداول",
      faqSub: "پاسخ به سوالات رایج شما درباره پلتفرم آموزشی فارسیار",
      faq1Q: "فارسیار برای چه کسانی مناسب است؟",
      faq1A: "فارسیار به طور ویژه برای ایرانیان خارج از کشور، فرزندان و زبان‌آموزان میراثی که می‌خواهند زبان فارسی را به صورت اصولی و آسان بیاموزند طراحی شده است.",
      faq2Q: "آیا حتماً باید قبل از شروع الفبای فارسی را بلد باشم؟",
      faq2A: "خیر! تمام درس‌ها دارای آواشناسی و تلفظ انگلیسی (Transliteration) هستند تا زبان‌آموزان مبتدی نیز از روز اول بتوانند شروع به مکالمه کنند.",
      faq3Q: "سیستم تشخیص هوشمند تلفظ چگونه کار می‌کند؟",
      faq3A: "در تمرین‌های گفتاری، صدای تلفظ واقعی را می‌شنوید و سپس آن را در میکروفون تکرار می‌کنید. موتور هوشمند ما بلافاصله صحت تلفظ شما را ارزیابی می‌کند.",
      faq4Q: "آیا والدین می‌توانند بر پیشرفت فرزندان خود نظارت کنند؟",
      faq4A: "بله! حساب‌های والدین امکان ساخت پروفایل فرزند، مشاهده درس‌های تکمیل شده، امتیازات و فعال‌سازی ترم‌های مختلف را فراهم می‌کند.",
      footerDesc: "پلتفرم دو زبانه هوشمند برای آموزش زبان و فرهنگ اصیل ایرانی به فرزندان، زبان‌آموزان میراثی و خانواده‌های مقیم خارج از کشور.",
      footerCourse1: "الفبا و پایه‌ها",
      footerCourse2: "مکالمه روزمره",
      footerCourse3: "فرهنگ و میراث اصیل",
      footerPlatform: "پلتفرم و ارتباطات",
      footerAccount: "حساب کاربری و دسترسی",
      footerCopyright: "کلیه حقوق برای سامانه آموزش زبان فارسیار محفوظ است.",
    },
  };

  const curr = t[lang];

  const faqs = [
    { q: curr.faq1Q, a: curr.faq1A },
    { q: curr.faq2Q, a: curr.faq2A },
    { q: curr.faq3Q, a: curr.faq3A },
    { q: curr.faq4Q, a: curr.faq4A },
  ];

  return (
    <div className="min-h-screen bg-[#faf9f6] text-[#1f1e1c] flex flex-col justify-between" dir={lang === "fa" ? "rtl" : "ltr"}>
      {/* Header & Navigation */}
      <header className="w-full border-b border-[#e2e0d8] bg-white/90 backdrop-blur-md sticky top-0 z-40 shadow-xs">
        <div className="max-w-6xl mx-auto px-6 py-3 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2.5 group">
            <img src="/logo.png" alt="Farsiyar Logo" className="w-8 h-8 object-contain" style={{ mixBlendMode: "multiply" }} />
            <span className="font-bold text-[#1f1e1c] text-lg tracking-tight">Farsiyar</span>
          </Link>

          {/* Nav Links */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-[#6b6a63]">
            <a href="#courses" className="hover:text-[#1f1e1c] transition-colors">{curr.navCourses}</a>
            <a href="#methodology" className="hover:text-[#1f1e1c] transition-colors">{curr.navMethodology}</a>
            <a href="#why" className="hover:text-[#1f1e1c] transition-colors">{curr.navWhy}</a>
            <Link href="/blog" className="hover:text-[#1f1e1c] transition-colors">{curr.navBlog}</Link>
            <Link href="/about" className="hover:text-[#1f1e1c] transition-colors">{curr.navAbout}</Link>
            <Link href="/contact" className="hover:text-[#1f1e1c] transition-colors">{curr.navContact}</Link>
          </nav>

          <div className="flex items-center gap-3">
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#e2e0d8] bg-white hover:bg-[#f4f2ec] transition-colors text-xs font-semibold shadow-2xs cursor-pointer"
            >
              <Globe className="w-3.5 h-3.5 text-[#185fa5]" />
              <span>{lang === "en" ? "فارسی" : "English"}</span>
            </button>

            <a
              href="#signin"
              className="hidden sm:inline-flex px-4 py-1.5 bg-[#1f1e1c] hover:bg-black text-white rounded-full text-xs font-bold transition-all shadow-2xs"
            >
              {curr.signInBtn}
            </a>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 space-y-20 pb-20">
        {/* HERO SECTION & SIGN IN */}
        <section className="max-w-6xl mx-auto px-6 pt-8 md:pt-12 flex flex-col md:flex-row items-center gap-12">
          {/* Left Side: Brand Hero Content */}
          <div className="flex-1 space-y-5 text-center md:text-start">
            <div className="flex justify-center md:justify-start">
              <img
                src="/logo.png"
                alt="Farsiyar Bird Logo"
                className="w-48 h-48 sm:w-56 sm:h-56 object-contain hover:scale-105 transition-transform duration-300"
                style={{ mixBlendMode: "multiply" }}
              />
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#e6f1fb] text-[#185fa5] border border-[#378add]/20 rounded-full text-[11px] font-bold tracking-wide uppercase">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{curr.badge}</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#1f1e1c] leading-tight tracking-tight">
              {curr.welcome}
            </h1>

            <p className="text-base sm:text-lg text-[#6b6a63] font-medium leading-relaxed max-w-xl">
              {curr.subWelcome}. {curr.tagline}
            </p>

            {/* Quick Benefits Bullet List */}
            <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-semibold text-[#1f1e1c] text-start max-w-lg">
              <div className="flex items-center gap-2 bg-white p-3 rounded-2xl border border-[#e2e0d8] shadow-2xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{curr.feature1Title}</span>
              </div>
              <div className="flex items-center gap-2 bg-white p-3 rounded-2xl border border-[#e2e0d8] shadow-2xs">
                <CheckCircle2 className="w-4 h-4 text-[#378add] shrink-0" />
                <span>{curr.feature2Title}</span>
              </div>
            </div>
          </div>

          {/* Right Side: Sign-In Box */}
          <div id="signin" className="w-full md:w-96 bg-white border border-[#e2e0d8] rounded-3xl p-6 shadow-md">
            <h2 className="text-xl font-bold text-center text-[#1f1e1c] mb-1">{curr.loginTitle}</h2>
            <p className="text-xs text-center text-[#6b6a63] mb-6">{curr.loginSubtitle}</p>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-2xl font-semibold">
                {error}
              </div>
            )}

            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#6b6a63] mb-1.5">{curr.usernameLabel}</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. student"
                  className="w-full px-4 py-2.5 rounded-xl border border-[#e2e0d8] bg-[#faf9f6] focus:bg-white text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#378add]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#6b6a63] mb-1.5">{curr.passwordLabel}</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="e.g. student"
                  className="w-full px-4 py-2.5 rounded-xl border border-[#e2e0d8] bg-[#faf9f6] focus:bg-white text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#378add]"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-[#1f1e1c] hover:bg-black text-white text-center rounded-xl font-semibold text-sm transition-all cursor-pointer shadow-sm"
              >
                {isLoading ? "..." : curr.btnLabel}
              </button>
            </form>

            <button
              type="button"
              onClick={() => router.push("/onboarding")}
              className="w-full py-3 bg-[#e6f1fb] hover:bg-[#d0e5f7] text-[#185fa5] text-center rounded-xl font-semibold text-xs transition-all cursor-pointer border border-[#378add]/20 mt-3"
            >
              {curr.newToFarsi}
            </button>
          </div>
        </section>

        {/* SECTION 2: WHY FARSIYAR & FEATURES GRID */}
        <section id="why" className="max-w-6xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-[10px] bg-[#faeeda] text-[#854f0b] px-3 py-1 rounded-full font-bold uppercase tracking-wider">
              {curr.navWhy}
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1f1e1c] mt-3">
              {lang === "fa" ? "چرا فارسیار بهترین پلتفرم آموزش زبان فارسی است؟" : "Why Learn Persian with Farsiyar?"}
            </h2>
            <p className="text-xs sm:text-sm text-[#6b6a63] mt-2">
              {lang === "fa" ? "ترکیب آموزش هوشمند، تمرین‌های گفتاری و هویت اصیل ایرانی" : "Empowering heritage learners with modern interactive tools."}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white border border-[#e2e0d8] rounded-3xl p-6 shadow-sm hover:shadow-md transition-all space-y-3">
              <div className="p-3 bg-[#e6f1fb] text-[#185fa5] rounded-2xl w-fit"><Award className="w-6 h-6" /></div>
              <h3 className="font-bold text-sm text-[#1f1e1c]">{curr.feature1Title}</h3>
              <p className="text-xs text-[#6b6a63] leading-relaxed">{curr.feature1Desc}</p>
            </div>

            <div className="bg-white border border-[#e2e0d8] rounded-3xl p-6 shadow-sm hover:shadow-md transition-all space-y-3">
              <div className="p-3 bg-[#faeeda] text-[#854f0b] rounded-2xl w-fit"><Mic className="w-6 h-6" /></div>
              <h3 className="font-bold text-sm text-[#1f1e1c]">{curr.feature2Title}</h3>
              <p className="text-xs text-[#6b6a63] leading-relaxed">{curr.feature2Desc}</p>
            </div>

            <div className="bg-white border border-[#e2e0d8] rounded-3xl p-6 shadow-sm hover:shadow-md transition-all space-y-3">
              <div className="p-3 bg-[#eaf3de] text-[#3b6d11] rounded-2xl w-fit"><Heart className="w-6 h-6" /></div>
              <h3 className="font-bold text-sm text-[#1f1e1c]">{curr.feature3Title}</h3>
              <p className="text-xs text-[#6b6a63] leading-relaxed">{curr.feature3Desc}</p>
            </div>

            <div className="bg-white border border-[#e2e0d8] rounded-3xl p-6 shadow-sm hover:shadow-md transition-all space-y-3">
              <div className="p-3 bg-purple-50 text-purple-700 rounded-2xl w-fit"><ShieldCheck className="w-6 h-6" /></div>
              <h3 className="font-bold text-sm text-[#1f1e1c]">{curr.feature4Title}</h3>
              <p className="text-xs text-[#6b6a63] leading-relaxed">{curr.feature4Desc}</p>
            </div>
          </div>
        </section>

        {/* SECTION 3: METHODOLOGY / HOW IT WORKS */}
        <section id="methodology" className="max-w-6xl mx-auto px-6 bg-white border border-[#e2e0d8] rounded-3xl p-8 sm:p-12 shadow-sm">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1f1e1c]">{curr.methodsTitle}</h2>
            <p className="text-xs sm:text-sm text-[#6b6a63] mt-2">{curr.methodsSub}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-[#faf9f6] border border-[#e2e0d8] rounded-2xl p-6 text-center space-y-3">
              <div className="w-10 h-10 bg-[#e6f1fb] text-[#185fa5] font-bold rounded-full flex items-center justify-center mx-auto text-sm">{lang === "fa" ? "۱" : "1"}</div>
              <h3 className="font-bold text-sm text-[#1f1e1c]">{curr.step1Title}</h3>
              <p className="text-xs text-[#6b6a63] leading-relaxed">{curr.step1Desc}</p>
            </div>

            <div className="bg-[#faf9f6] border border-[#e2e0d8] rounded-2xl p-6 text-center space-y-3">
              <div className="w-10 h-10 bg-[#faeeda] text-[#854f0b] font-bold rounded-full flex items-center justify-center mx-auto text-sm">{lang === "fa" ? "۲" : "2"}</div>
              <h3 className="font-bold text-sm text-[#1f1e1c]">{curr.step2Title}</h3>
              <p className="text-xs text-[#6b6a63] leading-relaxed">{curr.step2Desc}</p>
            </div>

            <div className="bg-[#faf9f6] border border-[#e2e0d8] rounded-2xl p-6 text-center space-y-3">
              <div className="w-10 h-10 bg-[#eaf3de] text-[#3b6d11] font-bold rounded-full flex items-center justify-center mx-auto text-sm">{lang === "fa" ? "۳" : "3"}</div>
              <h3 className="font-bold text-sm text-[#1f1e1c]">{curr.step3Title}</h3>
              <p className="text-xs text-[#6b6a63] leading-relaxed">{curr.step3Desc}</p>
            </div>
          </div>
        </section>

        {/* SECTION 4: COURSES & CURRICULUM PREVIEW */}
        <section id="courses" className="max-w-6xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-[10px] bg-[#e6f1fb] text-[#185fa5] px-3 py-1 rounded-full font-bold uppercase tracking-wider">
              {curr.navCourses}
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1f1e1c] mt-3">{curr.curriculumTitle}</h2>
            <p className="text-xs sm:text-sm text-[#6b6a63] mt-2">{curr.curriculumSub}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white border border-[#e2e0d8] rounded-3xl p-6 shadow-sm space-y-4">
              <span className="text-[10px] bg-[#e6f1fb] text-[#185fa5] px-2.5 py-0.5 rounded-full font-bold uppercase">Term 1</span>
              <h3 className="font-bold text-base text-[#1f1e1c]">{curr.term1Title}</h3>
              <p className="text-xs text-[#6b6a63] leading-relaxed">{curr.term1Desc}</p>
              <div className="pt-2 text-[11px] font-semibold text-[#185fa5] flex items-center gap-1">
                <BookOpen className="w-3.5 h-3.5" />
                <span>6 Lessons · Interactive Voice Tests</span>
              </div>
            </div>

            <div className="bg-white border border-[#e2e0d8] rounded-3xl p-6 shadow-sm space-y-4">
              <span className="text-[10px] bg-[#faeeda] text-[#854f0b] px-2.5 py-0.5 rounded-full font-bold uppercase">Term 2</span>
              <h3 className="font-bold text-base text-[#1f1e1c]">{curr.term2Title}</h3>
              <p className="text-xs text-[#6b6a63] leading-relaxed">{curr.term2Desc}</p>
              <div className="pt-2 text-[11px] font-semibold text-[#854f0b] flex items-center gap-1">
                <BookOpen className="w-3.5 h-3.5" />
                <span>8 Lessons · Daily Conversation</span>
              </div>
            </div>

            <div className="bg-white border border-[#e2e0d8] rounded-3xl p-6 shadow-sm space-y-4">
              <span className="text-[10px] bg-[#eaf3de] text-[#3b6d11] px-2.5 py-0.5 rounded-full font-bold uppercase">Term 3</span>
              <h3 className="font-bold text-base text-[#1f1e1c]">{curr.term3Title}</h3>
              <p className="text-xs text-[#6b6a63] leading-relaxed">{curr.term3Desc}</p>
              <div className="pt-2 text-[11px] font-semibold text-[#3b6d11] flex items-center gap-1">
                <BookOpen className="w-3.5 h-3.5" />
                <span>10 Lessons · Stories & Poetry</span>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 5: FREQUENTLY ASKED QUESTIONS (FAQ) */}
        <section id="faq" className="max-w-4xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-[10px] bg-purple-50 text-purple-700 px-3 py-1 rounded-full font-bold uppercase tracking-wider">
              {curr.navFaq}
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1f1e1c] mt-3">{curr.faqTitle}</h2>
            <p className="text-xs sm:text-sm text-[#6b6a63] mt-2">{curr.faqSub}</p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div key={idx} className="bg-white border border-[#e2e0d8] rounded-2xl overflow-hidden shadow-2xs transition-all">
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full px-6 py-4 flex items-center justify-between text-start font-bold text-sm text-[#1f1e1c] cursor-pointer hover:bg-[#faf9f6]"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown className={`w-4 h-4 text-[#6b6a63] transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
                  </button>
                  {isOpen && (
                    <div className="px-6 pb-5 pt-1 text-xs text-[#6b6a63] leading-relaxed border-t border-[#f4f2ec]">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      </main>

      {/* SEO Footer */}
      <footer className="bg-white border-t border-[#e2e0d8] py-12 text-[#6b6a63] text-xs">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <img src="/logo.png" alt="Farsiyar" className="w-6 h-6 object-contain" style={{ mixBlendMode: "multiply" }} />
              <span className="font-bold text-[#1f1e1c] text-base">Farsiyar</span>
            </div>
            <p className="text-[11px] text-[#6b6a63] leading-relaxed">
              {curr.footerDesc}
            </p>
          </div>

          <div>
            <h4 className="font-bold text-xs text-[#1f1e1c] mb-3">{curr.navCourses}</h4>
            <ul className="space-y-2 text-[11px]">
              <li><a href="#courses" className="hover:underline">{curr.footerCourse1}</a></li>
              <li><a href="#courses" className="hover:underline">{curr.footerCourse2}</a></li>
              <li><a href="#courses" className="hover:underline">{curr.footerCourse3}</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-xs text-[#1f1e1c] mb-3">{curr.footerPlatform}</h4>
            <ul className="space-y-2 text-[11px]">
              <li><Link href="/blog" className="hover:underline">{curr.navBlog}</Link></li>
              <li><Link href="/about" className="hover:underline">{curr.navAbout}</Link></li>
              <li><Link href="/contact" className="hover:underline">{curr.navContact}</Link></li>
              <li><Link href="/privacy" className="hover:underline">{curr.navPrivacy}</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-xs text-[#1f1e1c] mb-3">{curr.footerAccount}</h4>
            <ul className="space-y-2 text-[11px]">
              <li><a href="#signin" className="hover:underline">{curr.signInBtn}</a></li>
              <li><Link href="/onboarding" className="hover:underline">{curr.newToFarsi}</Link></li>
            </ul>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-6 pt-6 border-t border-[#e2e0d8] flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-start text-[11px]">
          <div>
            &copy; {new Date().getFullYear()} {curr.footerCopyright}
          </div>
          <div className="flex items-center gap-6 text-[#6b6a63]">
            <Link href="/privacy" className="hover:underline">{curr.navPrivacy}</Link>
            <Link href="/contact" className="hover:underline">{curr.navContact}</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
