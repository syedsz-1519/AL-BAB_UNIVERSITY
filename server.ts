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
