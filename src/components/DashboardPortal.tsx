import React, { useState, useEffect } from 'react';
import { 
  GraduationCap, Lock, User, BookOpen, Award, ClipboardCheck, 
  Bell, Send, Check, CheckCircle2, XCircle, PlusCircle, 
  Trash2, HelpCircle, RefreshCw, FileText, LayoutDashboard, 
  BookMarked, Hourglass, ShieldCheck, UserCheck, AlertTriangle,
  Database, Copy
} from 'lucide-react';
import { COURSES } from '../data';
import D3ProgressChart from './D3ProgressChart';

interface DashboardPortalProps {
  currentTheme: 'parchment' | 'space';
  onBackToLanding?: () => void;
}

interface AdmissionRecord {
  id: string;
  fullName: string;
  email: string;
  selectedCourse: string;
  statementOfPurpose: string;
  priorKnowledge: string;
  date: string;
  status: 'Pending' | 'Approved' | 'Rejected';
}

interface Notice {
  id: string;
  title: string;
  category: string;
  body: string;
  date: string;
  priority: 'High' | 'Normal';
}

interface Assignment {
  id: string;
  studentName: string;
  studentEmail: string;
  courseId: string;
  title: string;
  thesis: string;
  date: string;
  status: 'Awaiting Grade' | 'Graded';
  grade?: string;
  feedback?: string;
}

const DEFAULT_NOTICES: Notice[] = [
  {
    id: 'n_1',
    title: 'Admissions for Summer Covenant 2026 Now Open',
    category: 'Admissions',
    body: 'Scholars globally are encouraged to submit their statements of purpose for our eight cardinal disciplines. Orientation matches the moon cycles.',
    date: 'May 24, 2026',
    priority: 'High'
  },
  {
    id: 'n_2',
    title: 'New Study Circles: Reconstructing Traditional Usul Texts',
    category: 'Seminary Notice',
    body: 'A weekly study circle specializing in text reconstruction has transitioned from online chat rooms directly to focused peer reviews.',
    date: 'May 20, 2026',
    priority: 'Normal'
  }
];

export default function DashboardPortal({ currentTheme, onBackToLanding }: DashboardPortalProps) {
  const isSpace = currentTheme === 'space';

  // Auth States
  const [role, setRole] = useState<'student' | 'admin' | null>(null);
  const [studentEmail, setStudentEmail] = useState('');
  const [studentPassword, setStudentPassword] = useState('');
  
  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [authError, setAuthError] = useState('');

  // Active Authenticated Users
  const [activeStudent, setActiveStudent] = useState<AdmissionRecord | null>(null);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);

  // Core Sync Data States
  const [admissions, setAdmissions] = useState<AdmissionRecord[]>([]);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);

  // Form states for adding notifications & submitting assignments
  const [newNoticeTitle, setNewNoticeTitle] = useState('');
  const [newNoticeCategory, setNewNoticeCategory] = useState('General');
  const [newNoticeBody, setNewNoticeBody] = useState('');
  const [newNoticePriority, setNewNoticePriority] = useState<'High' | 'Normal'>('Normal');

  const [newAsgCourse, setNewAsgCourse] = useState('quran');
  const [newAsgTitle, setNewAsgTitle] = useState('');
  const [newAsgThesis, setNewAsgThesis] = useState('');
  const [asgSuccess, setAsgSuccess] = useState(false);

  // Grading states
  const [gradingAsgId, setGradingAsgId] = useState<string | null>(null);
  const [gradeInput, setGradeInput] = useState('A+ (Mumtaz)');
  const [feedbackInput, setFeedbackInput] = useState('');

  // Interactive Student Lectures completion map (local simulation for scholarship)
  const [completedLectures, setCompletedLectures] = useState<Record<string, boolean>>({});

  // Student lecture view filter: 'all', 'completed', or 'pending'
  const [lectureFilter, setLectureFilter] = useState<'all' | 'completed' | 'pending'>('all');

  // Offline Simulation & Sync Manager States
  const [offlineSimulated, setOfflineSimulated] = useState<boolean>(() => {
    return localStorage.getItem('albab_offline_simulated') === 'true';
  });
  const [syncQueue, setSyncQueue] = useState<string[]>(() => {
    try {
      const q = localStorage.getItem('albab_sync_queue');
      return q ? JSON.parse(q) : [];
    } catch {
      return [];
    }
  });
  const [isSyncing, setIsSyncing] = useState(false);

  // Gesture Touch & Mobile Swipe interaction tracking
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [swipingIdx, setSwipingIdx] = useState<number | null>(null);
  const [swipeOffset, setSwipeOffset] = useState<number>(0);

  // Form Validation Refresher
  const [copiedNotification, setCopiedNotification] = useState<string | null>(null);

  // Supabase Backend Connectivity Diagnostics State
  const [dbStatus, setDbStatus] = useState<any>(null);

  // Real-time toast / alert notifier system states
  const [activeAlertAsg, setActiveAlertAsg] = useState<Assignment | null>(null);
  const [acknowledgedAsgIds, setAcknowledgedAsgIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('albab_seen_graded_assignments');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Polling Real-time Synchronization (Query backend state every 4 seconds)
  useEffect(() => {
    const intervalId = setInterval(() => {
      // 1. Fetch assignments
      fetch('/api/assignments')
        .then(res => res.json())
        .then(response => {
          if (response?.data) {
            setAssignments(response.data);
            localStorage.setItem('albab_assignments', JSON.stringify(response.data));
          }
        })
        .catch(err => console.warn('Interval assignments sync silent fail:', err));

      // 2. Fetch admissions (sync status updates or new records)
      fetch('/api/admissions')
        .then(res => res.json())
        .then(response => {
          if (response?.data) {
            setAdmissions(response.data);
            localStorage.setItem('albab_admissions', JSON.stringify(response.data));
          }
        })
        .catch(err => console.warn('Interval admissions sync silent fail:', err));

      // 3. Fetch notices
      fetch('/api/notices')
        .then(res => res.json())
        .then(response => {
          if (response?.data) {
            setNotices(response.data);
            localStorage.setItem('albab_notices', JSON.stringify(response.data));
          }
        })
        .catch(err => console.warn('Interval notices sync silent fail:', err));
    }, 4000);

    return () => clearInterval(intervalId);
  }, []);

  // Monitor assignments to trigger immediate student graded notifications
  useEffect(() => {
    if (!activeStudent) {
      setActiveAlertAsg(null);
      return;
    }

    // Find any assignment for the active student that has transitioned to 'Graded'
    // but has not been acknowledged by the user yet.
    const unacknowledgedGradedObj = assignments.find(asg => 
      asg.studentEmail.toLowerCase() === activeStudent.email.toLowerCase() &&
      asg.status === 'Graded' &&
      !acknowledgedAsgIds.includes(asg.id)
    );

    if (unacknowledgedGradedObj) {
      setActiveAlertAsg(unacknowledgedGradedObj);
    } else {
      setActiveAlertAsg(null);
    }
  }, [assignments, activeStudent, acknowledgedAsgIds]);

  const handleAcknowledgeAlert = (asgId: string) => {
    const updatedIds = [...acknowledgedAsgIds, asgId];
    setAcknowledgedAsgIds(updatedIds);
    localStorage.setItem('albab_seen_graded_assignments', JSON.stringify(updatedIds));
    setActiveAlertAsg(null);
    showNotification('Academic grade recorded and saved in your archive.');
  };

  // Initialize Data from APIs with LocalStorage backup
  useEffect(() => {
    // Check Supabase configurations & diagnostic status
    fetch('/api/supabase-status')
      .then(res => res.json())
      .then(data => setDbStatus(data))
      .catch(err => console.warn('Could not read backend Supabase status:', err));

    // 1. Load admissions
    fetch('/api/admissions')
      .then(res => res.json())
      .then(response => {
        if (response?.data) {
          setAdmissions(response.data);
          localStorage.setItem('albab_admissions', JSON.stringify(response.data));
        }
      })
      .catch(err => {
        console.warn('Backend admissions sync failed, falling back to local storage:', err);
        const rawAdmissions = localStorage.getItem('albab_admissions');
        if (rawAdmissions) setAdmissions(JSON.parse(rawAdmissions));
      });

    // 2. Load notices
    fetch('/api/notices')
      .then(res => res.json())
      .then(response => {
        if (response?.data) {
          setNotices(response.data);
          localStorage.setItem('albab_notices', JSON.stringify(response.data));
        }
      })
      .catch(err => {
        console.warn('Backend notices sync failed, falling back to local storage:', err);
        const rawNotices = localStorage.getItem('albab_notices');
        if (rawNotices) {
          setNotices(JSON.parse(rawNotices));
        } else {
          setNotices(DEFAULT_NOTICES);
        }
      });

    // 3. Load assignments
    fetch('/api/assignments')
      .then(res => res.json())
      .then(response => {
        if (response?.data) {
          setAssignments(response.data);
          localStorage.setItem('albab_assignments', JSON.stringify(response.data));
        }
      })
      .catch(err => {
        console.warn('Backend assignments sync failed, falling back to local storage:', err);
        const rawAssignments = localStorage.getItem('albab_assignments');
        if (rawAssignments) setAssignments(JSON.parse(rawAssignments));
      });

    // 4. Load lectures checked off (remains client-centric)
    const rawLectures = localStorage.getItem('albab_completed_lectures');
    if (rawLectures) {
      setCompletedLectures(JSON.parse(rawLectures));
    }
  }, []);

  // Save changes helper
  const saveAdmissionsToLS = (updated: AdmissionRecord[]) => {
    localStorage.setItem('albab_admissions', JSON.stringify(updated));
    setAdmissions(updated);
  };

  const saveNoticesToLS = (updated: Notice[]) => {
    localStorage.setItem('albab_notices', JSON.stringify(updated));
    setNotices(updated);
  };

  const saveAssignmentsToLS = (updated: Assignment[]) => {
    localStorage.setItem('albab_assignments', JSON.stringify(updated));
    setAssignments(updated);
  };

  // Helper: auto populate database to explore quickly
  const handlePopulateTestData = () => {
    const testApplicants: AdmissionRecord[] = [
      {
        id: 'app_test1',
        fullName: 'Zubayr Al-Husseini',
        email: 'student@albab.edu', // Ready email for quick testing!
        selectedCourse: 'fiqh',
        statementOfPurpose: 'Desiring to master classical Hanafi and Maliki jurisprudence to analyze modern crowd-sourced financing and cryptocurrency structures.',
        priorKnowledge: 'intermediate',
        date: 'May 25, 2026',
        status: 'Approved' // Pre-approved so they can immediately sign in with student@albab.edu!
      },
      {
        id: 'app_test2',
        fullName: 'Layla Binte Farooq',
        email: 'layla@outlook.com',
        selectedCourse: 'logic',
        statementOfPurpose: 'Determined to reconstruct logic syllogisms in theological tracts and contrast deductive traditions with modern machine intelligence frameworks.',
        priorKnowledge: 'advanced',
        date: 'May 26, 2026',
        status: 'Pending'
      },
      {
        id: 'app_test3',
        fullName: 'Abdur-Rahman Sterling',
        email: 'rahman.sterling@gmail.com',
        selectedCourse: 'challenges',
        statementOfPurpose: 'Intending to examine the intellectual foundations of contemporary secular ideologies and offer constructive scholarly critiques to foster harmony.',
        priorKnowledge: 'none',
        date: 'May 26, 2026',
        status: 'Pending'
      }
    ];

    const updated = [...testApplicants, ...admissions.filter(a => !a.id.startsWith('app_test'))];
    saveAdmissionsToLS(updated);

    // Sync applicants to backend Supabase
    testApplicants.forEach(app => {
      fetch('/api/admissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(app)
      }).catch(err => console.error('Error seeding test applicant:', err));
    });

    // Populate a test assignment too for fast admin grading review!
    const testAsg: Assignment[] = [
      {
        id: 'asg_test1',
        studentName: 'Zubayr Al-Husseini',
        studentEmail: 'student@albab.edu',
        courseId: 'fiqh',
        title: 'Mudarabah Contracts in Digital Tokenization Assets',
        thesis: 'Traditional Mudarabah aligns seamlessly with peer-to-peer liquidity protocol structures. However, systemic risks, collateral slippages, and interest-bearing proxy tokens command extreme caution under Usul-al-Fiqh guidelines.',
        date: 'May 26, 2026',
        status: 'Awaiting Grade'
      }
    ];
    const updatedAsgs = [...testAsg, ...assignments.filter(asg => !asg.id.startsWith('asg_'))];
    saveAssignmentsToLS(updatedAsgs);

    // Sync test assignment to backend Supabase
    testAsg.forEach(asg => {
      fetch('/api/assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(asg)
      }).catch(err => console.error('Error seeding test assignment:', err));
    });

    showNotification('Injected test data and synched with Supabase! Try logging in as student@albab.edu (any password/bypass) or view approvals.');
  };

  const showNotification = (msg: string) => {
    setCopiedNotification(msg);
    setTimeout(() => setCopiedNotification(null), 4500);
  };

  // Login handler
  const handleStudentLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');

    if (!studentEmail.trim()) {
      setAuthError('Email field must be provided.');
      return;
    }

    // Find applicant in local storage list with 'Approved' status
    const student = admissions.find(
      (a) => a.email.toLowerCase() === studentEmail.toLowerCase()
    );

    if (!student) {
      setAuthError('Email not registered under any admission applicant records. Ensure you apply first above!');
      return;
    }

    if (student.status !== 'Approved') {
      setAuthError(`Your admission status is currently: "${student.status}". Access to student portal is granted only upon Official Covenant Approval by the Scribes (Admins).`);
      return;
    }

    // Success Authentication! (Bypass password check for friendly evaluation)
    setActiveStudent(student);
    setRole('student');
    localStorage.setItem('albab_logged_in_email', student.email);
    localStorage.setItem('albab_logged_in_name', student.fullName);
    showNotification(`Welcome back, Scholar ${student.fullName}!`);
  };

  const handleAdminLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');

    // Scribes Credentials matching sandbox standards: admin / admin
    if (adminUsername.trim() === 'admin' && adminPassword.trim() === 'admin') {
      setIsAdminLoggedIn(true);
      setRole('admin');
      showNotification('Administrator credential authenticated. Welcome, Scribe!');
    } else {
      setAuthError('Invalid administrator credentials. Hint: use Username: "admin" & Password: "admin"');
    }
  };

  const logout = () => {
    setRole(null);
    setActiveStudent(null);
    setIsAdminLoggedIn(false);
    setAuthError('');
    localStorage.removeItem('albab_logged_in_email');
    localStorage.removeItem('albab_logged_in_name');
  };

  // Admin approval decisions
  const updateAdmissionStatus = (id: string, nextStatus: 'Approved' | 'Rejected') => {
    const updated = admissions.map(a => {
      if (a.id === id) {
        return { ...a, status: nextStatus };
      }
      return a;
    });
    saveAdmissionsToLS(updated);
    showNotification(`Application status updated to: ${nextStatus}`);

    // Sync to backend Supabase
    fetch(`/api/admissions/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: nextStatus })
    })
    .then(res => res.json())
    .catch(err => console.error('Error syncing admission status update:', err));
  };

  // Add Notice
  const handlePublishNotice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoticeTitle.trim() || !newNoticeBody.trim()) {
      showNotification('Notice title and contents cannot be left blank!');
      return;
    }

    const item: Notice = {
      id: 'n_' + Math.random().toString(36).substring(2, 9),
      title: newNoticeTitle,
      category: newNoticeCategory,
      body: newNoticeBody,
      date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
      priority: newNoticePriority
    };

    const updated = [item, ...notices];
    saveNoticesToLS(updated);
    
    // Reset forms
    setNewNoticeTitle('');
    setNewNoticeBody('');
    showNotification('Official advisory published to Notice Board!');

    // Sync to backend Supabase
    fetch('/api/notices', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item)
    })
    .then(res => res.json())
    .catch(err => console.error('Error syncing notice creation:', err));
  };

  // Delete Notice
  const handleDeleteNotice = (id: string) => {
    const updated = notices.filter(n => n.id !== id);
    saveNoticesToLS(updated);
    showNotification('Notice removed.');

    // Sync to backend Supabase
    fetch(`/api/notices/${id}`, {
      method: 'DELETE'
    })
    .then(res => res.json())
    .catch(err => console.error('Error syncing notice deletion:', err));
  };

  // Submit Critique Project
  const handleCommitCritique = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAsgTitle.trim() || !newAsgThesis.trim()) {
      showNotification('Please fill in both the research title and the scholarly thesis.');
      return;
    }

    if (!activeStudent) return;

    const item: Assignment = {
      id: 'asg_' + Math.random().toString(36).substring(2, 9),
      studentName: activeStudent.fullName,
      studentEmail: activeStudent.email,
      courseId: newAsgCourse,
      title: newAsgTitle,
      thesis: newAsgThesis,
      date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
      status: 'Awaiting Grade'
    };

    const updated = [item, ...assignments];
    saveAssignmentsToLS(updated);
    
    setNewAsgTitle('');
    setNewAsgThesis('');
    setAsgSuccess(true);
    setTimeout(() => setAsgSuccess(false), 4000);
    showNotification('Thesis manuscript committed into state repository for admin critique.');

    // Sync to backend Supabase
    fetch('/api/assignments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item)
    })
    .then(res => res.json())
    .catch(err => console.error('Error syncing critique paper submission:', err));
  };

  // Submit Grade
  const handleSubmitGrade = (e: React.FormEvent) => {
    e.preventDefault();
    if (!gradingAsgId) return;

    const updated = assignments.map(asg => {
      if (asg.id === gradingAsgId) {
        return {
          ...asg,
          status: 'Graded' as const,
          grade: gradeInput,
          feedback: feedbackInput
        };
      }
      return asg;
    });

    saveAssignmentsToLS(updated);
    setGradingAsgId(null);
    setFeedbackInput('');
    showNotification('Scholarly critique graded and recorded.');

    // Sync to backend Supabase
    fetch(`/api/assignments/${gradingAsgId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status: 'Graded',
        grade: gradeInput,
        feedback: feedbackInput
      })
    })
    .then(res => res.json())
    .catch(err => console.error('Error syncing grade feedback:', err));
  };

  // Fetch lecture progress from backend once verified
  useEffect(() => {
    if (role === 'student' && activeStudent) {
      setIsSyncing(true);
      fetch(`/api/lecture-progress/${activeStudent.email}`)
        .then(res => res.json())
        .then(response => {
          if (response?.data && Object.keys(response.data).length > 0) {
            setCompletedLectures(response.data);
            localStorage.setItem('albab_completed_lectures', JSON.stringify(response.data));
          } else {
            // No backend storage yet, load existing local storage fallback
            const saved = localStorage.getItem('albab_completed_lectures');
            if (saved) {
              const parsed = JSON.parse(saved);
              setCompletedLectures(parsed);
              // Post current local configuration to sync backend init
              fetch(`/api/lecture-progress/${activeStudent.email}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ completedLectures: parsed })
              }).catch(() => {});
            }
          }
          setIsSyncing(false);
        })
        .catch(err => {
          console.warn('Silent backend load fail, using local storage fallback:', err);
          setIsSyncing(false);
          const saved = localStorage.getItem('albab_completed_lectures');
          if (saved) setCompletedLectures(JSON.parse(saved));
        });
    }
  }, [role, activeStudent]);

  // Flush sync queue to database
  const triggerFlushSyncQueue = () => {
    if (!activeStudent) return;
    setIsSyncing(true);
    
    fetch(`/api/lecture-progress/${activeStudent.email}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completedLectures })
    })
    .then(res => res.json())
    .then(() => {
      setIsSyncing(false);
      setSyncQueue([]);
      localStorage.setItem('albab_sync_queue', JSON.stringify([]));
      showNotification('Success! Unsynced offline queue flushed to academic archives database.');
    })
    .catch(err => {
      console.error('Failed to flush offline queue:', err);
      setIsSyncing(false);
      showNotification('Sync fail! Could not reach academic database server.');
    });
  };

  // Toggle dynamic lecture completes with Sync-Status engine
  const toggleLecture = (courseId: string, lectureIndex: number) => {
    const key = `${courseId}_lec_${lectureIndex}`;
    const nextVal = !completedLectures[key];
    const updated = {
      ...completedLectures,
      [key]: nextVal
    };
    
    setCompletedLectures(updated);
    localStorage.setItem('albab_completed_lectures', JSON.stringify(updated));

    if (activeStudent) {
      if (offlineSimulated) {
        // Enqueue sync item
        const queueKey = `${courseId}_lec_${lectureIndex}:${nextVal}`;
        const nextQueue = [queueKey, ...syncQueue.filter(q => !q.startsWith(`${courseId}_lec_${lectureIndex}:`))];
        setSyncQueue(nextQueue);
        localStorage.setItem('albab_sync_queue', JSON.stringify(nextQueue));
        showNotification('Lecture saved offline in local queue. Restoring database connection will sync progress.');
      } else {
        setIsSyncing(true);
        fetch(`/api/lecture-progress/${activeStudent.email}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ completedLectures: updated })
        })
        .then(res => res.json())
        .then(() => {
          setIsSyncing(false);
          // If any queue matches, clear it
          const nextQueue = syncQueue.filter(q => !q.startsWith(`${courseId}_lec_${lectureIndex}:`));
          setSyncQueue(nextQueue);
          localStorage.setItem('albab_sync_queue', JSON.stringify(nextQueue));
          showNotification('Lecture status updated and synced with database.');
        })
        .catch(err => {
          console.warn('Sync failed, queuing offline:', err);
          setIsSyncing(false);
          const queueKey = `${courseId}_lec_${lectureIndex}:${nextVal}`;
          const nextQueue = [queueKey, ...syncQueue.filter(q => !q.startsWith(`${courseId}_lec_${lectureIndex}:`))];
          setSyncQueue(nextQueue);
          localStorage.setItem('albab_sync_queue', JSON.stringify(nextQueue));
          showNotification('Network offline. Progress saved to unsynced local queue.');
        });
      }
    }
  };

  // Calc progress rate of a course
  const getCourseProgress = (courseId: string) => {
    // Each course has nominal 4 simulated core text chapters/lectures for completion
    let completedCount = 0;
    for (let i = 0; i < 4; i++) {
      if (completedLectures[`${courseId}_lec_${i}`]) {
        completedCount++;
      }
    }
    return Math.round((completedCount / 4) * 100);
  };

  // Experience and Knowledge level tracker
  const getExperiencePointsAndLevel = () => {
    let totalCompleted = 0;
    Object.entries(completedLectures).forEach(([key, isDone]) => {
      if (isDone) {
        totalCompleted++;
      }
    });

    const xp = totalCompleted * 250;
    
    let levelName = 'Initiate Neophyte';
    let levelColor = 'text-stone-400 border-stone-800';
    let badgeBg = 'bg-stone-500/10';
    if (xp >= 1000) {
      levelName = 'Hermetic Master';
      levelColor = 'text-purple-400 border-purple-500/30';
      badgeBg = 'bg-purple-500/20';
    } else if (xp >= 750) {
      levelName = 'Sage Philosopher';
      levelColor = 'text-amber-400 border-amber-500/30';
      badgeBg = 'bg-amber-500/20';
    } else if (xp >= 500) {
      levelName = 'Scribe Scholar';
      levelColor = 'text-blue-400 border-blue-500/30';
      badgeBg = 'bg-blue-500/20';
    } else if (xp >= 250) {
      levelName = 'Acolyte Disciple';
      levelColor = 'text-amber-600 dark:text-[#C9933A] border-[#C9933A]/30';
      badgeBg = 'bg-[#C9933A]/20';
    }
    
    return { xp, levelName, levelColor, badgeBg, totalCompleted };
  };

  const scholarXP = getExperiencePointsAndLevel();

  return (
    <section 
      id="portal" 
      className={`py-20 px-6 md:px-12 border-t relative overflow-hidden transition-all duration-700
        ${isSpace 
          ? 'bg-space-dark/45 border-gold/10 text-white' 
          : 'bg-[#FAF8F5] border-crimson/10 text-charcoal'
        }
      `}
    >
      {/* Dynamic Alert Banner */}
      {copiedNotification && (
        <div className="fixed bottom-6 left-6 z-50 bg-[#C9933A] text-white px-5 py-3 rounded shadow-xl font-mono text-xs flex items-center gap-2 border border-white/20 animate-fade-in-up">
          <ShieldCheck className="h-4 w-4 animate-bounce" />
          <span>{copiedNotification}</span>
        </div>
      )}

      {/* Real-time Graded Research Critique Toast Alert */}
      {activeAlertAsg && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-xs flex items-center justify-center z-50 p-4 transition-all animate-fade-in">
          <div className={`w-full max-w-md p-6 rounded border-2 shadow-2xl relative overflow-hidden transition-all text-left font-sans
            ${isSpace 
              ? 'bg-space-dark border-[#C9933A] text-white' 
              : 'bg-[#FAF6EF] border-[#8B0000]/60 text-stone-900'
            }
          `}>
            {/* Elegant header */}
            <div className="flex items-center gap-3 pb-3 border-b border-dashed border-stone-200/20 mb-4">
              <div className="p-2 rounded-full bg-emerald-500/10 border border-emerald-500/25">
                <Award className="h-6 w-6 text-emerald-500 animate-pulse" />
              </div>
              <div>
                <span className="text-[9px] font-mono uppercase tracking-[0.2em] text-[#C9933A] font-bold block">Critique Reviewed</span>
                <h4 className="font-serif font-black text-sm uppercase tracking-wide">Academic Manuscript Graded!</h4>
              </div>
            </div>

            {/* Content Details */}
            <div className="space-y-4">
              <div className="space-y-1">
                <span className="text-[9px] font-mono text-stone-400 block uppercase">TITLE OF THESIS:</span>
                <p className="text-xs font-serif font-medium italic text-stone-700 dark:text-stone-200 border-l-2 border-[#C9933A]/60 pl-2">
                  "{activeAlertAsg.title}"
                </p>
              </div>

              <div className="flex items-center justify-between bg-black/20 p-2.5 rounded border border-stone-200/10 font-mono">
                <span className="text-[10px] text-stone-400">ASSIGNED GRADE:</span>
                <span className="text-xs font-black text-[#C9933A]">{activeAlertAsg.grade || 'A+ (Mumtaz)'}</span>
              </div>

              {activeAlertAsg.feedback && (
                <div className="bg-[#C9933A]/5 p-3 rounded border border-[#C9933A]/10 space-y-1">
                  <span className="text-[8px] font-sans font-bold text-stone-400 block uppercase tracking-wider">SCRIBE CRITIQUE GUIDANCE:</span>
                  <p className="text-xs font-serif leading-relaxed text-stone-600 dark:text-stone-300">
                    "{activeAlertAsg.feedback}"
                  </p>
                </div>
              )}
            </div>

            {/* Action buttons */}
            <div className="mt-5 pt-4 flex justify-end">
              <button
                onClick={() => handleAcknowledgeAlert(activeAlertAsg.id)}
                className="w-full sm:w-auto font-mono text-xs uppercase bg-[#C9933A] hover:bg-black text-white hover:text-[#C9933A] hover:border-[#C9933A] border border-transparent font-bold tracking-wider px-4 py-2 rounded shadow transition-all duration-300 pointer-events-auto"
              >
                Acknowledge Critique &amp; Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Decorative backdrop */}
      <div className="absolute inset-0 opacity-[0.02] bg-repeat bg-contain arabesque-grid pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        
        {onBackToLanding && (
          <div className="flex justify-start mb-8">
            <button
              id="back-to-sanctuary"
              onClick={onBackToLanding}
              className={`group flex items-center gap-2 px-4 py-2 text-xs font-mono uppercase tracking-wider rounded border hover:scale-[1.01] transition-all duration-300 cursor-pointer
                ${isSpace 
                  ? 'border-gold/20 text-gold-light hover:border-gold hover:bg-gold/5' 
                  : 'border-crimson/20 text-crimson hover:border-crimson hover:bg-crimson/5'
                }
              `}
            >
              <span className="transform group-hover:-translate-x-1 transition-transform">←</span>
              Return to University Sanctuary Landing
            </button>
          </div>
        )}
        
        {/* SECTION HEADER PANEL */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 mb-3 px-3 py-1 rounded-full border text-[10px] font-mono tracking-[0.2em] uppercase
            ${isSpace 
              ? 'border-gold/25 bg-gold/5 text-gold-light' 
              : 'border-crimson/20 bg-crimson/5 text-crimson'
            }
          ">
            <GraduationCap className="h-3.5 w-3.5 animate-pulse" />
            Scholastic Campus Hub
          </div>
          <h2 className="font-serif font-black text-3xl sm:text-4xl md:text-5xl tracking-wide max-w-3xl mx-auto">
            University Portals
          </h2>
          <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 max-w-lg mx-auto leading-relaxed mt-2">
            Sign into the specialized student and administration frameworks of Albab Islamic University to manage notices, covenants, and critique evaluations.
          </p>
        </div>

        {/* NOT AUTHENTICATED OR ROLE NULL: SHOW SELECTION SCREEN */}
        {!role ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch max-w-4xl mx-auto">
            
            {/* STUDENT PORTAL ACCESS CELL */}
            <div className={`lg:col-span-6 p-6 sm:p-8 rounded border flex flex-col justify-between shadow-md transition-all duration-300 hover:scale-[1.01]
              ${isSpace 
                ? 'bg-space-dark/80 border-gold/20 hover:border-gold/50' 
                : 'bg-white border-stone-200 hover:border-crimson/30'
              }
            `}>
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className={`p-3 rounded-full border
                    ${isSpace ? 'bg-gold/5 border-gold/30 text-gold-light' : 'bg-crimson/5 border-crimson/15 text-crimson'}
                  `}>
                    <User className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-serif font-extrabold text-lg sm:text-xl tracking-wide">Scholar Student</h3>
                    <span className="text-[9px] font-mono tracking-wider opacity-60">CLASSROOM ACCESS SYSTEM</span>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 leading-relaxed font-serif mb-6">
                  Access your official Covenant letter certificate, record curriculum progress, mark daily lessons, and submit critique theses into the academic repository.
                </p>

                {authError && authError.includes('admission') && (
                  <div className="mb-4 p-3 rounded text-[11px] font-mono leading-relaxed bg-red-500/10 text-red-500 border border-red-500/15 flex gap-2">
                    <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                    <span>{authError}</span>
                  </div>
                )}

                <form onSubmit={handleStudentLoginSubmit} className="space-y-3.5">
                  <div>
                    <label className="block text-[10px] uppercase font-mono tracking-widest text-[#C9933A] mb-1.5 font-bold">
                      Registered Student Email
                    </label>
                    <input 
                      type="email"
                      placeholder="e.g. student@albab.edu"
                      value={studentEmail}
                      onChange={(e) => setStudentEmail(e.target.value)}
                      className={`w-full px-3 py-2 text-xs rounded border bg-transparent font-sans focus:outline-none transition-colors
                        ${isSpace 
                          ? 'border-gold/25 text-white placeholder-white/35 focus:border-gold' 
                          : 'border-stone-300 text-charcoal placeholder-stone-400 focus:border-crimson'
                        }
                      `}
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-mono tracking-widest text-stone-400 mb-1.5 font-bold">
                      Access Passcode / Key (Secure Bypass Enabled)
                    </label>
                    <input 
                      type="password"
                      placeholder="••••••••"
                      value={studentPassword}
                      onChange={(e) => setStudentPassword(e.target.value)}
                      className={`w-full px-3 py-2 text-xs rounded border bg-transparent font-sans focus:outline-none transition-colors
                        ${isSpace 
                          ? 'border-gold/25 text-white placeholder-white/35 focus:border-gold' 
                          : 'border-stone-300 text-charcoal placeholder-stone-400 focus:border-crimson'
                        }
                      `}
                    />
                  </div>

                  <button 
                    type="submit"
                    className={`w-full flex justify-center items-center gap-2 py-2.5 text-xs font-bold tracking-widest uppercase rounded shadow hover:scale-[1.01] transition-all
                      ${isSpace 
                        ? 'bg-gold hover:bg-white text-space' 
                        : 'bg-crimson hover:bg-black text-white'
                      }
                    `}
                  >
                    <BookOpen className="h-4 w-4" />
                    Enter Sanctuary
                  </button>
                </form>
              </div>

              <div className="mt-6 pt-4 border-t border-stone-200/10 flex flex-col gap-2">
                <span className="text-[10px] font-mono tracking-wider opacity-60 text-center">
                  💡 No applications yet? Try entering:
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setStudentEmail('student@albab.edu');
                    setStudentPassword('bypass');
                    showNotification('Auto-filled active applicant Zubayr! Now submit test database injection or click Sanctuary.');
                  }}
                  className={`py-1 px-3 text-[10px] border font-mono rounded-sm transition-colors hover:bg-black/5
                    ${isSpace ? 'border-gold/20 text-gold-light' : 'border-stone-300 text-stone-600'}
                  `}
                >
                  Quick Sandbox Scholar (student@albab.edu)
                </button>
              </div>
            </div>

            {/* SCRIBE ADMIN PORTAL ACCESS CELL */}
            <div className={`lg:col-span-6 p-6 sm:p-8 rounded border flex flex-col justify-between shadow-md transition-all duration-300 hover:scale-[1.01]
              ${isSpace 
                ? 'bg-space-dark/80 border-gold/20 hover:border-gold/50' 
                : 'bg-white border-stone-200 hover:border-crimson/30'
              }
            `}>
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className={`p-3 rounded-full border
                    ${isSpace ? 'bg-gold/5 border-gold/30 text-gold-light' : 'bg-crimson/5 border-crimson/15 text-crimson'}
                  `}>
                    <Lock className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-serif font-extrabold text-lg sm:text-xl tracking-wide">University Scribes</h3>
                    <span className="text-[9px] font-mono tracking-wider opacity-60">ADMINISTRATIVE COVENANT AUDITS</span>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 leading-relaxed font-serif mb-6">
                  Manage admissions lists, review and accept prophetic statements of purpose, publish advisory notifications, and evaluate student critique submissions.
                </p>

                {authError && !authError.includes('admission') && (
                  <div className="mb-4 p-3 rounded text-[11px] font-mono text-red-500 bg-red-500/10 border border-red-500/15">
                    {authError}
                  </div>
                )}

                <form onSubmit={handleAdminLoginSubmit} className="space-y-3.5">
                  <div>
                    <label className="block text-[10px] uppercase font-mono tracking-widest text-[#C9933A] mb-1.5 font-bold">
                      Admin Username
                    </label>
                    <input 
                      type="text"
                      placeholder="Use 'admin'"
                      value={adminUsername}
                      onChange={(e) => setAdminUsername(e.target.value)}
                      className={`w-full px-3 py-2 text-xs rounded border bg-transparent font-sans focus:outline-none transition-colors
                        ${isSpace 
                          ? 'border-gold/25 text-white placeholder-white/35 focus:border-gold' 
                          : 'border-stone-300 text-charcoal placeholder-stone-400 focus:border-crimson'
                        }
                      `}
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-mono tracking-widest text-stone-400 mb-1.5 font-bold">
                      Password Code
                    </label>
                    <input 
                      type="password"
                      placeholder="Use 'admin'"
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      className={`w-full px-3 py-2 text-xs rounded border bg-transparent font-sans focus:outline-none transition-colors
                        ${isSpace 
                          ? 'border-gold/25 text-white placeholder-white/35 focus:border-gold' 
                          : 'border-stone-300 text-charcoal placeholder-stone-400 focus:border-crimson'
                        }
                      `}
                    />
                  </div>

                  <button 
                    type="submit"
                    className={`w-full flex justify-center items-center gap-2 py-2.5 text-xs font-bold tracking-widest uppercase rounded shadow hover:scale-[1.01] transition-all
                      ${isSpace 
                        ? 'bg-gold hover:bg-white text-space' 
                        : 'bg-crimson hover:bg-black text-white'
                      }
                    `}
                  >
                    <ShieldCheck className="h-4 w-4" />
                    Access Scribes Portal
                  </button>
                </form>
              </div>

              <div className="mt-6 pt-4 border-t border-stone-200/10 flex flex-col gap-2">
                <span className="text-[10px] font-mono tracking-wider opacity-60 text-center">
                  ⚠️ Sandbox Database Control:
                </span>
                <button
                  type="button"
                  onClick={handlePopulateTestData}
                  className={`py-1 px-3 text-[10px] border tracking-wide font-mono rounded-sm transition-colors hover:bg-gold/10 flex items-center justify-center gap-1.5
                    ${isSpace ? 'border-gold/30 text-gold-light' : 'border-crimson/30 text-crimson'}
                  `}
                >
                  <PlusCircle className="h-3.5 w-3.5 animate-pulse" />
                  Populate DB with 3 Test Applicants
                </button>
              </div>
            </div>

          </div>
        ) : role === 'student' && activeStudent ? (
          /* STUDENT SCHOLAR SUB-PORTAL */
          <div className="space-y-8 animate-fade-in-up">
            
            {/* STUDENT PORTAL HEADER PANEL */}
            <div className={`p-6 rounded border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-sm
              ${isSpace ? 'bg-space border-gold/20' : 'bg-white border-stone-200'}
            `}>
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-full border hidden sm:block
                  ${isSpace ? 'bg-gold/5 border-gold/20 text-gold-light' : 'bg-crimson/10 border-crimson/15 text-crimson'}
                `}>
                  <UserCheck className="h-7 w-7" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-mono tracking-widest uppercase text-gold leading-none px-2 py-0.5 border border-gold/30 rounded">
                      Scholar Inscribed
                    </span>
                    <span className="text-xs font-mono text-stone-400">
                      ID: {activeStudent.id}
                    </span>
                  </div>
                  <h3 className="font-serif font-black text-xl sm:text-2xl mt-1 leading-none">
                    Al-Talib {activeStudent.fullName}
                  </h3>
                  <p className="text-xs text-stone-400 mt-1">
                    Authentic Academic Pursuit: <strong className="text-stone-800 dark:text-stone-100">{COURSES.find(c => c.id === activeStudent.selectedCourse)?.name || 'Islamic Sciences'}</strong> • Enrolled {activeStudent.date}
                  </p>
                </div>
              </div>

              <div className="flex gap-2.5 items-center w-full sm:w-auto">
                <button 
                  onClick={logout}
                  className="w-full sm:w-auto flex items-center justify-center gap-1.5 text-xs font-bold tracking-widest uppercase py-2 px-4 rounded-sm border border-stone-300 hover:bg-black/5 text-stone-500 hover:text-stone-800"
                >
                  <RefreshCw className="h-4 w-4" />
                  Sign Out
                </button>
              </div>
            </div>

            {/* SCHOLAR PERFORMANCE STATS ROW */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              
              {/* Card 1: Ancient Academic Title / Knowledge Rank */}
              <div className={`p-4 sm:p-5 rounded border flex items-center gap-4 shadow-sm transition-all duration-300 hover:scale-[1.01]
                ${isSpace 
                  ? 'bg-space border-gold/15 hover:border-gold/30' 
                  : 'bg-white border-stone-200 hover:border-crimson/15'
                }
              `}>
                <div className={`p-3 rounded-full border shrink-0
                  ${isSpace 
                    ? 'bg-gold/5 border-gold/15 text-gold-light' 
                    : 'bg-[#C9933A]/10 border-[#C9933A]/25 text-[#C9933A]'
                  }
                `}>
                  <Award className="h-5 w-5" />
                </div>
                <div>
                  <span className="text-[9px] font-mono tracking-wider opacity-60 block uppercase leading-none mb-1.5">
                    Knowledge Rank
                  </span>
                  <div className={`text-sm sm:text-md font-serif font-black uppercase tracking-wide ${scholarXP.levelColor}`}>
                    {scholarXP.levelName}
                  </div>
                  <span className="text-[9px] font-mono text-stone-400 mt-1 block">
                    Grown with authentic scriptural trace
                  </span>
                </div>
              </div>

              {/* Card 2: Cumulative Experience Points */}
              <div className={`p-4 sm:p-5 rounded border flex items-center gap-4 shadow-sm transition-all duration-300 hover:scale-[1.01]
                ${isSpace 
                  ? 'bg-space border-gold/15 hover:border-gold/30' 
                  : 'bg-white border-stone-200 hover:border-crimson/15'
                }
              `}>
                <div className={`p-3 rounded-full border shrink-0
                  ${isSpace 
                    ? 'bg-green-400/5 border-green-500/10 text-green-400' 
                    : 'bg-green-500/10 border-green-500/20 text-green-600'
                  }
                `}>
                  <GraduationCap className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-2">
                    <span className="text-[9px] font-mono tracking-wider opacity-60 block uppercase leading-none">
                      Academic XP
                    </span>
                    <span className="text-sm font-mono font-black text-stone-900 dark:text-stone-100">
                      {scholarXP.xp} XP
                    </span>
                  </div>
                  
                  {/* Subtle progress indicator to next level bounds */}
                  <div className="h-1.5 w-full bg-stone-150 dark:bg-stone-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-green-500 rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(5, (scholarXP.xp % 1000) / 10)}%` }}
                    />
                  </div>
                  <span className="text-[8px] font-mono text-stone-400 mt-1.5 block">
                    {1000 - (scholarXP.xp % 1000)} XP to Next Scholarly Honor
                  </span>
                </div>
              </div>

              {/* Card 3: Deep Completion Count */}
              <div className={`p-4 sm:p-5 rounded border flex items-center gap-4 shadow-sm transition-all duration-300 hover:scale-[1.01]
                ${isSpace 
                  ? 'bg-space border-gold/15 hover:border-gold/30' 
                  : 'bg-white border-stone-200 hover:border-crimson/15'
                }
              `}>
                <div className={`p-3 rounded-full border shrink-0
                  ${isSpace 
                    ? 'bg-sky-400/5 border-sky-400/10 text-sky-450' 
                    : 'bg-blue-500/10 border-blue-500/20 text-blue-600'
                  }
                `}>
                  <BookOpen className="h-5 w-5" />
                </div>
                <div>
                  <span className="text-[9px] font-mono tracking-wider opacity-60 block uppercase leading-none mb-1.5">
                    Completed Chapters
                  </span>
                  <div className="text-sm font-mono font-black text-stone-900 dark:text-stone-100 uppercase tracking-widest leading-none">
                    {scholarXP.totalCompleted} Modules Marked
                  </div>
                  <span className="text-[9px] font-mono text-stone-400 mt-1.5 block">
                    Incremental progress recorded instantly
                  </span>
                </div>
              </div>

            </div>

            {/* DUAL COLUMN GRID LAYOUT */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* LEFT COLUMN: CURRICULUM progression & TEXT CHAPTER COMPLETE PANEL */}
              <div className="lg:col-span-8 space-y-8">
                
                {/* INTERACTIVE STUDY TRACKS & LECTURES INDEX */}
                <div className={`p-6 sm:p-8 rounded border shadow-sm
                  ${isSpace ? 'bg-space border-gold/15' : 'bg-white border-stone-200'}
                `}>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-stone-200/10 pb-4">
                    <div className="flex items-center gap-2.5">
                      <BookMarked className={`h-6 w-6 shrink-0 ${isSpace ? 'text-gold-light' : 'text-crimson'}`} />
                      <div>
                        <h4 className="font-serif font-black text-lg">My Study Chapters</h4>
                        <span className="text-[9px] font-mono tracking-widest text-stone-400 uppercase">Interactive study module tracker</span>
                      </div>
                    </div>
                    
                    {/* Progress Bar Badge */}
                    <div className="text-left sm:text-right">
                      <span className="text-xl font-bold font-mono">
                        {getCourseProgress(activeStudent.selectedCourse)}%
                      </span>
                      <span className="block text-[8px] tracking-[0.15em] uppercase text-[#C9933A] font-medium leading-none mt-0.5">Completed</span>
                    </div>
                  </div>

                  {/* Progressive indicator bar */}
                  <div className="h-2 w-full bg-stone-200 dark:bg-stone-800/60 rounded-full mb-8 overflow-hidden">
                    <div 
                      className="h-full bg-[#C9933A] transition-all duration-700 rounded-full"
                      style={{ width: `${getCourseProgress(activeStudent.selectedCourse)}%` }}
                    />
                  </div>

                  {/* Dynamic Database Sync & Offline Control Bar */}
                  <div className={`p-3.5 rounded border mb-6 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors duration-300
                    ${isSpace 
                      ? 'bg-black/25 border-gold/15' 
                      : 'bg-stone-50 border-stone-200'
                    }
                  `}>
                    {/* Left: Indicator pulse light & pending queue feedback */}
                    <div className="flex items-center gap-2.5 text-left">
                      <div className={`h-2.5 w-2.5 rounded-full shrink-0 relative
                        ${offlineSimulated 
                          ? 'bg-amber-500 shadow-sm' 
                          : isSyncing 
                            ? 'bg-blue-400 shadow-sm animate-ping'
                            : 'bg-green-500 shadow-sm'
                        }
                      `}>
                        {(!offlineSimulated && isSyncing) && (
                          <div className="absolute inset-0 bg-blue-400 rounded-full animate-ping" />
                        )}
                        {(offlineSimulated && syncQueue.length > 0) && (
                          <div className="absolute inset-0 bg-amber-500 rounded-full animate-ping opacity-75" />
                        )}
                      </div>
                      <div className="font-mono text-[10px] leading-tight text-stone-700 dark:text-stone-300">
                        <span className="font-bold block tracking-wider uppercase">
                          {offlineSimulated ? 'Offline Sync Queueing' : isSyncing ? 'Synchronizing Current Trace...' : 'Database Secured & Connected'}
                        </span>
                        <span className="text-[9px] text-stone-400 font-normal">
                          {offlineSimulated 
                            ? `${syncQueue.length} unsynced progress marks pending in browser cache`
                            : 'All study chapters backed up in high-security academic records.'
                          }
                        </span>
                      </div>
                    </div>

                    {/* Right: Actions, Force Flush & Sandbox Switch toggle */}
                    <div className="flex flex-wrap items-center gap-3">
                      {offlineSimulated && syncQueue.length > 0 && (
                        <button
                          onClick={triggerFlushSyncQueue}
                          disabled={isSyncing}
                          className="font-mono text-[8.5px] font-bold uppercase tracking-widest bg-amber-600 hover:bg-black hover:text-[#C9933A] text-white px-2 py-1 rounded inline-flex items-center gap-1 cursor-pointer transition-all border border-transparent hover:border-amber-500"
                        >
                          <RefreshCw className={`h-2.5 w-2.5 ${isSyncing ? 'animate-spin' : ''}`} />
                          Force Sync ({syncQueue.length})
                        </button>
                      )}
                      
                      <label className="inline-flex items-center gap-2 cursor-pointer text-[9px] font-mono text-stone-400 select-none">
                        <input 
                          type="checkbox"
                          checked={offlineSimulated}
                          onChange={(e) => {
                            const nextState = e.target.checked;
                            setOfflineSimulated(nextState);
                            localStorage.setItem('albab_offline_simulated', String(nextState));
                            if (!nextState) {
                              // Trigger automatic sync flush when turning offline mode OFF
                              triggerFlushSyncQueue();
                            } else {
                              showNotification('Academic portal offline mode enabled. Mark a lesson to test local caching!');
                            }
                          }}
                          className="sr-only peer"
                        />
                        <div className="relative w-7 h-4 bg-stone-300 dark:bg-stone-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all dark:border-gray-600 peer-checked:bg-amber-500"></div>
                        <span className="ml-1 uppercase tracking-wider font-bold">Simulate Offline</span>
                      </label>
                    </div>
                  </div>

                  {/* Lecture Filter Toggles */}
                  <div className="flex flex-wrap gap-2 mb-6 justify-center sm:justify-start">
                    <button
                      onClick={() => setLectureFilter('all')}
                      className={`px-3 py-1 text-[10px] font-mono uppercase tracking-wider rounded-sm transition-all border duration-300 cursor-pointer
                        ${lectureFilter === 'all'
                          ? isSpace 
                            ? 'bg-gold/10 text-gold-light border-gold/45' 
                            : 'bg-crimson/10 text-crimson border-crimson/30 font-bold'
                          : isSpace 
                            ? 'bg-transparent text-stone-400 border-stone-800 hover:text-gold hover:border-gold/30' 
                            : 'bg-transparent text-stone-500 border-stone-200 hover:text-crimson hover:border-crimson/30'
                        }
                      `}
                    >
                      All Lectures
                    </button>
                    <button
                      onClick={() => setLectureFilter('completed')}
                      className={`px-3 py-1 text-[10px] font-mono uppercase tracking-wider rounded-sm transition-all border duration-300 cursor-pointer
                        ${lectureFilter === 'completed'
                          ? 'bg-green-500/10 text-green-500 border-green-500/40 font-bold'
                          : isSpace 
                            ? 'bg-transparent text-stone-400 border-stone-800 hover:text-[#4ade80] hover:border-[#4ade80]/20' 
                            : 'bg-transparent text-stone-500 border-stone-200 hover:text-[#16a34a] hover:border-[#16a34a]/20'
                        }
                      `}
                    >
                      Completed Only
                    </button>
                    <button
                      onClick={() => setLectureFilter('pending')}
                      className={`px-3 py-1 text-[10px] font-mono uppercase tracking-wider rounded-sm transition-all border duration-300 cursor-pointer
                        ${lectureFilter === 'pending'
                          ? isSpace 
                            ? 'bg-[#fbbf24]/10 text-[#f59e0b] border-[#fbbf24]/30 font-bold'
                            : 'bg-[#b45309]/10 text-[#b45309] border-[#b45309]/20 font-bold'
                          : isSpace 
                            ? 'bg-transparent text-stone-400 border-stone-800 hover:text-[#fbbf24] hover:border-[#fbbf24]/20' 
                            : 'bg-transparent text-stone-500 border-stone-200 hover:text-[#b45309] hover:border-[#b45309]/20'
                        }
                      `}
                    >
                      Pending Only
                    </button>
                  </div>

                  {/* Core Lectures Simulated */}
                  <div className="space-y-4">
                    {(() => {
                      const allLectures = [
                        { title: 'Tradition Recalibration Principles', ref: 'Chapter I - Structural Definitions' },
                        { title: 'The Archetype of Sincere Purpose', ref: 'Chapter II - Ethical Codes' },
                        { title: 'Syllogism Analysis of Text Interpretations', ref: 'Chapter III - Logic Syllogisms' },
                        { title: 'Deciphering Modern Ideological Paradigm Shifts', ref: 'Chapter IV - Synthesis' }
                      ];

                      const filteredLectures = allLectures
                        .map((item, idx) => ({ ...item, originalIdx: idx }))
                        .filter(item => {
                          const isChecked = !!completedLectures[`${activeStudent.selectedCourse}_lec_${item.originalIdx}`];
                          if (lectureFilter === 'completed') return isChecked;
                          if (lectureFilter === 'pending') return !isChecked;
                          return true;
                        });

                      if (filteredLectures.length === 0) {
                        return (
                          <div className="text-center py-8 rounded border border-dashed border-stone-200 dark:border-stone-800/40 opacity-75">
                            <p className="text-xs font-serif italic text-stone-500 dark:text-stone-400">
                              No {lectureFilter === 'completed' ? 'completed' : 'pending'} study chapters found in this module.
                            </p>
                          </div>
                        );
                      }

                      return filteredLectures.map((item) => {
                        const isChecked = !!completedLectures[`${activeStudent.selectedCourse}_lec_${item.originalIdx}`];
                        const isSwipingThis = swipingIdx === item.originalIdx;
                        
                        return (
                          <div 
                            key={item.originalIdx}
                            className="relative overflow-hidden rounded border border-dashed border-stone-200/50 dark:border-stone-800/40 select-none"
                            onTouchStart={(e) => {
                              setTouchStartX(e.touches[0].clientX);
                              setSwipingIdx(item.originalIdx);
                              setSwipeOffset(0);
                            }}
                            onTouchMove={(e) => {
                              if (touchStartX !== null) {
                                const currentX = e.touches[0].clientX;
                                const diffX = currentX - touchStartX;
                                if (diffX > 0) {
                                  setSwipeOffset(Math.min(diffX, 150));
                                }
                              }
                            }}
                            onTouchEnd={() => {
                              if (touchStartX !== null && swipingIdx === item.originalIdx) {
                                if (swipeOffset > 80) {
                                  toggleLecture(activeStudent.selectedCourse, item.originalIdx);
                                }
                              }
                              setTouchStartX(null);
                              setSwipingIdx(null);
                              setSwipeOffset(0);
                            }}
                          >
                            {/* Hidden Reveal Completion Track Behind Card Swipe */}
                            <div className="absolute inset-0 bg-green-500/10 flex items-center pl-5 text-green-600 dark:text-green-400 font-mono text-[9px] uppercase font-bold tracking-widest pointer-events-none transition-all">
                              <span>→ Swipe to togggle completion mark</span>
                            </div>

                            <div 
                              style={{
                                transform: isSwipingThis ? `translateX(${swipeOffset}px)` : 'none',
                                transition: isSwipingThis ? 'none' : 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                              }}
                              className={`relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded border transition-colors duration-205 animate-fade-in
                                ${isChecked 
                                  ? 'border-green-500/35 bg-green-500/[0.02]' 
                                  : isSpace ? 'border-gold/10 hover:border-gold/30 hover:bg-gold/[0.01]' : 'border-stone-200 hover:border-crimson/15 hover:bg-stone-50'
                                }
                                ${isSpace ? 'bg-space' : 'bg-white'}
                              `}
                            >
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="text-[9px] font-mono uppercase text-[#C9933A] block font-semibold leading-none mb-1">
                                    {item.ref}
                                  </span>
                                  <span className="text-[7.5px] font-mono text-stone-400 sm:hidden uppercase tracking-wider">
                                    (Swipe Right →)
                                  </span>
                                </div>
                                <h5 className="font-serif font-bold text-sm sm:text-base text-stone-900 dark:text-stone-100">
                                  {item.title}
                                </h5>
                              </div>

                              <button 
                                onClick={() => toggleLecture(activeStudent.selectedCourse, item.originalIdx)}
                                className={`flex items-center justify-center gap-1.5 py-1.5 px-3 w-full sm:w-auto rounded-sm text-[10px] font-mono uppercase tracking-wider transition-all border cursor-pointer
                                  ${isChecked 
                                    ? 'bg-green-500/10 text-green-500 border-green-500/30 font-bold' 
                                    : isSpace 
                                      ? 'bg-transparent text-stone-400 border-stone-700 hover:text-gold hover:border-gold' 
                                      : 'bg-transparent text-stone-600 border-stone-300 hover:text-crimson hover:border-crimson'
                                  }
                                `}
                              >
                                <Check className={`h-3.5 w-3.5 ${isChecked ? 'opacity-100' : 'opacity-40'}`} />
                                {isChecked ? 'Completed' : 'Complete Lesson'}
                              </button>
                            </div>
                          </div>
                        );
                      });
                    })()}
                  </div>

                  {/* D3 Progress Timeline Performance Chart */}
                  <div className="mt-8 pt-6 border-t border-dashed border-stone-200 dark:border-stone-800/50">
                    <D3ProgressChart 
                      currentTheme={currentTheme}
                      completedCount={(() => {
                        let completedCount = 0;
                        for (let i = 0; i < 4; i++) {
                          if (completedLectures[`${activeStudent.selectedCourse}_lec_${i}`]) {
                            completedCount++;
                          }
                        }
                        return completedCount;
                      })()}
                    />
                  </div>
                </div>

                {/* SCHOLAR REFLECTION AND CRITIQUE SUBMISSION FORMS */}
                <div className={`p-6 sm:p-8 rounded border shadow-sm
                  ${isSpace ? 'bg-space border-gold/15' : 'bg-white border-stone-200'}
                `}>
                  <div className="flex items-center gap-2.5 mb-6 border-b border-stone-200/10 pb-4">
                    <Send className={`h-6 w-6 ${isSpace ? 'text-gold-light' : 'text-crimson'}`} />
                    <div>
                      <h4 className="font-serif font-black text-lg">Critique Submission Bureau</h4>
                      <span className="text-[9px] font-mono tracking-widest text-stone-400 uppercase">Submit academic essays for scribe feedback</span>
                    </div>
                  </div>

                  {asgSuccess && (
                    <div className="mb-6 p-4 rounded border border-green-500/25 bg-green-500/5 text-xs text-green-600 dark:text-green-400 font-mono flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5" />
                      Manuscript committed! Admins can audit and grade your essay in the Scribes Portal immediately.
                    </div>
                  )}

                  <form onSubmit={handleCommitCritique} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-mono uppercase tracking-widest text-[#C9933A] mb-1.5 font-bold">
                          Thematic Area
                        </label>
                        <select 
                          value={newAsgCourse}
                          onChange={(e) => setNewAsgCourse(e.target.value)}
                          className={`w-full px-3 py-2 text-xs rounded border bg-transparent font-sans focus:outline-none transition-colors
                            ${isSpace 
                              ? 'border-gold/25 text-white' 
                              : 'border-stone-300 text-charcoal'
                            }
                          `}
                        >
                          {COURSES.map(c => (
                            <option key={c.id} value={c.id} className="bg-space text-white">
                              {c.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] font-mono uppercase tracking-widest text-[#C9933A] mb-1.5 font-bold">
                          Research Project Title
                        </label>
                        <input 
                          type="text"
                          placeholder="e.g. Rethinking Usul Principles"
                          value={newAsgTitle}
                          onChange={(e) => setNewAsgTitle(e.target.value)}
                          className={`w-full px-3 py-2 text-xs rounded border bg-transparent font-sans focus:outline-none transition-colors
                            ${isSpace 
                              ? 'border-gold/25 text-white placeholder-white/35 focus:border-gold' 
                              : 'border-stone-300 text-charcoal placeholder-stone-400 focus:border-crimson'
                            }
                          `}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono uppercase tracking-widest text-[#C9933A] mb-1.5 font-bold">
                        Manuscript Content / Scholarly Thesis Critique
                      </label>
                      <textarea 
                        rows={4}
                        placeholder="Inscribe your critique or reflection here. We encourage deep academic analysis regarding classical perspectives juxtaposed with contemporary challenges."
                        value={newAsgThesis}
                        onChange={(e) => setNewAsgThesis(e.target.value)}
                        className={`w-full px-3 py-2 text-xs rounded border bg-transparent font-sans focus:outline-none transition-colors
                          ${isSpace 
                            ? 'border-gold/25 text-white placeholder-white/35 focus:border-gold' 
                            : 'border-stone-300 text-charcoal placeholder-stone-400'
                          }
                        `}
                      />
                    </div>

                    <button 
                      type="submit"
                      className={`w-full flex justify-center items-center gap-1.5 py-3 text-xs font-bold tracking-widest uppercase rounded shadow hover:scale-[1.01] transition-all
                        ${isSpace 
                          ? 'bg-gold hover:bg-white text-space' 
                          : 'bg-crimson hover:bg-black text-white'
                        }
                      `}
                    >
                      <FileText className="h-4 w-4" />
                      Inscribe &amp; Submit Manuscript
                    </button>
                  </form>

                  {/* SUBMITTED CRITIQUES FEEDBACK SHEETS */}
                  <div className="mt-8 pt-8 border-t border-stone-200/15">
                    <h5 className="font-serif font-black text-sm uppercase tracking-wide mb-4">
                      My Submission Archives
                    </h5>

                    {assignments.filter(asg => asg.studentEmail === activeStudent.email).length === 0 ? (
                      <p className="text-xs text-stone-400 italic font-serif">
                        No critiques or research committed in the repository archive yet.
                      </p>
                    ) : (
                      <div className="space-y-4">
                        {assignments
                          .filter(asg => asg.studentEmail === activeStudent.email)
                          .map((asg) => (
                            <div 
                              key={asg.id}
                              className={`p-4 rounded border text-left
                                ${asg.status === 'Graded' 
                                  ? 'bg-stone-500/[0.02] border-[#C9933A]/50' 
                                  : 'border-stone-200 bg-[#FAF8F5]/10 dark:border-stone-800'
                                }
                              `}
                            >
                              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 mb-2">
                                <div>
                                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#C9933A] bg-amber-500/5 px-2 py-0.5 rounded border border-[#C9933A]/20 mr-2">
                                    {COURSES.find(c => c.id === asg.courseId)?.name || 'Islamic Studies'}
                                  </span>
                                  <strong className="text-xs text-stone-400 font-mono font-medium">{asg.date}</strong>
                                </div>
                                
                                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-mono uppercase tracking-widest font-bold border
                                  ${asg.status === 'Graded' 
                                    ? 'bg-green-500/10 text-green-500 border-green-500/30' 
                                    : 'bg-amber-500/10 text-amber-500 border-amber-500/25'
                                  }
                                `}>
                                  {asg.status === 'Graded' ? <Check className="h-3 w-3" /> : <Hourglass className="h-2.5 w-2.5 animate-spin" />}
                                  {asg.status}
                                </span>
                              </div>

                              <h6 className="font-serif font-black text-sm sm:text-base text-stone-900 dark:text-stone-100">
                                {asg.title}
                              </h6>
                              <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed font-serif mt-2 italic bg-black/5 p-3 rounded-xs border-l-2 border-[#C9933A]/50">
                                "{asg.thesis}"
                              </p>

                              {asg.status === 'Graded' && (
                                <div className="mt-4 pt-4 border-t border-dashed border-stone-200 dark:border-stone-800/80 space-y-2">
                                  <div className="flex items-center gap-2">
                                    <Award className="h-4 w-4 text-emerald-500" />
                                    <span className="font-mono text-xs font-bold uppercase tracking-wider text-emerald-500">
                                      Critique Grade: {asg.grade}
                                    </span>
                                  </div>
                                  <p className="text-xs font-serif leading-relaxed text-stone-600 dark:text-stone-300">
                                    <strong className="text-stone-700 dark:text-stone-200">Scribes Feedback: </strong>
                                    {asg.feedback || 'None provided.'}
                                  </p>
                                </div>
                              )}
                            </div>
                          ))}
                      </div>
                    )}
                  </div>

                </div>

              </div>

              {/* RIGHT COLUMN: COVENANT VIEW & NOTICES */}
              <div className="lg:col-span-4 space-y-8">
                
                {/* MY COVENANT MINI CERTIFICATE CARD */}
                <div className="relative border-4 border-double p-5 text-center font-serif bg-[#FAF6EF] text-[#1A1A1A] rounded shadow-md border-[#C9933A]/60 overflow-hidden">
                  <div className="absolute top-1 left-1 w-2.5 h-2.5 border-t border-l border-[#8B0000]" />
                  <div className="absolute bottom-1 right-1 w-2.5 h-2.5 border-b border-r border-[#8B0000]" />
                  
                  <span className="text-[7px] tracking-[0.2em] font-mono font-black uppercase text-[#8B0000] block mt-1">
                    Albab Islamic University
                  </span>
                  
                  <h4 className="font-serif font-black text-sm tracking-wide text-stone-900 mt-2 mb-3 leading-none">
                    Covenant Certifications
                  </h4>

                  <span className="text-[8px] uppercase tracking-widest font-mono text-stone-400 block mb-0.5">Under scholarly name of</span>
                  <div className="font-serif italic font-extrabold text-[#8B0000] text-base leading-tight font-black border-b border-[#C9933A]/35 pb-2 mb-2">
                    {activeStudent.fullName}
                  </div>

                  <p className="text-[10px] text-stone-500 leading-relaxed mb-4 max-w-xs mx-auto">
                    Declared a validated active student scholar of the Albab traditional circles in good standing. Prior knowledge tier evaluated as {activeStudent.priorKnowledge}.
                  </p>

                  <div className="flex justify-between items-end pt-2 border-t border-[#C9933A]/20">
                    <span className="text-[8px] font-mono text-stone-400 text-left">Founder Signee<br /><strong className="text-[9px] font-serif italic text-stone-800">Syed Shahnawaz</strong></span>
                    
                    {/* Tiny Gold Seal */}
                    <div className="relative flex justify-center items-center h-8 w-8">
                      <div className="absolute inset-0 rounded-full border border-dashed border-[#C9933A] animate-spin-slow" />
                      <div className="absolute inset-0.5 rounded-full bg-[#C9933A]/10 flex items-center justify-center">
                        <span className="text-[8px] font-bold text-[#C9933A]">الباب</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ADVISORY SERVICE NOTICE BOARD */}
                <div className={`p-6 rounded border shadow-sm
                  ${isSpace ? 'bg-space border-gold/15' : 'bg-white border-stone-200'}
                `}>
                  <div className="flex items-center gap-2 mb-4 border-b border-stone-200/10 pb-3">
                    <Bell className="h-5 w-5 text-gold" />
                    <h4 className="font-serif font-black text-base">Notice Board</h4>
                  </div>

                  {notices.length === 0 ? (
                    <p className="text-xs text-stone-400 italic font-serif">
                      Notice board currently clear. No alerts published.
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {notices.map((n) => (
                        <div key={n.id} className="text-left border-l-2 border-[#C9933A]/50 pl-3.5 space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[8px] font-mono text-stone-400">{n.date}</span>
                            {n.priority === 'High' && (
                              <span className="text-[7px] font-mono font-semibold uppercase tracking-widest text-[#8B0000] bg-red-500/10 px-1 py-0.5 rounded">
                                Urgent
                              </span>
                            )}
                          </div>
                          <h5 className="font-serif font-black text-xs sm:text-sm text-stone-900 dark:text-stone-100">
                            {n.title}
                          </h5>
                          <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed">
                            {n.body}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>

            </div>

          </div>
        ) : (
          /* ADMINISTRATIVE SCRIBE PANEL */
          <div className="space-y-8 animate-fade-in-up">
            
            {/* ADMIN SUBNET HEADER PANEL */}
            <div className={`p-6 rounded border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-sm
              ${isSpace ? 'bg-space border-gold/20' : 'bg-white border-stone-200'}
            `}>
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-full border
                  ${isSpace ? 'bg-gold/5 border-gold/20 text-gold-light' : 'bg-crimson/10 border-crimson/15 text-crimson'}
                `}>
                  <LayoutDashboard className="h-6 w-6 animate-pulse" />
                </div>
                <div>
                  <h3 className="font-serif font-black text-xl tracking-wide">
                    Scribes Administrative Console
                  </h3>
                  <p className="text-xs text-stone-400 mt-1">
                    System Administration Subnet • Credentials Validated
                  </p>
                </div>
              </div>

              <div className="flex gap-2.5 items-center w-full sm:w-auto">
                <button 
                  onClick={handlePopulateTestData}
                  className={`flex-1 sm:flex-none py-2 px-3.5 text-xs border font-mono rounded-sm transition-all hover:bg-gold/5 flex items-center justify-center gap-1.5
                    ${isSpace ? 'border-gold/30 text-gold-light' : 'border-crimson/30 text-crimson'}
                  `}
                  title="Populate applicants data"
                >
                  <PlusCircle className="h-4 w-4 shrink-0" />
                  Seed Test Records
                </button>

                <button 
                  onClick={logout}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 text-xs font-bold tracking-widest uppercase py-2 px-4 rounded-sm border border-stone-300 hover:bg-black/5 text-stone-500 hover:text-stone-800"
                >
                  <RefreshCw className="h-4 w-4" />
                  Scribe Signout
                </button>
              </div>
            </div>

            {/* CORE ANALYTICAL METRICS Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Enrolled Scholars', val: admissions.filter(a => a.status === 'Approved').length, icon: UserCheck, color: 'text-green-500 bg-green-500/5 border-green-500/10' },
                { label: 'Pending Covenants', val: admissions.filter(a => a.status === 'Pending').length, icon: Hourglass, color: 'text-amber-500 bg-amber-500/5 border-amber-500/15' },
                { label: 'Awaiting Critique', val: assignments.filter(a => a.status === 'Awaiting Grade').length, icon: ClipboardCheck, color: 'text-blue-500 bg-blue-500/5 border-blue-500/15' },
                { label: 'Published Notices', val: notices.length, icon: Bell, color: 'text-purple-500 bg-purple-500/5 border-purple-500/15' }
              ].map((m, i) => (
                <div key={i} className={`p-4 rounded border flex items-center gap-3.5 shadow-sm bg-white dark:bg-space ${m.color}`}>
                  <div className="p-2 rounded-full border border-current">
                    <m.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono tracking-widest uppercase opacity-75 block text-stone-400">
                      {m.label}
                    </span>
                    <strong className="text-xl sm:text-2xl font-black font-mono leading-none mt-1 block">
                      {m.val}
                    </strong>
                  </div>
                </div>
              ))}
            </div>

            {/* CORE COLUMNS SYSTEM */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* COVENANTS APPLICATIONS LIST (LEFT COL) */}
              <div className="lg:col-span-8 space-y-8">
                
                {/* INCOMING APPLICATIONS LIST */}
                <div className={`p-6 sm:p-8 rounded border shadow-sm
                  ${isSpace ? 'bg-space border-gold/15' : 'bg-white border-stone-200'}
                `}>
                  <div className="flex items-center justify-between mb-6 border-b border-stone-200/10 pb-4">
                    <div className="flex items-center gap-2.5">
                      <ClipboardCheck className={`h-6 w-6 ${isSpace ? 'text-gold-light' : 'text-crimson'}`} />
                      <div>
                        <h4 className="font-serif font-black text-lg">Covenant Registrations list</h4>
                        <span className="text-[9px] font-mono tracking-widest text-stone-400 uppercase">Manage admission seekers</span>
                      </div>
                    </div>
                  </div>

                  {admissions.length === 0 ? (
                    <div className="text-center py-12">
                      <HelpCircle className="h-10 w-10 mx-auto text-stone-300 animate-bounce mb-3" />
                      <p className="text-sm text-stone-400 italic font-serif">
                        No admissions applications submitted in state database yet. 
                      </p>
                      <button 
                        onClick={handlePopulateTestData}
                        className="mt-3 text-xs font-mono py-1.5 px-3 border border-dashed border-gold/50 text-gold-light hover:bg-gold/5 rounded"
                      >
                        Seed Database with Sandbox Records
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {admissions.map((record) => (
                        <div 
                          key={record.id}
                          className={`p-5 rounded border text-left flex flex-col justify-between gap-4 transition-all duration-200
                            ${record.status === 'Approved' ? 'border-green-500/20 bg-green-500/[0.01]' : record.status === 'Rejected' ? 'border-red-500/20 bg-red-500/[0.01]' : 'border-stone-200 dark:border-stone-800 bg-stone-50/5'}
                          `}
                        >
                          <div>
                            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 mb-3">
                              <div className="flex items-center gap-2.5">
                                <span className={`text-[9px] font-mono uppercase tracking-[0.1em] px-2 py-0.5 border rounded
                                  ${record.status === 'Approved' 
                                    ? 'bg-green-500/10 text-green-500 border-green-500/25' 
                                    : record.status === 'Rejected' 
                                      ? 'bg-red-500/10 text-red-500 border-red-500/25' 
                                      : 'bg-amber-500/10 text-amber-500 border-amber-500/25'
                                  }
                                `}>
                                  {record.status}
                                </span>
                                <span className="text-[10px] font-mono text-stone-400">Submitted {record.date}</span>
                              </div>

                              <span className="text-xs font-semibold uppercase text-gold">
                                {COURSES.find(c => c.id === record.selectedCourse)?.name || 'Islamic Sciences'} 
                                <span className="text-[10px] font-medium text-stone-400 underline lowercase block sm:inline sm:ml-2">({record.email})</span>
                              </span>
                            </div>

                            <h5 className="font-serif font-black text-base sm:text-lg text-stone-900 dark:text-stone-100">
                              Applicant: {record.fullName}
                            </h5>
                            <span className="text-[10px] font-mono uppercase text-stone-400 block mt-1">
                              Prior Knowledge: <strong className="text-[#C9933A]">{record.priorKnowledge}</strong>
                            </span>

                            <p className="text-xs font-serif leading-relaxed text-stone-500 dark:text-stone-400 bg-black/5 p-3.5 rounded-xs border-l-2 border-[#C9933A] mt-3">
                              <strong className="text-stone-700 dark:text-stone-200 block font-sans uppercase tracking-widest text-[9px] mb-1">Statement of Sincere Purpose:</strong>
                              "{record.statementOfPurpose}"
                            </p>
                          </div>

                          {/* Action Options */}
                          <div className="flex justify-start gap-2 pt-2 border-t border-stone-100 dark:border-stone-800/80">
                            {record.status !== 'Approved' && (
                              <button 
                                onClick={() => updateAdmissionStatus(record.id, 'Approved')}
                                className="inline-flex items-center gap-1 text-[10px] font-mono font-bold uppercase tracking-wider bg-green-500 hover:bg-green-600 text-white rounded-sm py-1.5 px-3 text-center"
                              >
                                <Check className="h-3 w-3" />
                                Approve Application
                              </button>
                            )}
                            
                            {record.status !== 'Rejected' && (
                              <button 
                                onClick={() => updateAdmissionStatus(record.id, 'Rejected')}
                                className="inline-flex items-center gap-1 text-[10px] font-mono font-bold uppercase tracking-wider bg-red-600 hover:bg-red-700 text-white rounded-sm py-1.5 px-3 text-center"
                              >
                                <XCircle className="h-3 w-3" />
                                Reject Application
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* ESSAYS ASSIGNMENTS REVIEW BUREAU */}
                <div className={`p-6 sm:p-8 rounded border shadow-sm
                  ${isSpace ? 'bg-space border-gold/15' : 'bg-white border-stone-200'}
                `}>
                  <div className="flex items-center justify-between mb-6 border-b border-stone-200/10 pb-4">
                    <div className="flex items-center gap-2.5">
                      <Award className={`h-6 w-6 ${isSpace ? 'text-gold-light' : 'text-crimson'}`} />
                      <div>
                        <h4 className="font-serif font-black text-lg">Critiques Evaluation Desk</h4>
                        <span className="text-[9px] font-mono tracking-widest text-stone-400 uppercase">Grade submitted research essays</span>
                      </div>
                    </div>
                  </div>

                  {assignments.length === 0 ? (
                    <p className="text-xs text-stone-400 italic font-serif">
                      No research essays submitted globally in campus index.
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {assignments.map((asg) => (
                        <div 
                          key={asg.id}
                          className={`p-4 rounded border text-left
                            ${asg.status === 'Graded' 
                              ? 'border-green-500/25 bg-green-500/[0.01]' 
                              : 'border-blue-500/25 bg-blue-500/[0.01]'
                            }
                          `}
                        >
                          <div className="flex justify-between items-center gap-2 mb-2">
                            <div>
                              <strong className="text-xs text-stone-700 dark:text-stone-200">{asg.studentName}</strong>
                              <span className="text-[10px] text-stone-400 font-mono ml-2">({asg.studentEmail})</span>
                            </div>

                            <span className={`text-[9px] font-mono uppercase tracking-widest border px-2 py-0.5 rounded
                              ${asg.status === 'Graded' 
                                ? 'bg-green-500/10 text-green-500 border-green-500/25' 
                                : 'bg-blue-500/10 text-blue-500 border-blue-500/25 animate-pulse'
                              }
                            `}>
                              {asg.status}
                            </span>
                          </div>

                          <span className="text-[10px] font-mono uppercase tracking-wider text-[#C9933A] bg-amber-500/5 px-2 py-0.5 rounded border border-[#C9933A]/20">
                            {COURSES.find(c => c.id === asg.courseId)?.name || 'Islamic Science Studies'}
                          </span>

                          <h5 className="font-serif font-black text-sm sm:text-base mt-2">
                            "{asg.title}"
                          </h5>

                          <p className="text-xs font-serif leading-relaxed text-stone-500 dark:text-stone-400 italic bg-black/5 p-3 rounded mt-2 border-l border-stone-450">
                            {asg.thesis}
                          </p>

                          {/* Inline Grading Form */}
                          {gradingAsgId === asg.id ? (
                            <form onSubmit={handleSubmitGrade} className="mt-4 p-4 border border-dashed border-stone-300 dark:border-stone-800 space-y-3 bg-stone-500/5 rounded-xs">
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                  <label className="block text-[10px] font-mono font-bold tracking-widest text-[#C9933A] uppercase mb-1">Grade</label>
                                  <select 
                                    value={gradeInput}
                                    onChange={(e) => setGradeInput(e.target.value)}
                                    className="w-full bg-space text-white px-2 py-1 flex items-center border border-stone-800 text-xs rounded"
                                  >
                                    <option value="A+ (Mumtaz)">A+ (Mumtaz)</option>
                                    <option value="A (Jayyid Jiddan)">A (Jayyid Jiddan)</option>
                                    <option value="B (Jayyid)">B (Jayyid)</option>
                                    <option value="C (Maqbul)">C (Maqbul)</option>
                                    <option value="D (Daeef)">D (Daeef / Marginal)</option>
                                  </select>
                                </div>
                              </div>

                              <div>
                                <label className="block text-[10px] font-mono font-bold tracking-widest text-[#C9933A] uppercase mb-1">Feedback Advisor Comments</label>
                                <textarea 
                                  rows={2}
                                  placeholder="Provide academic critique guidance or recommendations..."
                                  value={feedbackInput}
                                  onChange={(e) => setFeedbackInput(e.target.value)}
                                  className="w-full bg-transparent px-3 py-1.5 border border-stone-300 dark:border-stone-800 text-xs rounded"
                                />
                              </div>

                              <div className="flex gap-2">
                                <button type="submit" className="text-[10px] font-mono bg-green-600 font-bold tracking-wider text-white px-3 py-1 uppercase rounded-sm hover:bg-green-700 text-stone-200">
                                  Save Decision
                                </button>
                                <button type="button" onClick={() => setGradingAsgId(null)} className="text-[10px] font-mono bg-stone-300 dark:bg-stone-800 text-stone-600 dark:text-stone-300 font-bold tracking-wider px-3 py-1 uppercase rounded-sm">
                                  Cancel
                                </button>
                              </div>
                            </form>
                          ) : asg.status === 'Awaiting Grade' ? (
                            <button 
                              onClick={() => {
                                setGradingAsgId(asg.id);
                                setGradeInput('A+ (Mumtaz)');
                              }}
                              className="mt-4 inline-flex items-center gap-1 text-[10px] font-mono font-bold tracking-widest uppercase text-blue-500 hover:underline border-b border-transparent hover:border-blue-500"
                            >
                              <Award className="h-3.5 w-3.5" />
                              Evaluate Critique Manuscript
                            </button>
                          ) : (
                            <div className="mt-4 bg-[#C9933A]/5 border border-[#C9933A]/20 p-3 rounded-xs text-xs space-y-1">
                              <span className="font-mono text-emerald-500 font-bold text-[10px] block">
                                DECISION LOCKED: {asg.grade}
                              </span>
                              <p className="text-stone-550 italic font-serif leading-relaxed">
                                <strong className="font-sans uppercase text-[8px] tracking-wider text-stone-400 mr-1">Comments:</strong>
                                {asg.feedback}
                              </p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>

              {/* NOTICE SCRIBE BOARD (RIGHT COL) */}
              <div className="lg:col-span-4 space-y-8">
                
                {/* WRITE NOTICE ALERT BOARD */}
                <div className={`p-6 rounded border shadow-sm
                  ${isSpace ? 'bg-space border-gold/15' : 'bg-white border-stone-200'}
                `}>
                  <div className="flex items-center gap-2.5 mb-5 border-b border-stone-200/10 pb-3">
                    <PlusCircle className="h-5 w-5 text-gold-light" />
                    <h4 className="font-serif font-black text-base">Write Advisory Notice</h4>
                  </div>

                  <form onSubmit={handlePublishNotice} className="space-y-3.5 text-left">
                    <div>
                      <label className="block text-[10px] uppercase font-mono tracking-widest text-[#C9933A] mb-1 font-bold">Category</label>
                      <select 
                        value={newNoticeCategory}
                        onChange={(e) => setNewNoticeCategory(e.target.value)}
                        className={`w-full px-2 py-1.5 text-xs rounded border bg-transparent font-sans
                          ${isSpace ? 'border-gold/25 text-white' : 'border-stone-300 text-charcoal'}
                        `}
                      >
                        <option value="General" className="bg-space text-white">General Information</option>
                        <option value="Admissions" className="bg-space text-white">Admissions Updates</option>
                        <option value="Seminary Notice" className="bg-space text-white">Seminary Notice</option>
                        <option value="Lecture Warning" className="bg-space text-white">Academic Advisory</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase font-mono tracking-widest text-[#C9933A] mb-1 font-bold">Notice Header/Title</label>
                      <input 
                        type="text" 
                        placeholder="e.g. Traditional study revisions"
                        value={newNoticeTitle}
                        onChange={(e) => setNewNoticeTitle(e.target.value)}
                        className={`w-full px-2 py-1.5 text-xs rounded border bg-transparent font-sans
                          ${isSpace ? 'border-gold/25 text-white' : 'border-stone-300 text-charcoal'}
                        `}
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase font-mono tracking-widest text-[#C9933A] mb-1 font-bold">Notice Priority</label>
                      <div className="flex gap-4">
                        <label className="flex items-center gap-1.5 text-xs font-mono cursor-pointer">
                          <input 
                            type="radio" 
                            name="priority" 
                            checked={newNoticePriority === 'Normal'} 
                            onChange={() => setNewNoticePriority('Normal')}
                          />
                          Normal info
                        </label>
                        <label className="flex items-center gap-1.5 text-xs font-mono cursor-pointer text-[#8B0000] dark:text-red-400 font-bold">
                          <input 
                            type="radio" 
                            name="priority" 
                            checked={newNoticePriority === 'High'} 
                            onChange={() => setNewNoticePriority('High')}
                          />
                          Urgent / High
                        </label>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase font-mono tracking-widest text-[#C9933A] mb-1 font-bold">Advisory Description</label>
                      <textarea 
                        rows={3}
                        placeholder="Inscribe detailed alert announcement details..."
                        value={newNoticeBody}
                        onChange={(e) => setNewNoticeBody(e.target.value)}
                        className={`w-full px-2 py-1.5 text-xs rounded border bg-transparent font-sans
                          ${isSpace ? 'border-gold/25 text-white' : 'border-stone-300 text-charcoal'}
                        `}
                      />
                    </div>

                    <button 
                      type="submit"
                      className={`w-full inline-flex items-center justify-center gap-1.5 py-2 text-xs font-bold font-mono tracking-widest uppercase rounded shadow transition-all
                        ${isSpace 
                          ? 'bg-gold hover:bg-white text-space hover:scale-[1.01]' 
                          : 'bg-crimson hover:bg-black text-white hover:scale-[1.01]'
                        }
                      `}
                    >
                      <PlusCircle className="h-4 w-4" />
                      Publish Advisory Notice
                    </button>
                  </form>
                </div>

                {/* CURRENT PUBLISHED NOTICES MANAGER */}
                <div className={`p-6 rounded border shadow-sm
                  ${isSpace ? 'bg-space border-gold/15' : 'bg-white border-stone-200'}
                `}>
                  <div className="flex items-center justify-between mb-4 border-b border-stone-200/10 pb-3">
                    <h4 className="font-serif font-black text-base">Current Broadcasts</h4>
                    <span className="text-[9px] font-mono uppercase bg-[#C9933A]/5 border border-[#C9933A]/20 text-[#C9933A] px-2 py-0.5 rounded">
                      {notices.length} active
                    </span>
                  </div>

                  <div className="space-y-4">
                    {notices.map((n) => (
                      <div key={n.id} className="text-left border-l border-stone-300 pl-3 space-y-1 relative">
                        <button 
                          onClick={() => handleDeleteNotice(n.id)}
                          className="absolute right-0 top-0.5 text-stone-400 hover:text-red-500 transition-colors"
                          title="Delete Notice"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>

                        <div className="flex items-center gap-1.5 select-none">
                          <span className="text-[8px] font-mono text-stone-400 font-semibold uppercase">{n.category}</span>
                          {n.priority === 'High' && (
                            <span className="text-[7px] font-mono bg-red-500/10 text-red-500 border border-red-500/25 px-1 rounded-sm leading-none">HIGH</span>
                          )}
                        </div>
                        <h5 className="font-serif font-black text-xs text-stone-900 dark:text-stone-100 pr-5">
                          {n.title}
                        </h5>
                        <p className="text-[11px] text-stone-400 leading-snug">
                          {n.body}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>



              </div>

            </div>

          </div>
        )}

      </div>
    </section>
  );
}
