# Farsiyar Project Handoff

## Overview
Farsiyar is an interactive Persian language learning application built with Next.js 16 (App Router), TypeScript, TailwindCSS, and Prisma ORM.

## Key Features & Architecture
- **Multi-Role & Multi-Account System:** Adult Heritage Learners, Parents, and Children.
- **Term & Level Access Management:** Premium terms locked by default; unlocked per user by Admin checkboxes.
- **Rich Question Types:**
  - `SELECT`: Multiple choice text questions
  - `SPEAK`: Speech recognition out-loud pronunciation test
  - `LISTEN_IMAGE`: Audio/voice match 4-grid image quiz
  - `STORY_ORDER`: Story sequence matcher with custom audio player and drag/arrow reordering
- **File Uploader & Automatic Cleanup:** Native file uploader serving `/uploads/` with physical disk cleanup on question edits/deletions.
- **Database Backup & Restore System:**
  - Export full DB backup as a structured JSON file (`farsiyar_db_backup_YYYY-MM-DD.json`).
  - Transactional import & restore system in Admin Panel (`/admin` under Backup & Restore tab) for terms, levels, lessons, questions, and user progress.
- **Universal Server-Side Persian TTS Proxy (`/api/tts`):**
  - Built a dedicated server-side TTS API proxy `/api/tts?text=...` so that Persian speech playback works in high quality across all devices and browsers (including Ubuntu/Linux servers, Chrome, Safari, iOS, and Android) without requiring pre-installed OS voices.
  - Supports custom uploaded MP3 audio files (`/uploads/...`) for questions as well.
- **Lesson Question Prompt Styling & RTL Font Alignment:**
  - Applied `dir="rtl"`, `font-fa`, and proper line heights (`leading-relaxed`) to Persian question/story prompt boxes so punctuation (dots/commas) align correctly and fonts match the site style.

## Database & API Routes
- `prisma/schema.prisma`: Schema using `postgresql` datasource provider.
- `src/lib/prisma.ts`: Centralized Prisma client helper with `dotenv/config` loading and `@prisma/adapter-pg` driver adapter.
- `src/app/api/admin/backup/route.ts`: `GET` (download backup) and `POST` (transactional restore).
- `src/app/api/upload/route.ts`: File upload handler.
- `src/app/api/questions/[id]/route.ts`: Question CRUD handler with file unlinking.

## Server Deployment Instructions
```bash
git pull
npm install @prisma/adapter-pg pg
npm install --save-dev @types/pg
npx prisma generate
npx prisma db push
npx tsx prisma/seed.ts
npm run build
sudo PORT=80 pm2 restart farsi-app
```
