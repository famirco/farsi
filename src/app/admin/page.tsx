"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus, ListPlus, LayoutGrid, Info, Settings, Users, Layers, BookOpen, Check } from "lucide-react";

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

interface Question {
  id: string;
  order: number;
  type: string;
  promptEn: string;
  promptFa: string;
  options: string;
  correctAnswer: string;
}

interface UserProfile {
  id: string;
  username: string;
  role: string;
  xp: number;
  streak: number;
  unlockedUntilLessonId: string | null;
}

export default function AdminPanel() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"users" | "terms" | "lessons">("users");

  // Master Data
  const [terms, setTerms] = useState<Term[]>([]);
  const [allLessons, setAllLessons] = useState<Lesson[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);

  // Form states for Term
  const [termOrder, setTermOrder] = useState("");
  const [termTitleEn, setTermTitleEn] = useState("");
  const [termTitleFa, setTermTitleFa] = useState("");

  // Form states for Level
  const [levelTermId, setLevelTermId] = useState("");
  const [levelOrder, setLevelOrder] = useState("");
  const [levelTitleEn, setLevelTitleEn] = useState("");
  const [levelTitleFa, setLevelTitleFa] = useState("");

  // Form states for Lesson
  const [lessonLevelId, setLessonLevelId] = useState("");
  const [lessonOrder, setLessonOrder] = useState("");
  const [lessonTitleEn, setLessonTitleEn] = useState("");
  const [lessonTitleFa, setLessonTitleFa] = useState("");
  const [lessonDescEn, setLessonDescEn] = useState("");
  const [lessonDescFa, setLessonDescFa] = useState("");
  const [lessonXp, setLessonXp] = useState("20");

  // Form states for Question
  const [qOrder, setQOrder] = useState("");
  const [qType, setQType] = useState("SELECT");
  const [qPromptEn, setQPromptEn] = useState("");
  const [qPromptFa, setQPromptFa] = useState("");
  const [qOptions, setQOptions] = useState("");
  const [qCorrect, setQCorrect] = useState("");

  const [isLoading, setIsLoading] = useState(true);

  // Load initial data
  useEffect(() => {
    const savedUser = localStorage.getItem("farsi_username");
    if (!savedUser) {
      router.push("/");
      return;
    }

    async function loadData() {
      try {
        const userRes = await fetch(`/api/user?username=${encodeURIComponent(savedUser || "")}`);
        const userData = await userRes.json();
        if (userData.role !== "ADMIN") {
          router.push("/dashboard");
          return;
        }

        // Fetch terms (with nested levels/lessons)
        const termsRes = await fetch("/api/terms");
        const termsData = await termsRes.json();
        setTerms(termsData);

        // Flatten all lessons for easy mapping
        const flatLessons: Lesson[] = [];
        if (Array.isArray(termsData)) {
          termsData.forEach((t: Term) => {
            t.levels.forEach((lv: Level) => {
              lv.lessons.forEach((ls: Lesson) => {
                flatLessons.push(ls);
              });
            });
          });
        }
        setAllLessons(flatLessons);

        // Fetch registered users
        const usersRes = await fetch("/api/users");
        const usersData = await usersRes.json();
        setUsers(usersData);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [router]);

  const reloadTermsAndLessons = async () => {
    const termsRes = await fetch("/api/terms");
    const termsData = await termsRes.json();
    setTerms(termsData);

    const flatLessons: Lesson[] = [];
    if (Array.isArray(termsData)) {
      termsData.forEach((t: Term) => {
        t.levels.forEach((lv: Level) => {
          lv.lessons.forEach((ls: Lesson) => {
            flatLessons.push(ls);
          });
        });
      });
    }
    setAllLessons(flatLessons);
  };

  const handleCreateTerm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!termTitleEn || !termTitleFa) return;

    try {
      const res = await fetch("/api/terms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          order: termOrder,
          titleEn: termTitleEn,
          titleFa: termTitleFa,
        }),
      });

      if (res.ok) {
        await reloadTermsAndLessons();
        setTermOrder("");
        setTermTitleEn("");
        setTermTitleFa("");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateLevel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!levelTermId || !levelTitleEn || !levelTitleFa) return;

    try {
      const res = await fetch("/api/terms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "CREATE_LEVEL",
          termId: levelTermId,
          order: levelOrder,
          titleEn: levelTitleEn,
          titleFa: levelTitleFa,
        }),
      });

      if (res.ok) {
        await reloadTermsAndLessons();
        setLevelOrder("");
        setLevelTitleEn("");
        setLevelTitleFa("");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lessonLevelId || !lessonTitleEn || !lessonTitleFa) return;

    try {
      const res = await fetch("/api/lessons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          levelId: lessonLevelId,
          order: lessonOrder,
          titleEn: lessonTitleEn,
          titleFa: lessonTitleFa,
          descEn: lessonDescEn,
          descFa: lessonDescFa,
          xpReward: lessonXp,
        }),
      });

      if (res.ok) {
        await reloadTermsAndLessons();
        setLessonOrder("");
        setLessonTitleEn("");
        setLessonTitleFa("");
        setLessonDescEn("");
        setLessonDescFa("");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleLessonSelect = async (lesson: Lesson) => {
    setSelectedLesson(lesson);
    try {
      const res = await fetch(`/api/lessons/${lesson.id}`);
      const data = await res.json();
      setQuestions(data.questions || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLesson || !qPromptEn || !qCorrect) return;

    const parsedOptions = qType === "SELECT" ? qOptions.split(",").map((o) => o.trim()) : [];

    try {
      const res = await fetch(`/api/lessons/${selectedLesson.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          order: qOrder,
          type: qType,
          promptEn: qPromptEn,
          promptFa: qPromptFa,
          options: parsedOptions,
          correctAnswer: qCorrect.trim(),
        }),
      });

      if (res.ok) {
        const newQuestion = await res.json();
        setQuestions((prev) => [...prev, newQuestion].sort((a, b) => a.order - b.order));
        setQOrder("");
        setQPromptEn("");
        setQPromptFa("");
        setQOptions("");
        setQCorrect("");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUserUnlockChange = async (userId: string, lessonId: string) => {
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          unlockedUntilLessonId: lessonId || null,
        }),
      });

      if (res.ok) {
        // Refresh users list
        const usersRes = await fetch("/api/users");
        const usersData = await usersRes.json();
        setUsers(usersData);
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#faf9f6] text-[#1f1e1c]">
        <div className="w-10 h-10 border-4 border-[#378add] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex-1 bg-[#faf9f6] text-[#1f1e1c] pb-20">
      {/* Top Header */}
      <header className="border-b border-[#e2e0d8] bg-white sticky top-0 z-30 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="p-2 hover:bg-[#f4f2ec] rounded-xl transition-all">
              <ArrowLeft className="w-4 h-4 text-[#6b6a63] hover:text-[#1f1e1c]" />
            </Link>
            <h1 className="text-xl font-bold tracking-tight">Farsiyar Admin Config</h1>
          </div>
          
          {/* Navigation Tabs */}
          <div className="flex gap-1.5 bg-[#f4f2ec] p-1 rounded-xl">
            <button
              onClick={() => setActiveTab("users")}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === "users" ? "bg-white text-[#1f1e1c] shadow-sm" : "text-[#6b6a63]"
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Users Progress</span>
            </button>
            <button
              onClick={() => setActiveTab("terms")}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === "terms" ? "bg-white text-[#1f1e1c] shadow-sm" : "text-[#6b6a63]"
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Terms & Levels</span>
            </button>
            <button
              onClick={() => setActiveTab("lessons")}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === "lessons" ? "bg-white text-[#1f1e1c] shadow-sm" : "text-[#6b6a63]"
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Lessons & Questions</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-6 pt-10">
        {/* TAB 1: USERS ACCESS MANAGEMENT */}
        {activeTab === "users" && (
          <div className="bg-white border border-[#e2e0d8] rounded-3xl p-6 shadow-sm">
            <h2 className="text-base font-bold mb-1">User Access & Progress Control</h2>
            <p className="text-xs text-[#6b6a63] mb-6">Manually unlock or restrict content access up to any specific lesson stage for registered learners.</p>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-[#e2e0d8] text-[#6b6a63] font-bold text-[10px] uppercase tracking-wider">
                    <th className="pb-3 w-1/4">User</th>
                    <th className="pb-3 w-1/6">Role</th>
                    <th className="pb-3 w-1/6">XP Points</th>
                    <th className="pb-3 w-1/6">Active Streak</th>
                    <th className="pb-3 w-1/4">Unlocked Up To Stage</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id} className="border-b border-[#faf9f6] last:border-0 hover:bg-[#faf9f6]/50">
                      <td className="py-4 font-bold">{u.username}</td>
                      <td className="py-4">
                        <span className={`badge ${u.role === "ADMIN" ? "bg-purple-100 text-purple-700" : "bg-[#f4f2ec] text-[#6b6a63]"}`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="py-4 font-semibold text-[#185fa5]">{u.xp} XP</td>
                      <td className="py-4 font-semibold text-[#854f0b]">🔥 {u.streak} days</td>
                      <td className="py-4">
                        <select
                          value={u.unlockedUntilLessonId || ""}
                          onChange={(e) => handleUserUnlockChange(u.id, e.target.value)}
                          className="px-3 py-1.5 bg-[#faf9f6] border border-[#c9c7bd] rounded-xl focus:outline-none focus:border-[#378add] text-xs text-[#1f1e1c] max-w-[200px]"
                        >
                          <option value="">Normal progression (default)</option>
                          {allLessons.map((l) => (
                            <option key={l.id} value={l.id}>
                              Unlock up to Lesson {l.order}: {l.titleEn}
                            </option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: TERMS AND LEVELS CONFIG */}
        {activeTab === "terms" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* Create Term Form */}
            <div className="space-y-8">
              <div className="bg-white border border-[#e2e0d8] rounded-3xl p-6 shadow-sm">
                <h2 className="text-base font-bold mb-4 flex items-center gap-2">
                  <Plus className="w-4 h-4 text-[#185fa5]" /> Create Term
                </h2>
                <form onSubmit={handleCreateTerm} className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-1">
                      <label className="block text-[11px] font-semibold text-[#6b6a63] mb-1">Order</label>
                      <input
                        type="number"
                        placeholder="e.g. 1"
                        value={termOrder}
                        onChange={(e) => setTermOrder(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-[#faf9f6] border border-[#c9c7bd] rounded-xl focus:outline-none focus:border-[#378add] text-xs text-[#1f1e1c]"
                        required
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-[11px] font-semibold text-[#6b6a63] mb-1">Term Title (English)</label>
                      <input
                        type="text"
                        placeholder="e.g. Term 1: Foundations"
                        value={termTitleEn}
                        onChange={(e) => setTermTitleEn(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-[#faf9f6] border border-[#c9c7bd] rounded-xl focus:outline-none focus:border-[#378add] text-xs text-[#1f1e1c]"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-[#6b6a63] mb-1">Term Title (Persian)</label>
                    <input
                      type="text"
                      placeholder="e.g. ترم ۱: پایه‌ها"
                      value={termTitleFa}
                      onChange={(e) => setTermTitleFa(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-[#faf9f6] border border-[#c9c7bd] rounded-xl focus:outline-none focus:border-[#378add] text-xs text-[#1f1e1c]"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-2.5 bg-[#1f1e1c] hover:bg-black text-white rounded-xl font-semibold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Save Term
                  </button>
                </form>
              </div>

              {/* Create Level Form */}
              <div className="bg-white border border-[#e2e0d8] rounded-3xl p-6 shadow-sm">
                <h2 className="text-base font-bold mb-4 flex items-center gap-2">
                  <Plus className="w-4 h-4 text-[#185fa5]" /> Create Level (Sath)
                </h2>
                <form onSubmit={handleCreateLevel} className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-semibold text-[#6b6a63] mb-1">Parent Term</label>
                    <select
                      value={levelTermId}
                      onChange={(e) => setLevelTermId(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-[#faf9f6] border border-[#c9c7bd] rounded-xl focus:outline-none focus:border-[#378add] text-xs text-[#1f1e1c]"
                      required
                    >
                      <option value="">Select Term...</option>
                      {terms.map((t) => (
                        <option key={t.id} value={t.id}>
                          Term {t.order}: {t.titleEn}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-1">
                      <label className="block text-[11px] font-semibold text-[#6b6a63] mb-1">Order</label>
                      <input
                        type="number"
                        placeholder="e.g. 1"
                        value={levelOrder}
                        onChange={(e) => setLevelOrder(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-[#faf9f6] border border-[#c9c7bd] rounded-xl focus:outline-none focus:border-[#378add] text-xs text-[#1f1e1c]"
                        required
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-[11px] font-semibold text-[#6b6a63] mb-1">Level Title (English)</label>
                      <input
                        type="text"
                        placeholder="e.g. Level 1: First Steps"
                        value={levelTitleEn}
                        onChange={(e) => setLevelTitleEn(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-[#faf9f6] border border-[#c9c7bd] rounded-xl focus:outline-none focus:border-[#378add] text-xs text-[#1f1e1c]"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-[#6b6a63] mb-1">Level Title (Persian)</label>
                    <input
                      type="text"
                      placeholder="e.g. سطح ۱: اولین قدم‌ها"
                      value={levelTitleFa}
                      onChange={(e) => setLevelTitleFa(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-[#faf9f6] border border-[#c9c7bd] rounded-xl focus:outline-none focus:border-[#378add] text-xs text-[#1f1e1c]"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-2.5 bg-[#1f1e1c] hover:bg-black text-white rounded-xl font-semibold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Save Level
                  </button>
                </form>
              </div>
            </div>

            {/* Terms and Levels Hierarchy List */}
            <div className="bg-white border border-[#e2e0d8] rounded-3xl p-6 shadow-sm">
              <h2 className="text-base font-bold mb-4">Structure Hierarchy</h2>
              <div className="space-y-4">
                {terms.map((t) => (
                  <div key={t.id} className="p-4 bg-[#faf9f6] border border-[#e2e0d8] rounded-2xl">
                    <div className="font-bold text-sm text-[#185fa5] mb-2 flex items-center justify-between">
                      <span>Term {t.order}: {t.titleEn} / {t.titleFa}</span>
                      <span className="text-[10px] bg-[#e6f1fb] px-2 py-0.5 rounded-full border border-[#378add]/10">{t.levels.length} Levels</span>
                    </div>

                    <div className="pl-4 space-y-2 border-l border-[#c9c7bd] mt-2">
                      {t.levels.map((lv) => (
                        <div key={lv.id} className="text-xs font-semibold py-1 flex justify-between items-center text-[#6b6a63]">
                          <span>Level {lv.order}: {lv.titleEn} / {lv.titleFa}</span>
                          <span className="text-[9px] bg-white px-1.5 py-0.5 rounded border border-[#e2e0d8]">{lv.lessons.length} lessons</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: LESSONS & QUESTIONS MANAGEMENT */}
        {activeTab === "lessons" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* Left Column: Create Lesson & Lessons List */}
            <div className="space-y-8">
              {/* Create Lesson Form */}
              <div className="bg-white border border-[#e2e0d8] rounded-3xl p-6 shadow-sm">
                <h2 className="text-base font-bold mb-4 flex items-center gap-2">
                  <LayoutGrid className="w-4 h-4 text-[#185fa5]" /> Create New Lesson
                </h2>
                <form onSubmit={handleCreateLesson} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-semibold text-[#6b6a63] mb-1">Parent Level</label>
                      <select
                        value={lessonLevelId}
                        onChange={(e) => setLessonLevelId(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-[#faf9f6] border border-[#c9c7bd] rounded-xl focus:outline-none focus:border-[#378add] text-xs text-[#1f1e1c]"
                        required
                      >
                        <option value="">Select Level...</option>
                        {terms.map((t) => (
                          <optgroup key={t.id} label={`Term ${t.order}: ${t.titleEn}`}>
                            {t.levels.map((lv) => (
                              <option key={lv.id} value={lv.id}>
                                Level {lv.order}: {lv.titleEn}
                              </option>
                            ))}
                          </optgroup>
                        ))}
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] font-semibold text-[#6b6a63] mb-1">Order</label>
                        <input
                          type="number"
                          placeholder="Order"
                          value={lessonOrder}
                          onChange={(e) => setLessonOrder(e.target.value)}
                          className="w-full px-3 py-2.5 bg-[#faf9f6] border border-[#c9c7bd] rounded-xl focus:outline-none focus:border-[#378add] text-xs text-[#1f1e1c]"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-[#6b6a63] mb-1">XP</label>
                        <input
                          type="number"
                          placeholder="XP"
                          value={lessonXp}
                          onChange={(e) => setLessonXp(e.target.value)}
                          className="w-full px-3 py-2.5 bg-[#faf9f6] border border-[#c9c7bd] rounded-xl focus:outline-none focus:border-[#378add] text-xs text-[#1f1e1c]"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-semibold text-[#6b6a63] mb-1">Title (English)</label>
                      <input
                        type="text"
                        placeholder="e.g. My Home"
                        value={lessonTitleEn}
                        onChange={(e) => setLessonTitleEn(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-[#faf9f6] border border-[#c9c7bd] rounded-xl focus:outline-none focus:border-[#378add] text-xs text-[#1f1e1c]"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-[#6b6a63] mb-1">Title (Persian)</label>
                      <input
                        type="text"
                        placeholder="e.g. خانه من"
                        value={lessonTitleFa}
                        onChange={(e) => setLessonTitleFa(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-[#faf9f6] border border-[#c9c7bd] rounded-xl focus:outline-none focus:border-[#378add] text-xs text-[#1f1e1c]"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[#6b6a63] mb-1">Description (English)</label>
                    <input
                      type="text"
                      placeholder="e.g. Learn home vocabulary"
                      value={lessonDescEn}
                      onChange={(e) => setLessonDescEn(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-[#faf9f6] border border-[#c9c7bd] rounded-xl focus:outline-none focus:border-[#378add] text-xs text-[#1f1e1c]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[#6b6a63] mb-1">Description (Persian)</label>
                    <input
                      type="text"
                      placeholder="e.g. کلمات مربوط به خانه"
                      value={lessonDescFa}
                      onChange={(e) => setLessonDescFa(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-[#faf9f6] border border-[#c9c7bd] rounded-xl focus:outline-none focus:border-[#378add] text-xs text-[#1f1e1c]"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-[#1f1e1c] hover:bg-black text-white rounded-xl font-semibold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Save Lesson
                  </button>
                </form>
              </div>

              {/* Lessons List Selection */}
              <div className="space-y-4">
                <h3 className="font-bold text-base">Select Lesson to Edit Questions</h3>
                <div className="space-y-3">
                  {allLessons.map((l) => (
                    <div
                      key={l.id}
                      onClick={() => handleLessonSelect(l)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer flex justify-between items-center ${
                        selectedLesson?.id === l.id
                          ? "bg-[#e6f1fb] border-[#378add]"
                          : "bg-white border-[#e2e0d8] hover:border-[#c9c7bd]"
                      }`}
                    >
                      <div>
                        <span className="text-[10px] bg-[#f4f2ec] text-[#6b6a63] px-1.5 py-0.5 rounded font-bold mr-2">Order {l.order}</span>
                        <span className="font-bold text-sm">{l.titleEn} / {l.titleFa}</span>
                      </div>
                      <span className="text-xs text-[#185fa5] font-bold">Edit Questions</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: Questions config */}
            <div className="space-y-8">
              {selectedLesson ? (
                <>
                  <div className="bg-white border border-[#e2e0d8] rounded-3xl p-6 shadow-sm">
                    <h2 className="text-base font-bold mb-4 flex items-center gap-2">
                      <ListPlus className="w-4 h-4 text-[#185fa5]" /> Add Question in "{selectedLesson.titleEn}"
                    </h2>
                    <form onSubmit={handleCreateQuestion} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[11px] font-semibold text-[#6b6a63] mb-1">Order</label>
                          <input
                            type="number"
                            placeholder="e.g. 1"
                            value={qOrder}
                            onChange={(e) => setQOrder(e.target.value)}
                            className="w-full px-3.5 py-2.5 bg-[#faf9f6] border border-[#c9c7bd] rounded-xl focus:outline-none focus:border-[#378add] text-xs text-[#1f1e1c]"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-[#6b6a63] mb-1">Type</label>
                          <select
                            value={qType}
                            onChange={(e) => setQType(e.target.value)}
                            className="w-full px-3.5 py-2.5 bg-[#faf9f6] border border-[#c9c7bd] rounded-xl focus:outline-none focus:border-[#378add] text-xs text-[#1f1e1c]"
                          >
                            <option value="SELECT">Multiple Choice (SELECT)</option>
                            <option value="SPEAK">Pronunciation Test (SPEAK)</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-[#6b6a63] mb-1">Prompt (English)</label>
                        <input
                          type="text"
                          placeholder="e.g. Say Hello in Persian:"
                          value={qPromptEn}
                          onChange={(e) => setQPromptEn(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-[#faf9f6] border border-[#c9c7bd] rounded-xl focus:outline-none focus:border-[#378add] text-xs text-[#1f1e1c]"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-[#6b6a63] mb-1">Persian word to display</label>
                        <input
                          type="text"
                          placeholder="e.g. سلام"
                          value={qPromptFa}
                          onChange={(e) => setQPromptFa(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-[#faf9f6] border border-[#c9c7bd] rounded-xl focus:outline-none focus:border-[#378add] text-xs text-[#1f1e1c]"
                        />
                      </div>

                      {qType === "SELECT" && (
                        <div>
                          <label className="block text-[11px] font-semibold text-[#6b6a63] mb-1">Options (comma separated)</label>
                          <input
                            type="text"
                            placeholder="e.g. Salâm, Na, Bale"
                            value={qOptions}
                            onChange={(e) => setQOptions(e.target.value)}
                            className="w-full px-3.5 py-2.5 bg-[#faf9f6] border border-[#c9c7bd] rounded-xl focus:outline-none focus:border-[#378add] text-xs text-[#1f1e1c]"
                            required
                          />
                        </div>
                      )}

                      <div>
                        <label className="block text-[11px] font-semibold text-[#6b6a63] mb-1">Correct Answer (Exact match)</label>
                        <input
                          type="text"
                          placeholder="e.g. Salâm (Hello) or سلام"
                          value={qCorrect}
                          onChange={(e) => setQCorrect(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-[#faf9f6] border border-[#c9c7bd] rounded-xl focus:outline-none focus:border-[#378add] text-xs text-[#1f1e1c]"
                          required
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full py-2.5 bg-[#1f1e1c] hover:bg-black text-white rounded-xl font-semibold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add Question
                      </button>
                    </form>
                  </div>

                  {/* List questions */}
                  <div className="space-y-4">
                    <h3 className="font-bold text-base">Questions list</h3>
                    <div className="space-y-3">
                      {questions.map((q) => (
                        <div key={q.id} className="p-4 bg-white border border-[#e2e0d8] rounded-2xl shadow-sm">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-[10px] bg-[#f4f2ec] text-[#6b6a63] px-2 py-0.5 rounded font-bold">Order {q.order}</span>
                            <span className="text-[10px] text-[#185fa5] font-bold">{q.type}</span>
                          </div>
                          <div className="text-xs font-bold">{q.promptEn}</div>
                          {q.promptFa && <div className="text-sm font-bold text-[#185fa5] mt-1">{q.promptFa}</div>}
                          <div className="text-xs text-[#3b6d11] bg-[#eaf3de] p-2 rounded-lg border border-[#639922]/10 mt-2 font-bold">
                            Correct: {q.correctAnswer}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <div className="h-48 flex items-center justify-center border border-dashed border-[#c9c7bd] rounded-3xl p-10 text-[#6b6a63] text-center bg-white shadow-sm">
                  <div>
                    <Settings className="w-8 h-8 mx-auto mb-2 text-[#9a988f] animate-spin" style={{ animationDuration: '4s' }} />
                    <p className="text-xs font-bold">Select a lesson from the left side to edit questions.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
