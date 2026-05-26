import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { createClient } from "@supabase/supabase-js";

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
