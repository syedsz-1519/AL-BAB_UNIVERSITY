# 🏛️ Al-Bab Islamic University (جامعة الباب الإسلامية)

A premium, interactive, state-of-the-art scholastic platform integrating classical Islamic knowledge (Quran, Hadith, Fiqh) with cutting-edge modern interactive visualizations, cognitive-behavioral recovery tools, and scholastic database portal systems.

---

## 🌟 Key Modules

### 🪐 1. Celestial Globe (Verse Explorer & Scholastic Hubs)
An interactive revolving 3D globe visualization detailing the coordinates of historical Islamic scholastic centers (Baghdad, Cairo, Bukhara, Cordoba, Medina, Fez) paired with classical and modern scholastic commentaries.

### 🩺 2. Waswas Recovery Clinic (Cognitive Therapy)
A cognitive-behavioral therapeutic module designed to address doubts (*Waswas*) using a synthesis of:
- **Classical Juridical Rules:** Applying principles like *Yaqin* (Certainty is not overridden by doubt).
- **Modern Cognitive Behavioral Therapy (CBT):** Techniques for cognitive restructuring and anxiety management.

### 📜 3. Hadith Canonical Inspector
An advanced search interface connected to verified prophetic traditions. Includes complete chains of narration (*Isnad*), text, and grading (Sahih, Hasan, Da'if) for curricular inspection.

### ⚔️ 4. Classical Munazara Room (Dialectics)
A simulation of scholarly debates (*Munazara*) between classical theological and legal schools of thought (Ash'ari, Athari, Maturidi, Hanafi, Maliki, Shafi'i, Hanbali) to demonstrate traditional dialectic methodologies.

### 🎓 5. Student Portal & Admin Sanctum
A fully functional scholastic management system featuring:
- **Student Admissions & Sponsorships**
- **Dynamic Notice Board & Curricular Announcements**
- **Graded Assignments Ledger**
- **Scholastic Backend Database (Supabase with Local Memory fallback sandbox)**

---

## 🛠️ Technology Stack

- **Frontend:** React, TypeScript, TailwindCSS, Motion (for premium micro-animations), Lucide Icons
- **Backend:** Node.js, Express (Scholastic Backend Server)
- **Database/Storage:** Supabase Client (with memory-sandbox fallback mode)
- **AI Engine:** Google Gemini API (via `@google/genai`) for Scholastic AI guidance and Munazara generation.

---

## 🚀 Running Locally

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/syedsz-1519/AL-BAB_UNIVERSITY.git
cd AL-BAB_UNIVERSITY
npm install
```

### 2. Configure Environment Variables
Create a `.env.local` or `.env` file in the root directory and add the following keys:
```env
# Google Gemini API Credentials
GEMINI_API_KEY=your_gemini_api_key_here

# Optional: Supabase Credentials (will fallback to local-memory sandbox mode if omitted)
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Start Development Server
```bash
npm run dev
```
The Scholastic Backend Server will start listening on **[http://localhost:3000](http://localhost:3000)**.

---

## 📦 Production Build

To compile and optimize the assets for production deployment:
```bash
npm run build
```
This splits vendor packages into clean Rollup chunks to resolve minification limits and compiles the server into `dist/server.cjs`.

To run the production build:
```bash
npm start
```
