"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Globe, ArrowRight, Star, Volume2, Mic, MicOff, CheckCircle2, ChevronRight, Award, User, Sparkles, ClipboardCheck } from "lucide-react";

export default function PlacementTest() {
  const router = useRouter();
  const [lang, setLang] = useState<"en" | "fa">("en");
  const [step, setStep] = useState<"role" | "questionnaire" | "test" | "signup" | "result">("role");

  // Dynamic Placement Test Config from Admin DB
  const [config, setConfig] = useState({
    listeningPromptEn: "Listen to the audio clip and select where the speaker says they are going today:",
    listeningPromptFa: "به فایل صوتی گوش دهید و مشخص کنید گوینده امروز به کجا می‌رود:",
    listeningOptions: ["مدرسه (School)", "بازار (Market)", "پارک (Park)", "خانه (Home)"],
    listeningCorrect: "مدرسه (School)",
    readingPromptEn: "Translate the following word to English: «کتاب»",
    readingPromptFa: "ترجمه کلمه زیر را انتخاب کنید: «کتاب»",
    readingOptions: ["Book", "Pen", "Notebook", "Chair"],
    readingCorrect: "Book",
    speakingPromptEn: "Say 'سلام' (Salâm) out loud in Persian:",
    speakingPromptFa: "جمله روبرو را با صدای بلند تلفظ کنید: «سلام»",
    speakingTarget: "سلام",
  });

  useEffect(() => {
    const savedLang = localStorage.getItem("farsi_lang");
    if (savedLang === "fa" || savedLang === "en") {
      setLang(savedLang);
    }

    fetch("/api/pages?key=placement_test")
      .then((res) => res.json())
      .then((data) => {
        if (data && data.contentEn) {
          try {
            const parsed = JSON.parse(data.contentEn);
            setConfig((prev) => ({ ...prev, ...parsed }));
          } catch (e) {
            console.error(e);
          }
        }
      })
      .catch(console.error);
  }, []);

  const toggleLanguage = () => {
    const nextLang = lang === "en" ? "fa" : "en";
    setLang(nextLang);
    localStorage.setItem("farsi_lang", nextLang);
  };

  // Questionnaire answers
  const [accountType, setAccountType] = useState<"ADULT_HERITAGE" | "PARENT">("ADULT_HERITAGE");
  const [homeLanguage, setHomeLanguage] = useState("Mostly Persian");
  const [holidayFamiliarity, setHolidayFamiliarity] = useState(70);
  const [alphabetRecognition, setAlphabetRecognition] = useState("No");

  // Detailed Child Profile Questionnaire (for Parent registration)
  const [childFirstName, setChildFirstName] = useState("");
  const [childLastName, setChildLastName] = useState("");
  const [childAge, setChildAge] = useState("7");
  const [residenceCountry, setResidenceCountry] = useState("Germany");
  const [motherNationality, setMotherNationality] = useState("Iranian");
  const [fatherNationality, setFatherNationality] = useState("Iranian");
  const [firstLanguage, setFirstLanguage] = useState("English");
  const [learningInterest, setLearningInterest] = useState(80);
  const [persianFriendsConnection, setPersianFriendsConnection] = useState("Medium");
  const [relativesConnection, setRelativesConnection] = useState("High");

  // Registration states
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Placement Test states
  const [testSection, setTestSection] = useState(1);
  const [listeningAnswer, setListeningAnswer] = useState("");
  const [readingAnswer, setReadingAnswer] = useState("");
  const [spokenText, setSpokenText] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [speechError, setSpeechError] = useState("");
  const recognitionRef = useRef<any>(null);

  // Calculated skills
  const [skills, setSkills] = useState({ listening: 30, speaking: 30, reading: 30, writing: 30 });

  // i18n
  const t = {
    en: {
      welcome: "Placement Test & Assessment",
      subWelcome: "First, tell us who this account is for",
      selfLearn: "I want to learn Persian myself",
      selfLearnDesc: "For learners age 16 and up",
      parentLearn: "I'm signing up for my child",
      parentLearnDesc: "I'm a parent or guardian",
      continue: "Continue",
      back: "Back",
      step1Title: "Tell us about your background",
      step1Label1: "What language do you speak at home with family?",
      step1Label2: "How familiar are you with Persian holidays (Nowruz, Yalda)?",
      alphabetLabel: "Does your child recognize the Persian alphabet?",
      holidayLow: "Low",
      holidayHigh: "Very High",
      next: "Next Section",
      testTitle: "Placement Test",
      listeningSec: "Section 1 · Listening assessment",
      playAudio: "Play Audio",
      readingSec: "Section 2 · Reading assessment",
      speakingSec: "Section 3 · Pronunciation check",
      speakBtn: "Tap mic to speak",
      signupTitle: "Save Your Skill Profile",
      signupSub: "Choose a username and password to save your progress",
      username: "Username",
      password: "Password",
      submit: "Complete Placement Test",
      resultTitle: "Your Skill Profile",
      resultSub: "Based on your placement test, we generated your skill breakdown:",
      listening: "Listening",
      speaking: "Speaking",
      reading: "Reading",
      writing: "Writing",
      startAdventure: "Start Learning Path",
    },
    fa: {
      welcome: "آزمون تعیین سطح و ارزیابی اولیه",
      subWelcome: "ابتدا مشخص کنید این حساب برای چه کسی است",
      selfLearn: "می‌خواهم خودم زبان فارسی را یاد بگیرم",
      selfLearnDesc: "برای زبان‌آموزان ۱۶ سال به بالا",
      parentLearn: "برای فرزندم ثبت‌نام می‌کنم",
      parentLearnDesc: "من والدین یا سرپرست هستم",
      continue: "ادامه",
      back: "بازگشت",
      step1Title: "کمی درباره پیشینه خود بگویید",
      step1Label1: "در خانه با خانواده معمولاً به چه زبانی صحبت می‌کنید؟",
      step1Label2: "چقدر با مناسبت‌های ایرانی (نوروز، یلدا) آشنا هستید؟",
      alphabetLabel: "آیا فرزند شما با الفبای فارسی آشنا است؟",
      holidayLow: "کم",
      holidayHigh: "بسیار زیاد",
      next: "بخش بعدی",
      testTitle: "آزمون تعیین سطح",
      listeningSec: "بخش ۱ · سنجش شنیداری",
      playAudio: "پخش صدا",
      readingSec: "بخش ۲ · سنجش خواندن",
      speakingSec: "بخش ۳ · سنجش گفتاری",
      speakBtn: "میکروفون را لمس کرده و صحبت کنید",
      signupTitle: "ذخیره پروفایل مهارتی",
      signupSub: "یک نام کاربری و رمز عبور برای پیگیری پیشرفت خود انتخاب کنید",
      username: "نام کاربری",
      password: "رمز عبور",
      submit: "اتمام آزمون تعیین سطح",
      resultTitle: "پروفایل مهارتی شما",
      resultSub: "بر اساس آزمون تعیین سطح، نتایج مهارت‌های چهارگانه شما آماده شده است:",
      listening: "شنیداری",
      speaking: "گفتاری",
      reading: "خواندن",
      writing: "نوشتن",
      startAdventure: "شروع مسیر آموزشی",
    },
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        try {
          const rec = new SpeechRecognition();
          rec.lang = "fa-IR";
          rec.interimResults = false;
          rec.maxAlternatives = 1;

          rec.onstart = () => {
            setIsListening(true);
            setSpeechError("");
          };

          rec.onresult = (event: any) => {
            const resultText = event.results[0][0].transcript;
            setSpokenText(resultText);
            setIsListening(false);
          };

          rec.onerror = () => {
            setSpeechError("Could not recognize speech. Try speaking clearly.");
            setIsListening(false);
          };

          rec.onend = () => {
            setIsListening(false);
          };

          recognitionRef.current = rec;
        } catch (e) {
          console.error(e);
        }
      }
    }
  }, []);

  const handleStartListening = () => {
    if (recognitionRef.current) {
      setSpokenText("");
      setSpeechError("");
      try {
        recognitionRef.current.start();
      } catch (e) {
        console.error(e);
      }
    } else {
      setSpeechError("Speech recognition is not supported in this browser.");
    }
  };

  const handleStopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  const playTTS = (text: string) => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "fa-IR";
      window.speechSynthesis.speak(utterance);
    }
  };

  const calculateFinalSkills = () => {
    let listScore = listeningAnswer === config.listeningCorrect ? 75 : 40;
    let readScore = readingAnswer === config.readingCorrect ? 80 : 35;
    let speakScore = spokenText.includes(config.speakingTarget) || config.speakingTarget.includes(spokenText) ? 85 : 45;
    let writeScore = alphabetRecognition === "Yes" ? 65 : 30;

    setSkills({
      listening: listScore,
      speaking: speakScore,
      reading: readScore,
      writing: writeScore,
    });
    setStep("result");
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!username.trim() || !password.trim()) return;

    const childProfileData = accountType === "PARENT" ? {
      name: childFirstName,
      family: childLastName,
      age: childAge,
      residenceCountry,
      motherNationality,
      fatherNationality,
      firstLanguage,
      homeLanguage,
      culturalFamiliarity: holidayFamiliarity,
      learningInterest,
      persianFriendsConnection,
      relativesConnection,
    } : null;

    setIsLoading(true);
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: username.trim(),
          password: password.trim(),
          accountType,
          homeLanguage,
          holidayFamiliarity,
          alphabetRecognition,
          childProfile: childProfileData,
        }),
      });

      if (res.ok) {
        localStorage.setItem("farsi_username", username.trim());
        calculateFinalSkills();
      } else {
        const data = await res.json();
        setError(data.error || "User registration failed");
      }
    } catch (err) {
      console.error(err);
      setError("Server connection failed. Try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const curr = t[lang];

  return (
    <div className="min-h-screen bg-[#faf9f6] text-[#1f1e1c] flex flex-col justify-between" dir={lang === "fa" ? "rtl" : "ltr"}>
      {/* Header */}
      <header className="w-full border-b border-[#e2e0d8] bg-white sticky top-0 z-40 shadow-xs">
        <div className="max-w-4xl mx-auto px-6 py-3 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <ClipboardCheck className="w-6 h-6 text-[#185fa5]" />
            <span className="font-extrabold text-base tracking-tight text-[#1f1e1c]">Farsiyar Placement Test</span>
          </div>

          <button
            onClick={toggleLanguage}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#e2e0d8] bg-white hover:bg-[#f4f2ec] transition-colors text-xs font-semibold shadow-2xs cursor-pointer"
          >
            <Globe className="w-3.5 h-3.5 text-[#185fa5]" />
            <span>{lang === "en" ? "فارسی" : "English"}</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-xl mx-auto w-full px-6 py-8 flex-1 flex flex-col justify-center">
        {/* STEP 1: Account Role Selection */}
        {step === "role" && (
          <div className="bg-white border border-[#e2e0d8] rounded-3xl p-8 shadow-sm space-y-6 text-center">
            <div className="w-16 h-16 bg-[#e6f1fb] text-[#185fa5] rounded-3xl flex items-center justify-center mx-auto shadow-inner">
              <User className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl font-extrabold text-[#1f1e1c]">{curr.welcome}</h1>
              <p className="text-xs text-[#6b6a63]">{curr.subWelcome}</p>
            </div>

            <div className="space-y-3 pt-2">
              <button
                type="button"
                onClick={() => setAccountType("ADULT_HERITAGE")}
                className={`w-full p-4 rounded-2xl border-2 text-start transition-all cursor-pointer ${
                  accountType === "ADULT_HERITAGE"
                    ? "border-[#378add] bg-[#e6f1fb] text-[#185fa5]"
                    : "border-[#e2e0d8] hover:bg-[#faf9f6] text-[#1f1e1c]"
                }`}
              >
                <div className="font-bold text-sm">{curr.selfLearn}</div>
                <div className="text-xs text-[#6b6a63] mt-0.5">{curr.selfLearnDesc}</div>
              </button>

              <button
                type="button"
                onClick={() => setAccountType("PARENT")}
                className={`w-full p-4 rounded-2xl border-2 text-start transition-all cursor-pointer ${
                  accountType === "PARENT"
                    ? "border-[#378add] bg-[#e6f1fb] text-[#185fa5]"
                    : "border-[#e2e0d8] hover:bg-[#faf9f6] text-[#1f1e1c]"
                }`}
              >
                <div className="font-bold text-sm">{curr.parentLearn}</div>
                <div className="text-xs text-[#6b6a63] mt-0.5">{curr.parentLearnDesc}</div>
              </button>
            </div>

            <button
              type="button"
              onClick={() => setStep("questionnaire")}
              className="w-full py-3.5 bg-[#1f1e1c] hover:bg-black text-white rounded-2xl font-bold text-sm transition-all shadow-sm cursor-pointer"
            >
              {curr.continue}
            </button>
          </div>
        )}

        {/* STEP 2: Background Questionnaire */}
        {step === "questionnaire" && (
          <div className="bg-white border border-[#e2e0d8] rounded-3xl p-8 shadow-sm space-y-6">
            <h2 className="text-xl font-bold text-[#1f1e1c] text-center">
              {accountType === "PARENT"
                ? (lang === "fa" ? "مشخصات فرزند (Child Profile Details)" : "Child Profile & Background")
                : curr.step1Title}
            </h2>

            {accountType === "PARENT" ? (
              <div className="space-y-4 text-xs">
                {/* Name & Family */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-[#6b6a63] mb-1">
                      {lang === "fa" ? "نام کودک (First Name)" : "Child's First Name"}
                    </label>
                    <input
                      type="text"
                      value={childFirstName}
                      onChange={(e) => setChildFirstName(e.target.value)}
                      placeholder="e.g. Kian"
                      className="w-full p-2.5 rounded-xl border border-[#e2e0d8] bg-[#faf9f6]"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-[#6b6a63] mb-1">
                      {lang === "fa" ? "نام خانوادگی (Last Name)" : "Child's Last Name"}
                    </label>
                    <input
                      type="text"
                      value={childLastName}
                      onChange={(e) => setChildLastName(e.target.value)}
                      placeholder="e.g. Tehrani"
                      className="w-full p-2.5 rounded-xl border border-[#e2e0d8] bg-[#faf9f6]"
                    />
                  </div>
                </div>

                {/* Age & Residence Country */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-[#6b6a63] mb-1">
                      {lang === "fa" ? "سن (Age)" : "Age"}
                    </label>
                    <input
                      type="number"
                      value={childAge}
                      onChange={(e) => setChildAge(e.target.value)}
                      min="3"
                      max="18"
                      className="w-full p-2.5 rounded-xl border border-[#e2e0d8] bg-[#faf9f6]"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-[#6b6a63] mb-1">
                      {lang === "fa" ? "کشور محل زندگی (Country of Residence)" : "Country of Residence"}
                    </label>
                    <input
                      type="text"
                      value={residenceCountry}
                      onChange={(e) => setResidenceCountry(e.target.value)}
                      placeholder="e.g. Germany, USA, UK"
                      className="w-full p-2.5 rounded-xl border border-[#e2e0d8] bg-[#faf9f6]"
                    />
                  </div>
                </div>

                {/* Mother & Father Nationality */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-[#6b6a63] mb-1">
                      {lang === "fa" ? "ملیت مادر (Mother's Nationality)" : "Mother's Nationality"}
                    </label>
                    <input
                      type="text"
                      value={motherNationality}
                      onChange={(e) => setMotherNationality(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-[#e2e0d8] bg-[#faf9f6]"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-[#6b6a63] mb-1">
                      {lang === "fa" ? "ملیت پدر (Father's Nationality)" : "Father's Nationality"}
                    </label>
                    <input
                      type="text"
                      value={fatherNationality}
                      onChange={(e) => setFatherNationality(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-[#e2e0d8] bg-[#faf9f6]"
                    />
                  </div>
                </div>

                {/* First Language & Home Language */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-[#6b6a63] mb-1">
                      {lang === "fa" ? "زبان اول کودک (First Language)" : "Child's First Language"}
                    </label>
                    <input
                      type="text"
                      value={firstLanguage}
                      onChange={(e) => setFirstLanguage(e.target.value)}
                      placeholder="e.g. English, German"
                      className="w-full p-2.5 rounded-xl border border-[#e2e0d8] bg-[#faf9f6]"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-[#6b6a63] mb-1">
                      {lang === "fa" ? "زبان خانه (Home Language)" : "Home Language"}
                    </label>
                    <select
                      value={homeLanguage}
                      onChange={(e) => setHomeLanguage(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-[#e2e0d8] bg-[#faf9f6]"
                    >
                      <option value="Mostly Persian">عمدتاً فارسی (Mostly Persian)</option>
                      <option value="Mix of English & Persian">ترکیب فارسی و انگلیسی (Mix of Both)</option>
                      <option value="Mostly English">عمدتاً انگلیسی (Mostly English)</option>
                    </select>
                  </div>
                </div>

                {/* Cultural Familiarity & Learning Interest */}
                <div className="space-y-3 pt-1">
                  <div>
                    <label className="block font-bold text-[#6b6a63] mb-1">
                      {lang === "fa" ? "میزان آشنایی با فرهنگ ایرانی (Familiarity with Persian Culture)" : "Familiarity with Persian Culture"}
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={holidayFamiliarity}
                      onChange={(e) => setHolidayFamiliarity(Number(e.target.value))}
                      className="w-full accent-[#378add]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-[#6b6a63] mb-1">
                      {lang === "fa" ? "میزان علاقه‌مندی به یادگیری زبان فارسی (Interest in Learning Persian)" : "Interest in Learning Persian"}
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={learningInterest}
                      onChange={(e) => setLearningInterest(Number(e.target.value))}
                      className="w-full accent-[#378add]"
                    />
                  </div>
                </div>

                {/* Connections with Peers & Relatives */}
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block font-bold text-[#6b6a63] mb-1">
                      {lang === "fa" ? "ارتباط با هم‌سن‌های فارسی‌زبان" : "Persian Peers Connection"}
                    </label>
                    <select
                      value={persianFriendsConnection}
                      onChange={(e) => setPersianFriendsConnection(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-[#e2e0d8] bg-[#faf9f6]"
                    >
                      <option value="High">زیاد (High)</option>
                      <option value="Medium">متوسط (Medium)</option>
                      <option value="Low">کم (Low)</option>
                      <option value="None">هیچ (None)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-[#6b6a63] mb-1">
                      {lang === "fa" ? "ارتباط با اقوام ایرانی" : "Connection with Iranian Relatives"}
                    </label>
                    <select
                      value={relativesConnection}
                      onChange={(e) => setRelativesConnection(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-[#e2e0d8] bg-[#faf9f6]"
                    >
                      <option value="High">زیاد (High)</option>
                      <option value="Medium">متوسط (Medium)</option>
                      <option value="Low">کم (Low)</option>
                      <option value="None">هیچ (None)</option>
                    </select>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-5 text-xs">
                <div>
                  <label className="block font-bold text-[#6b6a63] mb-2">{curr.step1Label1}</label>
                  <select
                    value={homeLanguage}
                    onChange={(e) => setHomeLanguage(e.target.value)}
                    className="w-full p-3 rounded-xl border border-[#e2e0d8] bg-[#faf9f6] font-medium"
                  >
                    <option value="Mostly Persian">عمدتاً فارسی (Mostly Persian)</option>
                    <option value="Mix of English & Persian">ترکیب فارسی و انگلیسی (Mix of Both)</option>
                    <option value="Mostly English">عمدتاً انگلیسی (Mostly English)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[#6b6a63] mb-2">{curr.step1Label2}</label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={holidayFamiliarity}
                    onChange={(e) => setHolidayFamiliarity(Number(e.target.value))}
                    className="w-full accent-[#378add]"
                  />
                  <div className="flex justify-between text-[11px] text-[#9a988f] mt-1 font-semibold">
                    <span>{curr.holidayLow}</span>
                    <span>{curr.holidayHigh}</span>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-[#6b6a63] mb-2">{curr.alphabetLabel}</label>
                  <div className="flex gap-3">
                    {["Yes", "Partial", "No"].map((val) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setAlphabetRecognition(val)}
                        className={`flex-1 py-2.5 rounded-xl border font-bold text-xs transition-all ${
                          alphabetRecognition === val
                            ? "bg-[#1f1e1c] text-white border-[#1f1e1c]"
                            : "bg-[#faf9f6] text-[#6b6a63] border-[#e2e0d8]"
                        }`}
                      >
                        {val}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setStep("role")}
                className="px-5 py-3 border border-[#e2e0d8] rounded-2xl font-bold text-xs hover:bg-[#faf9f6]"
              >
                {curr.back}
              </button>
              <button
                type="button"
                onClick={() => setStep("test")}
                className="flex-1 py-3 bg-[#1f1e1c] hover:bg-black text-white rounded-2xl font-bold text-xs shadow-sm"
              >
                {curr.next}
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Placement Test */}
        {step === "test" && (
          <div className="bg-white border border-[#e2e0d8] rounded-3xl p-8 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-[#e2e0d8] pb-4">
              <h2 className="font-bold text-base text-[#1f1e1c]">{curr.testTitle}</h2>
              <span className="text-xs font-bold text-[#185fa5] bg-[#e6f1fb] px-3 py-1 rounded-full">
                Step {testSection} / 3
              </span>
            </div>

            {/* Test Section 1: Listening */}
            {testSection === 1 && (
              <div className="space-y-4 text-xs">
                <span className="font-bold text-[#185fa5] block">{curr.listeningSec}</span>
                <p className="text-[#6b6a63] font-medium leading-relaxed">
                  {lang === "fa" ? config.listeningPromptFa : config.listeningPromptEn}
                </p>

                <div className="p-4 bg-[#e6f1fb] border border-[#378add]/20 rounded-2xl flex items-center justify-between">
                  <span className="font-bold text-[#185fa5]">«امروز من به مدرسه می‌روم.»</span>
                  <button
                    type="button"
                    onClick={() => playTTS("امروز من به مدرسه می‌روم.")}
                    className="p-2 bg-white rounded-xl border border-[#e2e0d8] hover:bg-[#f4f2ec]"
                  >
                    <Volume2 className="w-4 h-4 text-[#185fa5]" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  {config.listeningOptions.map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setListeningAnswer(opt)}
                      className={`p-3 rounded-xl border font-bold text-xs text-start transition-all ${
                        listeningAnswer === opt
                          ? "bg-[#1f1e1c] text-white border-[#1f1e1c]"
                          : "bg-[#faf9f6] text-[#6b6a63] border-[#e2e0d8]"
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  disabled={!listeningAnswer}
                  onClick={() => setTestSection(2)}
                  className="w-full py-3 bg-[#1f1e1c] hover:bg-black disabled:opacity-40 text-white rounded-2xl font-bold text-xs mt-4 shadow-sm"
                >
                  {curr.next}
                </button>
              </div>
            )}

            {/* Test Section 2: Reading */}
            {testSection === 2 && (
              <div className="space-y-4 text-xs">
                <span className="font-bold text-[#185fa5] block">{curr.readingSec}</span>
                <p className="text-[#6b6a63] font-medium leading-relaxed">
                  {lang === "fa" ? config.readingPromptFa : config.readingPromptEn}
                </p>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  {config.readingOptions.map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setReadingAnswer(opt)}
                      className={`p-3 rounded-xl border font-bold text-xs text-start transition-all ${
                        readingAnswer === opt
                          ? "bg-[#1f1e1c] text-white border-[#1f1e1c]"
                          : "bg-[#faf9f6] text-[#6b6a63] border-[#e2e0d8]"
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  disabled={!readingAnswer}
                  onClick={() => setTestSection(3)}
                  className="w-full py-3 bg-[#1f1e1c] hover:bg-black disabled:opacity-40 text-white rounded-2xl font-bold text-xs mt-4 shadow-sm"
                >
                  {curr.next}
                </button>
              </div>
            )}

            {/* Test Section 3: Speaking */}
            {testSection === 3 && (
              <div className="space-y-4 text-xs">
                <span className="font-bold text-[#185fa5] block">{curr.speakingSec}</span>
                <p className="text-[#6b6a63] font-medium leading-relaxed">
                  {lang === "fa" ? config.speakingPromptFa : config.speakingPromptEn}
                </p>

                <div className="p-4 bg-[#e6f1fb] border border-[#378add]/20 rounded-2xl text-center font-bold text-lg text-[#185fa5]">
                  «{config.speakingTarget}»
                </div>

                <div className="flex flex-col items-center justify-center p-6 bg-[#faf9f6] border border-[#e2e0d8] rounded-2xl space-y-3">
                  {isListening ? (
                    <button
                      type="button"
                      onClick={handleStopListening}
                      className="w-14 h-14 bg-amber-600 rounded-full flex items-center justify-center animate-pulse text-white shadow-md"
                    >
                      <MicOff className="w-6 h-6" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleStartListening}
                      className="w-14 h-14 bg-[#378add] hover:bg-[#185fa5] rounded-full flex items-center justify-center text-white shadow-md"
                    >
                      <Mic className="w-6 h-6" />
                    </button>
                  )}
                  <span className="text-[11px] font-bold text-[#6b6a63]">
                    {isListening ? "Listening..." : curr.speakBtn}
                  </span>
                  {spokenText && (
                    <div className="text-xs font-bold text-[#185fa5] bg-white px-3 py-1.5 rounded-xl border border-[#e2e0d8]">
                      Spoken: "{spokenText}"
                    </div>
                  )}
                  {speechError && <div className="text-[10px] text-amber-700 font-semibold">{speechError}</div>}
                </div>

                <button
                  type="button"
                  onClick={() => setStep("signup")}
                  className="w-full py-3 bg-[#1f1e1c] hover:bg-black text-white rounded-2xl font-bold text-xs mt-4 shadow-sm"
                >
                  {curr.continue}
                </button>
              </div>
            )}
          </div>
        )}

        {/* STEP 4: Registration */}
        {step === "signup" && (
          <div className="bg-white border border-[#e2e0d8] rounded-3xl p-8 shadow-sm space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-xl font-bold text-[#1f1e1c]">{curr.signupTitle}</h2>
              <p className="text-xs text-[#6b6a63]">{curr.signupSub}</p>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-2xl">
                {error}
              </div>
            )}

            <form onSubmit={handleRegisterSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-[#6b6a63] mb-1.5">{curr.username}</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. student"
                  className="w-full px-4 py-2.5 rounded-xl border border-[#e2e0d8] bg-[#faf9f6] focus:bg-white font-medium focus:outline-none focus:ring-2 focus:ring-[#378add]"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-[#6b6a63] mb-1.5">{curr.password}</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className="w-full px-4 py-2.5 rounded-xl border border-[#e2e0d8] bg-[#faf9f6] focus:bg-white font-medium focus:outline-none focus:ring-2 focus:ring-[#378add]"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-[#1f1e1c] hover:bg-black text-white font-bold rounded-xl shadow-sm text-xs transition-all"
              >
                {isLoading ? "..." : curr.submit}
              </button>
            </form>
          </div>
        )}

        {/* STEP 5: Skill Result Summary */}
        {step === "result" && (
          <div className="bg-white border border-[#e2e0d8] rounded-3xl p-8 shadow-sm space-y-6">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-[#eaf3de] text-[#3b6d11] rounded-2xl flex items-center justify-center mx-auto">
                <Award className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold text-[#1f1e1c]">{curr.resultTitle}</h2>
              <p className="text-xs text-[#6b6a63]">{curr.resultSub}</p>
            </div>

            <div className="space-y-3 text-xs pt-2">
              <div>
                <div className="flex justify-between font-bold text-[#6b6a63] mb-1">
                  <span>{curr.listening}</span>
                  <span>{skills.listening}%</span>
                </div>
                <div className="h-2 bg-[#f4f2ec] rounded-full overflow-hidden">
                  <div className="h-full bg-[#378add] rounded-full transition-all duration-500" style={{ width: `${skills.listening}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between font-bold text-[#6b6a63] mb-1">
                  <span>{curr.speaking}</span>
                  <span>{skills.speaking}%</span>
                </div>
                <div className="h-2 bg-[#f4f2ec] rounded-full overflow-hidden">
                  <div className="h-full bg-[#639922] rounded-full transition-all duration-500" style={{ width: `${skills.speaking}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between font-bold text-[#6b6a63] mb-1">
                  <span>{curr.reading}</span>
                  <span>{skills.reading}%</span>
                </div>
                <div className="h-2 bg-[#f4f2ec] rounded-full overflow-hidden">
                  <div className="h-full bg-[#ba7517] rounded-full transition-all duration-500" style={{ width: `${skills.reading}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between font-bold text-[#6b6a63] mb-1">
                  <span>{curr.writing}</span>
                  <span>{skills.writing}%</span>
                </div>
                <div className="h-2 bg-[#f4f2ec] rounded-full overflow-hidden">
                  <div className="h-full bg-purple-600 rounded-full transition-all duration-500" style={{ width: `${skills.writing}%` }} />
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => router.push("/dashboard")}
              className="w-full py-3.5 bg-[#1f1e1c] hover:bg-black text-white font-bold rounded-2xl shadow-sm text-xs transition-all"
            >
              {curr.startAdventure}
            </button>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-[#e2e0d8] py-6 text-center text-[#9a988f] text-xs">
        &copy; {new Date().getFullYear()} Farsiyar Persian Learning App.
      </footer>
    </div>
  );
}
