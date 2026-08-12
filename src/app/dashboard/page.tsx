"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Flame, Star, Award, CheckCircle2, Lock, User, PlusCircle, Sparkles, BookOpen, Plus, Heart, GraduationCap, ShieldAlert } from "lucide-react";

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
}

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [terms, setTerms] = useState<Term[]>([]);
  const [completedIds, setCompletedIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [flatLessons, setFlatLessons] = useState<Lesson[]>([]);

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
                  flat.push(ls);
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

  const checkIsUnlocked = (lessonId: string, indexInFlat: number) => {
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
    <div className="flex-1 bg-[#faf9f6] text-[#1f1e1c] min-h-screen pb-20">
      {/* Header */}
      <header className="border-b border-[#e2e0d8] bg-white sticky top-0 z-30 shadow-sm">
        <div className="max-w-4xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="p-1.5 bg-[#378add] rounded-lg">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-[#1f1e1c] text-lg">Farsiyar</span>
          </Link>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 px-3 py-1 bg-[#faeeda] rounded-full border border-[#ba7517]/20 text-[#854f0b] font-bold text-xs">
              <Flame className="w-4 h-4 fill-[#ba7517]" />
              <span>{user?.streak || 0} days</span>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1 bg-[#e6f1fb] rounded-full border border-[#378add]/20 text-[#185fa5] font-bold text-xs">
              <Star className="w-4 h-4 fill-[#378add]" />
              <span>{user?.xp || 0} XP</span>
            </div>

            {user?.role === "ADMIN" && (
              <Link
                href="/admin"
                className="flex items-center gap-1 px-3 py-1 bg-purple-50 hover:bg-purple-100 rounded-full border border-purple-200 text-purple-700 font-bold text-xs transition-all"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Admin</span>
              </Link>
            )}

            <button
              onClick={handleLogout}
              className="flex items-center gap-1 text-[#6b6a63] hover:text-[#1f1e1c] transition-colors text-xs font-semibold"
            >
              <User className="w-3.5 h-3.5" />
              <span>{user?.username} (Logout)</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-4xl mx-auto px-6 pt-10 grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column: Profile Card */}
        <div className="md:col-span-1 space-y-6">
          <div className="border border-[#e2e0d8] shadow-sm bg-white rounded-[26px] p-6 w-full">
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-[#e2e0d8]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#e6f1fb] flex items-center justify-center font-bold text-[#185fa5] uppercase">
                  {user?.username ? user.username.charAt(0) : "U"}
                </div>
                <div>
                  <p className="margin:0 font-bold text-sm">{user?.username}</p>
                  <p className="margin:0 text-[11px] text-[#6b6a63]">Heritage learner · Since March 2025</p>
                </div>
              </div>
              <span className="badge bg-[#faeeda] text-[#854f0b]">🔥 {user?.streak || 0} days</span>
            </div>

            {/* Why I'm learning motivational card */}
            {user?.whyLearning && (
              <div className="bg-[#f4f2ec] rounded-2xl p-4 mb-4 border border-[#e2e0d8] text-center">
                <p className="text-[10px] text-[#9a988f] font-bold uppercase tracking-wider mb-1">Why I'm learning</p>
                <p className="text-xs text-[#6b6a63] italic leading-relaxed">
                  "{user.whyLearning}"
                </p>
              </div>
            )}

            {/* Skill Profile Bars */}
            <div className="bg-[#f4f2ec] rounded-2xl p-4 mb-4 border border-[#e2e0d8]">
              <p className="margin:0 0 10px text-xs font-bold text-[#6b6a63]">Skill Profile</p>
              
              <div className="mb-3">
                <div className="flex justify-between text-[11px] font-semibold mb-1">
                  <span>Listening</span>
                  <span>{parsedSkills.listening}%</span>
                </div>
                <div className="bar">
                  <div className="bar-fill" style={{ width: `${parsedSkills.listening}%`, backgroundColor: "var(--success-fill)" }} />
                </div>
              </div>

              <div className="mb-3">
                <div className="flex justify-between text-[11px] font-semibold mb-1">
                  <span>Speaking</span>
                  <span>{parsedSkills.speaking}%</span>
                </div>
                <div className="bar">
                  <div className="bar-fill" style={{ width: `${parsedSkills.speaking}%`, backgroundColor: "var(--warning-fill)" }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] font-semibold mb-1">
                  <span>Reading</span>
                  <span>{parsedSkills.reading}%</span>
                </div>
                <div className="bar">
                  <div className="bar-fill" style={{ width: `${parsedSkills.reading}%`, backgroundColor: "var(--accent-fill)" }} />
                </div>
              </div>
            </div>

            {/* Today's Practice Card */}
            {currentPracticeLesson && (
              <div className="bg-[#e6f1fb] rounded-2xl p-4 border border-[#378add]/10">
                <p className="text-[11px] text-[#185fa5] font-bold uppercase tracking-wider mb-1">Today's Practice</p>
                <p className="font-bold text-sm text-[#1f1e1c] mb-3">
                  Lesson {currentPracticeLesson.order}: {currentPracticeLesson.titleEn}
                </p>
                <Link
                  href={`/lesson/${currentPracticeLesson.id}`}
                  className="block w-full py-2 bg-[#1f1e1c] hover:bg-black text-white text-center rounded-xl text-xs font-semibold transition-all"
                >
                  Start Practice
                </Link>
              </div>
            )}
          </div>

          {/* Certificates Card */}
          <div className="bg-white border border-[#e2e0d8] rounded-3xl p-5 shadow-sm space-y-3">
            <h4 className="font-bold text-xs text-[#1f1e1c]">My Certificates</h4>
            <div className="flex items-center gap-3 p-3 bg-[#f4f2ec] rounded-2xl border border-[#e2e0d8]">
              <div className="p-2 bg-[#e6f1fb] text-[#185fa5] rounded-xl"><GraduationCap className="w-5 h-5" /></div>
              <div>
                <p className="font-bold text-xs text-[#1f1e1c]">Foundations Completed</p>
                <p className="text-[10px] text-[#6b6a63]">Earned June 2025</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Learning Path */}
        <div className="md:col-span-2 space-y-8">
          {terms.map((term) => (
            <div key={term.id} className="bg-white border border-[#e2e0d8] rounded-3xl p-6 shadow-sm">
              <div className="border-b border-[#e2e0d8] pb-3 mb-6">
                <span className="text-[10px] bg-[#e6f1fb] text-[#185fa5] px-2 py-0.5 rounded-full border border-[#378add]/15 font-bold uppercase tracking-wider">
                  Term {term.order}
                </span>
                <h2 className="text-lg font-bold text-[#1f1e1c] mt-1">{term.titleEn}</h2>
                <p className="text-xs text-[#6b6a63]">{term.titleFa}</p>
              </div>

              <div className="space-y-8">
                {term.levels.map((level) => (
                  <div key={level.id} className="space-y-6">
                    <div className="bg-[#f4f2ec] px-4 py-2 rounded-xl border border-[#e2e0d8] flex justify-between items-center">
                      <div>
                        <span className="text-[10px] font-bold text-[#6b6a63]">LEVEL {level.order}</span>
                        <h3 className="text-xs font-bold text-[#1f1e1c]">{level.titleEn}</h3>
                      </div>
                      <span className="text-[10px] text-gray-500 font-bold">{level.titleFa}</span>
                    </div>

                    <div className="flex flex-col items-center gap-10 relative py-2">
                      <div className="absolute top-0 bottom-0 w-1 bg-[#e2e0d8] z-0" />

                      {level.lessons.map((lesson) => {
                        const isCompleted = completedIds.includes(lesson.id);
                        const indexInFlat = flatLessons.findIndex((fl) => fl.id === lesson.id);
                        const isUnlocked = checkIsUnlocked(lesson.id, indexInFlat);

                        const posVal = indexInFlat % 3;
                        const positionClass =
                          posVal === 0
                            ? "translate-x-0"
                            : posVal === 1
                            ? "translate-x-12"
                            : "-translate-x-12";

                        return (
                          <div
                            key={lesson.id}
                            className={`flex flex-col items-center z-10 transition-all duration-300 ${positionClass} ${
                              isUnlocked ? "opacity-100" : "opacity-50"
                            }`}
                          >
                            {isUnlocked ? (
                              <Link href={`/lesson/${lesson.id}`}>
                                <div className="group relative cursor-pointer">
                                  <div
                                    className={`w-14 h-14 rounded-full flex items-center justify-center shadow-sm transform transition-transform duration-300 hover:scale-105 active:scale-95 ${
                                      isCompleted
                                        ? "bg-[#639922] text-white"
                                        : "bg-[#378add] text-white"
                                    }`}
                                  >
                                    {isCompleted ? (
                                      <CheckCircle2 className="w-7 h-7" />
                                    ) : (
                                      <Award className="w-7 h-7 animate-pulse" />
                                    )}
                                  </div>

                                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2.5 w-40 bg-[#1f1e1c] rounded-xl p-2.5 text-center pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-lg z-20">
                                    <div className="text-[9px] text-[#e6f1fb] font-bold uppercase mb-0.5">
                                      Lesson {lesson.order}
                                    </div>
                                    <div className="font-bold text-[11px] text-white mb-0.5">{lesson.titleEn}</div>
                                    <div className="text-[9px] text-gray-400">{lesson.titleFa}</div>
                                    <div className="text-[8px] text-[#faeeda] mt-1">+{lesson.xpReward} XP</div>
                                  </div>
                                </div>
                              </Link>
                            ) : (
                              <div className="w-14 h-14 rounded-full bg-[#f4f2ec] border border-[#e2e0d8] flex items-center justify-center text-[#9a988f] shadow-inner">
                                <Lock className="w-5 h-5" />
                              </div>
                            )}

                            <div className="text-center mt-2 max-w-[100px]">
                              <div className="font-bold text-[11px]">{lesson.titleEn}</div>
                              <div className="text-[9px] text-[#6b6a63]">{lesson.titleFa}</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
