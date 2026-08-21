"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus, ListPlus, LayoutGrid, Info, Settings, Users, Layers, BookOpen, Check, Database, Download, Upload, RefreshCw, HardDriveUpload, FileJson, AlertCircle, CheckCircle2, FileText, Edit3, Image as ImageIcon, Volume2, FileEdit, ClipboardCheck } from "lucide-react";

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
  levelName?: string;
  levelOrder?: number;
  termName?: string;
  termOrder?: number;
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
  unlockedTerms: string;
}

export default function AdminPanel() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"users" | "terms" | "lessons" | "backup" | "blog" | "pages" | "placement">("users");
  const [isRestoring, setIsRestoring] = useState(false);
  const [backupFile, setBackupFile] = useState<File | null>(null);
  const [backupPreview, setBackupPreview] = useState<any>(null);
  const [backupMessage, setBackupMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Blog Management States
  const [blogPosts, setBlogPosts] = useState<any[]>([]);
  const [blogTitleEn, setBlogTitleEn] = useState("");
  const [blogTitleFa, setBlogTitleFa] = useState("");
  const [blogContentEn, setBlogContentEn] = useState("");
  const [blogContentFa, setBlogContentFa] = useState("");
  const [blogCoverImage, setBlogCoverImage] = useState("");
  const [blogAudioUrl, setBlogAudioUrl] = useState("");
  const [editingBlogId, setEditingBlogId] = useState<string | null>(null);

  // Site Pages Content States
  const [selectedPageKey, setSelectedPageKey] = useState<"about" | "contact" | "privacy" | "placement_test">("about");
  const [pageTitleEn, setPageTitleEn] = useState("");
  const [pageTitleFa, setPageTitleFa] = useState("");
  const [pageContentEn, setPageContentEn] = useState("");
  const [pageContentFa, setPageContentFa] = useState("");
  const [isPageSaving, setIsPageSaving] = useState(false);
  const [pageSaveMessage, setPageSaveMessage] = useState("");

  // Placement Test Admin States
  const [placementConfig, setPlacementConfig] = useState({
    listeningPromptEn: "Listen to the audio clip and select where the speaker says they are going today:",
    listeningPromptFa: "به فایل صوتی گوش دهید و مشخص کنید گوینده امروز به کجا می‌رود:",
    listeningOptions: "مدرسه (School), بازار (Market), پارک (Park), خانه (Home)",
    listeningCorrect: "مدرسه (School)",
    readingPromptEn: "Translate the following word to English: «کتاب»",
    readingPromptFa: "ترجمه کلمه زیر را انتخاب کنید: «کتاب»",
    readingOptions: "Book, Pen, Notebook, Chair",
    readingCorrect: "Book",
    speakingPromptEn: "Say 'سلام' (Salâm) out loud in Persian:",
    speakingPromptFa: "جمله روبرو را با صدای بلند تلفظ کنید: «سلام»",
    speakingTarget: "سلام",
  });
  const [isPlacementSaving, setIsPlacementSaving] = useState(false);
  const [placementSaveMessage, setPlacementSaveMessage] = useState("");

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
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);

  // LISTEN_IMAGE specific states
  const [imgOption1, setImgOption1] = useState("");
  const [imgOption2, setImgOption2] = useState("");
  const [imgOption3, setImgOption3] = useState("");
  const [imgOption4, setImgOption4] = useState("");
  const [imgCorrectIndex, setImgCorrectIndex] = useState(0);

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

        // Flatten all lessons and enrich with parent Term/Level metadata
        const flatLessons: Lesson[] = [];
        if (Array.isArray(termsData)) {
          termsData.forEach((t: Term) => {
            t.levels.forEach((lv: Level) => {
              lv.lessons.forEach((ls: Lesson) => {
                flatLessons.push({
                  ...ls,
                  levelName: lv.titleEn,
                  levelOrder: lv.order,
                  termName: t.titleEn,
                  termOrder: t.order,
                });
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
            flatLessons.push({
              ...ls,
              levelName: lv.titleEn,
              levelOrder: lv.order,
              termName: t.titleEn,
              termOrder: t.order,
            });
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
      } else {
        const errData = await res.json();
        alert(errData.error || "Failed to create Term");
      }
    } catch (err: any) {
      console.error(err);
      alert(err.message || "An unexpected error occurred");
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
      } else {
        const errData = await res.json();
        alert(errData.error || "Failed to create Level");
      }
    } catch (err: any) {
      console.error(err);
      alert(err.message || "An unexpected error occurred");
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
      } else {
        const errData = await res.json();
        alert(errData.error || "Failed to create Lesson");
      }
    } catch (err: any) {
      console.error(err);
      alert(err.message || "An unexpected error occurred");
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
    if (!selectedLesson || !qPromptEn) return;

    if ((qType === "LISTEN_IMAGE" || qType === "STORY_ORDER") && (!imgOption1 || !imgOption2 || !imgOption3 || !imgOption4)) {
      alert("Please upload all 4 images for the question!");
      return;
    }
    if (qType !== "LISTEN_IMAGE" && qType !== "STORY_ORDER" && !qCorrect) {
      alert("Please specify the correct answer!");
      return;
    }

    const parsedOptions = (qType === "LISTEN_IMAGE" || qType === "STORY_ORDER")
      ? [imgOption1, imgOption2, imgOption3, imgOption4].filter(Boolean)
      : qOptions.split(",").map((o) => o.trim());

    // Correct answer for STORY_ORDER is a JSON string of correct sequence
    const finalCorrectAnswer = qType === "STORY_ORDER"
      ? JSON.stringify([imgOption1, imgOption2, imgOption3, imgOption4])
      : qType === "LISTEN_IMAGE"
      ? [imgOption1, imgOption2, imgOption3, imgOption4][imgCorrectIndex] || ""
      : qCorrect.trim();

    try {
      if (editingQuestionId) {
        // Edit mode (PUT)
        const res = await fetch(`/api/questions/${editingQuestionId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            order: qOrder,
            type: qType,
            promptEn: qPromptEn,
            promptFa: qPromptFa,
            options: parsedOptions,
            correctAnswer: finalCorrectAnswer,
          }),
        });

        if (res.ok) {
          const updatedQ = await res.json();
          setQuestions((prev) =>
            prev.map((q) => (q.id === editingQuestionId ? updatedQ : q)).sort((a, b) => a.order - b.order)
          );
          cancelEditQuestion();
        }
      } else {
        // Create mode (POST)
        const res = await fetch(`/api/lessons/${selectedLesson.id}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            order: qOrder,
            type: qType,
            promptEn: qPromptEn,
            promptFa: qPromptFa,
            options: parsedOptions,
            correctAnswer: finalCorrectAnswer,
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
          setImgOption1("");
          setImgOption2("");
          setImgOption3("");
          setImgOption4("");
          setImgCorrectIndex(0);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteQuestion = async (qId: string) => {
    if (!confirm("Are you sure you want to delete this question?")) return;
    try {
      const res = await fetch(`/api/questions/${qId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setQuestions((prev) => prev.filter((q) => q.id !== qId));
        if (editingQuestionId === qId) {
          cancelEditQuestion();
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const startEditQuestion = (q: Question) => {
    setEditingQuestionId(q.id);
    setQOrder(String(q.order));
    setQType(q.type);
    setQPromptEn(q.promptEn);
    setQPromptFa(q.promptFa || "");
    
    let opts: string[] = [];
    try {
      opts = JSON.parse(q.options || "[]");
    } catch (e) {}

    if (q.type === "LISTEN_IMAGE" || q.type === "STORY_ORDER") {
      setImgOption1(opts[0] || "");
      setImgOption2(opts[1] || "");
      setImgOption3(opts[2] || "");
      setImgOption4(opts[3] || "");
      if (q.type === "LISTEN_IMAGE") {
        const correctIdx = opts.indexOf(q.correctAnswer);
        setImgCorrectIndex(correctIdx !== -1 ? correctIdx : 0);
      }
    } else {
      setQOptions(opts.join(", "));
    }
    setQCorrect(q.correctAnswer);
  };

  const cancelEditQuestion = () => {
    setEditingQuestionId(null);
    setQOrder("");
    setQPromptEn("");
    setQPromptFa("");
    setQOptions("");
    setQCorrect("");
    setImgOption1("");
    setImgOption2("");
    setImgOption3("");
    setImgOption4("");
    setImgCorrectIndex(0);
  };

  const handleImageUpload = async (file: File, setUrl: (url: string) => void) => {
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      if (res.ok) {
        const data = await res.json();
        setUrl(data.url);
      } else {
        alert("Upload failed!");
      }
    } catch (e) {
      console.error(e);
      alert("Upload error!");
    }
  };


  const handleUserTermToggle = async (userId: string, termId: string, isChecked: boolean, currentUnlockedTermsJson: string) => {
    let list: string[] = [];
    try {
      list = JSON.parse(currentUnlockedTermsJson || "[]");
    } catch (e) {}

    if (isChecked) {
      if (!list.includes(termId)) list.push(termId);
    } else {
      list = list.filter((id) => id !== termId);
    }

    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          unlockedTerms: JSON.stringify(list),
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
            <button
              onClick={() => setActiveTab("backup")}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === "backup" ? "bg-white text-[#1f1e1c] shadow-sm" : "text-[#6b6a63]"
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              <span>Backup & Restore</span>
            </button>

            <button
              onClick={() => {
                setActiveTab("blog");
                fetch("/api/blog").then(res => res.json()).then(data => { if (Array.isArray(data)) setBlogPosts(data); });
              }}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === "blog" ? "bg-white text-[#1f1e1c] shadow-sm" : "text-[#6b6a63]"
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Blog Articles</span>
            </button>

            <button
              onClick={() => {
                setActiveTab("pages");
                fetch(`/api/pages?key=${selectedPageKey}`).then(res => res.json()).then(data => {
                  setPageTitleEn(data.titleEn || "");
                  setPageTitleFa(data.titleFa || "");
                  setPageContentEn(data.contentEn || "");
                  setPageContentFa(data.contentFa || "");
                });
              }}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === "pages" ? "bg-white text-[#1f1e1c] shadow-sm" : "text-[#6b6a63]"
              }`}
            >
              <FileEdit className="w-3.5 h-3.5" />
              <span>Site Pages Content</span>
            </button>

            <button
              onClick={async () => {
                setActiveTab("placement");
                try {
                  const res = await fetch("/api/pages?key=placement_test");
                  if (res.ok) {
                    const data = await res.json();
                    if (data && data.contentEn) {
                      const parsed = JSON.parse(data.contentEn);
                      setPlacementConfig({
                        listeningPromptEn: parsed.listeningPromptEn || "",
                        listeningPromptFa: parsed.listeningPromptFa || "",
                        listeningOptions: Array.isArray(parsed.listeningOptions) ? parsed.listeningOptions.join(", ") : parsed.listeningOptions || "",
                        listeningCorrect: parsed.listeningCorrect || "",
                        readingPromptEn: parsed.readingPromptEn || "",
                        readingPromptFa: parsed.readingPromptFa || "",
                        readingOptions: Array.isArray(parsed.readingOptions) ? parsed.readingOptions.join(", ") : parsed.readingOptions || "",
                        readingCorrect: parsed.readingCorrect || "",
                        speakingPromptEn: parsed.speakingPromptEn || "",
                        speakingPromptFa: parsed.speakingPromptFa || "",
                        speakingTarget: parsed.speakingTarget || "",
                      });
                    }
                  }
                } catch (e) {
                  console.error(e);
                }
              }}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === "placement" ? "bg-white text-[#1f1e1c] shadow-sm" : "text-[#6b6a63]"
              }`}
            >
              <ClipboardCheck className="w-3.5 h-3.5" />
              <span>Placement Test</span>
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
                    <th className="pb-3 w-1/12">Role</th>
                    <th className="pb-3 w-1/12">XP</th>
                    <th className="pb-3 w-1/12">Streak</th>
                    <th className="pb-3 w-1/2">Unlocked Terms</th>
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
                      <td className="py-4 font-semibold text-[#854f0b]">🔥 {u.streak}</td>
                      <td className="py-4">
                        <div className="flex flex-wrap gap-2">
                          {terms.map((t) => {
                            const isFree = t.order === 1;
                            let isChecked = isFree;
                            try {
                              const list = JSON.parse(u.unlockedTerms || "[]");
                              if (list.includes(t.id)) isChecked = true;
                            } catch (e) {}

                            return (
                              <label key={t.id} className="inline-flex items-center gap-1 bg-[#faf9f6] border border-[#e2e0d8] px-2 py-1 rounded-lg text-[10px] font-semibold cursor-pointer hover:bg-[#f4f2ec]">
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  disabled={isFree}
                                  onChange={(e) => handleUserTermToggle(u.id, t.id, e.target.checked, u.unlockedTerms)}
                                  className="accent-[#378add] cursor-pointer"
                                />
                                <span>T{t.order} {isFree ? "(Free)" : ""}</span>
                              </label>
                            );
                          })}
                        </div>
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
                                Level {lv.order}: {lv.titleEn} (Term {t.order})
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
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span className="text-[10px] bg-[#f4f2ec] text-[#6b6a63] px-1.5 py-0.5 rounded font-bold">Order {l.order}</span>
                          {l.termOrder && l.levelOrder && (
                            <span className="text-[10px] text-[#185fa5] font-semibold">
                              Term {l.termOrder} &gt; Level {l.levelOrder} ({l.levelName})
                            </span>
                          )}
                        </div>
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
                    <h2 className="text-base font-bold mb-4 flex items-center gap-2 flex-wrap">
                      <ListPlus className="w-4 h-4 text-[#185fa5]" />
                      <span>
                        {editingQuestionId ? "Edit" : "Add"} Question in "{selectedLesson.titleEn}"
                        {selectedLesson.termOrder && selectedLesson.levelOrder && (
                          <span className="text-[11px] text-[#6b6a63] font-normal block mt-0.5">
                            (Term {selectedLesson.termOrder} &gt; Level {selectedLesson.levelOrder}: {selectedLesson.levelName})
                          </span>
                        )}
                      </span>
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
                            <option value="LISTEN_IMAGE">Listen & Select Image (LISTEN_IMAGE)</option>
                            <option value="STORY_ORDER">Story Sequence Match (STORY_ORDER)</option>
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
                        <label className="block text-[11px] font-semibold text-[#6b6a63] mb-1">
                          {qType === "STORY_ORDER" ? "Farsi Audio File (Optional upload or URL)" : "Persian word to display"}
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder={qType === "STORY_ORDER" ? "e.g. /uploads/story.mp3" : "e.g. سلام"}
                            value={qPromptFa}
                            onChange={(e) => setQPromptFa(e.target.value)}
                            className="flex-1 px-3.5 py-2.5 bg-[#faf9f6] border border-[#c9c7bd] rounded-xl focus:outline-none focus:border-[#378add] text-xs text-[#1f1e1c]"
                          />
                          {qType === "STORY_ORDER" && (
                            <label className="px-4 py-2.5 bg-[#378add] hover:bg-[#185fa5] text-white rounded-xl font-bold text-xs cursor-pointer flex items-center justify-center">
                              Upload Audio
                              <input
                                type="file"
                                accept="audio/*"
                                onChange={async (e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    const formData = new FormData();
                                    formData.append("file", file);
                                    try {
                                      const res = await fetch("/api/upload", { method: "POST", body: formData });
                                      if (res.ok) {
                                        const data = await res.json();
                                        setQPromptFa(data.url);
                                      } else {
                                        alert("Audio upload failed!");
                                      }
                                    } catch (err) {
                                      console.error(err);
                                    }
                                  }
                                }}
                                className="hidden"
                              />
                            </label>
                          )}
                        </div>
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

                      {(qType === "LISTEN_IMAGE" || qType === "STORY_ORDER") && (
                        <div className="space-y-4 border border-[#e2e0d8] p-4 rounded-2xl bg-[#faf9f6]">
                          <span className="text-[11px] font-bold text-[#1f1e1c] block mb-2">
                            {qType === "STORY_ORDER"
                              ? "Upload 4 Story Steps in Correct Sequence (1 is First, 4 is Last)"
                              : "Upload 4 Images & Select the Correct One"}
                          </span>
                          
                          <div className="grid grid-cols-2 gap-3">
                            {[
                              { label: qType === "STORY_ORDER" ? "Step 1" : "Option 1", val: imgOption1, setVal: setImgOption1, index: 0 },
                              { label: qType === "STORY_ORDER" ? "Step 2" : "Option 2", val: imgOption2, setVal: setImgOption2, index: 1 },
                              { label: qType === "STORY_ORDER" ? "Step 3" : "Option 3", val: imgOption3, setVal: setImgOption3, index: 2 },
                              { label: qType === "STORY_ORDER" ? "Step 4" : "Option 4", val: imgOption4, setVal: setImgOption4, index: 3 },
                            ].map((opt) => (
                              <div key={opt.index} className="flex flex-col gap-1.5 p-3 bg-white border border-[#e2e0d8] rounded-xl relative">
                                <label className="text-[10px] font-bold text-[#6b6a63] flex justify-between items-center">
                                  <span>{opt.label}</span>
                                  {qType === "LISTEN_IMAGE" && (
                                    <span className="inline-flex items-center gap-1 cursor-pointer">
                                      <input
                                        type="radio"
                                        name="correct_img"
                                        checked={imgCorrectIndex === opt.index}
                                        onChange={() => setImgCorrectIndex(opt.index)}
                                        className="accent-[#378add] cursor-pointer"
                                      />
                                      <span className="text-[9px] text-[#3b6d11]">Correct</span>
                                    </span>
                                  )}
                                </label>
                                
                                {opt.val ? (
                                  <div className="relative aspect-square w-full rounded-lg overflow-hidden bg-gray-50 flex items-center justify-center border border-[#e2e0d8]">
                                    <img src={opt.val} alt={opt.label} className="object-contain max-h-full max-w-full" />
                                    <button
                                      type="button"
                                      onClick={() => opt.setVal("")}
                                      className="absolute top-1 right-1 bg-red-600 hover:bg-red-700 text-white rounded-full p-1 text-[8px] font-bold cursor-pointer shadow-sm"
                                    >
                                      Remove
                                    </button>
                                  </div>
                                ) : (
                                  <div className="aspect-square w-full rounded-lg bg-[#faf9f6] border border-dashed border-[#c9c7bd] flex items-center justify-center">
                                    <label className="flex flex-col items-center justify-center gap-1 cursor-pointer w-full h-full p-2">
                                      <span className="text-[18px] text-[#6b6a63]">+</span>
                                      <span className="text-[9px] text-[#6b6a63] font-bold text-center">Upload Image</span>
                                      <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => {
                                          const file = e.target.files?.[0];
                                          if (file) handleImageUpload(file, opt.setVal);
                                        }}
                                        className="hidden"
                                      />
                                    </label>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {qType !== "LISTEN_IMAGE" && qType !== "STORY_ORDER" && (
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
                      )}

                      <div className="flex gap-2">
                        <button
                          type="submit"
                          className="flex-1 py-2.5 bg-[#1f1e1c] hover:bg-black text-white rounded-xl font-semibold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          {editingQuestionId ? "Save Changes" : <><Plus className="w-3.5 h-3.5" /> Add Question</>}
                        </button>
                        {editingQuestionId && (
                          <button
                            type="button"
                            onClick={cancelEditQuestion}
                            className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold text-xs transition-all cursor-pointer"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
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
                          <div className="text-xs text-[#3b6d11] bg-[#eaf3de] p-2 rounded-lg border border-[#639922]/10 mt-2 font-bold break-all">
                            Correct: {q.correctAnswer}
                          </div>
                          
                          {/* Edit / Delete actions */}
                          <div className="flex justify-end gap-3 mt-3 pt-3 border-t border-[#faf9f6] text-[10px] font-bold">
                            <button
                              onClick={() => startEditQuestion(q)}
                              className="text-[#185fa5] hover:underline cursor-pointer"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteQuestion(q.id)}
                              className="text-red-600 hover:underline cursor-pointer"
                            >
                              Delete
                            </button>
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

        {/* TAB 4: BACKUP & RESTORE */}
        {activeTab === "backup" && (
          <div className="space-y-6">
            {/* Header Description */}
            <div className="bg-white border border-[#e2e0d8] rounded-3xl p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2.5 bg-blue-50 text-[#378add] rounded-2xl">
                  <Database className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-[#1f1e1c]">Database Backup & Restore System</h2>
                  <p className="text-xs text-[#6b6a63]">پشتیبان‌گیری کامل از داده‌ها (کاربران، ترم‌ها، سطح‌ها، درس‌ها و سوالات) و بازگردانی دیتابیس</p>
                </div>
              </div>
            </div>

            {backupMessage && (
              <div className={`p-4 rounded-2xl border text-xs font-semibold flex items-center gap-2.5 ${
                backupMessage.type === "success" 
                  ? "bg-[#eaf3de] border-[#3b6d11]/30 text-[#3b6d11]" 
                  : "bg-red-50 border-red-200 text-red-700"
              }`}>
                {backupMessage.type === "success" ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                <span>{backupMessage.text}</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Export Backup Card */}
              <div className="bg-white border border-[#e2e0d8] rounded-3xl p-6 shadow-sm space-y-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Download className="w-5 h-5 text-[#378add]" />
                      <h3 className="font-bold text-sm text-[#1f1e1c]">دانلود نسخه پشتیبان (Export)</h3>
                    </div>
                    <span className="text-[10px] bg-[#e6f1fb] text-[#185fa5] px-2 py-0.5 rounded-full font-bold">JSON Format</span>
                  </div>
                  <p className="text-xs text-[#6b6a63] leading-relaxed mb-4">
                    یک خروجی کامل و استاندارد در قالب یک فایل JSON دانلود کنید. این فایل شامل تمام داده‌های وارد شده شامل ترم‌ها، دروس، سوالات و کاربران همراه با وضعیت پیشرفت آن‌هاست.
                  </p>

                  <div className="grid grid-cols-2 gap-2 text-xs bg-[#faf9f6] p-3 rounded-2xl border border-[#e2e0d8] mb-4">
                    <div><span className="text-[#6b6a63]">تعداد ترم‌ها:</span> <strong className="text-[#1f1e1c]">{terms.length}</strong></div>
                    <div><span className="text-[#6b6a63]">تعداد درس‌ها:</span> <strong className="text-[#1f1e1c]">{allLessons.length}</strong></div>
                    <div><span className="text-[#6b6a63]">تعداد کاربران:</span> <strong className="text-[#1f1e1c]">{users.length}</strong></div>
                    <div><span className="text-[#6b6a63]">تاریخ خروجی:</span> <strong className="text-[#1f1e1c]">{new Date().toLocaleDateString('fa-IR')}</strong></div>
                  </div>
                </div>

                <a
                  href="/api/admin/backup"
                  download
                  className="w-full py-3 bg-[#378add] hover:bg-[#185fa5] text-white rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm text-center"
                >
                  <Download className="w-4 h-4" />
                  <span>دانلود فایل پشتیبان (Export Backup)</span>
                </a>
              </div>

              {/* Import / Restore Backup Card */}
              <div className="bg-white border border-[#e2e0d8] rounded-3xl p-6 shadow-sm space-y-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <HardDriveUpload className="w-5 h-5 text-[#ba7517]" />
                      <h3 className="font-bold text-sm text-[#1f1e1c]">بازگردانی دیتابیس (Import & Restore)</h3>
                    </div>
                    <span className="text-[10px] bg-[#faeeda] text-[#854f0b] px-2 py-0.5 rounded-full font-bold">Restore</span>
                  </div>
                  <p className="text-xs text-[#6b6a63] leading-relaxed mb-4">
                    فایل پشتیبان (با پسوند <code className="bg-gray-100 px-1 rounded">.json</code>) را انتخاب کنید تا اطلاعات قبلی دیتابیس با موفقیت بازگردانی شوند.
                  </p>

                  <div className="space-y-3 mb-4">
                    <label className="block w-full border-2 border-dashed border-[#c9c7bd] hover:border-[#378add] bg-[#faf9f6] p-4 rounded-2xl text-center cursor-pointer transition-all">
                      <FileJson className="w-8 h-8 text-[#6b6a63] mx-auto mb-1" />
                      <span className="text-xs font-bold text-[#1f1e1c] block">
                        {backupFile ? backupFile.name : "انتخاب فایل پشتیبان JSON"}
                      </span>
                      <span className="text-[10px] text-[#6b6a63] block mt-0.5">برای آپلود فایل کلیک کنید</span>
                      <input
                        type="file"
                        accept=".json,application/json"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          setBackupFile(file);
                          setBackupMessage(null);

                          const reader = new FileReader();
                          reader.onload = (event) => {
                            try {
                              const json = JSON.parse(event.target?.result as string);
                              setBackupPreview(json);
                            } catch (err) {
                              setBackupMessage({ type: "error", text: "فرمت فایل نامعتبر است. فایل JSON پشتیبان انتخاب کنید." });
                              setBackupPreview(null);
                            }
                          };
                          reader.readAsText(file);
                        }}
                        className="hidden"
                      />
                    </label>

                    {backupPreview && (
                      <div className="bg-[#f4f2ec] p-3 rounded-2xl text-xs space-y-1 text-[#1f1e1c]">
                        <div className="font-bold text-[11px] text-[#378add] mb-1">پیش‌نمایش محتوای فایل:</div>
                        {backupPreview.counts && (
                          <div className="grid grid-cols-2 gap-1 text-[11px] text-[#6b6a63]">
                            <div>ترم‌ها: <strong>{backupPreview.counts.terms ?? backupPreview.data?.terms?.length ?? 0}</strong></div>
                            <div>درس‌ها: <strong>{backupPreview.counts.lessons ?? backupPreview.data?.lessons?.length ?? 0}</strong></div>
                            <div>سوالات: <strong>{backupPreview.counts.questions ?? backupPreview.data?.questions?.length ?? 0}</strong></div>
                            <div>کاربران: <strong>{backupPreview.counts.users ?? backupPreview.data?.users?.length ?? 0}</strong></div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={async () => {
                    if (!backupPreview) return;
                    if (!confirm("آیا مطمئن هستید؟ با بازگردانی نسخه پشتیبان، تمام اطلاعات فعلی دیتابیس جایگزین خواهند شد.")) return;

                    setIsRestoring(true);
                    setBackupMessage(null);

                    try {
                      const res = await fetch("/api/admin/backup", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(backupPreview),
                      });

                      const data = await res.json();
                      if (res.ok) {
                        setBackupMessage({ type: "success", text: `دیتابیس با موفقیت بازگردانی شد! (${data.restoredCounts?.terms || 0} ترم، ${data.restoredCounts?.lessons || 0} درس، ${data.restoredCounts?.questions || 0} سوال، ${data.restoredCounts?.users || 0} کاربر)` });
                        setBackupFile(null);
                        setBackupPreview(null);
                        reloadTermsAndLessons();
                        const uRes = await fetch("/api/users");
                        if (uRes.ok) setUsers(await uRes.json());
                      } else {
                        setBackupMessage({ type: "error", text: data.error || "خطا در بازگردانی دیتابیس." });
                      }
                    } catch (err: any) {
                      console.error(err);
                      setBackupMessage({ type: "error", text: "خطا در برقراری ارتباط با سرور." });
                    } finally {
                      setIsRestoring(false);
                    }
                  }}
                  disabled={!backupPreview || isRestoring}
                  className={`w-full py-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-sm ${
                    !backupPreview || isRestoring
                      ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                      : "bg-[#1f1e1c] hover:bg-black text-white cursor-pointer"
                  }`}
                >
                  {isRestoring ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>در حال بازگردانی دیتابیس...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      <span>بازگردانی کامل اطلاعات (Restore)</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: BLOG ARTICLES MANAGEMENT */}
        {activeTab === "blog" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 bg-white border border-[#e2e0d8] rounded-3xl p-6 shadow-sm space-y-4">
              <h2 className="text-base font-bold">
                {editingBlogId ? "ویرایش مقاله وبلاگ" : "افزودن مقاله جدید به وبلاگ"}
              </h2>
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (!blogTitleEn || !blogTitleFa || !blogContentEn || !blogContentFa) return;

                  const payload = {
                    titleEn: blogTitleEn,
                    titleFa: blogTitleFa,
                    contentEn: blogContentEn,
                    contentFa: blogContentFa,
                    coverImage: blogCoverImage,
                    audioUrl: blogAudioUrl,
                  };

                  const url = editingBlogId ? `/api/blog/${editingBlogId}` : "/api/blog";
                  const method = editingBlogId ? "PUT" : "POST";

                  const res = await fetch(url, {
                    method,
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                  });

                  if (res.ok) {
                    setBlogTitleEn("");
                    setBlogTitleFa("");
                    setBlogContentEn("");
                    setBlogContentFa("");
                    setBlogCoverImage("");
                    setBlogAudioUrl("");
                    setEditingBlogId(null);
                    const bRes = await fetch("/api/blog");
                    if (bRes.ok) setBlogPosts(await bRes.json());
                  }
                }}
                className="space-y-4 text-xs"
              >
                <div>
                  <label className="block font-bold mb-1">عنوان مقاله (English)</label>
                  <input
                    type="text"
                    value={blogTitleEn}
                    onChange={(e) => setBlogTitleEn(e.target.value)}
                    placeholder="e.g. Traditional Norouz Customs"
                    className="w-full px-3 py-2 border border-[#e2e0d8] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#378add]"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold mb-1">عنوان مقاله (فارسی)</label>
                  <input
                    type="text"
                    value={blogTitleFa}
                    onChange={(e) => setBlogTitleFa(e.target.value)}
                    placeholder="مثلا: آیین‌های سنتی نوروز"
                    className="w-full px-3 py-2 border border-[#e2e0d8] rounded-xl text-right focus:outline-none focus:ring-2 focus:ring-[#378add]"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold mb-1">متن مقاله (English)</label>
                  <textarea
                    value={blogContentEn}
                    onChange={(e) => setBlogContentEn(e.target.value)}
                    rows={4}
                    placeholder="Write article details in English..."
                    className="w-full px-3 py-2 border border-[#e2e0d8] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#378add]"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold mb-1">متن مقاله (فارسی)</label>
                  <textarea
                    value={blogContentFa}
                    onChange={(e) => setBlogContentFa(e.target.value)}
                    rows={4}
                    placeholder="متن مقاله را به فارسی وارد کنید..."
                    className="w-full px-3 py-2 border border-[#e2e0d8] rounded-xl text-right focus:outline-none focus:ring-2 focus:ring-[#378add]"
                    required
                  />
                </div>

                {/* Cover Image Upload */}
                <div>
                  <label className="block font-bold mb-1">تصویر کاور مقاله (آپلود فایل)</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={blogCoverImage}
                      onChange={(e) => setBlogCoverImage(e.target.value)}
                      placeholder="/uploads/image.jpg"
                      className="flex-1 px-3 py-2 border border-[#e2e0d8] rounded-xl text-xs"
                    />
                    <label className="px-3 py-2 bg-[#f4f2ec] hover:bg-[#e2e0d8] rounded-xl font-bold cursor-pointer shrink-0">
                      <span>آپلود عکس</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          const formData = new FormData();
                          formData.append("file", file);
                          const res = await fetch("/api/upload", { method: "POST", body: formData });
                          if (res.ok) {
                            const data = await res.json();
                            setBlogCoverImage(data.url);
                          }
                        }}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                {/* Audio File Upload */}
                <div>
                  <label className="block font-bold mb-1">فایل صوتی / پادکست (آپلود MP3)</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={blogAudioUrl}
                      onChange={(e) => setBlogAudioUrl(e.target.value)}
                      placeholder="/uploads/audio.mp3"
                      className="flex-1 px-3 py-2 border border-[#e2e0d8] rounded-xl text-xs"
                    />
                    <label className="px-3 py-2 bg-[#f4f2ec] hover:bg-[#e2e0d8] rounded-xl font-bold cursor-pointer shrink-0">
                      <span>آپلود صدا</span>
                      <input
                        type="file"
                        accept="audio/*"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          const formData = new FormData();
                          formData.append("file", file);
                          const res = await fetch("/api/upload", { method: "POST", body: formData });
                          if (res.ok) {
                            const data = await res.json();
                            setBlogAudioUrl(data.url);
                          }
                        }}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-[#1f1e1c] hover:bg-black text-white font-bold rounded-xl"
                  >
                    {editingBlogId ? "بروزرسانی مقاله" : "ثبت مقاله"}
                  </button>
                  {editingBlogId && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingBlogId(null);
                        setBlogTitleEn("");
                        setBlogTitleFa("");
                        setBlogContentEn("");
                        setBlogContentFa("");
                        setBlogCoverImage("");
                        setBlogAudioUrl("");
                      }}
                      className="px-4 py-2.5 bg-gray-200 text-gray-700 font-bold rounded-xl"
                    >
                      انصراف
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* Articles List */}
            <div className="lg:col-span-2 bg-white border border-[#e2e0d8] rounded-3xl p-6 shadow-sm space-y-4">
              <h2 className="text-base font-bold">لیست مقالات وبلاگ ({blogPosts.length})</h2>
              {blogPosts.length === 0 ? (
                <p className="text-xs text-[#6b6a63]">مقاله‌ای ثبت نشده است.</p>
              ) : (
                <div className="space-y-3">
                  {blogPosts.map((post) => (
                    <div key={post.id} className="p-4 border border-[#e2e0d8] rounded-2xl flex items-center justify-between gap-4 bg-[#faf9f6]">
                      <div className="space-y-1">
                        <div className="font-bold text-xs text-[#1f1e1c]">{post.titleFa} / {post.titleEn}</div>
                        <div className="text-[10px] text-[#6b6a63]">Slug: {post.slug}</div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingBlogId(post.id);
                            setBlogTitleEn(post.titleEn);
                            setBlogTitleFa(post.titleFa);
                            setBlogContentEn(post.contentEn);
                            setBlogContentFa(post.contentFa);
                            setBlogCoverImage(post.coverImage || "");
                            setBlogAudioUrl(post.audioUrl || "");
                          }}
                          className="px-3 py-1 bg-blue-50 text-[#185fa5] font-bold rounded-lg text-xs"
                        >
                          ویرایش
                        </button>
                        <button
                          type="button"
                          onClick={async () => {
                            if (!confirm("آیا از حذف مقاله مطمئن هستید؟")) return;
                            const res = await fetch(`/api/blog/${post.id}`, { method: "DELETE" });
                            if (res.ok) {
                              const bRes = await fetch("/api/blog");
                              if (bRes.ok) setBlogPosts(await bRes.json());
                            }
                          }}
                          className="px-3 py-1 bg-red-50 text-red-700 font-bold rounded-lg text-xs"
                        >
                          حذف
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 6: SITE PAGES CONTENT EDITOR */}
        {activeTab === "pages" && (
          <div className="bg-white border border-[#e2e0d8] rounded-3xl p-6 shadow-sm space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-[#e2e0d8]">
              <div>
                <h2 className="text-base font-bold">مدیریت متون صفحات عمومی سایت</h2>
                <p className="text-xs text-[#6b6a63]">ویرایش مستقیم محتوای صفحات درباره ما، تماس با ما و قوانین</p>
              </div>

              <div className="flex gap-2">
                {(["about", "contact", "privacy"] as const).map((key) => (
                  <button
                    key={key}
                    type="button"
                    onClick={async () => {
                      setSelectedPageKey(key);
                      setPageSaveMessage("");
                      const res = await fetch(`/api/pages?key=${key}`);
                      if (res.ok) {
                        const data = await res.json();
                        setPageTitleEn(data.titleEn || "");
                        setPageTitleFa(data.titleFa || "");
                        setPageContentEn(data.contentEn || "");
                        setPageContentFa(data.contentFa || "");
                      }
                    }}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                      selectedPageKey === key ? "bg-[#1f1e1c] text-white shadow-sm" : "bg-[#f4f2ec] text-[#6b6a63]"
                    }`}
                  >
                    {key === "about" ? "درباره ما" : key === "contact" ? "تماس با ما" : "حریم خصوصی"}
                  </button>
                ))}
              </div>
            </div>

            {pageSaveMessage && (
              <div className="p-3 bg-[#eaf3de] border border-[#3b6d11]/20 text-[#3b6d11] text-xs font-semibold rounded-2xl">
                {pageSaveMessage}
              </div>
            )}

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setIsPageSaving(true);
                setPageSaveMessage("");

                try {
                  const res = await fetch("/api/pages", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      key: selectedPageKey,
                      titleEn: pageTitleEn,
                      titleFa: pageTitleFa,
                      contentEn: pageContentEn,
                      contentFa: pageContentFa,
                    }),
                  });

                  if (res.ok) {
                    setPageSaveMessage("تغییرات صفحه با موفقیت ذخیره شد!");
                  }
                } catch (err) {
                  console.error(err);
                } finally {
                  setIsPageSaving(false);
                }
              }}
              className="space-y-4 text-xs"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold mb-1">عنوان صفحه (English)</label>
                  <input
                    type="text"
                    value={pageTitleEn}
                    onChange={(e) => setPageTitleEn(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-[#e2e0d8] rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-[#378add]"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">عنوان صفحه (فارسی)</label>
                  <input
                    type="text"
                    value={pageTitleFa}
                    onChange={(e) => setPageTitleFa(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-[#e2e0d8] rounded-xl text-right font-medium focus:outline-none focus:ring-2 focus:ring-[#378add]"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold mb-1">محتوای کامل صفحه (English)</label>
                  <textarea
                    value={pageContentEn}
                    onChange={(e) => setPageContentEn(e.target.value)}
                    rows={10}
                    className="w-full px-3.5 py-2.5 border border-[#e2e0d8] rounded-xl font-medium leading-relaxed focus:outline-none focus:ring-2 focus:ring-[#378add]"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">محتوای کامل صفحه (فارسی)</label>
                  <textarea
                    value={pageContentFa}
                    onChange={(e) => setPageContentFa(e.target.value)}
                    rows={10}
                    className="w-full px-3.5 py-2.5 border border-[#e2e0d8] rounded-xl text-right font-medium leading-relaxed focus:outline-none focus:ring-2 focus:ring-[#378add]"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isPageSaving}
                className="w-full py-3 bg-[#1f1e1c] hover:bg-black text-white rounded-xl font-bold text-xs shadow-sm transition-all"
              >
                {isPageSaving ? "در حال ذخیره‌سازی..." : "ذخیره تغییرات محتوای صفحه"}
              </button>
            </form>
          </div>
        )}

        {/* TAB 7: PLACEMENT TEST QUESTIONS & CONFIG */}
        {activeTab === "placement" && (
          <div className="bg-white border border-[#e2e0d8] rounded-3xl p-6 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-[#e2e0d8] pb-4">
              <div>
                <h2 className="font-bold text-base text-[#1f1e1c]">مدیریت سوالات آزمون تعیین سطح (Placement Test)</h2>
                <p className="text-xs text-[#6b6a63]">ویرایش مستقیم متن سوالات، گزینه‌ها و پاسخ‌های صحیح آزمون تعیین سطح دانش‌آموزان جدید</p>
              </div>
              <ClipboardCheck className="w-6 h-6 text-[#185fa5]" />
            </div>

            {placementSaveMessage && (
              <div className="p-3 bg-[#eaf3de] border border-[#3b6d11]/20 text-[#3b6d11] text-xs font-semibold rounded-2xl">
                {placementSaveMessage}
              </div>
            )}

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setIsPlacementSaving(true);
                setPlacementSaveMessage("");

                try {
                  const options1 = placementConfig.listeningOptions.split(",").map(s => s.trim()).filter(Boolean);
                  const options2 = placementConfig.readingOptions.split(",").map(s => s.trim()).filter(Boolean);

                  const payload = {
                    listeningPromptEn: placementConfig.listeningPromptEn,
                    listeningPromptFa: placementConfig.listeningPromptFa,
                    listeningOptions: options1,
                    listeningCorrect: placementConfig.listeningCorrect,
                    readingPromptEn: placementConfig.readingPromptEn,
                    readingPromptFa: placementConfig.readingPromptFa,
                    readingOptions: options2,
                    readingCorrect: placementConfig.readingCorrect,
                    speakingPromptEn: placementConfig.speakingPromptEn,
                    speakingPromptFa: placementConfig.speakingPromptFa,
                    speakingTarget: placementConfig.speakingTarget,
                  };

                  const res = await fetch("/api/pages", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      key: "placement_test",
                      titleEn: "Placement Test & Assessment",
                      titleFa: "آزمون تعیین سطح و ارزیابی اولیه",
                      contentEn: JSON.stringify(payload),
                      contentFa: JSON.stringify(payload),
                    }),
                  });

                  if (res.ok) {
                    setPlacementSaveMessage("سوالات و تنظیمات آزمون تعیین سطح با موفقیت ذخیره شدند!");
                  }
                } catch (err) {
                  console.error(err);
                } finally {
                  setIsPlacementSaving(false);
                }
              }}
              className="space-y-6 text-xs"
            >
              {/* Section 1: Listening Question */}
              <div className="border border-[#e2e0d8] rounded-2xl p-5 bg-[#faf9f6] space-y-4">
                <h3 className="font-bold text-sm text-[#185fa5]">بخش ۱: سوال شنیداری (Listening Question)</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold mb-1">صورت سوال (English)</label>
                    <input
                      type="text"
                      value={placementConfig.listeningPromptEn}
                      onChange={(e) => setPlacementConfig({ ...placementConfig, listeningPromptEn: e.target.value })}
                      className="w-full px-3.5 py-2.5 border border-[#e2e0d8] bg-white rounded-xl font-medium"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-bold mb-1">صورت سوال (فارسی)</label>
                    <input
                      type="text"
                      value={placementConfig.listeningPromptFa}
                      onChange={(e) => setPlacementConfig({ ...placementConfig, listeningPromptFa: e.target.value })}
                      className="w-full px-3.5 py-2.5 border border-[#e2e0d8] bg-white rounded-xl text-right font-medium"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold mb-1">گزینه‌های پاسخ (با ویرگول انگلیسی جدا کنید)</label>
                    <input
                      type="text"
                      value={placementConfig.listeningOptions}
                      onChange={(e) => setPlacementConfig({ ...placementConfig, listeningOptions: e.target.value })}
                      className="w-full px-3.5 py-2.5 border border-[#e2e0d8] bg-white rounded-xl font-medium"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-bold mb-1">پاسخ صحیح (دقیقاً با یکی از گزینه‌ها برابر باشد)</label>
                    <input
                      type="text"
                      value={placementConfig.listeningCorrect}
                      onChange={(e) => setPlacementConfig({ ...placementConfig, listeningCorrect: e.target.value })}
                      className="w-full px-3.5 py-2.5 border border-[#e2e0d8] bg-white rounded-xl font-medium"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Reading Question */}
              <div className="border border-[#e2e0d8] rounded-2xl p-5 bg-[#faf9f6] space-y-4">
                <h3 className="font-bold text-sm text-[#185fa5]">بخش ۲: سوال خواندن (Reading Question)</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold mb-1">صورت سوال (English)</label>
                    <input
                      type="text"
                      value={placementConfig.readingPromptEn}
                      onChange={(e) => setPlacementConfig({ ...placementConfig, readingPromptEn: e.target.value })}
                      className="w-full px-3.5 py-2.5 border border-[#e2e0d8] bg-white rounded-xl font-medium"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-bold mb-1">صورت سوال (فارسی)</label>
                    <input
                      type="text"
                      value={placementConfig.readingPromptFa}
                      onChange={(e) => setPlacementConfig({ ...placementConfig, readingPromptFa: e.target.value })}
                      className="w-full px-3.5 py-2.5 border border-[#e2e0d8] bg-white rounded-xl text-right font-medium"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold mb-1">گزینه‌های پاسخ (با ویرگول انگلیسی جدا کنید)</label>
                    <input
                      type="text"
                      value={placementConfig.readingOptions}
                      onChange={(e) => setPlacementConfig({ ...placementConfig, readingOptions: e.target.value })}
                      className="w-full px-3.5 py-2.5 border border-[#e2e0d8] bg-white rounded-xl font-medium"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-bold mb-1">پاسخ صحیح</label>
                    <input
                      type="text"
                      value={placementConfig.readingCorrect}
                      onChange={(e) => setPlacementConfig({ ...placementConfig, readingCorrect: e.target.value })}
                      className="w-full px-3.5 py-2.5 border border-[#e2e0d8] bg-white rounded-xl font-medium"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Section 3: Speaking Question */}
              <div className="border border-[#e2e0d8] rounded-2xl p-5 bg-[#faf9f6] space-y-4">
                <h3 className="font-bold text-sm text-[#185fa5]">بخش ۳: سوال گفتاری و تلفظ (Speaking Question)</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold mb-1">راهنمای سوال (English)</label>
                    <input
                      type="text"
                      value={placementConfig.speakingPromptEn}
                      onChange={(e) => setPlacementConfig({ ...placementConfig, speakingPromptEn: e.target.value })}
                      className="w-full px-3.5 py-2.5 border border-[#e2e0d8] bg-white rounded-xl font-medium"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-bold mb-1">راهنمای سوال (فارسی)</label>
                    <input
                      type="text"
                      value={placementConfig.speakingPromptFa}
                      onChange={(e) => setPlacementConfig({ ...placementConfig, speakingPromptFa: e.target.value })}
                      className="w-full px-3.5 py-2.5 border border-[#e2e0d8] bg-white rounded-xl text-right font-medium"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold mb-1">عبارت/کلمه مورد نظر برای تلفظ (Target Speech Word)</label>
                  <input
                    type="text"
                    value={placementConfig.speakingTarget}
                    onChange={(e) => setPlacementConfig({ ...placementConfig, speakingTarget: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-[#e2e0d8] bg-white rounded-xl text-right font-bold text-base text-[#185fa5]"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isPlacementSaving}
                className="w-full py-3.5 bg-[#1f1e1c] hover:bg-black text-white rounded-2xl font-bold text-xs shadow-sm transition-all cursor-pointer"
              >
                {isPlacementSaving ? "در حال ذخیره‌سازی..." : "ذخیره تغییرات سوالات آزمون تعیین سطح"}
              </button>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}
