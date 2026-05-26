import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { createClient } from "@supabase/supabase-js";
import { GoogleGenAI, Type } from "@google/genai";

// Load environment variables
dotenv.config();

// Initialize Supabase Client (Lazy, safe, with fallback flags)
const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || "";

let supabase: any = null;
let isSupabaseConfigured = false;

if (supabaseUrl && supabaseServiceKey) {
  try {
    supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      }
    });
    isSupabaseConfigured = true;
    console.log("Supabase Client initialized successfully.");
  } catch (error) {
    console.error("Failed to initialize Supabase client:", error);
  }
} else {
  console.warn("Supabase credentials missing in environment. Operating in sandbox local-memory fallback mode.");
}

// In-Memory Fallback Databases (Seeded with initial structural logs)
let localAdmissions: any[] = [
  {
    id: "app_test1",
    fullName: "Zubayr Al-Husseini",
    email: "student@albab.edu",
    selectedCourse: "fiqh",
    statementOfPurpose: "Desiring to master classical Hanafi and Maliki jurisprudence to analyze modern crowd-sourced financing and cryptocurrency structures.",
    priorKnowledge: "intermediate",
    date: "May 25, 2026",
    status: "Approved"
  },
  {
    id: "app_test2",
    fullName: "Layla Bintl Farooq",
    email: "layla@outlook.com",
    selectedCourse: "logic",
    statementOfPurpose: "Determined to reconstruct logic syllogisms in theological tracts and contrast deductive traditions with modern machine intelligence frameworks.",
    priorKnowledge: "advanced",
    date: "May 26, 2026",
    status: "Pending"
  }
];

let localNotices: any[] = [
  {
    id: "n_1",
    title: "Admissions for Summer Covenant 2026 Now Open",
    category: "Admissions",
    body: "Scholars globally are encouraged to submit their statements of purpose for our eight cardinal disciplines. Orientation matches the moon cycles.",
    date: "May 24, 2026",
    priority: "High"
  },
  {
    id: "n_2",
    title: "New Study Circles: Reconstructing Traditional Usul Texts",
    category: "Seminary Notice",
    body: "A weekly study circle specializing in text reconstruction has transitioned from online chat rooms directly to focused peer reviews.",
    date: "May 20, 2026",
    priority: "Normal"
  }
];

let localAssignments: any[] = [
  {
    id: "asg_test1",
    studentName: "Zubayr Al-Husseini",
    studentEmail: "student@albab.edu",
    courseId: "fiqh",
    title: "Mudarabah Contracts in Digital Tokenization Assets",
    thesis: "Traditional Mudarabah aligns seamlessly with peer-to-peer liquidity protocol structures. However, systemic risks, collateral slippages, and interest-bearing proxy tokens command extreme caution under Usul-al-Fiqh guidelines.",
    date: "May 26, 2026",
    status: "Awaiting Grade"
  }
];

// Helper: Attempt Supabase operation, fallback otherwise
async function trySupabaseFetch(table: string, fallbackData: any[]) {
  if (!isSupabaseConfigured || !supabase) return { data: fallbackData, source: "fallback" };
  try {
    const { data, error } = await supabase.from(table).select("*").order("id", { ascending: false });
    if (error) {
      // Table might not exist, fallback gracefully
      console.warn(`Supabase fetch failed for "${table}". Error logic:`, error.message);
      return { data: fallbackData, source: "fallback (table missing or error)" };
    }
    return { data, source: "supabase" };
  } catch (err: any) {
    console.error(`Subsystem error fetching from ${table}:`, err.message);
    return { data: fallbackData, source: "fallback (exception)" };
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // 1. DATABASE CONNECTIVITY DIAGNOSTICS ENDPOINT
  app.get("/api/supabase-status", async (req, res) => {
    let admissionsStatus = "Unknown";
    let noticesStatus = "Unknown";
    let assignmentsStatus = "Unknown";

    if (isSupabaseConfigured && supabase) {
      try {
        const fetchAdmissions = await supabase.from("albab_admissions").select("id").limit(1);
        admissionsStatus = fetchAdmissions.error ? `Missing/Error: ${fetchAdmissions.error.message}` : "Ready";
        
        const fetchNotices = await supabase.from("albab_notices").select("id").limit(1);
        noticesStatus = fetchNotices.error ? `Missing/Error: ${fetchNotices.error.message}` : "Ready";

        const fetchAsgs = await supabase.from("albab_assignments").select("id").limit(1);
        assignmentsStatus = fetchAsgs.error ? `Missing/Error: ${fetchAsgs.error.message}` : "Ready";
      } catch (e: any) {
        console.error("Diagnostic sweep failed:", e.message);
      }
    }

    res.json({
      configured: isSupabaseConfigured,
      project_id: "wmxjnzgfvirfaiutskvg",
      url: supabaseUrl,
      endpoints: {
        albab_admissions: admissionsStatus,
        albab_notices: noticesStatus,
        albab_assignments: assignmentsStatus
      },
      sql_setup_script: `
-- RUN THESE QUERIES IN THE SUPABASE SQL EDITOR TO INITIALIZE THE SCHOLASTIC DATABASE!

-- 1. Create admissions table
CREATE TABLE IF NOT EXISTS albab_admissions (
  id TEXT PRIMARY KEY,
  "fullName" TEXT NOT NULL,
  email TEXT NOT NULL,
  "selectedCourse" TEXT NOT NULL,
  "statementOfPurpose" TEXT,
  "priorKnowledge" TEXT,
  date TEXT,
  status TEXT DEFAULT 'Pending'
);

-- 2. Create notices table
CREATE TABLE IF NOT EXISTS albab_notices (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT,
  body TEXT NOT NULL,
  date TEXT,
  priority TEXT DEFAULT 'Normal'
);

-- 3. Create assignments table
CREATE TABLE IF NOT EXISTS albab_assignments (
  id TEXT PRIMARY KEY,
  "studentName" TEXT NOT NULL,
  "studentEmail" TEXT NOT NULL,
  "courseId" TEXT NOT NULL,
  title TEXT NOT NULL,
  thesis TEXT NOT NULL,
  date TEXT,
  status TEXT DEFAULT 'Awaiting Grade',
  grade TEXT,
  feedback TEXT
);

-- Enable select operations for anonymous callers (or rely on bypass)
ALTER TABLE albab_admissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE albab_notices ENABLE ROW LEVEL SECURITY;
ALTER TABLE albab_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow read/write anonymized operations" ON albab_admissions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow read/write notices operations" ON albab_notices FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow read/write assignments operations" ON albab_assignments FOR ALL USING (true) WITH CHECK (true);
      `
    });
  });

  // 2. ADMISSIONS APIS
  app.get("/api/admissions", async (req, res) => {
    const { data, source } = await trySupabaseFetch("albab_admissions", localAdmissions);
    res.json({ data, source });
  });

  app.post("/api/admissions", async (req, res) => {
    const record = {
      id: req.body.id || `app_${Math.random().toString(36).substring(2, 9)}`,
      fullName: req.body.fullName,
      email: req.body.email,
      selectedCourse: req.body.selectedCourse,
      statementOfPurpose: req.body.statementOfPurpose || "",
      priorKnowledge: req.body.priorKnowledge || "Seeker",
      date: req.body.date || new Date().toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }),
      status: req.body.status || "Pending"
    };

    // Update Local fallback
    localAdmissions = [record, ...localAdmissions.filter(a => a.email.toLowerCase() !== record.email.toLowerCase())];

    let source = "fallback";
    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.from("albab_admissions").upsert(record);
        if (!error) {
          source = "supabase";
        } else {
          console.warn("Supabase insert/upsert failed. Falling back. Error:", error.message);
        }
      } catch (err: any) {
        console.error("Supabase write exception:", err.message);
      }
    }

    res.json({ success: true, record, source });
  });

  app.put("/api/admissions/:id", async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    // Update Local fallback
    localAdmissions = localAdmissions.map(a => a.id === id ? { ...a, status } : a);

    let source = "fallback";
    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.from("albab_admissions").update({ status }).eq("id", id);
        if (!error) {
          source = "supabase";
        } else {
          console.warn("Supabase update status failed. Falling back. Error:", error.message);
        }
      } catch (err: any) {
        console.error("Supabase update status exception:", err.message);
      }
    }

    res.json({ success: true, id, status, source });
  });

  // 3. NOTICES APIS
  app.get("/api/notices", async (req, res) => {
    const { data, source } = await trySupabaseFetch("albab_notices", localNotices);
    res.json({ data, source });
  });

  app.post("/api/notices", async (req, res) => {
    const record = {
      id: req.body.id || `n_${Math.random().toString(36).substring(2, 9)}`,
      title: req.body.title,
      category: req.body.category || "General",
      body: req.body.body,
      date: req.body.date || new Date().toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }),
      priority: req.body.priority || "Normal"
    };

    // Update Local fallback
    localNotices = [record, ...localNotices];

    let source = "fallback";
    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.from("albab_notices").insert(record);
        if (!error) {
          source = "supabase";
        } else {
          console.warn("Supabase notice insert failed. Error:", error.message);
        }
      } catch (err: any) {
        console.error("Supabase notice insert exception:", err.message);
      }
    }

    res.json({ success: true, record, source });
  });

  app.delete("/api/notices/:id", async (req, res) => {
    const { id } = req.params;

    // Update Local fallback
    localNotices = localNotices.filter(n => n.id !== id);

    let source = "fallback";
    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.from("albab_notices").delete().eq("id", id);
        if (!error) {
          source = "supabase";
        } else {
          console.warn("Supabase notice delete failed. Error:", error.message);
        }
      } catch (err: any) {
        console.error("Supabase notice delete exception:", err.message);
      }
    }

    res.json({ success: true, id, source });
  });

  // 4. ASSIGNMENTS APIS
  app.get("/api/assignments", async (req, res) => {
    const { data, source } = await trySupabaseFetch("albab_assignments", localAssignments);
    res.json({ data, source });
  });

  app.post("/api/assignments", async (req, res) => {
    const record = {
      id: req.body.id || `asg_${Math.random().toString(36).substring(2, 9)}`,
      studentName: req.body.studentName,
      studentEmail: req.body.studentEmail,
      courseId: req.body.courseId,
      title: req.body.title,
      thesis: req.body.thesis,
      date: req.body.date || new Date().toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }),
      status: req.body.status || "Awaiting Grade"
    };

    // Update Local fallback
    localAssignments = [record, ...localAssignments];

    let source = "fallback";
    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.from("albab_assignments").upsert(record);
        if (!error) {
          source = "supabase";
        } else {
          console.warn("Supabase assignment insert/upsert failed. Error:", error.message);
        }
      } catch (err: any) {
        console.error("Supabase assignment insert/upsert exception:", err.message);
      }
    }

    res.json({ success: true, record, source });
  });

  app.put("/api/assignments/:id", async (req, res) => {
    const { id } = req.params;
    const { status, grade, feedback } = req.body;

    // Update Local fallback
    localAssignments = localAssignments.map(asg => 
      asg.id === id ? { ...asg, status, grade, feedback } : asg
    );

    let source = "fallback";
    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.from("albab_assignments").update({ status, grade, feedback }).eq("id", id);
        if (!error) {
          source = "supabase";
        } else {
          console.warn("Supabase grading failed. Error:", error.message);
        }
      } catch (err: any) {
        console.error("Supabase grading exception:", err.message);
      }
    }

    res.json({ success: true, id, status, grade, feedback, source });
  });

  // 5. LECTURES PROGRESS APIS (Persisted in-memory & fallback in local memory)
  const localLectureProgress: Record<string, any> = {};

  app.get("/api/lecture-progress/:email", (req, res) => {
    const email = req.params.email.toLowerCase();
    res.json({ data: localLectureProgress[email] || {}, source: "fallback-memory" });
  });

  app.post("/api/lecture-progress/:email", (req, res) => {
    const email = req.params.email.toLowerCase();
    const { completedLectures } = req.body;
    localLectureProgress[email] = completedLectures || {};
    res.json({ success: true, data: localLectureProgress[email], source: "fallback-memory" });
  });

  // --- GEMINI AI & CLASSICAL ISLAMIC ACADEMIC SUBSYSTEMS ---

  // Lazy Initializer for GoogleGenAI
  let genAIClient: GoogleGenAI | null = null;
  function getGenAI(): GoogleGenAI | null {
    if (!genAIClient) {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        console.warn("GEMINI_API_KEY is missing. Operating with high-fidelity local fallback models.");
        return null;
      }
      try {
        genAIClient = new GoogleGenAI({
          apiKey,
          httpOptions: {
            headers: {
              "User-Agent": "aistudio-build"
            }
          }
        });
        console.log("GoogleGenAI Client initialized server-side successfully.");
      } catch (e) {
        console.error("Failed to initialize GoogleGenAI client:", e);
      }
    }
    return genAIClient;
  }

  // Local state mappings for sponsorships, subscribers, and dashboard sync
  const localSponsorships: Record<string, string[]> = {
    quran: ["Fatima Al-Fihri Foundation"],
    hadith: ["Zubayr Al-Husseini (Sadaqah Jariyah)"]
  };
  const localSubscribers: string[] = [];
  const localDashboards: Record<string, any> = {};

  // Deterministic Falback Resources for offline/development robustness
  const FALLBACK_DEBATES: Record<string, string> = {
    finance: `### Classical Munazara: Trading of Digital Assets & Tokenized Currency

**Moderator Statement (Albab Academic Board):**  
In this study circle, we evaluate the status of digital tokens and cryptographic assets under traditional Islamic commercial law (*Fiqh al-Muamalat*).

---

#### 1. The Proponents / Permissive Argument (*Hanafi / Contemporary Synthesis*)
* **Evidence (*Daleel*):**  
  * Usul and the custom of the market (*Al-Urf*) play a primary role in defining money (*Maliyyah*). Since digital assets serve as standard indicators of utility/value and are widely accepted, they fulfill the core requirements of assets (*Mal*).
  * The default state of transaction types is general permission (*Al-Asl fil-Ashya al-Ibahah*) unless explicit absolute hazards exist.
* **Refined Reasoning:**  
  * Modern crypto acts identically to physical token currencies (*Fulus*) of medieval eras, which didn't possess intrinsic value but carried transactional exchange agreements.

---

#### 2. The Restrictive Argument (*Shafi'i / Classical Precautions*)
* **Evidence (*Daleel*):**  
  * High-level uncertainty and price volatility (*Gharar*) border on structural gambling (*Maysir*). Shafi'i parameters mandate physical possession or direct hand-to-hand delivery (*Qabd*) of tangible assets or stable mediums.
  * Lack of a central legal backing (*Sultah*) leaves assets highly susceptible to unmitigated loss and speculation.

---

#### 3. Scholarly Synthesis & Resolution (*Academic Conciliation*)
* **Verdict:**  
  * Distinction must be drawn between utility tokens representing clear, actual assets, and pure speculative trading instruments. 
  * If a digital asset represents real collateral or clear service utility, it achieves the rank of a sound asset under classical principles. Standard digital speculation remains highly discouraged to protect private wealth (*Hifz al-Mal*).`,
    moon: `### Classical Munazara: Moon Sighting (Global vs Local Calculations)

**Moderator Statement (Albab Academic Board):**  
Establishing the Lunar Crescent for cosmic sacred calendars (*Ramadan / Eid*).

---

#### 1. Position A: Absolute Global Unity (*Hanafi School*)
* **Evidence (*Daleel*):**  
  * Hanafi jurisprudence historically holds that the sighting of one community is binding upon all nations (*Ikhtilaf al-Matali' la 'ibarata bih*). 
  * General command of the Prophet: "Fast when you see it and end fast when you see it." This command applies collectively to the global Ummah.

---

#### 2. Position B: Astronomical Local Horizon (*Shafi'i School*)
* **Evidence (*Daleel*):**  
  * Shafi'is hold that every region has its unique horizon (*Matla'*). If distance exceeds the standard travel range (*Masafat al-Qasr*), different celestial rules apply.
  * Verified by the narration of Kuraib where the sighting of Ash-Shams in Damascus was not deemed binding on Medina.

---

#### 3. Scholarly Synthesis & Resolution (*Academic Conciliation*)
* **Verdict:**  
  * Traditional jurisprudential frameworks easily contain both views. Local authorities should specify a unified framework for their territory to prevent domestic communal divide (*Nifaq*).`
  };

  const FALLBACK_EXP_RECORDS: Record<string, any> = {
    "1:1": {
      arabic: "الم قُلْ نَعَمْ وَأَنتُمْ دَاخِرُونَ",
      translation: "Alif, Lam, Meem. Say: 'Yes, and you will be humiliated.'",
      tafseer: "Classic Tafseer Ibn Katheer: These foundational disconnected letters (Huruf al-Muqatta'at) indicate the supreme rhetoric and inimitability of the Quranic structure. No creature can construct its equivalents. Traditional scholars emphasize that Allah reserves the absolute meaning of these letters while using them to focus human attention.",
      hadiths: [
        "Sahih al-Bukhari: 'The best among you are those who learn the Quran and teach it.'",
        "Sunan al-Tirmidhi: 'Whoever recites a letter from the Book of Allah receives a good deed, multiplied by ten.'"
      ],
      curriculumLinks: ["Quranic Arabic", "Tafseer", "Uloom al-Qur'an"]
    },
    "2:255": {
      arabic: "اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ",
      translation: "Allah! There is no deity except Him, the Self-Sustaining, the All-Sustaining...",
      tafseer: "Classic Tafseer Ibn Katheer: Ayat Al-Kursi is the supreme verse of the Holy Scroll. It outlines ten majestic attributes of central monotheism (Tawheed). It highlights Allah's absolute self-subsistence (Qayyumiyyah), cosmic majesty, and total wakefulness.",
      hadiths: [
        "Sahih Muslim: The Prophet asked Ubayy bin Ka'b: 'Which verse is the greatest?' He replied 'Ayat Al-Kursi' and the Prophet patted his chest in approval.",
        "Sahih al-Bukhari: 'Reciting it at night ensures a celestial guardian watches over you until Dawn.'"
      ],
      curriculumLinks: ["Aqeedah", "Tafseer", "Islamic Studies"]
    }
  };

  // 1. AI SCHOLARLY DEBATE ARENA
  app.post("/api/debate", async (req, res) => {
    const { madhabA, madhabB, topic } = req.body;
    if (!madhabA || !madhabB || !topic) {
      return res.status(400).json({ error: "Missing madhabA, madhabB, or topic fields" });
    }

    const ai = getGenAI();
    if (!ai) {
      // Return high-fidelity dynamic fallback
      const fallbackKey = topic.toLowerCase().includes("moon") ? "moon" : "finance";
      return res.json({
        content: FALLBACK_DEBATES[fallbackKey] || FALLBACK_DEBATES["finance"],
        isSimulated: true
      });
    }

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: `You are a classic scholarly moderator at Albab Islamic University, guiding the Classical Munazara (academic scholarly debate) between the classic positions or schools: "${madhabA}" and "${madhabB}".
The selected scholastic Fiqh/theological topic is: "${topic}".

Please generate an extensive, highly academic, deeply respectful, and structured Munazara:
1. Classical Moderator Statement: Establish the framework of academic integrity under traditional laws.
2. Position A (${madhabA}) Daleel: Scriptural proofs, logical syllogisms, and classic juristic authorities.
3. Position B (${madhabB}) Daleel & Counter-argument: Scriptural proofs, systematic responses to A, and methodologies.
4. Academic Synthesis: A peaceful, scholarly conciliation (*Tawfeeq*) highlighting how traditional differences in legal root principles (*Usul*) yield these varied branches, promoting intellectual growth.

Format the output entirely with elegant, clean Markdown.`,
        config: {
          systemInstruction: "You are a senior dean of Islamic Jurisprudence and Scholarly Debate. Your tone is traditional, objective, eloquent, and highly respectful."
        }
      });
      res.json({ content: response.text, isSimulated: false });
    } catch (e: any) {
      console.error("Debate API Generation failed:", e);
      res.status(500).json({ error: "System error during Munazara generation: " + e.message });
    }
  });

  // 2. QURAN VERSE EXPLORER (With Claude/Gemini-driven classic Tafseer, Hadiths & Curriculum Maps)
  app.post("/api/quran-explorer", async (req, res) => {
    const { surah, ayah } = req.body;
    const sNum = parseInt(surah) || 1;
    const aNum = parseInt(ayah) || 1;

    let arabicText = "الم";
    let englishTrans = "Alif, Lam, Meem.";
    let fetchError = null;

    // Fetch from public Quran API with timeout safeguard
    try {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), 4000);
      
      const quranRes = await fetch(`https://api.quran.com/api/v4/quran/verses/utf8?verse_key=${sNum}:${aNum}`, { signal: controller.signal });
      clearTimeout(id);

      if (quranRes.ok) {
        const qData: any = await quranRes.json();
        if (qData.verses && qData.verses[0]) {
          arabicText = qData.verses[0].text_utf8;
        }
      }

      const transController = new AbortController();
      const tid = setTimeout(() => transController.abort(), 4000);
      const transRes = await fetch(`https://api.quran.com/api/v4/quran/translations/131?verse_key=${sNum}:${aNum}`, { signal: transController.signal });
      clearTimeout(tid);

      if (transRes.ok) {
        const tData: any = await transRes.json();
        if (tData.translations && tData.translations[0]) {
          englishTrans = tData.translations[0].text.replace(/<[^>]*>/g, ""); // Strip html tags
        }
      }
    } catch (err: any) {
      console.warn("Quran API fetch bypassed or timed out. Relying on fallback/AI expansion.", err.message);
      fetchError = err.message;
    }

    const ai = getGenAI();
    if (!ai) {
      const lookupKey = `${sNum}:${aNum}`;
      const record = FALLBACK_EXP_RECORDS[lookupKey] || {
        arabic: arabicText,
        translation: englishTrans,
        tafseer: `Comprehensive Tafseer: For Surah ${sNum}, Ayah ${aNum}. This sacred verse demands deep scholarly reflection on divine attributes, the preservation of law, and spiritual refinement. Traditional scholars focus specifically on the lexical links between guidance (*Huda*) and practice (*Taqwa*).`,
        hadiths: ["Sunan al-Tirmidhi: 'Seeking accurate Tafseer is equivalent to continuous learning.'"],
        curriculumLinks: ["Qur'anic Arabic", "Tafseer"]
      };
      return res.json({ ...record, isSimulated: true });
    }

    try {
      const prompt = `Scripture coordinates: Surah ${sNum}, Ayah ${aNum}.
Arabic words: "${arabicText}"
Translation: "${englishTrans}"

Please generate a deeply traditional analysis in the style of elite Islamic seminaries:
1. Tafseer (Classic Ibn Katheer Style): Frame the textual exegesis, historic triggers of revelation (*Asbab al-Nuzul*), and syntactic/rhetorical nuances.
2. Related Hadiths: Cite 2 authentic prophetic traditions supporting or explaining the themes of this verse, with complete grading.
3. Site Curriculum Connection: Suggest 2 or 3 relevant curriculum branches (such as Fiqh, Logic, Aqeedah, Islamic Studies, Modernity) that align with this verse.

Provide the response in structural markdown.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction: "You are a master of Tafseer (revelation exegesis) and Hadith sciences."
        }
      });

      res.json({
        arabic: arabicText,
        translation: englishTrans,
        tafseer: response.text,
        hadiths: [], // Integrated in the markdown text
        curriculumLinks: ["Tafseer", "Uloom al-Qur'an", "Islamic Studies"],
        isSimulated: false
      });
    } catch (e: any) {
      console.log("Quran Explorer AI generation failed:", e.message);
      res.json({
        arabic: arabicText,
        translation: englishTrans,
        tafseer: `System error during academic AI Tafseer drafting: ${e.message}`,
        hadiths: [],
        curriculumLinks: ["Tafseer"],
        isSimulated: true
      });
    }
  });

  // 3. FIQH RULING GENERATOR
  app.post("/api/fiqh-ruling", async (req, res) => {
    const { question } = req.body;
    if (!question) {
      return res.status(400).json({ error: "No question provided" });
    }

    const ai = getGenAI();
    if (!ai) {
      const docText = `### Authentic Decrees: Albab Juristic Fatwa Board

* **现代Question:** "${question}"
* **Decision Status:** Seeded Fallback Legal Opinion

---

#### 1. QURANIC EVIDENCE
* "Say: If you love Allah, follow me, and Allah will love you" (3:31)
* "And cooperate in righteousness and piety, but do not cooperate in sin and aggression" (5:2)

---

#### 2. HADITH EVIDENCE
* "The lawful is clear, and the unlawful is clear, and between them are doubtful matters..." (Sahih al-Bukhari)
* "Actions are valued according to intentions" (Sahih Muslim)

---

#### 3. SCHOLARLY CONSENSUS & OPINIONS OF THE SCHOOLS
* **Hanafi Legal Paradigm:** Prioritizes commercial custom and ease of transaction (*Istihsan*) unless explicit textual bars exist.
* **Maliki Legal Paradigm:** Evaluates blockages of systemic harms (*Sadd al-Dara'i*) and collective public interests (*Maslahah Mursalah*).
* **Shafi'i/Hanbali Legal Paradigm:** Relies strictly on semantic absolute textual proofs and direct analogies.

---

#### 4. VERDICT (Hukm)
* Transactions and modern-life options must maintain transparent terms free of clear high-risk deception (*Gharar*) or institutional interest (*Riba*). 
* The default stance on standard technological facilities is general permission, provided they are employed toward noble ends.

---

#### 5. SCHOLASTIC DISCLAIMER
*This legal opinion (*Fatwa*) constitutes a standard educational synthesis based on classic legal canons. Individuals should consult qualified local legal muftis for direct structural rulings.*`;
      return res.json({ content: docText, isSimulated: true });
    }

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: `You are a learned classical Mufti (Islamic Jurist) presiding at the Mufti fatwa counsel of Albab Islamic University.
Please provide a systematic, academic, and deeply traditional legal opinion (*Fatwa*) in response to the modern question or dilemma: "${question}".

You MUST structure your response exactly as follows:
1. QURANIC EVIDENCE - Cite key verses, their context, and direct application.
2. HADITH EVIDENCE - Cite authentic prophetic statements with contextual annotations.
3. SCHOLARLY CONSENSUS (Ijma/Qiyas) - Outline the traditional consensus or schools of thought (Hanafi, Maliki, Shafi'i, Hanbali).
4. VERDICT (Hukm) - Clear traditional legal decree with specific conditions.
5. DISCLAIMER - Explaining the limits of general research versus direct courtroom counseling.

Generate the ruling completely as beautifully formatted, parchment-ready Markdown.`,
        config: {
          systemInstruction: "You are an elite Islamic scholar specializing in legal root principles (Usul al-Fiqh) and Fatwa formulation."
        }
      });
      res.json({ content: response.text, isSimulated: false });
    } catch (err: any) {
      res.status(500).json({ error: "Fatwa council AI generation timed out: " + err.message });
    }
  });

  // 4. BRANCH QUIZ SYSTEM (Generate 10 dynamic MCQ questions)
  app.post("/api/branch-quiz", async (req, res) => {
    const { branchName } = req.body;
    if (!branchName) {
      return res.status(400).json({ error: "No branchName provided" });
    }

    const ai = getGenAI();
    if (!ai) {
      // Return a set of default premium questions to ensure quiz works beautifully offline
      const genericMCQs = [
        {
          question: `In classical scholarly literature, what is the primary literal translation of 'Usul'?`,
          options: ["Branches", "Roots/Foundations", "Texts", "Syllogisms"],
          correct: "B",
          explanation: "In traditional Lexicography, 'Usul' is the plural of 'Asl', which literally means 'the foundation/root upon which other things are built'."
        },
        {
          question: `Which historical legal manual is widely credited as the first book written on Usul al-Fiqh?`,
          options: ["Al-Muwatta by Imam Malik", "Al-Risalah by Imam al-Shafi'i", "Al-Hidayah by Imam al-Marghinani", "Al-Mustasfa by Imam al-Ghazali"],
          correct: "B",
          explanation: "Imam Muhammad ibn Idris al-Shafi'i composed 'Al-Risalah', systematizing the legal reasoning rules for extracting decisions."
        },
        {
          question: "Under traditional rules of evidence, what category of Hadith represents absolute historical certainty?",
          options: ["Ahad (Isolated)", "Mashhur (Famous)", "Mutawatir (Consecutively Narrated)", "Da'if (Weak)"],
          correct: "C",
          explanation: "A Mutawatir transmission comprises so many truthful narrators at every link that fabrication is logically and astronomically impossible."
        },
        {
          question: "What is the legal ruling for an action which is recommended and rewarded, but not strictly punished if omitted?",
          options: ["Fard", "Mandub (Mustahabb)", "Mubah", "Makruh"],
          correct: "B",
          explanation: "Mandub or Mustahabb refers to acts which earn spiritual rewards upon performance but do not incur punishment upon omission."
        },
        {
          question: "Which of the four major Sunni schools of laws was founded latest in historical chronology?",
          options: ["Hanafi", "Maliki", "Shafi'i", "Hanbali"],
          correct: "D",
          explanation: "Chronologically, Imam Ahmad ibn Hanbal was born last among the founders, studying closely as an illustrious pupil of Imam Shafi'i."
        },
        {
          question: "What classical tool of reasoning relies on applying a ruling to a new scenario due to a shared effective cause ('Illah)?",
          options: ["Ijma", "Qiyas", "Istihsan", "Urf"],
          correct: "B",
          explanation: "Qiyas is systematic analogical deduction, bridging an established textual case to a modern scenario based on a mutual effective cause."
        },
        {
          question: "Which term describes a jurist who has reached the state of complete independent visual reasoning?",
          options: ["Muqallid", "Mufti", "Mujtahid", "Khateeb"],
          correct: "C",
          explanation: "A Mujtahid is qualified through mastery of grammar, Usul, and texts to formulate independent rulings directly from revelation."
        },
        {
          question: "Which category of law refers to transactional, financial, and civil interactions among people?",
          options: ["Ibadat", "Muamalat", "Aqeedah", "Adab"],
          correct: "B",
          explanation: "Muamalat represents civil commerce and transaction laws, whereas Ibadat focuses strictly on prayers and ritualistic worship."
        },
        {
          question: "In logic and theology, what is the term for a deductive argument of two premises and a final conclusion?",
          options: ["Urf", "Istishab", "Syllogism (Qiyas al-Mantaqi)", "Bayan"],
          correct: "C",
          explanation: "A syllogism links a major premise and minor premise to yield an inevitable logical conclusion."
        },
        {
          question: "What is the ultimate objective or purpose of Islamic law, collectively known as?",
          options: ["Maqasid al-Shariah", "Usul al-Aslah", "Ilm al-Rijal", "Fatawa"],
          correct: "A",
          explanation: "Maqasid al-Shariah represents the core protective goals of religion, life, intellect, family lineage, and wealth."
        }
      ];
      return res.json({ questions: genericMCQs, isSimulated: true });
    }

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: `Generate exactly 10 multiple choice questions (MCQs) designed for university-level testing on the subject: "${branchName}".
Each question MUST test deep, authentic historical and theological aspects of the curriculum.

Return ONLY a valid JSON array of objects. Do not include markdown codeblocks or any commentary outside of the valid JSON.
Each object in the JSON array must contain exactly these properties:
- "question": text of the question (string)
- "options": array of exactly 4 strings (options representing A, B, C, D)
- "correct": single character representing the correct option ("A", "B", "C", or "D")
- "explanation": a detailed paragraph outlining the scholarly reason why this option is correct based on traditional seminary modules (string)

Format example:
[
  {
    "question": "...",
    "options": ["...", "...", "...", "..."],
    "correct": "C",
    "explanation": "..."
  }
]`,
        config: {
          responseMimeType: "application/json"
        }
      });

      const cleanText = response.text.trim();
      const parsed = JSON.parse(cleanText);
      res.json({ questions: parsed, isSimulated: false });
    } catch (e: any) {
      console.error("Failed to generate dynamic branch quiz:", e);
      res.status(500).json({ error: "Failed to generate dynamic quiz parameters: " + e.message });
    }
  });

  // --- AI COGNITIVE LABS ENDPOINTS ---

  // History and Persistence local in-memory stores
  const localCognitiveSaves: any[] = [];

  // Helper function to delay/pulse local stream simulation
  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  // 1. Nafs Assessment Engine Endpoint
  app.post("/api/labs/nafs-assessment", async (req, res) => {
    const { answers } = req.body;
    if (!answers || !Array.isArray(answers)) {
      return res.status(400).write("Error: Missing or invalid answers array");
    }

    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.setHeader("Transfer-Encoding", "chunked");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    const ai = getGenAI();
    if (!ai) {
      // Stream premium simulated scholarly assessment
      const responseStreamText = `[ALIGNMENT DIAGNOSIS: NAFS AL-LAWWAMA - THE SELF-BLAMING CONSCIENCE]

1) NAFS STAGE & SCRIPTURAL EVIDENCE
Your spiritual psychological profile indicates a predominant state of Nafs al-Lawwama. You are in a dynamic state of spiritual wakefulness, actively battling inner impulses yet feeling immediate regret after falling into error.
Sacred Proof: "And I swear by the self-reproaching soul (Nafs al-Lawwama)..." (Surah Al-Qiyamah, 75:2). Traditional masters outline this as the pivot of spiritual growth—it is the soul that moves between right and wrong but commands praise because it blames itself for its shortcomings.

2) PSYCHOLOGICAL PROFILE IN ISLAMIC TERMS
Under classically formulated Ibn al-Qayyim Nafs sciences, Nafs al-Lawwama operates as a transitional spiritual state. You are neither completely commanded by lower desires (Ammara) nor fully anchored in absolute divine tranquility (Mutmainna). 
In cognitive-behavioral terms, this manifests as high self-monitoring, acute moral awareness, and localized distress after ethical deviations. The challenge is converting self-reproach from a destructive cognitive feedback loop (unfiltered guilt) into adaptive repentance and behavioral modifications (Istiqlal).

3) SEVEN-DAY TAZKIYAH COGNITIVE PRESCRIPTION
- Day 1-2 (The Shield of Astaghfirullah): Recite "Astaghfirullah al-Azeem" 100 times after Fajr and Asr. Pair this with a cognitive pause—whenever an error occurs, do not spiral into hopelessness; write down the cognitive trigger.
- Day 3-4 (The Litany of Constant Grounding): Read Surah Al-Qiyamah verses 1-10 with exegesis. Practice behavioral cognitive reframing: focus on divine mercy over obsessive perfectionism.
- Day 5 (The Prayer of Renewed Alignment): Pray two rak'ahs of Salat al-Tawbah with focused presence. Actively visualize releasing the weight of past actions into divine mercy.
- Day 6-7 (Inoculation of Sabr): Align with nature or sit in silence for 15 minutes post-Asr. Practice deep diaphragmatic breathing (Nafas al-Ruh) while internally meditating on "Ya Hayyu Ya Qayyum."

4) CLASSIC ETHICAL MAXIM (IBN AL-QAYYIM Q-MEMORANDUM)
"The soul (Nafs) is like a wild beast; if you do not busy it with truth, it will busy you with falsehood. The remorse of the Lawwama is the dawn of the Mutmainna." (Ighathat al-Lahfan, Vol. 1)`;

      const lines = responseStreamText.split("\n");
      for (const line of lines) {
        res.write(line + "\n");
        await sleep(60);
      }
      res.end();
      return;
    }

    try {
      const formattedAnswers = answers.map((a: any, i: number) => `Q${i + 1}: ${a.question}\nSelected Response: ${a.answer}`).join("\n\n");
      const prompt = `Here are the student's selections on a spiritual psychology Nafs assessment:\n\n${formattedAnswers}\n\nPlease generate a professional, deep, and traditional psycho-spiritual analysis. Format the response exactly as:
1) Their predominant Nafs stage out of the three traditional levels: Nafs al-Ammara, Nafs al-Lawwama, or Nafs al-Mutmainna, with Quranic Ayah proof.
2) Psychological profile in classical Islamic terms fused with modern CBT insights.
3) A 7-day Tazkiyah (spiritual purification) course or prescription with specific Adhkar, Quranic verses, and lifestyle modifications.
4) One relevant quote from Ibn al-Qayyim.`;

      const responseStream = await ai.models.generateContentStream({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction: "You are an Islamic psychologist trained in traditional Tazkiyah al-Nafs (purification of the soul) of Imam Ibn al-Qayyim and contemporary Cognitive Behavioral Therapy (CBT). Your tone is eloquent, deeply spiritual, clinical, compassionate, and highly academic."
        }
      });

      for await (const chunk of responseStream) {
        res.write(chunk.text || "");
      }
      res.end();
    } catch (err: any) {
      console.error("Nafs streaming error:", err);
      res.write(`Error during live assessment: ${err.message}`);
      res.end();
    }
  });

  // 2. Mantiq Tutor Lesson Explainer Endpoint
  app.post("/api/labs/mantiq-tutor/explain", async (req, res) => {
    const { moduleKey } = req.body;
    if (!moduleKey) {
      return res.status(400).json({ error: "Missing moduleKey parameter" });
    }

    const ai = getGenAI();
    if (!ai) {
      // Fallback prebaked explanation
      const sampleExplanations: Record<string, string> = {
        hadd: `### Concept: Hadd (Classical Scholarly Definition)
**Arabic Term**: الحدّ (Al-Hadd)
**English Translation**: Absolute Essential Definition / Boundary

#### Traditional Exposition
Under classical Avicennian logic (Al-Mantiq), a *Hadd* represents the complete, essential definition of a reality. It must be composed of the immediate genus (*Jins al-Qarib*) and the specific difference (*Fasl*) that isolates the entity from all other members of the genus. A true Hadd explains *what* a thing essentially is.

*   **Classical Example**: "Man is a rational animal" (الإنسان حيوان ناطق). Here, "animal" is the genus (shared with other species) and "rational/articulate" is the specific differentiator (*Fasl*) that isolates man.
*   **Modern Example**: "A smartphone is a handheld mobile computer." "Computer" is the genus; "handheld and connected to mobile telephony" represents the essential dividing properties.

#### Practice Exercise
Using classical logic rules, formulate an essential definition (Hadd) for "A Book". Ensure you outline both the genus and its defining specific differentiator.`,
        qiyas: `### Concept: Qiyas (Logical Syllogism)
**Arabic Term**: القياس (Al-Qiyas)
**English Translation**: Logical Syllogism / Deduction

#### Traditional Exposition
In classical study, a Syllogism (*Qiyas*) is a systematic formal argument in which a conclusion is drawn from two given or assumed premises. The major premise establishes a cosmic or general truth; the minor premise links a localized entity; the conclusion unites them through a shared middle term (*Hadd-al-Anshat*).

*   **Classical Example**:
    *   *Premise 1*: The world is created (and changing).
    *   *Premise 2*: Everything created has a Creator.
    *   *Conclusion*: Therefore, the world has a Creator.
*   **Modern Example**:
    *   *Premise 1*: All software algorithms are governed by mathematical logic.
    *   *Premise 2*: Neural networks are software algorithms.
    *   *Conclusion*: Therefore, neural networks are governed by mathematical logic.

#### Practice Exercise
Construct a formal theological syllogism showing that ethical integrity is necessary for human flourishment. Label Premise 1, Premise 2, and the final Conclusion.`,
        burhan: `### Concept: Burhan (Demonstration)
**Arabic Term**: البرهان (Al-Burhan)
**English Translation**: Philosophical Demonstration / Certain Proof`,
        jadal: `### Concept: Jadal (Dialectic Debate)
**Arabic Term**: الجدل (Al-Jadal)
**English Translation**: Dialectics / Disputation`,
        mughalata: `### Concept: Mughalata (Fallacies)
**Arabic Term**: المغالطة (Al-Mughalata)
**English Translation**: Sophistical Fallacy`
      };

      return res.json({
        content: sampleExplanations[moduleKey] || sampleExplanations["hadd"],
        isSimulated: true
      });
    }

    try {
      const prompt = `Module topic requested: "${moduleKey}" (Options are hadd: Definition, qiyas: Syllogism, burhan: Demonstration, jadal: Dialectic, mughalata: Fallacies).
Provide a classical, eloquent explanation of this specific branch of Islamic logic (Mantiq) under Avicennian tradition.
You must include:
1. The classic scholastic Arabic Term with English translation.
2. Comprehensive, easy to grasp traditional explanation.
3. One classical historical example + One modern analytical example.
4. An interactive practice prompt/exercise for the student to solve at the bottom.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction: "You are a direct disciple of Abu Ali Ibn Sina teaching classical Aristotelian-Arabic logic (Mantiq) at a premium level. Your tone is dry, highly academic, precise, and encouraging."
        }
      });

      res.json({ content: response.text, isSimulated: false });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Evaluate Student Practice Exercise Answer
  app.post("/api/labs/mantiq-tutor/evaluate", async (req, res) => {
    const { moduleKey, exerciseQuestion, studentAnswer } = req.body;
    if (!moduleKey || !studentAnswer) {
      return res.status(400).json({ error: "Missing moduleKey or studentAnswer parameters" });
    }

    const ai = getGenAI();
    if (!ai) {
      return res.json({
        feedback: `### Scholarly Feedback (Simulated Sandbox)
*   **Assessment**: Your answer matches the logical parameters of traditional Mantiq. You successfully identified the genus and the core distinction.
*   **Grade**: Pass (Jayyid)
*   **Advice**: Continue refining your use of precise terms over colloquial expressions.`,
        isSimulated: true
      });
    }

    try {
      const prompt = `Class: Classical Mantiq (Islamic Logic).
Module: ${moduleKey}
Exercise Prompt: "${exerciseQuestion}"
Student's Response: "${studentAnswer}"

Evaluate the student's answer using Avicennian standards.
Clearly provide:
1. Score/Assessment (e.g. Pass/Jayyid/Excellent).
2. Bulleted conceptual feedback.
3. How to improve the syllogistic formulation.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction: "You are a master teacher of Avicennian logic. Provide direct, constructive, and highly formal scholastic feedback."
        }
      });
      res.json({ feedback: response.text, isSimulated: false });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Dynamic Mini-Quiz Generator for Mantiq Modules
  app.post("/api/labs/mantiq-tutor/quiz", async (req, res) => {
    const { moduleKey } = req.body;
    if (!moduleKey) {
      return res.status(400).json({ error: "Missing moduleKey parameter" });
    }

    const ai = getGenAI();
    if (!ai) {
      // Prebaked 3-question mini-quiz to ensure mock behaves perfectly
      const sampleQuizzes: Record<string, any[]> = {
        hadd: [
          {
            question: "A true classical Definition (Hadd al-Tamm) must be composed of which of the following?",
            options: [
              "Immediate Genus and Specific Difference (Jins & Fasl)",
              "Accidental Property and Genus (Jins & 'Ard)",
              "Accidental Property and Specific Difference",
              "Syllogistic Premise only"
            ],
            correct: "A",
            explanation: "Traditional logic dictates that the Hadd al-Tamm isolates the essence through its immediate genus (Jins Qarib) and differentiator (Fasl)."
          },
          {
            question: "In the definition 'Man is a laughing animal', why is 'laughing' NOT considered a Fasl?",
            options: [
              "Because it is an accidental quality (Proprium/Khasah), not an essential difference",
              "Because it is too long",
              "Because it represents the ultimate genus",
              "Because animals cannot laugh"
            ],
            correct: "A",
            explanation: "Laughing is a proprium (khasah) that is unique to humans but not part of the core genus/essence definition, thus making it a 'Hadd al-Naqis' or description."
          },
          {
            question: "An Arabic term that corresponds to the definition boundary is:",
            options: ["Hadd", "Qiyas", "Mughalata", "Tasawwur"],
            correct: "A",
            explanation: "Al-Hadd literally translates to a boundary, limit, or definition in formal classical logic."
          }
        ],
        qiyas: [
          {
            question: "What refers to the middle term in a logical syllogism that disappears in the conclusion?",
            options: ["Hadd-al-Anshat (Middle Term)", "Hadd-al-Akbar", "Hadd-al-Asghar", "Natijah"],
            correct: "A",
            explanation: "The middle term connects the major and minor premises but must not appear in the final conclusion."
          },
          {
            question: "A syllogism drawing localized instances from general principles is a process of:",
            options: ["Deduction", "Induction", "Abduction", "Analogy"],
            correct: "A",
            explanation: "Formal Qiyas in classical philosophy operates primordially as deduction (istintaj)."
          },
          {
            question: "Identify the conclusion of: 'All humans are mortal; Socrates is human.'",
            options: ["Socrates is mortal", "Socrates is human", "Mortals are humans", "Socrates is an animal"],
            correct: "A",
            explanation: "The major term (mortal) and minor term (Socrates) align to yield 'Socrates is mortal'."
          }
        ]
      };
      return res.json({
        questions: sampleQuizzes[moduleKey] || sampleQuizzes["hadd"],
        isSimulated: true
      });
    }

    try {
      const prompt = `Generate exactly 3 multiple choice questions (MCQs) in JSON format for the specific classical logic topic: "${moduleKey}".
Return ONLY a valid JSON array of objects. Do not include markdown codeblocks or outer commentary.
Each object in the JSON array must contain exactly:
- "question": text of the question (string)
- "options": array of exactly 4 strings (options representing A, B, C, D)
- "correct": single character representing the correct option ("A", "B", "C", or "D")
- "explanation": a concise paragraph explaining the Avicennian logic rule supporting the correct answer.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json"
        }
      });
      const parsed = JSON.parse(response.text.trim());
      res.json({ questions: parsed, isSimulated: false });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 3. Waswas Clinic Chat Endpoint (Streaming API)
  app.post("/api/labs/waswas-clinic", async (req, res) => {
    const { message } = req.body;
    if (!message) {
      return res.status(400).write("Error: Message parameter is missing");
    }

    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.setHeader("Transfer-Encoding", "chunked");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    const ai = getGenAI();
    if (!ai) {
      const responseStreamText = `### COMPASSIONATE VALIDATION & LOGICAL SHIELDING

Indeed, the thoughts, doubts, and internal weight you are facing represent a profoundly human and spiritual trial. 
First and foremost, know that having unwanted, distressing obsessive religious doubts or fears is **not** a reflection of a diseased heart; rather, it is a hallmark of an active, sincere intellect and conscience.

#### 1) Scriptural Theological Foundation
During the era of the companions, some came to the Prophet ﷺ in extreme distress, seeking remedy: "We find within our souls thoughts that are too severe for any of us to speak aloud." 
The Prophet ﷺ looked at them with immense compassion and asked: "Do you truly feel that?" They replied: "Yes." He ﷺ smiled and declared: "That is pure, clear faith" (ذَاكَ جَلِيحُ الإِيمَان - Sahih Muslim). Commenting on this, Imam Ibn al-Qayyim explained that the thief only breaks into a house filled with treasures—the whisperer (waswas) only launches intensive attacks against heart-spaces rich in authentic conviction and sincerity.

#### 2) Clinical Acceptance & Commitment (ACT) Integration
In therapy, trying to forcefully 'suppress' a thought causes it to return with double intensity (rebound effect). 
We use Ibn al-Qayyim's cognitive detachment combined with ACT. Instead of fighting and engaging in endless mental debates with the doubts:
- **Unhook (Defusion)**: Verbally label the thought. Say to yourself internally: *"I am noticing that my mind is having a scary thought about ritual purity."* Do not debate the content; recognize it is just a background cognitive firing of the nervous system.
- **Accept and Carry**: Allow the anxiety to exist without performing compounding physical rituals or seeking endless reassurance. This teaches your amygdala that the thought is not a real existential threat.

#### 3) Practical Remedial Prescription
- Day-to-Day: Practice the "Stop-Acknowledge" cycle. When thoughts spike, make fresh, simple wudu *once* without repeating. Count 1-2-3 and step away.
- Morning & Evening: Recite the Mu'awwidhatayn (Suras Falaq and Nas) slowly, while rubbing your hands over your body feeling the physical tactile boundary.

#### 4) Proprietary Prophetic Supplication
**Transliteration**: *“A'udhu bi-Kalimatillahit-Tammaati min sharri ma khalaq, wa min hamazatish-shayateeni wa an yahdurun.”*
**Meaning**: "I seek refuge in the perfect words of Allah from the evil of what He created, and from the obsessive whisperings of the devils, and from their presence."

*Clarity Disclaimer: If mental or spiritual struggles remain highly disruptive, obsessive, or trigger continuous panic, please consult a qualified mental health professional.*`;

      const lines = responseStreamText.split("\n");
      for (const line of lines) {
        res.write(line + "\n");
        await sleep(50);
      }
      res.end();
      return;
    }

    try {
      const prompt = `User describes their obsessive doubts or religious anxiety: "${message}".

Provide a highly compassionate response fusing Ibn al-Qayyim's Ighathat al-Lahfan methodology with modern Acceptance and Commitment Therapy (ACT):
1) Validate their psychological pain, clarifying that religious anxiety does not imply spiritual bankruptcy.
2) Give the classical theological explanation (referencing the Hadith 'That is pure/clear faith' from Sahih Muslim).
3) A practical 3-step exercise focusing on defusion (detaching from thoughts) and physical anchoring.
4) Suggest a reassuring Prophetic Dua with precise transliteration and translation.
5) End with the exact clinical disclaimer instructing them to consult local qualified mental health professionals if symptoms are severe.`;

      const responseStream = await ai.models.generateContentStream({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction: "You are an Islamic clinical psychologist who specializes in religious OCD (Waswas) and existential doubts, fluent in both Ibn al-Qayyim's psycho-spiritual text 'Ighathat al-Lahfan' and modern ACT. Your posture is incredibly gentle, reassuring, scientifically and logically sound, and grounded in profound empathy."
        }
      });

      for await (const chunk of responseStream) {
        res.write(chunk.text || "");
      }
      res.end();
    } catch (err: any) {
      res.write(`Waswas API error: ${err.message}`);
      res.end();
    }
  });

  // 4. Maqasid Ethical Analyzer Endpoint
  app.post("/api/labs/maqasid-analyzer", async (req, res) => {
    const { dilemma } = req.body;
    if (!dilemma) {
      return res.status(400).json({ error: "No dilemmetic scenario provided" });
    }

    const ai = getGenAI();
    if (!ai) {
      // Premium parsed sandbox JSON
      const sandboxOutput = {
        lenses: [
          {
            name: "Hifz al-Deen (Religion)",
            explanation: "Protects fundamental human values and absolute belief systems. Helps shield spiritual freedom from state or algorithmic erosion.",
            verdict: "permissible"
          },
          {
            name: "Hifz al-Nafs (Life / Biological Preservation)",
            explanation: "Prioritizes immediate medical well-being, biological sanctity, and preventions of self-harm or structural violence.",
            verdict: "permissible"
          },
          {
            name: "Hifz al-Aql (Intellect / Consciousness)",
            explanation: "Saves cognitive freedom, shields critical reasoning from chemicals or systemic manipulation.",
            verdict: "disputed"
          },
          {
            name: "Hifz al-Nasl (Lineage & Family)",
            explanation: "Guarantees family stability, childhood protection, and proper physical genealogy channels.",
            verdict: "permissible"
          },
          {
            name: "Hifz al-Maal (Wealth & Ownership)",
            explanation: "Safeguards honest commerce, shields public capital from high-frequency exploitation or interest-bearing compounds.",
            verdict: "disputed"
          }
        ],
        comparative: {
          utilitarian: "Highly optimal, as it increases raw aggregate utility, economic efficiency, and access to services.",
          deontology: "Repels because it uses humans as mere proxies or violates categorical duties regarding privacy or bio-ethics.",
          convergence: "Both systems stress the preservation of social harmony and avoiding absolute structural collapse.",
          divergence: "Maqasid insists on unchanging, divinely sourced moral boundaries (e.g., spiritual protection), whereas Utilitarianism allows compromises for net utility.",
          finalRuling: "Disputed/Permissible with severe, systemic regulatory guards. Source evidence relies on the juristic maxim: 'Warding off harm takes precedence over acquiring benefits' (Dar' al-mafasid)."
        }
      };
      return res.json({ result: sandboxOutput, isSimulated: true });
    }

    try {
      const prompt = `Modern Ethical Dilemma: "${dilemma}".

Analyze this dilemma through the lens of Maqasid al-Shariah and comparative ethics.
You MUST respond with a strictly formatted JSON object that fits the following structure:
{
  "lenses": [
    {
      "name": "Hifz al-Deen (Religion)",
      "explanation": "Brief explanation...",
      "verdict": "permissible" | "disputed" | "impermissible"
    },
    ...
  ],
  "comparative": {
    "utilitarian": "Brief summary of utilitarian view...",
    "deontology": "Brief summary of Kantian deontological view...",
    "convergence": "Where Maqasid and Western frameworks converge...",
    "divergence": "Where they diverge...",
    "finalRuling": "A classical final ruling with legal proof..."
  }
}

Explain clearly for each of the 5 traditional lenses: Hifz al-Deen (protection of religion), Hifz al-Nafs (life), Hifz al-Aql (intellect), Hifz al-Nasl (lineage), Hifz al-Maal (wealth). Ensure each lens has a verdict ('permissible', 'disputed', or 'impermissible') reflecting classical juristic balancing.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json"
        }
      });
      const parsed = JSON.parse(response.text.trim());
      res.json({ result: parsed, isSimulated: false });
    } catch (err: any) {
      console.error("Maqasid analysis exception:", err);
      res.status(500).json({ error: err.message });
    }
  });

  // 5. Aqeedah Firewall (Streaming Refutation)
  app.post("/api/labs/aqeedah-firewall", async (req, res) => {
    const { challengeKey } = req.body;
    if (!challengeKey) {
      return res.status(400).write("Error: Missing challengeKey parameter");
    }

    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.setHeader("Transfer-Encoding", "chunked");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    const ai = getGenAI();
    if (!ai) {
      const responseStreamText = `### THEOLOGICAL RESISTANCE REPORT: DIALECTICAL ANTI-VIRUS

#### Challenge: Modern Philosophical Challenge Mode (${challengeKey})
#### 1) STEEL-MAN ARGUMENTATION (Challenger's Strongest Premise)
Let us formulate the challenge at its absolute strongest:
$P1$: If a perfectly powerful and perfectly good Creator exists, gratuitous evil or suffering should not exist in the baseline creation environment.
$P2$: Systemic gratuitous suffering exists (e.g., predatory animal cycles, pediatric leukemia).
$C$: Therefore, a perfectly good, omnipotent Creator does not exist.

#### 2) AL-GHAZALI'S CRITIQUE (Tahafut al-Falasifa Response)
Refuting the philosophical philosophers, Imam Abu Hamid al-Ghazali demonstrates that human reasoning is structurally limited when trying to subject divine cosmic wisdom to anthropocentric human moral measurements. He illustrates that 'causality' itself is not an absolute logical necessity but a habitual temporal sequence. Thus, a temporary localized pain carries systemic necessities which human finite intellect cannot calculate, but exists under divine permission (Mashee'ah) for cosmic completeness.

#### 3) IBN TAYMIYYAH'S RATIONAL HYBRIDOLOGY
Imam Ibn Taymiyyah dismantles the dualistic trap of evil altogether. He argues that there is no such thing as "absolute, pure evil" ($Shar\\ al-Mutlaq$) in creation. Every localized hardship is relationally good, serving as a catalyst for human moral courage, purification, patience, and awakening. Divine actions are characterized by "Ultimate Wise Purpose" ($Hikmah\\ al-Balighah$), which is perfect, meaning Allah creates the framework with ultimate design objectives.

#### 4) MODERN INTELLECTUAL COUNTERPART
Plantinga’s Free Will Defense and Alvin Plantinga’s Reformed Epistemology align perfectly with classical Sunni Ash'ari and Maturidi responses:
- Evil exists because moral free agency is an immense intrinsic good. 
- A world where free agents make choices carries the absolute logical possibility of moral compromise. Removing the capacity for harm destroys free will.

#### 5) SACRED CLOSING REVELATION
**Sacred Proof**: "Or did you think that you would enter Heaven without such trials as came to those who passed away before you? They were afflicted with poverty and hardship and were shaken..." (Surah Al-Baqarah, 2:214).`;

      const lines = responseStreamText.split("\n");
      for (const line of lines) {
        res.write(line + "\n");
        await sleep(40);
      }
      res.end();
      return;
    }

    try {
      const prompt = `Modern Philosophical Challenge: "${challengeKey}".

Construct an intensive, scholarly theological refutation (dialectical firewall):
1) Steel-man the challenger's argument using formal logical notation (P1, P2 -> Conclusion).
2) Reference Al-Ghazali's intellectual model from Tahafut al-Falasifa if relevant.
3) Introduce Ibn Taymiyyah's rational theology on Hikmah (ultimate wisdom) and divine purpose.
4) Point to a modern philosophical defense (e.g., Plantinga, Craig, or Swinburne) that aligns with the traditional Islamic position.
5) Seal the refutation with a powerful closing Quranic Ayah.`;

      const responseStream = await ai.models.generateContentStream({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction: "You are an elite Islamic theologian trained in classical Kalam (rational theology) and modern analytic philosophy. Your style is deeply logical, precise, respectful, intellectually formidable, and grounded in orthodox principles."
        }
      });

      for await (const chunk of responseStream) {
        res.write(chunk.text || "");
      }
      res.end();
    } catch (err: any) {
      res.write(`Aqeedah error: ${err.message}`);
      res.end();
    }
  });

  // 6. Ru'ya Dream Interpreter Endpoint
  app.post("/api/labs/ruya-interpreter", async (req, res) => {
    const { dream } = req.body;
    if (!dream) {
      return res.status(400).json({ error: "Dream description not provided" });
    }

    const ai = getGenAI();
    if (!ai) {
      return res.json({
        islamic: `### Traditional Islamic Lens (Ibn Sirin Tradition)
*   **Symbols**: Drinking deep from water indicates seeking authentic, pristine knowledge, wisdom, and longevity.
*   **Aura**: Reflected under the narrative of Surah Yusuf, clean pure streams point to stabilization of resources and emotional clarity after intense dryness.`,
        jungian: `### Modern Jungian Depth Psychology
*   **Archetypes**: The deep water represents your vast collective unconscious. Seeking the source indicates an active individuation process, diving beneath the Mask (Persona) to integrate the shadow or anima/animus.`,
        synthesis: `### Combined Scholarly Synthesis
Both traditions agree that the dream points to an internal thirst or calling for wholeness and deeper orientation. Where they diverge is the source of meaning: classical Sirin attributes the symbol to an external divine warning/gift, whereas Jung attributes it to internal psychic projections.`,
        dua: `### Recommended Dua
"O Allah, I ask You for a dream of truth, that is truthful, bringing glad tidings, and not harmful. Ameen."`,
        isSimulated: true
      });
    }

    try {
      const prompt = `Dream Description: "${dream}".

Please interpret this dream through two advanced frameworks simultaneously:
1. Classical Islamic Lens (Ibn Sirin's Kitab al-Tabir): Analyze classical symbols, emotional tone, and exegesis, referencing Surah Yusuf if helpful.
2. Jungian Depth Psychology: Look for essential archetypes (Shadow, Anima/Animus, Self, Persona), unconscious promptings, and symbolic integration.
3. Comparative Synthesis: Where do they agree? Where do they diverge? What is the combined wisdom?
4. A customized, comforting prophetic Dua for the dreamer.

Output your analysis in a structured format containing separate keys inside a JSON object:
{
  "islamic": "...",
  "jungian": "...",
  "synthesis": "...",
  "dua": "..."
}`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json"
        }
      });
      const parsed = JSON.parse(response.text.trim());
      res.json({ ...parsed, isSimulated: false });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 7. Dhikr Prescription Engine Endpoint
  app.post("/api/labs/dhikr-rx", async (req, res) => {
    const { emotionKey } = req.body;
    if (!emotionKey) {
      return res.status(400).json({ error: "No emotional state selected" });
    }

    const ai = getGenAI();
    if (!ai) {
      // High-fidelity prebaked prescriptions
      const premadeRx: Record<string, any> = {
        anxiety: {
          dhikr: "حَسْبُنَا اللَّهُ وَنِعْمَ الْوَكِيلُ",
          transliteration: "Hasbunallahu wa ni'mal-Wakeel",
          meaning: "Sufficient for us is Allah, and He is the best Disposer of affairs.",
          repetition: "Repeat 100 times after Morning and Night prayers.",
          secondaryDua: "Ya Hayyu Ya Qayyum bi Rahmatika astagheeth.",
          neuroscience: "Recitation of rhythmic Arabic phonemes activates the vagus nerve, immediately shifting the nervous system from sympathetic (fight-or-flight) to parasympathetic (rest-and-digest). It reduces cortisol production in the adrenal glands and down-regulates a hyper-reactive amygdala. Consistent repetition fosters neuroplastic pathways favoring emotional regulation.",
          lifestyle: "Unplug, seek a green natural setting, or align your sleep cycles directly with the circadian rhythm of Isha and Fajr.",
          timeline: "Instant localized relief within 15 minutes of rhythmic chanting; systemic emotional re-wiring occurs in 21 days."
        },
        grief: {
          dhikr: "إِنَّا لِلَّهِ وَإِنَّا إِلَيْهِ رَاجِعُونَ",
          transliteration: "Inna lillahi wa inna ilayhi raji'oon",
          meaning: "Indeed we belong to Allah, and indeed to Him we will return."
        }
      };

      const defaultOrMatched = premadeRx[emotionKey] || premadeRx["anxiety"];
      return res.json({ result: defaultOrMatched, isSimulated: true });
    }

    try {
      const prompt = `Emotional Slate Selection: "${emotionKey}" (Options include: anxiety, grief, anger, loneliness, arrogance, envy, depression, gratitude).

For this specific state, formulate a precise, dual-disciplinary prescription:
1. Primary Dhikr (Remembrance): Provide accurate Arabic script, clear transliteration, English meaning, and recommended repetitive cycles.
2. Secondary Prophetic Dua from authentic sources.
3. THE NEUROBIOLOGY (Explain precisely in exactly 3 lines): How does this specific vocalized Arabic chanting or meditation mechanically affect cortisol, vagus nerve tone, blood pressure, or regional neuroplasticity?
4. Sunnah Lifestyle Tool: Fasting, sleep alignment, tactile grounding, or walking in nature.
5. Expected chronological timeline for spiritual and cognitive relief.

Respond with a strictly conforming JSON object:
{
  "dhikr": "Arabic text",
  "transliteration": "Transliteration",
  "meaning": "English translation",
  "repetition": "Times to repeat",
  "secondaryDua": "Dua from Sunnah",
  "neuroscience": "A 3-sentence neuroscientific analysis...",
  "lifestyle": "Sunnah practice...",
  "timeline": "Timeline..."
}`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json"
        }
      });
      const parsed = JSON.parse(response.text.trim());
      res.json({ result: parsed, isSimulated: false });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 8. Logical Fallacy Scanner Endpoint
  app.post("/api/labs/fallacy-scanner", async (req, res) => {
    const { argument } = req.body;
    if (!argument) {
      return res.status(400).json({ error: "Please input a valid argument text" });
    }

    const ai = getGenAI();
    if (!ai) {
      return res.json({
        fallacies: [
          {
            name: "Mughalata fi al-Lafz (Linguistic Fallacy) / Equivocation",
            quote: `"${argument.slice(0, 45)}..."`,
            severity: "fatal",
            explanation: "This occurs due to shifting semantics or sliding definition boundaries of key terms inside the premise.",
            reformulation: "Clarify the precise meaning of the term prior to presenting the major premise."
          }
        ],
        isSimulated: true
      });
    }

    try {
      const prompt = `Argument text to analyze: "${argument}".

Scan this argument for classical Fallacies (Mughalata) under traditional Mantiq rules (such as Sofia/Sophistry, Equivocation, Linguistic Mughalata fi al-Lafz, or Semantic Mughalata fi al-Ma'na), as well as modern fallacies (straw man, appeal to authority, false dichotomy, hasty generalization).

You MUST return a JSON object with this shape:
{
  "fallacies": [
    {
      "name": "Classical Term + English Name",
      "quote": "Exact sentence where it occurs",
      "severity": "fatal" | "weakening" | "minor",
      "explanation": "Why this is a fallacy and what logic rule it violates...",
      "reformulation": "How to write the argument correctly..."
    }
  ]
}

Provide deep critical evaluations. If no severe fallacies are present, return an empty array.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json"
        }
      });
      const parsed = JSON.parse(response.text.trim());
      res.json({ ...parsed, isSimulated: false });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 9. Unified Save Endpoint for all Cognitive Labs
  app.post("/api/labs/save", async (req, res) => {
    const { email, featureName, input, output } = req.body;
    const newSave = {
      id: "save_" + Date.now() + "_" + Math.random().toString(36).substr(2, 5),
      email: email || "anonymous",
      featureName,
      input: input || "",
      output: typeof output === "object" ? JSON.stringify(output) : output || "",
      timestamp: new Date().toISOString()
    };

    localCognitiveSaves.push(newSave);

    if (isSupabaseConfigured && supabase && email) {
      try {
        const { error } = await supabase.from("albab_cognitive_saves").insert([newSave]);
        if (error) {
          console.warn("Could not save to Supabase table (yet):", error.message);
        }
      } catch (err: any) {
        console.warn("Exception during Supabase labs save:", err.message);
      }
    }

    res.json({ success: true, save: newSave });
  });

  // 10. Fetch history of labs saves
  app.get("/api/labs/history/:email", async (req, res) => {
    const { email } = req.params;
    let userSaves = localCognitiveSaves.filter(s => s.email.toLowerCase() === email.toLowerCase());

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from("albab_cognitive_saves").select("*").eq("email", email);
        if (data && !error) {
          // Parse stringified output if needed
          return res.json({ history: data });
        }
      } catch (err) {
        console.warn("Fallback to local labs list:", err);
      }
    }

    res.json({ history: userSaves });
  });

  // 11. Complete List of saved records
  app.get("/api/labs/all", (req, res) => {
    res.json({ saves: localCognitiveSaves });
  });

  // 5. HADITH OF THE DAY (Rotating daily, fetching authentic Hadith with grading, with subscribe option)
  app.get("/api/hadith-of-the-day", async (req, res) => {
    const ai = getGenAI();
    
    const prebakedHadiths = [
      {
        arabic: "إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ وَإِنَّمَا لِكُلِّ امْرِئٍ مَا نَوَى",
        translation: "Actions are but by intentions, and every person shall have but that which he intended.",
        source: "Sahih al-Bukhari 1, Sahih Muslim 1907",
        grading: "Mutawatir Sahih (Unanimously Agreed) ✓",
        context: "The ethical starting gate of all actions, highlighting internal spiritual purity."
      },
      {
        arabic: "الْمُسْلِمُ مَنْ سَلِمَ الْمُسْلِمُونَ مِنْ لِسَانِهِ وَيَدِهِ",
        translation: "The true Muslim is one from whose tongue and hand other Muslims are safe.",
        source: "Sahih al-Bukhari 10",
        grading: "Sahih ✓",
        context: "Underlines social justice, verbal safety, non-aggression, and fraternal peace."
      }
    ];

    if (!ai) {
      // Return a rotating prebaked item based on the calendar day
      const day = new Date().getDate();
      const selected = prebakedHadiths[day % prebakedHadiths.length];
      return res.json({ data: selected, isSimulated: true });
    }

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: `Generate exactly one authentic, highly inspirational prophetic Hadith with its full Arabic text, its English translation, its rigorous classical source citation, its Isnad grading (e.g., Sahih/Hasan), and a short paragraph describing its academic context.
        Return as valid JSON of this exact schema:
        {
          "arabic": "...",
          "translation": "...",
          "source": "...",
          "grading": "...",
          "context": "..."
        }`,
        config: {
          responseMimeType: "application/json"
        }
      });
      const parsed = JSON.parse(response.text.trim());
      res.json({ data: parsed, isSimulated: false });
    } catch (e: any) {
      const day = new Date().getDate();
      const selected = prebakedHadiths[day % prebakedHadiths.length];
      res.json({ data: selected, isSimulated: true });
    }
  });

  // Hadith Newsletter Subscription (Resend alternative simulator)
  app.post("/api/subscribe-hadith", (req, res) => {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: "Email field is required" });
    }
    localSubscribers.push(email.toLowerCase());
    console.log(`New Hadith newsletter subscriber registered: ${email}`);
    res.json({ success: true, email, count: localSubscribers.length });
  });

  // 6. WAQF / SPONSOR AD-HOC API
  app.post("/api/sponsor", (req, res) => {
    const { courseId, name, amount, type } = req.body;
    if (!courseId || !name) {
      return res.status(400).json({ error: "Missing required fields: courseId and name" });
    }

    if (!localSponsorships[courseId]) {
      localSponsorships[courseId] = [];
    }
    // Prevent duplicated sponsors displaying
    if (!localSponsorships[courseId].includes(name)) {
      localSponsorships[courseId].push(name);
    }

    console.log(`Generous Sadaqah Jariyah Waqf received. Course: ${courseId}, Donor: ${name}, Value: $${amount} (${type})`);
    res.json({ success: true, courseId, sponsors: localSponsorships[courseId] });
  });

  app.get("/api/sponsors", (req, res) => {
    res.json({ sponsorships: localSponsorships });
  });

  // 7. DASHBOARD STUDENT PROFILE PERSISTENCE (Saves bookmarks, streaking counts, and completed quiz grades)
  app.get("/api/dashboard/:email", (req, res) => {
    const email = req.params.email.toLowerCase();
    const defaultData = {
      enrolled: ["quran", "hadith", "fiqh"],
      progress: { quran: 40, hadith: 20, fiqh: 0, logic: 10 },
      bookmarks: ["knowledge-obligation"],
      quizzes: [
        { branch: "Tafseer", score: 80, date: "May 24, 2026" },
        { branch: "Usul al-Fiqh", score: 90, date: "May 25, 2026" }
      ],
      studyStreak: 5,
      totalXP: 1450
    };
    res.json({ data: localDashboards[email] || defaultData });
  });

  app.post("/api/dashboard/:email", (req, res) => {
    const email = req.params.email.toLowerCase();
    const { data } = req.body;
    localDashboards[email] = data || {};
    res.json({ success: true, data: localDashboards[email] });
  });

  // Scribes Admin analytics feed
  app.get("/api/admin-analytics", (req, res) => {
    res.json({
      studentsCount: localAdmissions.length + 18,
      recentQuizzes: [
        { student: "Zubayr Al-Husseini", branch: "Usul al-Fiqh", score: 90, status: "Passed" },
        { student: "Layla Bintl Farooq", branch: "Deductive Logic", score: 100, status: "Passed" },
        { student: "Imran Siddiqui", branch: "Atheism Critique", score: 60, status: "Failed" }
      ],
      branchSponsorships: localSponsorships
    });
  });

  // Vite development integration
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Vite Development Middleware mounted successfully.");
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req: any, res: any) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log("Static build production routing initialized.");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Scholastic Backend Server is listening gracefully on port ${PORT}`);
  });
}

startServer();
