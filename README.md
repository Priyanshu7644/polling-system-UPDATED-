# ⚡ PULSE - Realtime Polling, Automated Proctoring & Survey Platform

**PULSE** is an enterprise-grade full-stack web application built with **React, TypeScript, Node.js, Express, Socket.IO, and MongoDB**. Designed with a high-performance architecture, vibrant Payoneer-inspired aesthetics, and robust real-time communication, PULSE offers an interactive suite for opinion polling, proctored examinations, and multi-format survey analytics.

---

## ✨ System Architecture & Key Features

### 1. 🗳️ Realtime Polling Node
- **Instant Vote Sync**: Powered by Socket.IO WebSockets to update option percentages live across all connected clients without page reloads.
- **Payoneer Electric Palette**: Sleek dark/light theme support with dynamic progress bars, voting badges, and share modal triggers.
- **Interactive Analytics**: Detailed visual breakdowns by option, response ratios, and engagement velocity.

### 2. 🎓 Automated Proctoring Exam Engine
- **Dual-Device Proctoring**: Connect mobile cameras via QR code to stream secondary viewing angles to the proctoring engine.
- **Integrity Enforcement**: Automatic tab-switch monitoring, fullscreen lock detection, time tracking, and event logging (`ProctorLog`).
- **Instant Grading**: Automated evaluation of objective questions with score breakdown and feedback.

### 3. 📋 Multi-Format Survey Builder
- **Flexible Survey Engine**: Multiple question formats (rating scale, multiple choice, short text).
- **Aggregate Analytics**: Interactive response charts built with Recharts, calculating average ratings and completion statistics.

### 4. 💬 Realtime Discussion Nodes
- **Nested Threaded Comments**: Nested reply support up to 3 levels deep with author distinction badges.
- **Live WebSocket Feed**: Instant push notifications when new comments or likes are added.

### 5. 🔒 Security & Authentication
- **Multi-Factor Email Verification**: OTP email verification via Gmail SMTP and Nodemailer.
- **Token Security**: Stateless JWT authentication with bcrypt password hashing and modular express middleware protection.

---

## 🛠️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend Framework** | React 18 (Vite), TypeScript |
| **Styling & Motion** | Tailwind CSS, Framer Motion, Lucide Icons |
| **Data Visualization** | Recharts |
| **Backend Runtime** | Node.js, Express.js (TypeScript) |
| **Realtime Protocol** | Socket.IO (WebSockets) |
| **Database** | MongoDB Atlas / Local MongoDB (Mongoose ORM) |
| **Authentication** | JSON Web Tokens (JWT), BcryptJS |
| **Email Service** | Nodemailer (Gmail SMTP) |

---

## 📂 Project Structure

```text
Online Polling System/
├── frontend/                   # React 18 + Vite TypeScript Frontend
│   ├── src/
│   │   ├── components/         # Reusable UI components & layouts
│   │   │   ├── analytics/      # Recharts dashboard widgets & charts
│   │   │   └── layout/         # Glassmorphism Navbar & theme controllers
│   │   ├── pages/              # Primary route pages (Polls, Exams, Surveys, Profile)
│   │   ├── App.tsx             # Root application router & layout wrapper
│   │   ├── api.ts              # Axios interceptors & Socket.IO client setup
│   │   └── index.css           # Global design system & utility classes
│   ├── index.html              # Single Page Application HTML shell
│   ├── tailwind.config.js      # Custom Payoneer gradient palette & theme configuration
│   └── vite.config.ts          # Vite build & SSL development proxy config
│
├── backend/                    # Node.js + Express TypeScript Backend
│   ├── src/
│   │   ├── middleware/         # JWT authentication & route security
│   │   ├── models/             # Mongoose schemas (Poll, Exam, Survey, User, ProctorLog, etc.)
│   │   ├── routes/             # RESTful API endpoints (/polls, /exams, /surveys, /comments)
│   │   ├── utils/              # Email mailer & keep-alive ping utilities
│   │   ├── seed.ts             # Comprehensive database seeder script
│   │   └── server.ts           # HTTP server setup & Socket.IO event handler
│   ├── package.json            # Node backend dependencies & scripts
│   └── tsconfig.json           # Backend TypeScript compiler setup
│
├── project_info/               # Project reference, master credentials & DB backups (Gitignored)
│   ├── MASTER_CREDENTIALS.txt # System endpoints & setup credentials
│   └── data_backup/            # Collection JSON archives for database recovery
│
├── render.yaml                 # Infrastructure-as-code deployment manifest for Render
└── README.md                   # Complete system documentation
```

---

## 🚀 Quickstart Guide

### Prerequisites
- **Node.js** (v18.x or higher)
- **npm** or **yarn**
- **MongoDB** (Local instance or MongoDB Atlas connection string)

### 1. Backend Setup
```bash
# Navigate to the backend directory
cd backend

# Install dependencies
npm install

# Start the development server (runs on http://localhost:5000)
npm run dev
```

*(Optional) Seed the database with sample polls, exams, and users:*
```bash
npx ts-node src/seed.ts
```

### 2. Frontend Setup
```bash
# Open a new terminal and navigate to the frontend directory
cd frontend

# Install dependencies
npm install

# Start the Vite development server (runs on http://localhost:5173)
npm run dev
```

---

## 💡 Interview & System Design Highlights

1. **WebSocket Event Architecture**:
   - `pollUpdate:<id>`: Broadcasts live vote counts to all viewing clients.
   - `newComment:<id>`: Pushes real-time discussion additions instantly.
   - `proctorStream:<id>`: Streams proctoring events and mobile camera status.

2. **Schema & Index Strategy**:
   - Designed normalized Mongoose models for user authentication, polls, option vote tracking, proctoring event logs, and nested comment trees with index optimization for query speed.

3. **Responsive UI & Design System**:
   - Hand-crafted Tailwind CSS theme using dynamic HSL color variables, micro-animations, glassmorphism containers, and viewport height management for a zero-scroll desktop experience.
