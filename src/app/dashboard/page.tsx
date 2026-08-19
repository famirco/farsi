"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Flame, Star, Award, CheckCircle2, Lock, User, PlusCircle, Sparkles, BookOpen, Plus, Heart, GraduationCap, ShieldAlert, Globe } from "lucide-react";

interface Term {
  id: string;
  order: number;
  titleEn: string;
  titleFa: string;
  levels: Level[];
}

interface Level {
  id: string;
  termId: string;
  order: number;
  titleEn: string;
  titleFa: string;
  lessons: Lesson[];
}

interface Lesson {
  id: string;
  levelId: string;
  order: number;
  titleEn: string;
  titleFa: string;
  descEn: string;
  descFa: string;
  xpReward: number;
}

interface UserProfile {
  id: string;
  username: string;
  role: string;
  accountType: "ADULT_HERITAGE" | "PARENT" | "CHILD";
  parentUserId: string | null;
  whyLearning: string | null;
  xp: number;
  streak: number;
  completedLessons: string; // JSON string
  unlockedUntilLessonId: string | null;
  skills: string; // JSON string
  unlockedTerms: string; // JSON string
}

export default function Dashboard() {
  const router = useRouter();
  const [lang, setLang] = useState<"en" | "fa">("en");
  const [user, setUser] = useState<UserProfile | null>(null);
  const [terms, setTerms] = useState<Term[]>([]);
  const [completedIds, setCompletedIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [flatLessons, setFlatLessons] = useState<Lesson[]>([]);

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

  // Parent states
  const [children, setChildren] = useState<UserProfile[]>([]);
  const [newChildName, setNewChildName] = useState("");
  const [newChildPass, setNewChildPass] = useState("");
  const [isAddingChild, setIsAddingChild] = useState(false);

  // Skill states
  const [parsedSkills, setParsedSkills] = useState({ listening: 30, speaking: 30, reading: 30, writing: 30 });

  useEffect(() => {
    const savedUser = localStorage.getItem("farsi_username");
    if (!savedUser) {
      router.push("/");
      return;
    }

    async function fetchData() {
      try {
        const userRes = await fetch(`/api/user?username=${encodeURIComponent(savedUser || "")}`);
        if (!userRes.ok) throw new Error("Failed to load user");
        const userData = await userRes.json();
        setUser(userData);
        setCompletedIds(JSON.parse(userData.completedLessons || "[]"));
        
        try {
          setParsedSkills(JSON.parse(userData.skills || "{}"));
        } catch(e) {}

        // Fetch terms
        const termsRes = await fetch("/api/terms");
        if (termsRes.ok) {
          const termsData = await termsRes.json();
          setTerms(termsData);

          const flat: Lesson[] = [];
          if (Array.isArray(termsData)) {
            termsData.forEach((t: Term) => {
              t.levels.forEach((lv: Level) => {
                lv.lessons.forEach((ls: Lesson) => {
                  flat.push({
                    ...ls,
                    termId: t.id,
                    termOrder: t.order,
                  } as any);
                });
              });
            });
          }
          setFlatLessons(flat);
        }

        // If parent, fetch children profiles
        if (userData.accountType === "PARENT") {
          const childrenRes = await fetch(`/api/users?parentUserId=${userData.id}`);
          if (childrenRes.ok) {
            const childrenData = await childrenRes.json();
            setChildren(childrenData);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("farsi_username");
    router.push("/");
  };

  const handleAddChild = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChildName.trim() || !newChildPass.trim() || !user) return;

    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: newChildName.trim(),
          password: newChildPass.trim(),
          parentUserId: user.id,
        }),
      });

      if (res.ok) {
        setNewChildName("");
        setNewChildPass("");
        setIsAddingChild(false);
        // Refresh children
        const childrenRes = await fetch(`/api/users?parentUserId=${user.id}`);
        const childrenData = await childrenRes.json();
        setChildren(childrenData);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const checkIsTermUnlocked = (termOrder: number, termId: string) => {
    if (termOrder === 1) return true;
    if (user?.unlockedTerms) {
      try {
        const unlockedList = JSON.parse(user.unlockedTerms || "[]");
        if (Array.isArray(unlockedList) && (unlockedList.includes(termId) || unlockedList.includes(String(termOrder)))) {
          return true;
        }
      } catch (e) {}
    }
    return false;
  };

  const checkIsUnlocked = (lessonId: string, indexInFlat: number) => {
    // Check if the term it belongs to is unlocked first
    const lessonObj = flatLessons[indexInFlat];
    if (lessonObj && (lessonObj as any).termOrder) {
      const isTermUnlocked = checkIsTermUnlocked((lessonObj as any).termOrder, (lessonObj as any).termId);
      if (!isTermUnlocked) return false;
    }

    if (indexInFlat === 0) return true;

    if (user?.unlockedUntilLessonId) {
      const targetIndex = flatLessons.findIndex((l) => l.id === user.unlockedUntilLessonId);
      if (targetIndex !== -1 && indexInFlat <= targetIndex) {
        return true;
      }
    }

    const prevLesson = flatLessons[indexInFlat - 1];
    if (prevLesson && completedIds.includes(prevLesson.id)) {
      return true;
    }

    return false;
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#faf9f6] text-[#1f1e1c]">
        <div className="text-center space-y-4">
          <div className="w-10 h-10 border-4 border-[#378add] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-[#6b6a63] text-sm">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const currentPracticeLesson = flatLessons.find((l, idx) => !completedIds.includes(l.id) && checkIsUnlocked(l.id, idx)) || flatLessons[0];

  // ----------------------------------------------------
  // PARENT DASHBOARD VIEW
  // ----------------------------------------------------
  if (user?.accountType === "PARENT") {
    return (
      <div className="flex-1 bg-[#faf9f6] text-[#1f1e1c] min-h-screen pb-20">
        <header className="border-b border-[#e2e0d8] bg-white sticky top-0 z-30 shadow-sm">
          <div className="max-w-4xl mx-auto px-6 py-4 flex justify-between items-center">
            <span className="font-bold text-[#1f1e1c] text-lg">Farsiyar Parent Panel</span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-[#6b6a63] hover:text-[#1f1e1c] transition-colors text-xs font-semibold"
            >
              <User className="w-3.5 h-3.5" />
              <span>{user.username} (Logout)</span>
            </button>
          </div>
        </header>

        <main className="max-w-xl mx-auto px-6 pt-10 space-y-6">
          <div className="border border-[#e2e0d8] shadow-md bg-white rounded-[26px] p-6 w-full">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#e2e0d8]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#eaf3de] text-[#3b6d11] flex items-center justify-center font-bold text-lg">
                  S
                </div>
                <div>
                  <p className="margin:0 font-bold text-sm">Parent Profile</p>
                  <p className="margin:0 text-[11px] text-[#6b6a63]">{user.username}</p>
                </div>
              </div>
            </div>

            <p className="font-bold text-xs mb-3 text-[#1f1e1c]">My Children</p>
            <div className="space-y-3 mb-6">
              {children.map((child) => (
                <div key={child.id} className="bg-[#f4f2ec] rounded-2xl p-4 border border-[#e2e0d8]">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-[#eaf3de] flex items-center justify-center font-bold text-[#3b6d11] text-xs">
                        N
                      </div>
                      <div>
                        <p className="margin:0 font-bold text-xs">{child.username}</p>
                        <p className="margin:0 text-[10px] text-[#6b6a63]">Term 2 · Kids track</p>
                      </div>
                    </div>
                    <span className="badge bg-[#faeeda] text-[#854f0b] text-[10px] font-bold">🔥 {child.streak}</span>
                  </div>

                  <div className="flex gap-4 text-[10px] text-[#6b6a63] border-t border-[#e2e0d8] pt-2">
                    <span>{JSON.parse(child.completedLessons || "[]").length} lessons completed</span>
                    <span>2 classes this week</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Add Child Form */}
            {isAddingChild ? (
              <form onSubmit={handleAddChild} className="p-4 border border-dashed border-[#c9c7bd] rounded-2xl space-y-3 mb-6">
                <input
                  type="text"
                  placeholder="Child Username..."
                  value={newChildName}
                  onChange={(e) => setNewChildName(e.target.value)}
                  className="w-full px-3 py-2 bg-[#faf9f6] border border-[#c9c7bd] rounded-xl text-xs"
                  required
                />
                <input
                  type="password"
                  placeholder="Child Password..."
                  value={newChildPass}
                  onChange={(e) => setNewChildPass(e.target.value)}
                  className="w-full px-3 py-2 bg-[#faf9f6] border border-[#c9c7bd] rounded-xl text-xs"
                  required
                />
                <div className="flex gap-2">
                  <button type="submit" className="flex-1 py-2 bg-[#1f1e1c] text-white text-xs rounded-lg font-bold">Save</button>
                  <button type="button" onClick={() => setIsAddingChild(false)} className="flex-1 py-2 bg-[#f4f2ec] text-xs rounded-lg font-bold">Cancel</button>
                </div>
              </form>
            ) : (
              <button
                onClick={() => setIsAddingChild(true)}
                className="w-full py-3 border border-dashed border-[#c9c7bd] hover:border-[#1f1e1c] rounded-2xl flex items-center justify-center gap-1.5 text-xs text-[#6b6a63] font-bold transition-all mb-6 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Child Profile
              </button>
            )}

            {/* Family Sub info */}
            <div className="bg-[#f4f2ec] rounded-2xl p-4 flex items-center justify-between">
              <div>
                <p className="margin:0 0 2px font-bold text-xs text-[#1f1e1c]">Family subscription</p>
                <p className="margin:0 text-[10px] text-[#6b6a63]">Premium plan</p>
              </div>
              <button className="bg-white border border-[#e2e0d8] rounded-lg px-3 py-1.5 text-[10px] font-bold hover:bg-[#faf9f6]">
                Manage
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // ----------------------------------------------------
  // CHILD DASHBOARD VIEW
  // ----------------------------------------------------
  if (user?.accountType === "CHILD") {
    return (
      <div className="flex-1 bg-[#faf9f6] text-[#1f1e1c] min-h-screen pb-20">
        <header className="border-b border-[#e2e0d8] bg-white sticky top-0 z-30 shadow-sm">
          <div className="max-w-4xl mx-auto px-6 py-4 flex justify-between items-center">
            <span className="font-bold text-[#1f1e1c]">Farsiyar Kids Mode</span>
            <button onClick={handleLogout} className="text-xs text-[#6b6a63] font-bold">Switch Account</button>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-6 pt-10 grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left Column: Kids Profile Card */}
          <div className="md:col-span-1 space-y-6">
            <div className="border border-[#e2e0d8] shadow-md bg-white rounded-[26px] p-6 w-full mx-auto">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-[#eaf3de] rounded-full flex items-center justify-center text-3xl font-bold text-[#3b6d11] mx-auto mb-2">
                  {user.username.charAt(0).toUpperCase()}
                </div>
                <p className="font-bold text-base text-[#1f1e1c]">{user.username}</p>
                <p className="text-xs text-[#6b6a63]">Persian language explorer · Level 3</p>
              </div>

              <div className="flex items-center justify-center gap-1.5 py-2.5 bg-[#faeeda] border border-[#ba7517]/10 text-[#854f0b] font-bold rounded-full text-xs mb-6">
                <Flame className="w-4 h-4 fill-[#ba7517]" />
                <span>{user.streak}-day streak</span>
              </div>

              {/* Badges */}
              <p className="font-bold text-xs mb-3">My Badges</p>
              <div className="grid grid-cols-4 gap-3 mb-6">
                <div className="text-center">
                  <div className="aspect-square bg-[#eaf3de] rounded-xl flex items-center justify-center text-lg">🌱</div>
                  <p className="text-[9px] text-[#6b6a63] mt-1">Great start</p>
                </div>
                <div className="text-center">
                  <div className="aspect-square bg-[#e6f1fb] rounded-xl flex items-center justify-center text-lg">📚</div>
                  <p className="text-[9px] text-[#6b6a63] mt-1">Book lover</p>
                </div>
                <div className="text-center">
                  <div className="aspect-square bg-[#eeedfe] rounded-xl flex items-center justify-center text-lg">💬</div>
                  <p className="text-[9px] text-[#6b6a63] mt-1">Chatterbox</p>
                </div>
                <div className="text-center opacity-40">
                  <div className="aspect-square bg-[#f4f2ec] rounded-xl flex items-center justify-center text-lg">🔒</div>
                  <p className="text-[9px] text-[#9a988f] mt-1">Locked</p>
                </div>
              </div>

              {currentPracticeLesson && (
                <Link
                  href={`/lesson/${currentPracticeLesson.id}`}
                  className="block w-full py-4 bg-[#1f1e1c] hover:bg-black text-white text-center rounded-full font-bold text-xs shadow-sm hover:scale-[1.02] transition-all"
                >
                  Continue the adventure
                </Link>
              )}
            </div>
          </div>

          {/* Right Column: Child road map */}
          <div className="md:col-span-2 space-y-6">
            <div className="bg-white border border-[#e2e0d8] rounded-3xl p-6 shadow-sm">
              <h3 className="font-bold text-sm text-center mb-6">Kids Roadmap</h3>
              <div className="flex flex-col items-center gap-10 relative py-2">
                <div className="absolute top-0 bottom-0 w-1 bg-[#e2e0d8] z-0" />
                {flatLessons.map((lesson, idx) => {
                  const isCompleted = completedIds.includes(lesson.id);
                  const isUnlocked = checkIsUnlocked(lesson.id, idx);
                  const pos = idx % 3;
                  const alignment = pos === 0 ? "translate-x-0" : pos === 1 ? "translate-x-8" : "-translate-x-8";

                  return (
                    <div key={lesson.id} className={`flex flex-col items-center z-10 ${alignment} ${isUnlocked ? "opacity-100" : "opacity-45"}`}>
                      {isUnlocked ? (
                        <Link href={`/lesson/${lesson.id}`}>
                          <div className="w-12 h-12 rounded-full bg-[#378add] text-white flex items-center justify-center shadow-sm">
                            {isCompleted ? <CheckCircle2 className="w-6 h-6" /> : <Award className="w-6 h-6" />}
                          </div>
                        </Link>
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-[#f4f2ec] border border-[#e2e0d8] flex items-center justify-center text-[#9a988f]">
                          <Lock className="w-4 h-4" />
                        </div>
                      )}
                      <span className="text-[10px] font-bold mt-1.5">{lesson.titleEn}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // ----------------------------------------------------
  // ADULT HERITAGE DASHBOARD VIEW (Original / Default)
  // ----------------------------------------------------
  return (
    <div className="flex-1 bg-[#faf9f6] text-[#1f1e1c] min-h-screen pb-24" dir={lang === "fa" ? "rtl" : "ltr"}>
      {/* Header */}
      <header className="border-b border-[#e2e0d8] bg-white/90 backdrop-blur-md sticky top-0 z-30 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-3.5 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2.5 group">
            <img src="/logo.png" alt="Farsiyar Logo" className="w-8 h-8 object-contain" style={{ mixBlendMode: "multiply" }} />
            <span className="font-bold text-[#1f1e1c] text-lg tracking-tight">Farsiyar</span>
          </Link>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1 bg-[#faeeda] rounded-full border border-[#ba7517]/20 text-[#854f0b] font-bold text-xs shadow-2xs">
              <Flame className="w-4 h-4 fill-[#ba7517] animate-pulse" />
              <span>{user?.streak || 0} {lang === "fa" ? "روز متوالی" : "days streak"}</span>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1 bg-[#e6f1fb] rounded-full border border-[#378add]/20 text-[#185fa5] font-bold text-xs shadow-2xs">
              <Star className="w-4 h-4 fill-[#378add]" />
              <span>{user?.xp || 0} XP</span>
            </div>

            {user?.role === "ADMIN" && (
              <Link
                href="/admin"
                className="flex items-center gap-1.5 px-3.5 py-1 bg-purple-50 hover:bg-purple-100 rounded-full border border-purple-200 text-purple-700 font-bold text-xs transition-all shadow-2xs"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>{lang === "fa" ? "مدیریت" : "Admin Panel"}</span>
              </Link>
            )}

            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1.5 px-3.5 py-1 rounded-full border border-[#e2e0d8] bg-white hover:bg-[#f4f2ec] transition-colors text-xs font-semibold shadow-2xs cursor-pointer"
            >
              <Globe className="w-3.5 h-3.5 text-[#185fa5]" />
              <span>{lang === "en" ? "فارسی" : "English"}</span>
            </button>

            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-[#6b6a63] hover:text-[#1f1e1c] transition-colors text-xs font-semibold px-2 py-1 rounded-lg hover:bg-[#f4f2ec] cursor-pointer"
            >
              <User className="w-3.5 h-3.5" />
              <span>{user?.username} ({lang === "fa" ? "خروج" : "Logout"})</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-6 pt-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column (Sidebar): Profile, Skills, Today's Practice & Certificates */}
        <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-20 lg:self-start">
          {/* Main User Card */}
          <div className="border border-[#e2e0d8] shadow-sm bg-white rounded-3xl p-6 relative overflow-hidden">
            <div className="flex items-start justify-between mb-4 pb-4 border-b border-[#e2e0d8]">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#378add] to-[#185fa5] flex items-center justify-center font-bold text-white text-lg shadow-md uppercase">
                  {user?.username ? user.username.charAt(0) : "U"}
                </div>
                <div>
                  <h3 className="font-bold text-base text-[#1f1e1c] leading-snug">{user?.username}</h3>
                  <p className="text-[11px] text-[#6b6a63] font-medium">
                    {lang === "fa" ? "زبان‌آموز فارسی · عضویت ۲۰۲۵" : "Heritage learner · Member 2025"}
                  </p>
                </div>
              </div>
            </div>

            {/* Motivational Quote */}
            {user?.whyLearning && (
              <div className="bg-[#f4f2ec] rounded-2xl p-4 mb-4 border border-[#e2e0d8] text-center relative">
                <p className="text-[10px] text-[#9a988f] font-bold uppercase tracking-wider mb-1">
                  {lang === "fa" ? "هدف من از یادگیری" : "Why I'm learning"}
                </p>
                <p className="text-xs text-[#1f1e1c] font-medium italic leading-relaxed">
                  "{user.whyLearning}"
                </p>
              </div>
            )}

            {/* Skill Profile Bars */}
            <div className="bg-[#faf9f6] rounded-2xl p-4 border border-[#e2e0d8] space-y-3">
              <div className="flex justify-between items-center text-xs font-bold text-[#1f1e1c] mb-1">
                <span>{lang === "fa" ? "پروفایل مهارت‌ها" : "Skill Profile"}</span>
                <Sparkles className="w-3.5 h-3.5 text-[#ba7517]" />
              </div>
              
              <div>
                <div className="flex justify-between text-[11px] font-semibold text-[#6b6a63] mb-1">
                  <span>{lang === "fa" ? "شنیداری (Listening)" : "Listening"}</span>
                  <span className="font-bold text-[#1f1e1c]">{parsedSkills.listening}%</span>
                </div>
                <div className="h-2 w-full bg-[#e2e0d8] rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full transition-all duration-500" style={{ width: `${parsedSkills.listening}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] font-semibold text-[#6b6a63] mb-1">
                  <span>{lang === "fa" ? "گفتاری (Speaking)" : "Speaking"}</span>
                  <span className="font-bold text-[#1f1e1c]">{parsedSkills.speaking}%</span>
                </div>
                <div className="h-2 w-full bg-[#e2e0d8] rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full transition-all duration-500" style={{ width: `${parsedSkills.speaking}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] font-semibold text-[#6b6a63] mb-1">
                  <span>{lang === "fa" ? "خوانداری (Reading)" : "Reading"}</span>
                  <span className="font-bold text-[#1f1e1c]">{parsedSkills.reading}%</span>
                </div>
                <div className="h-2 w-full bg-[#e2e0d8] rounded-full overflow-hidden">
                  <div className="h-full bg-[#378add] rounded-full transition-all duration-500" style={{ width: `${parsedSkills.reading}%` }} />
                </div>
              </div>
            </div>

            {/* Today's Practice Action Banner */}
            {currentPracticeLesson && (
              <div className="mt-4 bg-[#e6f1fb] rounded-2xl p-4 border border-[#378add]/20 shadow-xs">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] text-[#185fa5] font-bold uppercase tracking-wider">
                    {lang === "fa" ? "تمرین امروز" : "Today's Practice"}
                  </span>
                  <span className="text-[10px] bg-[#378add] text-white px-2 py-0.5 rounded-full font-bold">
                    +{currentPracticeLesson.xpReward} XP
                  </span>
                </div>
                <p className="font-bold text-sm text-[#1f1e1c] mb-3">
                  {lang === "fa" ? `درس ${currentPracticeLesson.order}: ${currentPracticeLesson.titleFa}` : `Lesson ${currentPracticeLesson.order}: ${currentPracticeLesson.titleEn}`}
                </p>
                <Link
                  href={`/lesson/${currentPracticeLesson.id}`}
                  className="block w-full py-2.5 bg-[#1f1e1c] hover:bg-black text-white text-center rounded-xl text-xs font-bold transition-all shadow-sm"
                >
                  {lang === "fa" ? "شروع تمرین" : "Start Practice"}
                </Link>
              </div>
            )}
          </div>

          {/* Certificates Card */}
          <div className="bg-white border border-[#e2e0d8] rounded-3xl p-5 shadow-sm space-y-3">
            <h4 className="font-bold text-xs text-[#1f1e1c]">
              {lang === "fa" ? "گواهینامه‌های من" : "My Certificates"}
            </h4>
            <div className="flex items-center gap-3 p-3 bg-[#faf9f6] rounded-2xl border border-[#e2e0d8]">
              <div className="p-2.5 bg-[#e6f1fb] text-[#185fa5] rounded-xl shrink-0"><GraduationCap className="w-5 h-5" /></div>
              <div>
                <p className="font-bold text-xs text-[#1f1e1c]">
                  {lang === "fa" ? "پایان دوره مقدماتی" : "Foundations Completed"}
                </p>
                <p className="text-[10px] text-[#6b6a63]">
                  {lang === "fa" ? "دریافت شده در ۲۰۲۵" : "Earned June 2025"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Learning Roadmap */}
        <div className="lg:col-span-8 space-y-8">
          {terms.map((term) => {
            const isTermUnlocked = checkIsTermUnlocked(term.order, term.id);
            
            // Calculate term progress
            const termLessonIds = term.levels.flatMap(l => l.lessons.map(ls => ls.id));
            const completedCount = termLessonIds.filter(id => completedIds.includes(id)).length;
            const progressPercent = termLessonIds.length > 0 ? Math.round((completedCount / termLessonIds.length) * 100) : 0;

            return (
              <div key={term.id} className="bg-white border border-[#e2e0d8] rounded-3xl p-6 sm:p-8 shadow-sm relative overflow-hidden">
                {/* Lock Overlay if term is premium and not unlocked */}
                {!isTermUnlocked && (
                  <div className="absolute inset-0 bg-[#faf9f6]/92 backdrop-blur-[2px] z-20 flex flex-col items-center justify-center p-6 text-center">
                    <div className="w-12 h-12 bg-[#faeeda] rounded-full flex items-center justify-center text-[#854f0b] border border-[#ba7517]/20 mb-3 shadow-md">
                      <Lock className="w-5 h-5" />
                    </div>
                    <p className="font-bold text-base text-[#1f1e1c]">
                      {lang === "fa" ? "ترم ویژه - قفل شده" : "Premium Term - Locked"}
                    </p>
                    <p className="text-xs text-[#6b6a63] mt-1.5 max-w-[320px] leading-relaxed">
                      {lang === "fa" 
                        ? "این ترم نیاز به فعال‌سازی اشتراک دارد. جهت دسترسی با مدیریت تماس بگیرید." 
                        : "This term requires package activation. Contact admin to unlock this course content."}
                    </p>
                  </div>
                )}

                {/* Term Header & Progress Banner */}
                <div className="border-b border-[#e2e0d8] pb-5 mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <span className="text-[10px] bg-[#e6f1fb] text-[#185fa5] px-2.5 py-0.5 rounded-full border border-[#378add]/15 font-bold uppercase tracking-wider">
                      {lang === "fa" ? `ترم ${term.order}` : `Term ${term.order}`}
                    </span>
                    <h2 className="text-xl font-bold text-[#1f1e1c] mt-1.5">
                      {lang === "fa" ? term.titleFa : term.titleEn}
                    </h2>
                    <p className="text-xs text-[#6b6a63] mt-0.5">
                      {lang === "fa" ? term.titleEn : term.titleFa}
                    </p>
                  </div>

                  <div className="bg-[#faf9f6] p-3 rounded-2xl border border-[#e2e0d8] min-w-[160px]">
                    <div className="flex justify-between text-[11px] font-bold mb-1.5 text-[#6b6a63]">
                      <span>{lang === "fa" ? "پیشرفت ترم" : "Term Progress"}</span>
                      <span className="text-[#378add]">{progressPercent}%</span>
                    </div>
                    <div className="h-2 w-full bg-[#e2e0d8] rounded-full overflow-hidden">
                      <div className="h-full bg-[#378add] rounded-full transition-all duration-500" style={{ width: `${progressPercent}%` }} />
                    </div>
                  </div>
                </div>

                {/* Levels & Lesson Nodes */}
                <div className="space-y-10">
                  {term.levels.map((level) => (
                    <div key={level.id} className="space-y-8">
                      {/* Level Title Pill */}
                      <div className="bg-[#f4f2ec] px-5 py-2.5 rounded-2xl border border-[#e2e0d8] flex justify-between items-center shadow-2xs">
                        <div className="flex items-center gap-2">
                          <BookOpen className="w-4 h-4 text-[#378add]" />
                          <div>
                            <span className="text-[10px] font-bold text-[#6b6a63] uppercase">
                              {lang === "fa" ? `سطح ${level.order}` : `LEVEL ${level.order}`}
                            </span>
                            <h3 className="text-xs font-bold text-[#1f1e1c]">
                              {lang === "fa" ? level.titleFa : level.titleEn}
                            </h3>
                          </div>
                        </div>
                        <span className="text-[11px] text-[#6b6a63] font-bold">
                          {lang === "fa" ? level.titleEn : level.titleFa}
                        </span>
                      </div>

                      {/* Lesson Path Nodes */}
                      <div className="flex flex-col items-center gap-12 relative py-4">
                        {/* Connecting Vertical Line */}
                        <div className="absolute top-4 bottom-4 w-1.5 bg-[#e2e0d8] rounded-full z-0" />

                        {level.lessons.map((lesson) => {
                          const isCompleted = completedIds.includes(lesson.id);
                          const indexInFlat = flatLessons.findIndex((fl) => fl.id === lesson.id);
                          const isUnlocked = checkIsUnlocked(lesson.id, indexInFlat);

                          const posVal = indexInFlat % 3;
                          const positionClass =
                            posVal === 0
                              ? "translate-x-0"
                              : posVal === 1
                              ? "translate-x-12 sm:translate-x-16"
                              : "-translate-x-12 sm:-translate-x-16";

                          return (
                            <div
                              key={lesson.id}
                              className={`flex flex-col items-center z-10 transition-all duration-300 ${positionClass} ${
                                isUnlocked ? "opacity-100" : "opacity-55"
                              }`}
                            >
                              {isUnlocked ? (
                                <Link href={`/lesson/${lesson.id}`}>
                                  <div className="group relative cursor-pointer">
                                    <div
                                      className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-md transform transition-all duration-300 group-hover:scale-110 active:scale-95 ${
                                        isCompleted
                                          ? "bg-emerald-500 text-white ring-4 ring-emerald-100"
                                          : "bg-[#378add] text-white ring-4 ring-blue-100"
                                      }`}
                                    >
                                      {isCompleted ? (
                                        <CheckCircle2 className="w-8 h-8" />
                                      ) : (
                                        <Award className="w-8 h-8 animate-pulse" />
                                      )}
                                    </div>

                                    {/* Tooltip Card on Hover */}
                                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-3 w-44 bg-[#1f1e1c] rounded-2xl p-3 text-center pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-xl z-30">
                                      <div className="text-[9px] text-[#e6f1fb] font-bold uppercase mb-0.5">
                                        {lang === "fa" ? `درس ${lesson.order}` : `Lesson ${lesson.order}`}
                                      </div>
                                      <div className="font-bold text-xs text-white mb-0.5">
                                        {lang === "fa" ? lesson.titleFa : lesson.titleEn}
                                      </div>
                                      <div className="text-[10px] text-gray-400">
                                        {lang === "fa" ? lesson.titleEn : lesson.titleFa}
                                      </div>
                                      <div className="text-[9px] text-[#faeeda] font-bold mt-1">
                                        +{lesson.xpReward} XP
                                      </div>
                                    </div>
                                  </div>
                                </Link>
                              ) : (
                                <div className="w-16 h-16 rounded-2xl bg-[#faf9f6] border-2 border-[#e2e0d8] flex items-center justify-center text-[#9a988f] shadow-inner">
                                  <Lock className="w-6 h-6" />
                                </div>
                              )}

                              <div className="text-center mt-2.5 max-w-[120px]">
                                <div className="font-bold text-xs text-[#1f1e1c]">
                                  {lang === "fa" ? lesson.titleFa : lesson.titleEn}
                                </div>
                                <div className="text-[10px] text-[#6b6a63] font-medium">
                                  {lang === "fa" ? lesson.titleEn : lesson.titleFa}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
