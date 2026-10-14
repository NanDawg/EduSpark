# ✨ EduSpark

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js" />
  <img src="https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript" />
  <img src="https://img.shields.io/badge/Prisma-ORM-2D3748?style=for-the-badge&logo=prisma" />
  <img src="https://img.shields.io/badge/AI-Powered-22D3EE?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Status-MVP%20Ready-4CD97B?style=for-the-badge" />
</p>

<p align="center">
  <b>EduSpark</b> adalah platform pembelajaran interaktif yang mengubah proses belajar menjadi sebuah perjalanan penuh tantangan, pencapaian, dan eksplorasi.
</p>

<p align="center">
  🚀 Learn • 🎯 Challenge • ⭐ Grow
</p>

---

## 🌟 About EduSpark

EduSpark adalah aplikasi edukasi berbasis web yang dirancang untuk membuat pengalaman belajar lebih menyenangkan bagi siswa sekolah dasar.

Berbeda dari platform belajar konvensional, EduSpark menggabungkan:

- 📚 Materi pembelajaran interaktif
- 🗺️ Learning Adventure Map
- 🎯 Quiz berbasis tantangan
- ⭐ Sistem XP dan level
- 🏆 Badge achievement
- 🤖 Spark AI Learning Companion

Dengan konsep gamifikasi, siswa tidak hanya belajar, tetapi juga merasakan progres seperti berada dalam sebuah perjalanan.

---

# 🎮 Core Features

## 🗺️ Learning Adventure

Sistem pembelajaran berbentuk perjalanan.

Setiap materi direpresentasikan sebagai node yang dapat:

- 🔒 Locked
- 🚀 Current Mission
- ✅ Completed
- ⭐ Mastered

Siswa membuka perjalanan baru dengan menyelesaikan materi dan quiz.

---

## 📚 Interactive Learning

EduSpark menyediakan pembelajaran berbasis:

- Materi terstruktur
- Progress tracking
- Quiz evaluation
- Learning journey

Saat ini EduSpark berfokus pada:

> 🎓 Kurikulum kelas 3 SD

dengan struktur pembelajaran yang dapat dikembangkan ke level berikutnya.

---

## 🎯 Gamified Quiz System

Quiz dibuat agar terasa seperti tantangan, bukan sekadar ujian.

Fitur:

- Multiple choice questions
- Progress tracking
- Score evaluation
- XP reward
- Mastery detection

---

## ⭐ Gamification System

EduSpark menggunakan sistem perkembangan siswa:

```
Learning
    ↓
Complete Mission
    ↓
Earn XP
    ↓
Unlock Achievement
    ↓
Grow Level
```

Komponen:

- XP System
- Level Progress
- Badge Achievement
- Journey Completion Reward

---

# 🤖 Spark AI

Spark adalah asisten belajar AI EduSpark.

Kemampuan:

- Membantu memahami materi
- Menjawab pertanyaan edukasi
- Memberikan penjelasan sederhana
- Membantu proses belajar siswa

Architecture:

```
User
 |
Next.js Server
 |
OpenAI Compatible SDK
 |
Kenari AI Provider
 |
DeepSeek Model
```

AI berjalan secara server-side sehingga API key tetap aman.

---

# 🎨 UI/UX Design

EduSpark menggunakan pendekatan:

- Friendly learning environment
- Child-focused interface
- Gamified interaction
- Responsive layout

Design identity:

| Element | Concept |
|-|-|
| Primary Color | Sky Blue |
| Growth Color | Green |
| Reward Color | Sunny Yellow |
| AI Character | Spark Companion |

---

# 🏗️ Tech Stack

## Frontend

- Next.js 16
- React
- TypeScript
- Tailwind CSS

## Backend

- Next.js Server Actions
- Prisma ORM

## Database

- SQLite (Development / MVP)

## AI

- OpenAI-compatible SDK
- Kenari AI Provider
- DeepSeek Model

## Validation

- Zod

---

# 📂 Project Structure

```
src
├── app
│   ├── dashboard
│   ├── adventure
│   ├── quiz
│   └── spark
│
├── features
│   ├── adventure
│   ├── quiz
│   ├── gamification
│   ├── spark
│   └── curriculum
│
├── actions
├── components
└── lib
```

---

# 🚀 Getting Started

## 1. Clone Repository

```bash
git clone https://github.com/yourusername/EduSpark.git

cd EduSpark
```

---

## 2. Install Dependencies

```bash
npm install
```

---

## 3. Setup Environment

Create `.env`

```env
DATABASE_URL="file:./dev.db"

SESSION_SECRET="your-secret"

OPENAI_API_KEY="your-api-key"

OPENAI_BASE_URL="https://kenari.id/v1"

EDUSPARK_AI_MODEL="deepseek-v4-1-flash"
```

---

## 4. Setup Database

```bash
npx prisma generate

npx prisma migrate dev

npm run seed
```

---

## 5. Run Development Server

```bash
npm run dev
```

Open:

```
http://localhost:3000
```

---

# 🧪 Testing

Quality checks:

```bash
npm run lint

npx tsc --noEmit

npm run build
```

---

# 🛣️ Roadmap

## ✅ Phase 1 — Foundation

- Authentication
- User system
- Basic learning flow

## ✅ Phase 2 — Gamification

- XP system
- Badge system
- Achievement tracking

## ✅ Phase 3 — Learning Adventure

- Adventure Map
- Mission system
- Progress tracking
- Quiz integration

## ✅ Phase 3.1 — AI & UI Enhancement

- AI provider migration
- Spark improvements
- EduSpark branding
- UI/UX polishing

---

# 💡 Vision

> "Membuat belajar terasa seperti sebuah petualangan."

EduSpark hadir untuk membantu siswa belajar dengan cara yang lebih interaktif, menyenangkan, dan bermakna.

---

<p align="center">
Made with ❤️ for better learning experience
</p>