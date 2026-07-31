<h1 align="center">🎓 UniQuest</h1>
<p align="center">
  <strong>Learn • Play • Achieve</strong>
</p>

<p align="center">
  <a href="https://github.com/mahek-56/UniQuest"><img src="https://img.shields.io/badge/Platform-Web-7289DA?style=for-the-badge&logo=google-chrome&logoColor=white" alt="Platform" /></a>
  <a href="https://python.org"><img src="https://img.shields.io/badge/Python-3.10%2B-3776AB?style=for-the-badge&logo=python&logoColor=yellow" alt="Python Version" /></a>
  <a href="https://fastapi.tiangolo.com"><img src="https://img.shields.io/badge/FastAPI-0.95%2B-009688?style=for-the-badge&logo=fastapi&logoColor=white" alt="FastAPI" /></a>
  <a href="https://react.dev"><img src="https://img.shields.io/badge/React-18.2-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React" /></a>
  <a href="https://postgresql.org"><img src="https://img.shields.io/badge/PostgreSQL-14%2B-336791?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" /></a>
  <a href="https://ai.google.dev"><img src="https://img.shields.io/badge/Gemini_API-Generative_AI-8E44AD?style=for-the-badge&logo=google&logoColor=white" alt="Gemini API" /></a>
  <a href="https://opensource.org/licenses/MIT"><img src="https://img.shields.io/badge/License-MIT-green?style=for-the-badge" alt="License" /></a>
</p>

<p align="center">
  <strong>An AI-Powered Gamified Learning Platform that curates custom educational roadmaps and embeds RPG-style mechanics to make study sessions adaptive, competitive, and engaging.</strong>
</p>

---

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│  _    _   _   _   ___    ___    _    _   ______    _____   _______          │
│ | |  | | | \ | | |_ _|  / _ \  | |  | | |  ____|  / ____| |__   __|         │
│ | |  | | |  \| |  | |  | | | | | |  | | | |__    | (___      | |            │
│ | |  | | | . ` |  | |  | | | | | |  | | |  __|    \___ \     | |            │
│ | |__| | | |\  | _| |_ | |_| | | |__| | | |____   ____) |    | |            │
│  \____/  |_| \_| |____| \__\_|  \____/  |______| |_____/     |_|            │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 📌 Table of Contents

1. [📖 Project Overview](#-project-overview)
2. [⚠️ Problem Statement](#-problem-statement)
3. [✨ Why UniQuest?](#-why-uniquest)
4. [🚀 Key Features](#-key-features)
5. [🧠 AI Learning Engine](#-ai-learning-engine)
6. [🔄 Learning Workflow](#-learning-workflow)
7. [🎮 Gamification Engine](#-gamification-engine)
8. [🏗️ System Architecture](#-system-architecture)
9. [🧬 AI Pipeline & Flow](#-ai-pipeline--flow)
10. [🖥️ Dashboard Layout Mockup](#-dashboard-layout-mockup)
11. [📊 Performance Analytics](#-performance-analytics)
12. [🛠️ Tech Stack](#-tech-stack)
13. [📁 Folder Structure](#-folder-structure)
14. [🗄️ Database Schema](#-database-schema)
15. [⚙️ Installation & Setup](#-installation--setup)
16. [🔌 API Documentation](#-api-documentation)
17. [👥 Team Profiles](#-team-profiles)
18. [🔮 Future Scope](#-future-scope)
19. [🤝 Contribution Guide](#-contribution-guide)
20. [📄 License](#-license)
21. [🎁 Footer](#-footer)

---

## 📖 Project Overview

**UniQuest** is a comprehensive educational ecosystem built to modernize remote learning. Traditional systems broadcast identical lecture pathways to thousands of students, ignoring variations in comprehension levels, attention spans, and interest sets. UniQuest disrupts this paradigm by utilizing **Generative AI** (via the Google Gemini API) and **Machine Learning** (using Scikit-Learn) to formulate highly personalized study tracks. 

To prevent platform fatigue and boost course completion rates, the system integrates a robust **role-playing game (RPG) progression engine**. As students learn concepts, solve AI-generated quizzes, and finish study sessions, they accrue experience points (XP), collect gold coins, complete daily quests, sustain learning streaks, and climb community leaderboards.

---

## ⚠️ Problem Statement

Modern e-learning is plagued by severe retention and engagement bottlenecks:
1. **One-Size-Fits-All Instruction:** Current learning management systems (LMS) present the same slides and assignments regardless of whether a student is a visual learner, struggles with basic concepts, or has already mastered the material.
2. **The Forgetting Curve:** Students study intensively before examinations but forget up to 70% of the material within days because platforms lack automated, memory-retention-based review mechanisms.
3. **Passive Content Consumption:** Video streaming models encourage passive watching. Without interactive milestones or feedback, student completion rates hover below 10% on most MOOC platforms.
4. **Lack of Instant Doubt Resolution:** Waiting for a tutor or peer responses to clear minor doubts halts learning momentum, leading to frustration and disinterest.

---

## ✨ Why UniQuest?

UniQuest approaches online education with a three-pronged strategy:

```mermaid
graph TD
    A[UniQuest Solution] --> B(Dynamic AI Personalization)
    A --> C(Intrinsic RPG Gamification)
    A --> D(Data-Driven Predictive Analytics)

    B --> B1[Custom Gemini Study Roadmaps]
    B --> B2[Real-time AI Doubt Solver]
    B --> B3[Spaced Repetition Flashcards]

    C --> C1[XP & Coin System]
    C --> C2[Daily Active Quests]
    C --> C3[Dynamic Global Leaderboards]

    D --> D1[Scikit-learn Weakness Detection]
    D --> D2[Grade Forecast Engine]
    D --> D3[Interactive Performance Analytics]
```

* **Adaptive Speed Mapping:** The system measures understanding using a diagnostic test, adjusting module complexities dynamically.
* **Continuous Active Learning:** Students are incentivized to test their knowledge frequently to earn progression assets.
* **Scientific Spaced Repetition:** Flashcards and reviews are systematically resurfaced using algorithms that track memory decay.

---

## 🚀 Key Features

The capabilities of UniQuest are divided into six primary architectural components:

| Module | Core Functionality | Primary Technology | User Benefit |
| :--- | :--- | :--- | :--- |
| **Authentication & Profile** | Secure JWT-based registration, Google OAuth integration, customizable user profiles. | FastAPI Security, PostgreSQL, React | Seamless, secure entry and unified storage of user learning parameters. |
| **Onboarding Diagnostic** | Initial assessment covering chosen subjects. Analyzes strengths and weaknesses. | Google Gemini API, Axios, React Router | Prevents redundant modules; benchmarks existing knowledge level. |
| **AI Learning Engine** | Generative tutor chat, dynamic study planning, cognitive roadmap generation. | Gemini API, Python, FastAPI | 24/7 personalized mentoring and dynamic curriculum planning. |
| **Smart Revision Scheduler** | Automatic scheduling of memory decay reviews based on spaced repetition. | SQLite/PostgreSQL, Python Celery | Long-term knowledge retention with minimal study fatigue. |
| **Gamification Engine** | XP tracking, levels, coin economy, badges, daily quests, and streaks. | FastAPI Background Tasks, SQL Tables | Transforms studying into a gamified habit loop. |
| **Analytics Dashboard** | Weekly/monthly progress tracking, category accuracy, and weakness alerts. | Recharts, Pandas, Scikit-Learn | Transparent tracking of academic growth and exam readiness. |

---

## 🧠 AI Learning Engine

```
                                  ┌────────────────────────┐
                                  │   Google Gemini API    │
                                  └───────────┬────────────┘
                                              │
                    ┌─────────────────────────┼────────────────────────┐
                    ▼                         ▼                        ▼
        ┌───────────────────────┐ ┌───────────────────────┐ ┌───────────────────────┐
        │   Contextual Tutor    │ │   Dynamic Roadmapper  │ │   Assessment Creator  │
        ├───────────────────────┤ ├───────────────────────┤ ├───────────────────────┤
        │ Answers doubts, ELI5, │ │ Evaluates diagnostic  │ │ Generates progressive │
        │ steps/hints output.   │ │ responses to format   │ │ test papers and       │
        │                       │ │ custom study nodes.   │ │ custom flashcards.    │
        └───────────────────────┘ └───────────────────────┘ └───────────────────────┘
```

The AI Learning Engine runs on a hybrid combination of generative language models and classical regression analytics:

### 1. The AI Tutor (Conversational Agent)
* **Progressive Hinting:** Instead of offering direct answers, the tutor outputs guided questions that prompt the student to find the solution.
* **Cognitive Level Switching:** Students can toggle the explanation styles between *Explain Like I'm 5 (ELI5)*, *Practical / Analogy*, or *Detailed / Scientific*.

### 2. Personalized Learning Planner
* Generates tailored learning nodes detailing files to read, practice questions, and target study times.
* Automatically parses uploaded lecture PDFs to extract core concepts, creating specialized flashcard decks.

### 3. Spaced Repetition Engine
* Implements a custom scheduler inspired by the **SuperMemo-2 (SM-2)** algorithm.
* Calculates next-review intervals ($I$) based on the user's recall quality feedback ($q$ scale of 0 to 5):
  $$I(1) = 1,\quad I(2) = 6$$
  $$I(n) = I(n-1) \times EF \quad (\text{for } n > 2)$$
  $$\text{where } EF' = f(EF, q)$$

### 4. Performance Prediction & Recommendation
* A Scikit-learn random forest classifier runs inference on a student's accuracy vectors, topic coverage ratios, and study consistency.
* Predicts upcoming test grades and lists topics that need immediate review to avoid academic failure.

---

## 🔄 Learning Workflow

Below is the standard student workflow during a learning session on UniQuest:

```text
                        +----------------------------+
                        |      Student Enters        |
                        +--------------+-------------+
                                       |
                                       v
                        +--------------+-------------+
                        |   Diagnostic Assessment    |
                        +--------------+-------------+
                                       |
                                       v
                        +--------------+-------------+
                        |     AI Profiling Engine    |
                        | (Strengths/Weaknesses/Goal)|
                        +--------------+-------------+
                                       |
                                       v
                        +--------------+-------------+
                        |   Personalized Study Path  |
                        |      Roadmap Generated     |
                        +--------------+-------------+
                                       |
                                       +<------------------------+
                                       |                         |
                                       v                         |
                        +--------------+-------------+           |
                        |  Active Learning Session   |           |
                        | (Lessons, Videos, Cards)   |           |
                        +--------------+-------------+           |
                                       |                         |
                                       v                         |
                        +--------------+-------------+           |
                        |      AI doubt solving      |           |
                        |       via AI Tutor         |           |
                        +--------------+-------------+           |
                                       |                         |
                                       v                         |
                        +--------------+-------------+           |
                        |    Quick Quiz/Assignment   |           |
                        +--------------+-------------+           |
                                       |                         |
                                       v                         |
                        +--------------+-------------+           |
                        |   Smart Spaced Repetition   |           |
                        |      & Review Schedule     |           |
                        +--------------+-------------+           |
                                       |                         |
                                       v                         |
                        +--------------+-------------+           |
                        |  AI Performance Analyzer   |-----------+
                        | (Predictive Scoring/Tips)  | (Adaptive Adjustment)
                        +--------------+-------------+
                                       |
                                       v
                        +--------------+-------------+
                        |   Reward & Progression     |
                        | (XP, Coins, Achievements)  |
                        +----------------------------+
```

---

## 🎮 Gamification Engine

The platform operates on a reward cycle designed to stimulate study consistency:

```text
                          [ Student Actions ]
                    (Daily Quests, Lesson Completed)
                                     |
                                     v
                       +-------------+-------------+
                       |       XP Calculator       |
                       +-------------+-------------+
                                     |
                                     v
                       +-------------+-------------+
                       |    Level-Up Evaluator     |
                       +-------------+-------------+
                                     |
                +--------------------+--------------------+
                |                                         |
                v                                         v
     [ New Level Reached ]                       [ Coins Earned ]
                |                                         |
                v                                         v
   +------------+------------+               +------------+------------+
   |   Unlock Title / Badge  |               |    Save to Coin Wallet  |
   +------------+------------+               +------------+------------+
                |                                         |
                +--------------------+--------------------+
                                     |
                                     v
                       +-------------+-------------+
                       |   Leaderboard Updates     |
                       |    (Real-time Sorting)    |
                       +-------------+-------------+
                                     |
                                     v
                       +-------------+-------------+
                       |   Achievements Unlocker   |
                       |  (Milestone Verification) |
                       +---------------------------+
```

* **XP Engine:** Actions yield XP: completing lessons (+50 XP), getting 100% on a quiz (+100 XP), asking a daily doubt (+10 XP).
* **Coin Economy:** Earned gold can be redeemed in the avatar store to customize student profile cards, titles, and themes.
* **Daily Quests:** 3 randomized daily objectives (e.g., "Complete 2 lessons", "Maintain streak for 5 days", "Solve 10 flashcards") keep the experience fresh.
* **Streaks:** Visual streak fire counters tracking consecutive active days. If broken, students can spend coins to save their progress.
* **Leaderboards:** Dynamic regional and global rankings reset weekly to foster friendly academic competition.

---

## 🏗️ System Architecture

UniQuest uses a decoupled decoupled Client-Server architecture built for scalability, low response times, and fast data flows:

```text
  +─────────────────────────────────────────────────────────────────────────────+
  │                                CLIENT LAYER                                 │
  │  +───────────────────────────────────────────────────────────────────────+  │
  │  │                            React.js / Vite                            │  │
  │  │                                                                       │  │
  │  │  +─────────────────+   +──────────────────+   +────────────────────+  │  │
  │  │  │  UI Components  │   │ State Management │   │ Axios (API Client) │  │  │
  │  │  │  (Tailwind CSS) │   │ (React Context)  │   │  & Recharts (Vis)  │  │  │
  │  │  +────────┬────────+   +──────────────────+   +─────────┬──────────+  │  │
  │  +──────────┼──────────────────────────────────────────────┼─────────────+  │
  +─────────────┼──────────────────────────────────────────────┼────────────────+
                │ HTTPS (JSON)                                 │ HTTPS (JSON)
                v                                              v
  +─────────────┼──────────────────────────────────────────────┼────────────────+
  │             │                  API GATEWAY                 │                │
  │  +──────────v──────────────────────────────────────────────v─────────────+  │
  │  │                          FastAPI Web Server                           │  │
  │  │                                                                       │  │
  │  │  +─────────────────+   +──────────────────+   +────────────────────+  │  │
  │  │  │  Auth & JWT     │   │ Router / Endpoints│  │ Pydantic Validation│  │  │
  │  │  +────────┬────────+   +────────┬─────────+   +─────────┬──────────+  │  │
  │  +──────────┼──────────────────────┼───────────────────────┼─────────────+  │
  +─────────────┼──────────────────────┼───────────────────────┼────────────────+
                │ ORM Queries          │ Gemini API            │ Data Wrangling
                v                      v                       v
  +─────────────┼───────+   +──────────v─────────+   +─────────v────────────────+
  │         DATABASE    │   │      AI ENGINE     │   │      ML ENGINE           │
  │                     │   │                    │   │                          │
  │   PostgreSQL DB     │   │ Google Gemini API  │   │   Scikit-Learn / Pandas  │
  │  (Models & Schema)  │   │ (Doubts / Quizzes) │   │   (Score Predictions)    │
  +─────────────────────+   +────────────────────+   +──────────────────────────+
```

---

## 🧬 AI Pipeline & Flow

Data processing flows through the following pipeline to serve real-time recommendations and feedback:

```text
  +─────────────────────────────────────────────────────────────────────────────+
  │                             DATA COLLECTION                                 │
  │  [Student Engagement Metrics] -> [Quiz Scores] -> [Strengths/Weaknesses]     │
  +──────────────────────────────────────┬──────────────────────────────────────+
                                         │
                                         v
  +──────────────────────────────────────┴──────────────────────────────────────+
  │                             FEATURE ENGINEERING                             │
  │  - Calculate Topic Accuracy Rate       - Compute Spaced Repetition Intervals│
  │  - Time-decay Study Recency            - Game-state Coin/XP Ratios          │
  +──────────────────────────────────────┬──────────────────────────────────────+
                                         │
                                         v
  +──────────────────────────────────────┴──────────────────────────────────────+
  │                            AI & ML INFERENCE LAYER                          │
  │  ┌──────────────────────────────┐          ┌──────────────────────────────┐ │
  │  │      Google Gemini API       │          │      Scikit-learn Model      │ │
  │  │                              │          │                              │ │
  │  │  - Doubt Explanation         │          │  - Dynamic Quiz Difficulty   │ │
  │  │  - Contextual Hints          │          │  - Weakness Classification   │ │
  │  │  - Adaptive Lesson Planning  │          │  - Score Prediction Regressor│ │
  │  └──────────────────────────────┘          └──────────────────────────────┘ │
  +──────────────────────────────────────┬──────────────────────────────────────+
                                         │
                                         v
  +──────────────────────────────────────┴──────────────────────────────────────+
  │                           RECOMMENDATION DELIVERY                           │
  │  [Custom Study Roadmaps] -> [Spaced Reminders] -> [Performance Predictions]  │
  +──────────────────────────────────────┬──────────────────────────────────────+
                                         │
                                         v
  +──────────────────────────────────────┴──────────────────────────────────────+
  │                            DYNAMIC FRONTEND UI                              │
  │  Recharts Dashboard updates | AI Tutor chat prompts | Streak notifications  │
  +─────────────────────────────────────────────────────────────────────────────+
```

---

## 🖥️ Dashboard Layout Mockup

The user dashboard displays courses, AI tasks, progress visualizers, and gamification status metrics:

```text
+───────────────────────────────────────────────────────────────────────────────+
│ UniQuest | LEARN • PLAY • ACHIEVE                     [👤 Profile] [🔥 5 Days] │
+───────────────────────────────────────────────────────────────────────────────+
│  [Navigation]  │                                                              │
│  📊 Dashboard  │  Welcome back, Student! Level 4 [████████░░░░░] (850 / 1000) │
│  📚 Courses    │  Wallet: 🪙 420 Coins | 🏆 12 Badges | ⚡ rank #3            │
│  🧠 AI Tutor   │                                                              │
│  🃏 Flashcards │  +────────────────────────────────────────────────────────+  │
│  🎯 Quests     │  │ AI RECOMMENDATION                                      │  │
│  🏆 Leaderboard│  │ ⚡ Review: "Spaced Repetition: Database Normalization" │  │
│  📈 Analytics  │  │ 🎯 Next Lesson: "Introduction to FastAPI Routing"      │  │
│                │  +────────────────────────────────────────────────────────+  │
│                │                                                              │
│                │  +─────────────────────────+   +──────────────────────────+  │
│                │  │ DAILY QUESTS            │   │ RECENT PROGRESS (WEEK)   │  │
│                │  │ [x] Complete 1 Lesson   │   │ Mon: ███ 30m             │  │
│                │  │ [ ] Read 5 Flashcards   │   │ Tue: █████ 50m           │  │
│                │  │ [ ] Ask AI Tutor 1 Q    │   │ Wed: ░ 10m               │  │
│                │  +─────────────────────────+   +──────────────────────────+  │
+────────────────┴──────────────────────────────────────────────────────────────+
```

---

## 📊 Performance Analytics

The analytics engine processes raw metrics and converts them into dashboards containing actionable items:
* **Subject Accuracy Matrix:** Breakdown of percentage scores across specific modules (e.g., Computer Networks: 82%, Database Systems: 45%).
* **Temporal Study Heatmap:** Monitors active study minutes across a calendar week to track consistency.
* **Cognitive Topic Strengths/Weaknesses:** Flags critical weak concepts, providing quick buttons to launch AI study sessions.
* **AI Progress Insights:** Summarizes the current student state to provide tips (e.g., *"You are progressing fast in Python syntax, but your memory retention in Algorithms has declined. Try studying Flashcard Deck B."*).

---

## 🛠️ Tech Stack

```
                              ┌────────────────────┐
                              │     UniQuest       │
                              └────────┬───────────┘
                    ┌──────────────────┴──────────────────┐
                    ▼                                     ▼
          ┌───────────────────┐                 ┌───────────────────┐
          │     Frontend      │                 │     Backend       │
          ├───────────────────┤                 ├───────────────────┤
          │ React / Vite      │                 │ FastAPI / Python  │
          │ Tailwind CSS      │                 │ PostgreSQL        │
          │ Axios / Recharts  │                 │ Gemini API        │
          └───────────────────┘                 └───────────────────┘
```

The system uses modern tech stack frameworks chosen for their speed, developer experience, and efficiency:

| Layer | Technology | Primary Package / Lib | Purpose |
| :--- | :--- | :--- | :--- |
| **Frontend Framework** | React.js | `vite` (bundler) | Client-side reactive views and build pipelines. |
| **Styling** | Tailwind CSS | `tailwindcss` | Utility-first styling for quick responsive design. |
| **Routing** | React Router | `react-router-dom` | Smooth single-page application navigation. |
| **API Client** | Axios | `axios` | HTTP client for interfacing with backend servers. |
| **Data Visualizations**| Recharts | `recharts` | Visual graphs for user metrics. |
| **Backend Framework** | FastAPI | `fastapi` (Uvicorn server) | High-performance async Python backend development. |
| **AI Integration** | Google Gemini | `google-generativeai` | Context-aware tutoring and dynamic content creation. |
| **Predictive ML** | Scikit-Learn | `scikit-learn` | Runs predictive grade regressors and classification tasks. |
| **Database** | PostgreSQL | `postgresql` | Relational store for user records and progress structures. |
| **ORM** | SQLAlchemy | `sqlalchemy` | Object relational mapper for safe query execution. |

---

## 📁 Folder Structure

```text
UniQuest/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── v1/
│   │   │   │   ├── auth.py
│   │   │   │   ├── courses.py
│   │   │   │   ├── gamification.py
│   │   │   │   ├── ai_engine.py
│   │   │   │   └── analytics.py
│   │   │   └── deps.py
│   │   ├── core/
│   │   │   ├── config.py
│   │   │   ├── security.py
│   │   │   └── database.py
│   │   ├── models/
│   │   │   ├── user.py
│   │   │   ├── course.py
│   │   │   ├── gamification.py
│   │   │   └── analytics.py
│   │   ├── schemas/
│   │   │   ├── user.py
│   │   │   ├── course.py
│   │   │   └── gamification.py
│   │   ├── services/
│   │   │   ├── gemini.py
│   │   │   ├── recommendation.py
│   │   │   └── scheduler.py
│   │   └── main.py
│   ├── tests/
│   ├── requirements.txt
│   └── alembic.ini
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   │   ├── common/
│   │   │   ├── dashboard/
│   │   │   ├── ai_tutor/
│   │   │   └── gamification/
│   │   ├── context/
│   │   │   ├── AuthContext.jsx
│   │   │   └── GameContext.jsx
│   │   ├── hooks/
│   │   │   └── useAxios.jsx
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Learn.jsx
│   │   │   ├── Profile.jsx
│   │   │   └── Leaderboard.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
└── README.md
```

---

## 🗄️ Database Schema

The database uses PostgreSQL. Relations, foreign key cascades, and tables are designed as follows:

| Table Name | Primary Key | Relations & Foreign Keys | Description |
| :--- | :--- | :--- | :--- |
| `users` | `id` (UUID) | Matches `user_preferences.user_id` | Stores credential hashes, registration metadata, and OAuth flags. |
| `courses` | `id` (INT) | Linked to `lessons.course_id` | Metadata detailing courses, titles, categories, and duration. |
| `lessons` | `id` (INT) | `course_id` (FK -> `courses.id`) | Contains node paths, lesson markdown body, and difficulty indicators. |
| `flashcards` | `id` (INT) | `lesson_id` (FK -> `lessons.id`) | Front/back card contents used for spaced repetition reviews. |
| `assignments`| `id` (INT) | `lesson_id` (FK -> `lessons.id`) | AI-generated questions, test parameters, and key templates. |
| `study_sessions`| `id` (INT) | `user_id` (FK -> `users.id`) | Tracks focus periods, timestamps, and active status values. |
| `progress` | `id` (INT) | `user_id`, `lesson_id` (FKs) | Tracks student progress, score ratios, and completion flags. |
| `quests` | `id` (INT) | Checked by `users` daily | Objective descriptions, XP values, and coin payout details. |
| `achievements` | `id` (INT) | Matches unlocked profiles | Uniquely indexed list of medals, description lines, and unlock limits. |
| `xp_history` | `id` (INT) | `user_id` (FK -> `users.id`) | Incremental log of daily XP events used for audits. |
| `leaderboard`| `id` (INT) | `user_id` (FK -> `users.id`) | Tracks real-time, weekly-reset user points. |
| `coins_rewards`| `id` (INT) | `user_id` (FK -> `users.id`) | Wallet registers tracking items bought and current gold coin balances. |
| `analytics` | `id` (INT) | `user_id` (FK -> `users.id`) | Aggregated performance indicators, weak metrics, and study patterns. |
| `ai_recommendations`| `id` (INT) | `user_id` (FK -> `users.id`) | Real-time queue for recommendations generated by ML classifiers. |
| `notifications`| `id` (INT) | `user_id` (FK -> `users.id`) | System notifications, quest alerts, and badge announcements. |
| `user_preferences`| `id` (INT) | `user_id` (FK -> `users.id`) | Student config preferences, UI choices, and daily goal targets. |

---

## ⚙️ Installation & Setup

### Prerequisites
* Python 3.10 or higher
* Node.js v16 or higher
* PostgreSQL Database
* Google Gemini API Key

---

### Backend Setup (FastAPI)

1. **Clone the repository:**
   ```bash
   git clone https://github.com/mahek-56/UniQuest.git
   cd UniQuest/backend
   ```

2. **Establish Python Virtual Environment:**
   ```bash
   python -m venv venv
   # On Windows:
   .\venv\Scripts\activate
   # On Unix/macOS:
   source venv/bin/activate
   ```

3. **Install Dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Environment Configuration (`.env`):**
   Create a `.env` file in the root backend directory:
   ```env
   PROJECT_NAME="UniQuest Backend"
   DATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/uniquest"
   SECRET_KEY="YOUR_SUPER_SECRET_SIGNING_KEY_JWT_HASH"
   ALGORITHM="HS256"
   ACCESS_TOKEN_EXPIRE_MINUTES=1440
   GEMINI_API_KEY="YOUR_GOOGLE_GEMINI_API_DEVELOPER_KEY"
   ENVIRONMENT="development"
   ```

5. **Run Migrations & Launch Server:**
   ```bash
   # Run DB Schema migrations
   alembic upgrade head
   
   # Launch Uvicorn
   uvicorn app.main:app --reload
   ```
   > [!NOTE]
   > The backend server will spin up on `http://127.0.0.1:8000`. You can access automated Swagger docs at `http://127.0.0.1:8000/docs`.

---

### Frontend Setup (React & Vite)

1. **Navigate to the frontend folder:**
   ```bash
   cd ../frontend
   ```

2. **Install Node Packages:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables (`.env`):**
   Create a `.env` file in the frontend root:
   ```env
   VITE_API_URL="http://localhost:8000/api/v1"
   VITE_FIREBASE_GOOGLE_AUTH_KEY="YOUR_OPTIONAL_GOOGLE_AUTH_CREDENTIALS"
   ```

4. **Run Vite Development Server:**
   ```bash
   npm run dev
   ```
   > [!TIP]
   > The local development server runs at `http://localhost:5173`. Any changes to the UI will trigger hot reloads in the browser.

---

## 🔌 API Documentation

Our API endpoints conform to REST standards, using correct HTTP verbs and JSON schemas.

### 1. Authentication Endpoints
* **`POST /api/v1/auth/register`**: Creates a new user record and sets up initial user profile configurations.
* **`POST /api/v1/auth/login`**: Authenticates credentials and returns a secure JWT Token.
* **`POST /api/v1/auth/google`**: Handles Google authentication requests.
* **`GET /api/v1/auth/me`**: Fetches details for the currently logged-in user.

### 2. Learning Module Endpoints
* **`GET /api/v1/courses`**: Lists all active courses.
* **`GET /api/v1/courses/{course_id}/lessons`**: Returns lessons within a course.
* **`POST /api/v1/lessons/{lesson_id}/progress`**: Updates completion indicators and logs study times.
* **`GET /api/v1/flashcards/review`**: Fetches cards due for spaced repetition review.
* **`POST /api/v1/flashcards/{card_id}/respond`**: Updates study ratings to schedule future card displays.

### 3. AI Engine Endpoints
* **`POST /api/v1/ai/tutor/chat`**: Sends prompts to the AI Tutor to resolve doubts.
* **`POST /api/v1/ai/roadmap/generate`**: Creates course structures based on diagnostic answers.
* **`GET /api/v1/ai/recommendations`**: Lists recommended lessons based on ML model predictions.

### 4. Gamification Endpoints
* **`GET /api/v1/game/quests`**: Fetches active quests.
* **`POST /api/v1/game/quests/{quest_id}/claim`**: Claims rewards for completed daily quests.
* **`GET /api/v1/game/leaderboard`**: Returns rankings reset weekly.
* **`GET /api/v1/game/achievements`**: Returns a list of all unlocked and pending achievements.

---

## 👥 Team Profiles

We are a two-member team developing the frontend, backend database schemas, and AI/ML algorithms:

| Developer Card | Role & Responsibilities | Core Stack |
| :--- | :--- | :--- |
| **Mahek Patel** <br> 🛠️ Frontend Lead | • UI/UX Prototyping & Design Systems <br> • Component Development & State Management <br> • Client-Side Routing & Axios Middleware <br> • Data Visualization using Recharts <br> • Vercel Deployment and Optimizations | React.js, Vite, Tailwind CSS, Recharts, HTML5, CSS3, JavaScript |
| **Mahek Saradva** <br> 🤖 Backend & AI Architect | • REST APIs & Async FastAPI Architecture <br> • Relational Databases & PostgreSQL Migration <br> • Google Gemini API prompt patterns <br> • Grade prediction using Scikit-Learn <br> • Deployment pipelines via Railway & Render | Python, FastAPI, PostgreSQL, SQLAlchemy, Gemini API, Scikit-Learn |

---

## 🔮 Future Scope

The expansion roadmap details future updates to improve user retention and capabilities:

| Phase | Milestone | Feature Description | Target Timeline | Status |
| :--- | :--- | :--- | :--- | :--- |
| **Phase 1** | **Voice AI Tutor** | Adds speech-to-text and text-to-speech features for conversational learning. | Q4 2026 | 📋 Planned |
| **Phase 2** | **Multiplayer Challenges** | Compete head-to-head in real-time, timed quiz battles. | Q1 2027 | 📋 Planned |
| **Phase 3** | **LMS System Integration** | Direct integrations with university platforms like Moodle, Canvas, and Blackboard. | Q2 2027 | 📋 Planned |
| **Phase 4** | **Blockchain Certificates** | Issues decentralized, tamper-proof credentials for completed courses. | Q3 2027 | 📋 Planned |
| **Phase 5** | **Immersive VR Classrooms** | Virtual spaces for collaborative study sessions and lab modules. | Q4 2027 | 📋 Planned |

---

## 🤝 Contribution Guide

We welcome contributions to UniQuest. Please follow these workflow guidelines:

1. **Fork the Repository:** Create an independent copy of this repository.
2. **Create a Feature Branch:** Ensure your branch names describe the changes being made:
   ```bash
   git checkout -b feature/amazing-ai-feature
   ```
3. **Commit Conventions:** Follow [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) formats:
   ```text
   feat: add Gemini-powered PDF context parser
   fix: resolve JWT token expiration issues on reload
   docs: update backend environment setup steps
   ```
4. **Push and Pull Request:** Push changes to your fork and submit a Pull Request (PR) detailing the changes made.

---

## 📄 License

Distributed under the MIT License. See [LICENSE](LICENSE) for more information.

---

<p align="center">
  Made with ❤️ by Team UniQuest
</p>

<p align="center">
  <strong>Learn • Play • Achieve</strong>
</p>

<p align="center">
  © 2026 UniQuest Project. All Rights Reserved.
</p>
