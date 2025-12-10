# 🚩 DIT CTF Platform

A modern, full-stack Capture The Flag (CTF) platform built for cybersecurity training, daily challenges, and competitions. 

Built with **Next.js 14**, **TypeScript**, **Tailwind CSS**, and **Supabase**.

![Status](https://img.shields.io/badge/Status-Active-success)
![Tech](https://img.shields.io/badge/Stack-Next.js%20%7C%20Supabase%20%7C%20Bun-black)

## ✨ Features

### 🔐 for Operatives (Users)
- **Authentication**: Secure email/password login and registration.
- **Challenge System**: View challenges by category (Web, Crypto, Pwn, etc.).
- **Flag Submission**: Real-time flag verification with strict anti-bruteforce protection.
- **Leaderboard**: Global rankings calculated dynamically based on solve time and points.
- **Profile**: Track personal progress, rank, and statistics.
- **Dark Mode UI**: Terminal-inspired aesthetic using Shadcn UI & Tailwind.

### 🛡️ for Administrators
- **Admin Dashboard**: Live overview of system stats (Users, Solves, Active Challenges).
- **Challenge Management**: Create, Edit, Delete, and Hide challenges via GUI.
- **User Management**: promote/demote admins, ban users.
- **Contest Scheduler**: Schedule timed CTF events.
- **Markdown Support**: Rich text descriptions for challenges.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Database & Auth**: [Supabase](https://supabase.com/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) & [Sass](https://sass-lang.com/)
- **Components**: [shadcn/ui](https://ui.shadcn.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Runtime/Package Manager**: [Bun](https://bun.sh/)

---

## 🚀 Getting Started

### 1. Prerequisites
- **Bun** installed (`curl -fsSL https://bun.sh/install | bash`)
- A **Supabase** project (Free tier works perfectly).

### 2. Installation

Clone the repository:

```bash
git clone https://github.com/yourusername/dit-ctf.git
cd dit-ctf/frontend
```

Install dependencies:

```bash
bun install
``` 

### 3. Environment Variables
Create a `.env.local` file in the root directory and add your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### 4. Run the Development Server
Start the development server:

```bash
bun dev
```