# SkillSpark

A full-stack learning platform to create and consume interactive, skill-path-based lessons. Admins can author rich-text lessons with embedded code/videos, and users can read content, track progress, earn XP and badges, and take AI-generated quizzes.

---

## 🚀 Features

- **Skill-Path Organization**  
  - Frontend, Backend, Full-Stack pages  
  - Nested dynamic routes for rich and intuitive navigation:  
    - `/lessons/[skillPath]` — list & add content  
    - `/lessons/[skillPath]/[lessonId]` — detail view  

- **Rich-Text Lesson Editor**  
  - Advanced **Tiptap Editor** integration  
  - Professional UI using `@heroicons/react`  
  - Support for text alignment, headers, inline media, links, and detailed text formatting  

- **Authentication & Authorization**  
  - Email or mobile OTP login/registration  
  - JWT-based sessions  
  - **Role-Based Access Control (RBAC)** to protect admin routes and premium content  

- **Progress & Gamification**  
  - **Progressive non-linear leveling system** based on user XP  
  - Professional inline SVG achievement badges  
  - Customized Gamification Dashboard with a dynamic Gamer ID card, mini-leaderboards, and interactive progress tracking  
  - "Continue Learning" call to action to boost engagement track  

- **AI-Generated Quizzes**  
  - **Google Gemini API** integration to dynamically generate multiple-choice questions for each lesson  
  - Real-time score display and interactive animations  

- **Comprehensive Software Testing**  
  - **Frontend & Backend Strategy:** Robust Unit, Integration, and End-to-End (E2E) test definitions  

- **Community Features**  
  - Dedicated community spaces to view posts, with real-time tracked "watched" counts and seamless interaction points. 

## 💻 Tech Stack

- **Frontend:** Next.js (App Router), React, Redux Toolkit, Tailwind CSS, Tiptap  
- **Backend:** Node.js, Express, MongoDB (Mongoose)  
- **Messaging:** Twilio SMS & Nodemailer email for OTP  
- **AI:** Google Gemini API for programmatic quiz generation  
- **Testing:** Jest, React Testing Library, and supplementary tools for robust software delivery  

---

## 📦 Getting Started

### Prerequisites

- Node.js v16+ & npm  
- MongoDB Atlas account (or local MongoDB)  
- Twilio account (for SMS OTP)  
- Gmail account with App Password (for email OTP)  
- Google Gemini API Key  

### Environment Variables

Create `.env` file(s) for your frontend/backend according to the workspace setup:

```dotenv
# MongoDB
MONGO_URI=your_mongo_connection_string

# JWT
JWT_SECRET=your_jwt_secret

# Twilio
TWILIO_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=+1234567890

# Email (Gmail App Password)
EMAIL_USER=you@gmail.com
EMAIL_PASS=your_app_password

# AI
GEMINI_API_KEY=your_gemini_api_key

# Next.js
NEXTAUTH_URL=http://localhost:3000
```

# Installation
## 1. Clone the repo
```bash
git clone https://github.com/AnsifMkr/Learning-website.git
cd Learning-website
```

## 2. Install dependencies (both frontend & backend)
Run in frontend and backend respectively, or project root if configured as a monorepo workspace:
```bash
npm install
```

## 3. Run the dev server
```bash
npm run dev
```

---

# 📝 API Documentation
Visit `http://localhost:5000/api-docs` (when running locally) for Swagger-powered API docs.

---

# 📄 License
MIT © Ansif
