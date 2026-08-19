"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, XCircle, Mic, MicOff, Volume2, AlertTriangle, Globe } from "lucide-react";

interface Question {
  id: string;
  order: number;
  type: "SELECT" | "SPEAK" | "LISTEN_IMAGE" | "STORY_ORDER";
  promptEn: string;
  promptFa: string;
  options: string; // JSON string array
  correctAnswer: string;
}

interface Lesson {
  id: string;
  titleEn: string;
  titleFa: string;
  xpReward: number;
  questions: Question[];
}

export default function LessonPage() {
  const router = useRouter();
  const { id } = useParams();

  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [lang, setLang] = useState<"en" | "fa">("en");
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

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
  
  // STORY_ORDER specific state
  const [storyOrderList, setStoryOrderList] = useState<string[]>([]);
  const [isAnswerChecked, setIsAnswerChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  // Speech Recognition states
  const [isListening, setIsListening] = useState(false);
  const [spokenText, setSpokenText] = useState("");
  const [speechError, setSpeechError] = useState("");
  const recognitionRef = useRef<any>(null);

  // Lesson end states
  const [isFinished, setIsFinished] = useState(false);
  const [username, setUsername] = useState("");

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem("farsi_username");
    if (!savedUser) {
      router.push("/");
      return;
    }
    setUsername(savedUser);

    async function fetchLesson() {
      try {
        const res = await fetch(`/api/lessons/${id}`);
        if (!res.ok) throw new Error("Lesson not found");
        const data = await res.json();
        setLesson(data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchLesson();
  }, [id, router]);

  useEffect(() => {
    if (!lesson || !lesson.questions || lesson.questions.length === 0) return;
    const currentQ = lesson.questions[currentQIndex];
    if (currentQ && currentQ.type === "STORY_ORDER" && storyOrderList.length === 0) {
      try {
        const opts = JSON.parse(currentQ.options || "[]");
        if (Array.isArray(opts) && opts.length > 0) {
          const shuffled = [...opts].sort(() => Math.random() - 0.5);
          setStoryOrderList(shuffled);
        }
      } catch (e) {
        console.error(e);
      }
    }
  }, [currentQIndex, lesson, storyOrderList.length]);


  // Set up Speech Recognition on browser
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        try {
          const rec = new SpeechRecognition();
          rec.lang = "fa-IR"; // Persian language code
          rec.interimResults = false;
          rec.maxAlternatives = 1;

          rec.onstart = () => {
            setIsListening(true);
            setSpeechError("");
            setSpokenText("");
          };

          rec.onresult = (event: any) => {
            const resultText = event.results[0][0].transcript;
            setSpokenText(resultText);
            setIsListening(false);
            verifySpokenAnswer(resultText);
          };

          rec.onerror = (event: any) => {
            console.error("Speech error", event);
            setSpeechError("Could not recognize speech. Please try again.");
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
  }, [lesson, currentQIndex]);

  const startListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
      } catch (e) {
        console.error("Failed to start speech recognition", e);
      }
    } else {
      setSpeechError("Web Speech API is not supported in this browser. Please try Chrome or Safari.");
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  const handleTextToSpeech = (text: string) => {
    if (!text) return;
    if (text.startsWith("/uploads/") || text.startsWith("http")) {
      const audio = new Audio(text);
      audio.play().catch((e) => console.error("Audio play error", e));
      return;
    }
    const cleanText = text.trim().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?؟]/g, "");

    if (cleanText === "سلام") {
      const audio = new Audio("/audio/salam.mp3");
      audio.play().catch((e) => console.error(e));
      return;
    }
    if (cleanText === "حال شما چطور است") {
      const audio = new Audio("/audio/hal_e_shoma.mp3");
      audio.play().catch((e) => console.error(e));
      return;
    }
    if (cleanText === "خیلی ممنون") {
      const audio = new Audio("/audio/kheyli_mamnun.mp3");
      audio.play().catch((e) => console.error(e));
      return;
    }

    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "fa-IR";
      const voices = window.speechSynthesis.getVoices();
      const voice = voices.find((v) => v.lang.startsWith("fa") || v.lang.includes("IR"));
      if (voice) utterance.voice = voice;
      window.speechSynthesis.speak(utterance);
    }
  };

  const verifySpokenAnswer = (spoken: string) => {
    if (!lesson) return;
    const currentQuestion = lesson.questions[currentQIndex];

    const cleanText = (str: string) =>
      str
        .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?؟]/g, "")
        .replace(/\s+/g, "")
        .trim();

    const cleanSpoken = cleanText(spoken);
    const cleanCorrect = cleanText(currentQuestion.correctAnswer);

    const matches = cleanSpoken.includes(cleanCorrect) || cleanCorrect.includes(cleanSpoken);

    setIsCorrect(matches);
    setIsAnswerChecked(true);
  };

  const handleOptionSelect = (option: string) => {
    if (isAnswerChecked) return;
    setSelectedOption(option);
  };

  const handleCheckAnswer = () => {
    if (!lesson || isAnswerChecked) return;

    const currentQuestion = lesson.questions[currentQIndex];
    if (currentQuestion.type === "SELECT" || currentQuestion.type === "LISTEN_IMAGE") {
      const correct = selectedOption === currentQuestion.correctAnswer;
      setIsCorrect(correct);
      setIsAnswerChecked(true);
    } else if (currentQuestion.type === "STORY_ORDER") {
      const correct = JSON.stringify(storyOrderList) === currentQuestion.correctAnswer;
      setIsCorrect(correct);
      setIsAnswerChecked(true);
    }
  };

  const handleNext = async () => {
    if (!lesson) return;

    if (currentQIndex < lesson.questions.length - 1) {
      setCurrentQIndex((prev) => prev + 1);
      setSelectedOption(null);
      setStoryOrderList([]);
      setIsAnswerChecked(false);
      setSpokenText("");
      setSpeechError("");
    } else {
      setIsFinished(true);
      try {
        const userRes = await fetch(`/api/user?username=${encodeURIComponent(username)}`);
        if (userRes.ok) {
          const user = await userRes.json();
          const completedList: string[] = JSON.parse(user.completedLessons || "[]");

          const isNewCompletion = !completedList.includes(lesson.id);
          if (isNewCompletion) {
            completedList.push(lesson.id);
          }

          const newXp = user.xp + (isNewCompletion ? lesson.xpReward : 5);
          
          let newStreak = user.streak;
          const today = new Date().toDateString();
          const lastActiveDate = user.lastActive ? new Date(user.lastActive).toDateString() : "";
          if (lastActiveDate !== today) {
            newStreak += 1;
          }

          await fetch("/api/user", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              username,
              xp: newXp,
              streak: newStreak,
              lastActive: new Date().toISOString(),
              completedLessons: completedList,
            }),
          });
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#faf9f6] text-[#1f1e1c]">
        <div className="w-10 h-10 border-4 border-[#378add] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!lesson || lesson.questions.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-[#faf9f6] text-[#1f1e1c] p-6 text-center">
        <AlertTriangle className="w-12 h-12 text-[#ba7517] mb-4" />
        <h2 className="text-xl font-bold mb-2">No Questions Found</h2>
        <p className="text-sm text-[#6b6a63] mb-6">This lesson doesn't have any questions configured yet.</p>
        <Link href="/dashboard" className="px-6 py-3 bg-[#1f1e1c] text-white hover:bg-black rounded-xl font-semibold text-sm transition-all">
          Back to Road
        </Link>
      </div>
    );
  }

  const currentQuestion = lesson.questions[currentQIndex];
  const progressPercent = ((currentQIndex + (isAnswerChecked ? 1 : 0)) / lesson.questions.length) * 100;

  if (isFinished) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-[#faf9f6] text-[#1f1e1c] p-6">
        <div className="p-8 max-w-md w-full bg-white border border-[#e2e0d8] rounded-3xl text-center space-y-6 shadow-sm">
          <div className="w-20 h-20 bg-[#eaf3de] rounded-full flex items-center justify-center mx-auto text-[#3b6d11]">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold text-[#1f1e1c]">
            Lesson Completed!
          </h2>
          <p className="text-sm text-[#6b6a63]">
            Great job! You finished the lesson and strengthened your Persian skills.
          </p>
          <div className="py-4 border-y border-[#e2e0d8] flex justify-around">
            <div>
              <div className="text-[11px] text-[#9a988f] font-bold uppercase tracking-wider mb-0.5">XP Reward</div>
              <div className="text-xl font-bold text-[#ba7517]">+{lesson.xpReward}</div>
            </div>
            <div>
              <div className="text-[11px] text-[#9a988f] font-bold uppercase tracking-wider mb-0.5">Status</div>
              <div className="text-xl font-bold text-[#3b6d11]">Excellent</div>
            </div>
          </div>
          <Link
            href="/dashboard"
            className="block w-full py-3 bg-[#1f1e1c] hover:bg-black text-white rounded-xl font-semibold text-sm transition-all"
          >
            Continue Road
          </Link>
        </div>
      </div>
    );
  }

  let optionsList: string[] = [];
  try {
    optionsList = JSON.parse(currentQuestion.options || "[]");
  } catch (e) {
    console.error(e);
  }

  return (
    <div className="flex-1 bg-[#faf9f6] text-[#1f1e1c] flex flex-col justify-between min-h-screen">
      {/* Top Header / Progress */}
      <header className="max-w-xl mx-auto w-full px-6 py-6 flex items-center gap-4">
        <Link href="/dashboard" className="p-2 hover:bg-[#f4f2ec] rounded-xl transition-all">
          <ArrowLeft className="w-4 h-4 text-[#6b6a63]" />
        </Link>
        <div className="flex-1 h-2 bg-[#e2e0d8] rounded-full overflow-hidden">
          <div
            className="h-full bg-[#378add] transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <span className="text-[11px] font-bold text-[#6b6a63]">
          {currentQIndex + 1}/{lesson.questions.length}
        </span>
        <button
          onClick={toggleLanguage}
          className="flex items-center gap-1 px-2.5 py-1 rounded-full border border-[#e2e0d8] bg-white hover:bg-[#f4f2ec] transition-colors text-[10px] font-bold"
        >
          <Globe className="w-3 h-3 text-[#185fa5]" />
          <span>{lang === "en" ? "فارسی" : "EN"}</span>
        </button>
      </header>

      {/* Main Quiz Area */}
      <main className="max-w-xl mx-auto w-full px-6 py-6 flex-1 flex flex-col justify-center">
        <div className="space-y-6">
          {/* Audio / Instruction Card */}
          <div className="bg-[#f4f2ec] border border-[#e2e0d8] rounded-2xl p-5 shadow-sm space-y-4">
            <h3 className="text-base font-bold leading-relaxed">
              {lang === "fa" && currentQuestion.promptFa && !currentQuestion.promptFa.startsWith("/uploads/") && currentQuestion.type !== "STORY_ORDER"
                ? currentQuestion.promptFa
                : currentQuestion.promptEn}
            </h3>

            {/* Audio player if question has an uploaded MP3 file */}
            {currentQuestion.promptFa && currentQuestion.promptFa.startsWith("/uploads/") && (
              <audio controls className="w-full h-10 accent-[#378add] mt-2">
                <source src={currentQuestion.promptFa} type="audio/mpeg" />
                Your browser does not support the audio element.
              </audio>
            )}

            {/* Special STORY_ORDER Story Card */}
            {currentQuestion.type === "STORY_ORDER" && currentQuestion.promptFa && !currentQuestion.promptFa.startsWith("/uploads/") && (
              <div dir="rtl" className="flex items-center gap-3 bg-[#e6f1fb] border border-[#378add]/15 p-4 sm:p-5 rounded-2xl text-right mt-3">
                <div dir="rtl" className="text-sm sm:text-base font-bold text-[#185fa5] flex-1 leading-relaxed text-right font-fa break-words [word-break:break-word]">
                  {currentQuestion.promptFa}
                </div>
                <button
                  onClick={() => handleTextToSpeech(currentQuestion.promptFa)}
                  className="p-3 bg-white hover:bg-[#f4f2ec] border border-[#e2e0d8] rounded-xl transition-all cursor-pointer shrink-0 shadow-2xs"
                  title="Listen"
                >
                  <Volume2 className="w-5 h-5 text-[#185fa5]" />
                </button>
              </div>
            )}

            {/* Special SPEAK Question Audio Player */}
            {currentQuestion.type === "SPEAK" && (
              <div dir="rtl" className="flex items-center justify-between gap-3 bg-[#e6f1fb] border border-[#378add]/15 p-4 rounded-2xl text-right mt-3">
                <span className="text-xl font-bold text-[#185fa5] text-right font-fa flex-1">
                  {currentQuestion.correctAnswer}
                </span>
                <button
                  onClick={() => handleTextToSpeech(currentQuestion.correctAnswer)}
                  className="p-2.5 bg-white hover:bg-[#f4f2ec] border border-[#e2e0d8] rounded-xl transition-all cursor-pointer shrink-0"
                  title="Listen"
                >
                  <Volume2 className="w-5 h-5 text-[#185fa5]" />
                </button>
              </div>
            )}
          </div>

          {/* Input Panel */}
          {currentQuestion.type === "SELECT" ? (
            <div className="grid grid-cols-1 gap-3">
              {optionsList.map((opt) => {
                const isSelected = selectedOption === opt;
                return (
                  <button
                    key={opt}
                    onClick={() => handleOptionSelect(opt)}
                    className={`w-full text-left p-4 rounded-xl border font-semibold text-sm transition-all cursor-pointer ${
                      isSelected
                        ? "bg-[#e6f1fb] border-[#378add] text-[#185fa5]"
                        : "bg-white border-[#e2e0d8] hover:bg-[#f4f2ec] text-[#1f1e1c]"
                    }`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          ) : currentQuestion.type === "LISTEN_IMAGE" ? (
            <div className="grid grid-cols-2 gap-4">
              {optionsList.map((opt) => {
                const isSelected = selectedOption === opt;
                return (
                  <button
                    key={opt}
                    disabled={isAnswerChecked}
                    onClick={() => handleOptionSelect(opt)}
                    className={`relative border-2 rounded-2xl overflow-hidden p-2 bg-white transition-all cursor-pointer ${
                      isSelected
                        ? "border-[#378add] ring-2 ring-[#378add]/10"
                        : "border-[#e2e0d8] hover:border-[#c9c7bd]"
                    }`}
                  >
                    <div className="aspect-square w-full relative rounded-lg overflow-hidden bg-[#faf9f6] flex items-center justify-center">
                      <img src={opt} alt="Option" className="object-contain max-h-full max-w-full rounded-md" />
                    </div>
                  </button>
                );
              })}
            </div>
          ) : currentQuestion.type === "STORY_ORDER" ? (
            <div className="space-y-4">
              <span className="text-[10px] text-[#9a988f] font-bold uppercase tracking-wider block text-center">
                Drag/Tap images to match correct story sequence:
              </span>
              <div className="grid grid-cols-2 gap-4">
                {storyOrderList.map((opt, idx) => (
                  <div
                    key={opt}
                    className="relative border border-[#e2e0d8] rounded-2xl p-2 bg-white flex flex-col items-center gap-2 shadow-sm"
                  >
                    <div className="aspect-square w-full rounded-lg overflow-hidden bg-gray-50 flex items-center justify-center border border-[#e2e0d8]/50">
                      <img src={opt} alt="Story step" className="object-contain max-h-full max-w-full" />
                    </div>
                    
                    <div className="flex items-center gap-2 w-full justify-between mt-1">
                      <span className="w-5 h-5 rounded-full bg-[#185fa5] text-white flex items-center justify-center text-[10px] font-bold">
                        {idx + 1}
                      </span>
                      <div className="flex gap-1" style={{ display: isAnswerChecked ? "none" : "flex" }}>
                        <button
                          disabled={idx === 0}
                          onClick={() => {
                            const copy = [...storyOrderList];
                            const temp = copy[idx];
                            copy[idx] = copy[idx - 1];
                            copy[idx - 1] = temp;
                            setStoryOrderList(copy);
                          }}
                          className="px-2 py-0.5 bg-[#f4f2ec] hover:bg-[#e2e0d8] text-[9px] font-bold rounded cursor-pointer disabled:opacity-30"
                        >
                          ◀
                        </button>
                        <button
                          disabled={idx === storyOrderList.length - 1}
                          onClick={() => {
                            const copy = [...storyOrderList];
                            const temp = copy[idx];
                            copy[idx] = copy[idx + 1];
                            copy[idx + 1] = temp;
                            setStoryOrderList(copy);
                          }}
                          className="px-2 py-0.5 bg-[#f4f2ec] hover:bg-[#e2e0d8] text-[9px] font-bold rounded cursor-pointer disabled:opacity-30"
                        >
                          ▶
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-6 bg-white border border-[#e2e0d8] rounded-2xl space-y-4 shadow-sm">
              <div className="flex items-center gap-4">
                {isListening ? (
                  <button
                    onClick={stopListening}
                    className="w-16 h-16 bg-[#ba7517] hover:bg-[#854f0b] rounded-full flex items-center justify-center shadow-md animate-pulse cursor-pointer"
                  >
                    <MicOff className="w-6 h-6 text-white" />
                  </button>
                ) : (
                  <button
                    onClick={startListening}
                    disabled={isAnswerChecked}
                    className="w-16 h-16 bg-[#378add] hover:bg-[#185fa5] rounded-full flex items-center justify-center shadow-md disabled:opacity-50 cursor-pointer"
                  >
                    <Mic className="w-6 h-6 text-white" />
                  </button>
                )}
              </div>

              <div className="text-center">
                <span className="text-[10px] text-[#9a988f] font-bold uppercase tracking-wider block mb-1">
                  {isListening ? "Listening..." : "Tap mic to speak"}
                </span>
                {spokenText && (
                  <div className="text-xs font-semibold text-[#185fa5] bg-[#e6f1fb] px-3.5 py-2 rounded-xl border border-[#378add]/10 mt-1">
                    Spoken: "{spokenText}"
                  </div>
                )}
                {speechError && <div className="text-[10px] text-[#854f0b] mt-1">{speechError}</div>}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Action Footer */}
      <footer className={`border-t transition-all duration-300 ${
        isAnswerChecked
          ? isCorrect
            ? "bg-[#eaf3de] border-[#639922]/20"
            : "bg-[#faeeda] border-[#ba7517]/20"
          : "bg-white border-[#e2e0d8]"
      } py-6`}>
        <div className="max-w-xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex-1">
            {isAnswerChecked && (
              <div className="flex items-center gap-3">
                {isCorrect ? (
                  <>
                    <CheckCircle2 className="w-6 h-6 text-[#3b6d11]" />
                    <div>
                      <div className="font-bold text-[#3b6d11] text-sm">Excellent!</div>
                      <div className="text-[11px] text-[#3b6d11]/80">Correct pronunciation/translation.</div>
                    </div>
                  </>
                ) : (
                  <>
                    <XCircle className="w-6 h-6 text-[#854f0b]" />
                    <div>
                      <div className="font-bold text-[#854f0b] text-sm">Incorrect</div>
                      <div className="text-[11px] text-[#854f0b]/80">Correct Answer: {currentQuestion.correctAnswer}</div>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          <div className="w-full sm:w-auto">
            {isAnswerChecked ? (
              <button
                onClick={handleNext}
                className="w-full sm:w-auto px-8 py-3 bg-[#1f1e1c] text-white hover:bg-black font-bold rounded-xl text-xs transition-all cursor-pointer"
              >
                Continue
              </button>
            ) : (
              <button
                onClick={handleCheckAnswer}
                disabled={
                  ((currentQuestion.type === "SELECT" || currentQuestion.type === "LISTEN_IMAGE") && !selectedOption) ||
                  (currentQuestion.type === "STORY_ORDER" && storyOrderList.length === 0)
                }
                className="w-full sm:w-auto px-8 py-3 bg-[#378add] hover:bg-[#185fa5] disabled:opacity-50 text-white font-bold rounded-xl text-xs transition-all cursor-pointer"
              >
                Check Answer
              </button>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}
