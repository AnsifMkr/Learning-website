# SkillSpark

A full-stack learning platform to create and consume interactive, skill-path-based lessons. Admins can author rich-text lessons with embedded code/videos, and users can read content, track progress, earn XP and badges, and take AI-generated quizzes.

---

## 🚀 Features

- **Skill-Path Organization**  
  - Frontend, Backend, Full-Stack pages  
  - Nested dynamic routes:  
    - `/lessons/[skillPath]` — list & add content  
    - `/lessons/[skillPath]/[lessonId]` — detail view  
- **Rich-Text Lesson Editor**  
  - ReactQuill toolbar: headings, bold/italic, lists, code blocks, images, links  
- **Authentication & Authorization**  
  - Email or mobile OTP login/registration  
  - JWT-based sessions  
  - Admin role check for protected routes  
- **Progress & Gamification**  
  - XP earned per lesson  
  - Badge awards at milestones  
  - Avatar upload & profile page with progress bar  
- **AI-Generated Quizzes**  
  - OpenAI GPT‐3.5 Turbo to generate multiple-choice questions per lesson  
  - Score display with tick animation  
- **Tech Stack**  
  - **Frontend:** Next.js (App Router), React, Redux Toolkit, Tailwind CSS  
  - **Backend:** Node.js, Express, MongoDB (Mongoose)  
  - **Messaging:** Twilio SMS & Nodemailer email for OTP  
  - **AI:** OpenAI API for quiz generation

---

## 📦 Getting Started

### Prerequisites

- Node.js v16+ & npm  
- MongoDB Atlas account (or local MongoDB)  
- Twilio account (for SMS OTP)  
- Gmail account with App Password (for email OTP)  
- OpenAI API key  

### Environment Variables

Create a `.env` file at project root with:

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

# OpenAI
OPENAI_API_KEY=sk-...

# Next.js
NEXTAUTH_URL=http://localhost:3000
```

# Installation
## 1. Clone the repo
```
git clone https://github.com/AnsifMkr/Learning-website.git
```
```
cd Learning-website
```

## 2. Install dependencies (both frontend & backend)
```
npm install
```

## 3. Run the dev server
```
npm run dev
```
