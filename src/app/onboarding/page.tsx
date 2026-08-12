"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Globe, ArrowRight, Star, Volume2, Mic, MicOff, CheckCircle2, ChevronRight, Award, User, Sparkles } from "lucide-react";

export default function Onboarding() {
  const router = useRouter();
  const [lang, setLang] = useState<"en" | "fa">("en");
  const [step, setStep] = useState<"role" | "questionnaire" | "test" | "signup" | "result">("role");

  // Onboarding answers
  const [accountType, setAccountType] = useState<"ADULT_HERITAGE" | "PARENT">("ADULT_HERITAGE");
  const [homeLanguage, setHomeLanguage] = useState("Mostly Persian");
  const [holidayFamiliarity, setHolidayFamiliarity] = useState(70);
  const [alphabetRecognition, setAlphabetRecognition] = useState("No");

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
      welcome: "Welcome to Farsiyar",
      subWelcome: "First, tell us who this account is for",
      selfLearn: "I want to learn Persian myself",
      selfLearnDesc: "For learners age 16 and up",
      parentLearn: "I'm signing up for my child",
      parentLearnDesc: "I'm a parent or guardian",
      continue: "Continue",
      back: "Back",
      step1Title: "Tell us about yourself",
      step1Label1: "What language do you speak at home with family?",
      step1Label2: "How familiar are you with Persian holidays (Nowruz, Yalda)?",
      alphabetLabel: "Does your child recognize the Persian alphabet?",
      holidayLow: "Low",
      holidayHigh: "Very High",
      next: "Next",
      testTitle: "Placement Test",
      listeningSec: "Section 1 · Listening assessment",
      listeningPrompt: "Listen to the audio clip and select where the speaker says they are going today:",
      playAudio: "Play Audio",
      readingSec: "Section 2 · Reading assessment",
      readingPrompt: "Translate the following word to English:",
      speakingSec: "Section 3 · Pronunciation check",
      speakingPrompt: "Say 'سلام' (Salâm) out loud in Persian:",
      speakBtn: "Tap mic to speak",
      signupTitle: "Save Your Profile",
      signupSub: "Choose a username and password to save your progress",
      username: "Username",
      password: "Password",
      submit: "Finish Onboarding",
      resultTitle: "Your Skill Profile",
      resultSub: "Based on your placement test, we have generated your multi-dimensional profile:",
      listening: "Listening",
      speaking: "Speaking",
      reading: "Reading",
      writing: "Writing",
      startAdventure: "Start Learning Path",
    },
    fa: {
      welcome: "به فارسیار خوش آمدید",
      subWelcome: "ابتدا مشخص کنید این حساب برای چه کسی است",
      selfLearn: "می‌خواهم خودم زبان فارسی را یاد بگیرم",
      selfLearnDesc: "برای زبان‌آموزان ۱۶ سال به بالا",
      parentLearn: "برای فرزندم ثبت‌نام می‌کنم",
      parentLearnDesc: "من والدین یا سرپرست هستم",
      continue: "ادامه",
      back: "بازگشت",
      step1Title: "کمی درباره خودتان بگویید",
      step1Label1: "در خانه با خانواده معمولاً به چه زبانی صحبت می‌کنید؟",
      step1Label2: "چقدر با مناسبت‌های ایرانی (نوروز، یلدا) آشنا هستید؟",
      alphabetLabel: "آیا فرزند شما با الفبای فارسی آشنا است؟",
      holidayLow: "کم",
      holidayHigh: "بسیار زیاد",
      next: "بعدی",
      testTitle: "تست تعیین سطح",
      listeningSec: "بخش ۱ · سنجش شنیداری",
      listeningPrompt: "به فایل صوتی گوش دهید و مشخص کنید گوینده امروز به کجا می‌رود:",
      playAudio: "پخش صدا",
      readingSec: "بخش ۲ · سنجش خواندن",
      readingPrompt: "ترجمه کلمه زیر را انتخاب کنید:",
      speakingSec: "بخش ۳ · سنجش گفتاری",
      speakingPrompt: "جمله روبرو را با صدای بلند تلفظ کنید: «سلام»",
      speakBtn: "میکروفون را لمس کرده و صحبت کنید",
      signupTitle: "ذخیره پروفایل کاربری",
      signupSub: "یک نام کاربری و رمز عبور برای پیگیری پیشرفت خود انتخاب کنید",
      username: "نام کاربری",
      password: "رمز عبور",
      submit: "اتمام تعیین سطح",
      resultTitle: "پروفایل مهارتی شما",
      resultSub: "بر اساس تست تعیین سطح، نتایج مهارت‌های چهارگانه شما آماده شده است:",
      listening: "شنیداری",
      speaking: "گفتاری",
      reading: "خواندن",
      writing: "نوشتن",
      startAdventure: "شروع ماجراجویی آموزشی",
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
            setSpokenText("");
          };

          rec.onresult = (event: any) => {
            const text = event.results[0][0].transcript;
            setSpokenText(text);
            setIsListening(false);
          };

          rec.onerror = (e: any) => {
            console.error(e);
            setSpeechError("Could not recognize speech. Try again.");
            setIsListening(false);
          };

          rec.onend = () => {
            setIsListening(false);
          };

          recognitionRef.current = rec;
        } catch (err) {
          console.warn("SpeechRecognition not supported or blocked (likely due to insecure origin HTTP):", err);
        }
      }
    }
  }, [step, testSection]);

  const handleTextToSpeech = (text: string) => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "fa-IR";

      const speak = () => {
        const voices = window.speechSynthesis.getVoices();
        const voice = voices.find((v) => v.lang.startsWith("fa") || v.lang.includes("IR"));
        if (voice) {
          utterance.voice = voice;
        }
        window.speechSynthesis.speak(utterance);
      };

      if (window.speechSynthesis.getVoices().length === 0) {
        window.speechSynthesis.onvoiceschanged = speak;
      } else {
        speak();
      }
    }
  };

  const playLocalAudio = (filename: string) => {
    if (typeof window !== "undefined") {
      const audio = new Audio(`/audio/${filename}`);
      audio.play().catch((e) => console.error("Local audio playback failed", e));
    }
  };

  const startListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
      } catch (e) {
        console.error(e);
      }
    } else {
      setSpeechError("Speech recognition is not supported in this browser.");
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  const handleTestNext = () => {
    if (testSection < 3) {
      setTestSection((prev) => prev + 1);
    } else {
      // Calculate Skill Profile
      let listen = 30;
      let read = 30;
      let speak = 30;

      if (listeningAnswer === "Grandmother's house") listen = 85;
      if (readingAnswer === "Book") read = 65;
      if (spokenText.includes("سلام")) speak = 75;

      setSkills({
        listening: listen,
        reading: read,
        speaking: speak,
        writing: 20, // default writing baseline
      });

      setStep("signup");
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!username.trim() || !password.trim()) return;

    setIsLoading(true);
    try {
      // Register User
      const res = await fetch("/api/user?username=" + encodeURIComponent(username.trim()) + "&t=" + Date.now());
      const existing = await res.json();

      if (existing && existing.id && existing.createdAt) {
        setError("Username already taken. Please choose another one.");
        setIsLoading(false);
        return;
      }

      // Create new user in DB
      const createRes = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: undefined,
          username: username.trim(),
          password: password.trim(),
          accountType,
          whyLearning: accountType === "ADULT_HERITAGE" ? "I want to talk comfortably with my family." : null,
          skills,
        }),
      });

      if (createRes.ok) {
        const user = await createRes.json();
        localStorage.setItem("farsi_username", user.username);
        setStep("result");
      } else {
        setError("Registration failed. Try again.");
      }
    } catch (err) {
      console.error(err);
      setError("Server connection failed.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#faf9f6] text-[#1f1e1c] flex flex-col justify-between">
      {/* Header */}
      <header className="max-w-xl mx-auto w-full px-6 py-6 flex justify-between items-center border-b border-[#e2e0d8] bg-white shadow-sm">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-[#378add] rounded-lg">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="text-base font-bold text-[#1f1e1c]">Farsiyar Onboarding</span>
        </div>

        <button
          onClick={() => setLang(lang === "en" ? "fa" : "en")}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#e2e0d8] bg-white hover:bg-[#f4f2ec] transition-colors text-[10px] font-semibold"
        >
          <Globe className="w-3 h-3 text-[#185fa5]" />
          {lang === "en" ? "فارسی" : "English"}
        </button>
      </header>

      {/* Main Flow card */}
      <main className="max-w-xl mx-auto w-full px-6 py-12 flex-1 flex flex-col justify-center">
        <div dir={lang === "fa" ? "rtl" : "ltr"} className="phone border border-[#e2e0d8] shadow-md bg-white mx-auto">
          {/* STEP 1: ROLE SELECTION */}
          {step === "role" && (
            <div className="space-y-6">
              <div className="text-center">
                <p className="font-bold text-lg mb-1">{t[lang].welcome}</p>
                <p className="text-xs text-[#6b6a63]">{t[lang].subWelcome}</p>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => setAccountType("ADULT_HERITAGE")}
                  className={`w-full text-left p-4 rounded-2xl border transition-all flex items-center gap-4 cursor-pointer ${
                    accountType === "ADULT_HERITAGE"
                      ? "bg-[#e6f1fb] border-[#378add]"
                      : "bg-[#f4f2ec] border-[#e2e0d8] hover:border-[#c9c7bd]"
                  }`}
                >
                  <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-lg shrink-0">👤</div>
                  <div>
                    <h4 className="font-bold text-sm text-[#1f1e1c]">{t[lang].selfLearn}</h4>
                    <p className="text-xs text-[#6b6a63]">{t[lang].selfLearnDesc}</p>
                  </div>
                </button>

                <button
                  onClick={() => setAccountType("PARENT")}
                  className={`w-full text-left p-4 rounded-2xl border transition-all flex items-center gap-4 cursor-pointer ${
                    accountType === "PARENT"
                      ? "bg-[#e6f1fb] border-[#378add]"
                      : "bg-[#f4f2ec] border-[#e2e0d8] hover:border-[#c9c7bd]"
                  }`}
                >
                  <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-lg shrink-0">👪</div>
                  <div>
                    <h4 className="font-bold text-sm text-[#1f1e1c]">{t[lang].parentLearn}</h4>
                    <p className="text-xs text-[#6b6a63]">{t[lang].parentLearnDesc}</p>
                  </div>
                </button>
              </div>

              <button
                onClick={() => setStep("questionnaire")}
                className="w-full py-3 bg-[#1f1e1c] hover:bg-black text-white rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
              >
                {t[lang].continue}
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* STEP 2: QUESTIONNAIRE */}
          {step === "questionnaire" && (
            <div className="space-y-6">
              <div className="flex gap-1.5">
                <div className="flex-1 h-1.5 bg-[#378add] rounded-full" />
                <div className="flex-1 h-1.5 bg-[#e2e0d8] rounded-full" />
              </div>
              <p className="text-[10px] text-[#9a988f] font-bold uppercase">{t[lang].step1Title}</p>

              {/* Questionnaire fields */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#1f1e1c] mb-2">{t[lang].step1Label1}</label>
                  <div className="space-y-2">
                    {["Mostly Persian", "A mix of Persian and English", "Mostly English"].map((opt) => (
                      <label
                        key={opt}
                        className={`flex items-center gap-3 p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                          homeLanguage === opt
                            ? "bg-[#e6f1fb] border-[#378add] text-[#185fa5] font-bold"
                            : "bg-white border-[#e2e0d8] hover:border-[#c9c7bd]"
                        }`}
                      >
                        <input
                          type="radio"
                          name="homeLanguage"
                          checked={homeLanguage === opt}
                          onChange={() => setHomeLanguage(opt)}
                          className="accent-[#378add]"
                        />
                        <span>{opt}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {accountType === "ADULT_HERITAGE" ? (
                  <div>
                    <label className="block text-xs font-bold text-[#1f1e1c] mb-2">{t[lang].step1Label2}</label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={holidayFamiliarity}
                      onChange={(e) => setHolidayFamiliarity(parseInt(e.target.value))}
                      className="w-full accent-[#378add]"
                    />
                    <div className="flex justify-between text-[10px] text-[#9a988f] mt-1 font-bold">
                      <span>{t[lang].holidayLow}</span>
                      <span>{t[lang].holidayHigh}</span>
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-bold text-[#1f1e1c] mb-2">{t[lang].alphabetLabel}</label>
                    <div className="flex gap-2">
                      {["Yes", "No", "Not sure"].map((opt) => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => setAlphabetRecognition(opt)}
                          className={`flex-1 py-2.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                            alphabetRecognition === opt
                              ? "bg-[#e6f1fb] border-[#378add] text-[#185fa5]"
                              : "bg-[#f4f2ec] border-[#e2e0d8] hover:border-[#c9c7bd]"
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setStep("role")}
                  className="flex-1 py-3 bg-[#f4f2ec] hover:bg-[#e2e0d8] text-[#6b6a63] rounded-xl font-bold text-xs transition-all cursor-pointer"
                >
                  {t[lang].back}
                </button>
                <button
                  onClick={() => setStep("test")}
                  className="flex-1 py-3 bg-[#1f1e1c] hover:bg-black text-white rounded-xl font-bold text-xs transition-all cursor-pointer shadow-sm"
                >
                  {t[lang].next}
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: PLACEMENT TEST */}
          {step === "test" && (
            <div className="space-y-6">
              <div className="flex gap-1.5">
                <div className="flex-1 h-1.5 bg-[#378add] rounded-full" />
                <div className="flex-1 h-1.5 bg-[#378add] rounded-full" />
                <div className={`flex-1 h-1.5 rounded-full ${testSection >= 2 ? "bg-[#378add]" : "bg-[#e2e0d8]"}`} />
                <div className={`flex-1 h-1.5 rounded-full ${testSection >= 3 ? "bg-[#378add]" : "bg-[#e2e0d8]"}`} />
              </div>
              <p className="text-[10px] text-[#9a988f] font-bold uppercase">{t[lang].testTitle}</p>

              {/* Test section 1: Listening */}
              {testSection === 1 && (
                <div className="space-y-4">
                  <span className="badge bg-[#e6f1fb] text-[#185fa5] font-semibold">{t[lang].listeningSec}</span>
                  <p className="text-xs text-[#6b6a63] leading-relaxed">{t[lang].listeningPrompt}</p>

                  <div className="bg-[#f4f2ec] rounded-2xl p-4 text-center border border-[#e2e0d8] space-y-3">
                    <button
                      type="button"
                      onClick={() => playLocalAudio("onboarding_test.mp3")}
                      className="w-12 h-12 bg-[#1f1e1c] hover:bg-black rounded-full flex items-center justify-center mx-auto text-white cursor-pointer shadow-sm"
                    >
                      <Volume2 className="w-5 h-5" />
                    </button>
                    <span className="text-[10px] text-[#9a988f] font-bold uppercase">{t[lang].playAudio}</span>
                  </div>

                  <div className="space-y-2">
                    {["Grandmother's house", "School", "Market"].map((opt) => (
                      <button
                        key={opt}
                        onClick={() => setListeningAnswer(opt)}
                        className={`w-full text-left p-3.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                          listeningAnswer === opt
                            ? "bg-[#e6f1fb] border-[#378add] text-[#185fa5]"
                            : "bg-white border-[#e2e0d8] hover:bg-[#f4f2ec]"
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Test section 2: Reading */}
              {testSection === 2 && (
                <div className="space-y-4">
                  <span className="badge bg-[#e6f1fb] text-[#185fa5] font-semibold">{t[lang].readingSec}</span>
                  <p className="text-xs text-[#6b6a63] leading-relaxed">{t[lang].readingPrompt}</p>

                  <div className="bg-[#f4f2ec] rounded-2xl p-4 text-center border border-[#e2e0d8]">
                    <span className="text-2xl font-bold text-[#185fa5]">کتاب</span>
                  </div>

                  <div className="space-y-2">
                    {["Apple", "Book", "Pen", "Notebook"].map((opt) => (
                      <button
                        key={opt}
                        onClick={() => setReadingAnswer(opt)}
                        className={`w-full text-left p-3.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                          readingAnswer === opt
                            ? "bg-[#e6f1fb] border-[#378add] text-[#185fa5]"
                            : "bg-white border-[#e2e0d8] hover:bg-[#f4f2ec]"
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Test section 3: Speaking */}
              {testSection === 3 && (
                <div className="space-y-4">
                  <span className="badge bg-[#e6f1fb] text-[#185fa5] font-semibold">{t[lang].speakingSec}</span>
                  <p className="text-xs text-[#6b6a63] leading-relaxed">{t[lang].speakingPrompt}</p>

                  <div className="bg-white border border-[#e2e0d8] rounded-2xl p-6 text-center space-y-4 shadow-inner">
                    <div className="flex justify-center items-center">
                      {isListening ? (
                        <button
                          type="button"
                          onClick={stopListening}
                          className="w-16 h-16 bg-[#ba7517] hover:bg-[#854f0b] rounded-full flex items-center justify-center text-white cursor-pointer shadow-md animate-pulse"
                        >
                          <MicOff className="w-5 h-5" />
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={startListening}
                          className="w-16 h-16 bg-[#378add] hover:bg-[#185fa5] rounded-full flex items-center justify-center text-white cursor-pointer shadow-md"
                        >
                          <Mic className="w-5 h-5" />
                        </button>
                      )}
                    </div>

                    <div className="text-center space-y-1">
                      <span className="text-[10px] text-[#9a988f] font-bold uppercase tracking-wider block">
                        {isListening ? "Listening..." : t[lang].speakBtn}
                      </span>
                      {spokenText && (
                        <p className="text-xs font-bold text-[#185fa5] bg-[#e6f1fb] px-3.5 py-1.5 rounded-xl border border-[#378add]/10 inline-block">
                          Spoken: "{spokenText}"
                        </p>
                      )}
                      {speechError && <p className="text-[9px] text-[#854f0b] font-medium">{speechError}</p>}
                    </div>
                  </div>
                </div>
              )}

              <button
                onClick={handleTestNext}
                disabled={
                  (testSection === 1 && !listeningAnswer) ||
                  (testSection === 2 && !readingAnswer)
                }
                className="w-full py-3 bg-[#1f1e1c] hover:bg-black text-white rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm disabled:opacity-50"
              >
                {t[lang].next}
              </button>
            </div>
          )}

          {/* STEP 4: SIGNUP PROFILE */}
          {step === "signup" && (
            <div className="space-y-6">
              <div className="text-center">
                <p className="font-bold text-lg mb-1">{t[lang].signupTitle}</p>
                <p className="text-xs text-[#6b6a63]">{t[lang].signupSub}</p>
              </div>

              <form onSubmit={handleSignupSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#6b6a63] mb-1">{t[lang].username}</label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Choose a username..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#c9c7bd] bg-[#faf9f6] text-xs text-[#1f1e1c] focus:outline-none focus:border-[#378add] transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#6b6a63] mb-1">{t[lang].password}</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Choose a password..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#c9c7bd] bg-[#faf9f6] text-xs text-[#1f1e1c] focus:outline-none focus:border-[#378add] transition-all"
                    required
                  />
                </div>

                {error && (
                  <p className="text-xs text-[#854f0b] bg-[#faeeda] p-2.5 rounded-xl border border-[#ba7517]/25 font-bold">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 bg-[#1f1e1c] hover:bg-black text-white text-center rounded-xl font-bold text-xs transition-all cursor-pointer shadow-sm"
                >
                  {isLoading ? "..." : t[lang].submit}
                </button>
              </form>
            </div>
          )}

          {/* STEP 5: TEST SKILLS RESULT */}
          {step === "result" && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-[#eaf3de] rounded-full flex items-center justify-center mx-auto text-[#3b6d11] mb-2 shadow-sm">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <p className="font-bold text-lg mb-1">{t[lang].resultTitle}</p>
                <p className="text-xs text-[#6b6a63] leading-relaxed">{t[lang].resultSub}</p>
              </div>

              {/* 4D Skill profile bars */}
              <div className="bg-[#f4f2ec] rounded-2xl p-5 space-y-4">
                <div>
                  <div className="flex justify-between text-[11px] font-bold mb-1">
                    <span>{t[lang].listening}</span>
                    <span>{skills.listening}%</span>
                  </div>
                  <div className="bar">
                    <div className="bar-fill" style={{ width: `${skills.listening}%`, backgroundColor: "var(--success-fill)" }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[11px] font-bold mb-1">
                    <span>{t[lang].speaking}</span>
                    <span>{skills.speaking}%</span>
                  </div>
                  <div className="bar">
                    <div className="bar-fill" style={{ width: `${skills.speaking}%`, backgroundColor: "var(--warning-fill)" }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[11px] font-bold mb-1">
                    <span>{t[lang].reading}</span>
                    <span>{skills.reading}%</span>
                  </div>
                  <div className="bar">
                    <div className="bar-fill" style={{ width: `${skills.reading}%`, backgroundColor: "var(--accent-fill)" }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[11px] font-bold mb-1">
                    <span>{t[lang].writing}</span>
                    <span>{skills.writing}%</span>
                  </div>
                  <div className="bar">
                    <div className="bar-fill" style={{ width: `${skills.writing}%`, backgroundColor: "var(--border-strong)" }} />
                  </div>
                </div>
              </div>

              <button
                onClick={() => router.push("/dashboard")}
                className="w-full py-3 bg-[#1f1e1c] hover:bg-black text-white text-center rounded-xl font-bold text-xs transition-all cursor-pointer shadow-sm"
              >
                {t[lang].startAdventure}
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 border-t border-[#e2e0d8] text-center text-[#9a988f] text-[10px] font-semibold bg-white">
        Farsiyar placement test module.
      </footer>
    </div>
  );
}
