# Farsiyar — Bilingual Persian Learning Platform

A bilingual web application for teaching the Persian (Farsi) language to heritage speakers and non-native learners. Built with Next.js, Prisma, and SQLite.

---

## 1. Project Vision & Pedagogy
Farsiyar integrates modern language acquisition methods to deliver a rich, gamified, and effective learning path:
* **Comprehensible Input (Krashen):** Lessons focus on contextual understanding with 4–5 sentence narrative structures, accompanied by native audio.
* **Heritage Pedagogy:** Custom learning tracks that recognize heritage learners' strong oral/listening backgrounds but weak reading/writing profiles.
* **Spaced Repetition System (SRS):** Smart flashcard intervals driven by the SM-2 algorithm to guarantee long-term vocabulary retention.
* **Integrated Live Classes:** The self-paced app curriculum feeds directly into live group session pre-work.

---

## 2. Restructured Course Architecture
The course structure is fully database-driven and organized hierarchically:
`Term` ➔ `Level` (Sath) ➔ `Lesson` ➔ `Question`

Each lesson follows a structured 7-step pedagogical template:
1. **Oral Warm-up:** Audio-only exercises activating prior knowledge.
2. **Narrative Text:** 4–5 comprehensible sentences with audio and translation.
3. **Letter Introduction:** Introducing alphabet letters contextually from the text.
4. **Flashcards in Context:** Interactive vocabulary cards backed by SRS scheduling.
5. **Micro Grammar Tip:** One single grammar point per lesson.
6. **Active Production:** Speaking checks matching user speech using Web Speech API, or custom written sentences.
7. **Live Class Connection:** Context linking to the next classroom conversation.

---

## 3. Onboarding & Multi-Dimensional Placement Test
New users undergo a 5-step onboarding questionnaire and placement test at `/onboarding`:
1. **Account Type Selection:** Choose between independent heritage learning (`ADULT_HERITAGE`) and parent-administered setups (`PARENT`).
2. **Background Questionnaire:** Assesses native language exposure, Persian holiday familiarity, and alphabet recognition.
3. **Listening Assessment:** Plays audio clip using the server TTS proxy and tests comprehension.
4. **Reading Assessment:** Evaluates basic translation skills.
5. **Pronunciation Check:** Speaks "Salâm" out loud using the browser's Web Speech API.
* **Output:** Generates a **4-dimensional Skill Profile** (Listening, Speaking, Reading, Writing) shown in the dashboard.

---

## 4. User Roles & Custom Dashboards
* **Adult Heritage Dashboard:** Displays personalized motivation ("Why I'm learning"), the 4D skill profile chart, completion certificates, and the terms roadmap.
* **Parent Dashboard:** Allows parents to add child profiles (`CHILD` accounts linked via `parentUserId`), monitor child streaks, view weekly lesson counts, and manage family premium subscriptions.
* **Child Dashboard:** Features a playful, gamified interface tracking progress, streaks, and unlocked badges (e.g., "Explorer", "Book lover"), with all financial controls and logout options hidden.
* **Admin Panel:** A modular, tabbed dashboard to manage user access levels (manually unlock/override lessons for specific users), define Terms/Levels hierarchy, and customize lessons/questions.

---

## 5. Technical Highlights
* **Prisma 7 & SQLite Adapter:** Configured to work in a serverless context using the `@prisma/adapter-better-sqlite3` driver.
* **TTS Server Proxy API (`/api/tts`):** A custom Node.js endpoint that proxies speech requests to bypass browser CORS policies and local system voice dependencies, returning high-quality native Persian MP3 streams to the client.
* **Web Speech Recognition:** Interactive oral verification using the browser's native `SpeechRecognition` API.
