import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, Send, Trash2, User, BookOpen, Clock, 
  CheckCircle, Shield, AlertCircle, HelpCircle, ArrowRight, BookMarked
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  collection, 
  doc, 
  addDoc, 
  deleteDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  serverTimestamp 
} from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from '../firebase';
import { COURSES } from '../data';

interface CourseDiscussionFeedProps {
  currentTheme: 'parchment' | 'space';
}

interface DiscussionQuestion {
  id: string;
  courseId: string;
  courseName: string;
  studentName: string;
  questionText: string;
  uid: string;
  createdAt: any;
}

export default function CourseDiscussionFeed({ currentTheme }: CourseDiscussionFeedProps) {
  const isSpace = currentTheme === 'space';
  const [questions, setQuestions] = useState<DiscussionQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filtering & Post Form State
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [postCourseId, setPostCourseId] = useState<string>('quran');
  const [customName, setCustomName] = useState<string>('');
  const [questionText, setQuestionText] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Sync auth state
  useEffect(() => {
    const unsub = auth.onAuthStateChanged((user) => {
      setCurrentUser(user);
      if (user?.displayName) {
        setCustomName(user.displayName);
      }
    });
    return () => unsub();
  }, []);

  // Listen to Firestore real-time questions (Single stable listener at mount)
  useEffect(() => {
    const questionsCol = collection(db, 'albab_questions');
    const q = query(questionsCol, orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetched: DiscussionQuestion[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        fetched.push({
          id: docSnap.id,
          courseId: data.courseId,
          courseName: data.courseName,
          studentName: data.studentName,
          questionText: data.questionText,
          uid: data.uid,
          createdAt: data.createdAt,
        });
      });
      setQuestions(fetched);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'albab_questions');
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Handle Question Posting
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionText.trim()) return;

    // Resolve name
    const finalName = currentUser 
      ? (currentUser.displayName || currentUser.email?.split('@')[0] || 'Authenticated Scholar') 
      : (customName.trim() || 'Anonymous Seeker');

    const selectedCourse = COURSES.find(c => c.id === postCourseId);
    if (!selectedCourse) return;

    setSubmitting(true);
    setNotification(null);

    const newQuestion = {
      courseId: postCourseId,
      courseName: selectedCourse.name,
      studentName: finalName,
      questionText: questionText.trim(),
      uid: currentUser ? currentUser.uid : 'guest',
      createdAt: serverTimestamp()
    };

    try {
      await addDoc(collection(db, 'albab_questions'), newQuestion);
      setQuestionText('');
      if (!currentUser) setCustomName('');
      showNotice('success', 'Your scholarly inquiry has been posted to the network ledger.');
    } catch (err: any) {
      console.error(err);
      showNotice('error', 'Inquiry failed validation. Please ensure fields are correctly filled.');
    } finally {
      setSubmitting(false);
    }
  };

  const showNotice = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  // Handle Deleting a post (Allowed if owner or admin)
  const handleDelete = async (questionId: string, authorUid: string) => {
    const isOwner = currentUser && currentUser.uid === authorUid;
    const canDelete = isOwner; // Rules also support global admins

    if (!canDelete) {
      alert('Forbidden. You may only delete your own inquiries.');
      return;
    }

    if (!confirm('Are you sure you want to remove this academic question?')) return;

    try {
      await deleteDoc(doc(db, 'albab_questions', questionId));
      showNotice('success', 'Academic inquiry retracted successfully.');
    } catch (err) {
      console.error(err);
      showNotice('error', 'Retraction refused by security rule protocols.');
    }
  };

  // Filter local state based on selected filter option
  const filteredQuestions = selectedFilter === 'all' 
    ? questions
    : questions.filter(q => q.courseId === selectedFilter);

  return (
    <div id="scholastic-discussions" className={`p-6 sm:p-8 rounded-md mt-12 border ${
      isSpace 
        ? 'bg-[#030611] border-gold/15 text-neutral-100' 
        : 'bg-[#FAF6EE] border-[#0B4628]/10 text-stone-900'
    }`}>
      
      {/* SECTION HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pb-4 border-b border-stone-300/30 dark:border-white/10">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <MessageSquare className={`h-4 w-4 ${isSpace ? 'text-gold' : 'text-[#0B4628]'}`} />
            <h3 className="font-eb font-bold text-xl sm:text-2xl tracking-normal">
              Scholarly Assembly & Feed
            </h3>
          </div>
          <p className="text-xs text-stone-500 dark:text-stone-400">
            A dynamic discussion forum where students peer-review and ask questions regarding official Albab courses.
          </p>
        </div>

        {/* FEED FILTER BOX */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono uppercase tracking-widest text-[#0B4628]/70 dark:text-gold-light/70">
            Course Filter:
          </span>
          <select
            value={selectedFilter}
            onChange={(e) => setSelectedFilter(e.target.value)}
            className={`text-xs p-1.5 px-3 font-mono rounded-xs border outline-none cursor-pointer transition-colors ${
              isSpace 
                ? 'bg-space-dark border-gold/20 text-gold-light focus:border-gold' 
                : 'bg-[#FAF6EE] border-stone-300 text-stone-800 focus:border-[#0B4628]'
            }`}
          >
            <option value="all">All Disciplines</option>
            {COURSES.map(course => (
              <option key={course.id} value={course.id}>{course.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* POST CREATOR BOX (5 cols) */}
        <div className="lg:col-span-5 h-full">
          <div className={`p-5 rounded border ${
            isSpace 
              ? 'bg-[#020509] border-gold/10' 
              : 'bg-[#FAF6EE]/50 border-[#0B4628]/15'
          }`}>
            <h4 className="font-eb font-black text-sm uppercase tracking-wider mb-4 flex items-center gap-2" style={{ color: isSpace ? '#E8B86D' : '#0B4628' }}>
              <HelpCircle className="h-4 w-4" />
              Submit Intellectual Inquiry
            </h4>

            {notification && (
              <div className={`mb-4 p-3 rounded text-xs flex items-center gap-2 font-sans border transition-all ${
                notification.type === 'success' 
                  ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' 
                  : 'bg-red-500/10 text-red-600 border-red-500/20'
              }`}>
                {notification.type === 'success' ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                <span>{notification.message}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* TARGET CURRICULAR DISCIPLINE */}
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-wider text-stone-500 font-mono block">
                  Select Curricular Topic
                </label>
                <div className="grid grid-cols-2 gap-1.5 max-h-[140px] overflow-y-auto p-1 border rounded-xs scrollbar-thin scrollbar-thumb-stone-400 border-stone-300 dark:border-white/10">
                  {COURSES.map((course) => (
                    <button
                      key={course.id}
                      type="button"
                      onClick={() => setPostCourseId(course.id)}
                      className={`p-1.5 text-left text-[11px] rounded-xs font-serif transition-all flex items-center justify-between border cursor-pointer ${
                        postCourseId === course.id
                          ? (isSpace 
                              ? 'bg-gold/15 text-gold border-gold/40' 
                              : 'bg-[#0B4628]/10 text-[#0B4628] border-[#0B4628]/30 font-semibold'
                            )
                          : (isSpace 
                              ? 'bg-[#020509] border-transparent text-neutral-400 hover:text-white' 
                              : 'bg-transparent border-transparent text-stone-600 hover:text-stone-900 hover:bg-stone-50'
                            )
                      }`}
                    >
                      <span>{course.name}</span>
                      {postCourseId === course.id && <BookMarked className="h-3 w-3" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* STUDENT NAME */}
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-wider text-stone-500 font-mono block">
                  Post Author Profile Name
                </label>
                {currentUser ? (
                  <div className={`p-2.5 px-3 text-xs rounded-xs font-mono border flex items-center gap-2 ${
                    isSpace ? 'bg-[#040816] border-gold/10' : 'bg-[#e5ddd3]/40 border-stone-300'
                  }`}>
                    <Shield className="h-3.5 w-3.5 text-emerald-600" />
                    <span>{currentUser.displayName || currentUser.email?.split('@')[0]}</span>
                    <span className="text-[9.5px] font-sans opacity-60 text-emerald-600 uppercase font-black ml-auto">
                      Authenticated Student
                    </span>
                  </div>
                ) : (
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="e.g. Scholar Ibn Rushd or Guest Seeker"
                      maxLength={100}
                      value={customName}
                      onChange={(e) => setCustomName(e.target.value)}
                      className={`w-full py-2 pl-9 pr-3 text-xs rounded-xs border outline-none font-sans focus:ring-1 ${
                        isSpace 
                          ? 'bg-[#020509] border-gold/25 text-white focus:border-gold focus:ring-gold/20' 
                          : 'bg-[#FAF6EE] border-stone-300 text-[#1E120A] focus:border-[#0B4628] focus:ring-crimson/10'
                      }`}
                    />
                    <User className="absolute left-3 top-2.5 h-3.5 w-3.5 text-stone-400" />
                  </div>
                )}
              </div>

              {/* INQUIRY TEXT */}
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-wider text-stone-500 font-mono block">
                  Question details
                </label>
                <textarea
                  placeholder="Pose a respectful academic query... e.g. 'How does Ibn Sina’s proof of the truth (Burhan al-Siddiqin) compare to the formal syllogisms presented in our first Kalam module?'"
                  rows={4}
                  maxLength={1500}
                  required
                  value={questionText}
                  onChange={(e) => setQuestionText(e.target.value)}
                  className={`w-full p-3 text-xs rounded-xs border outline-none font-sans leading-relaxed focus:ring-1 resize-none ${
                    isSpace 
                      ? 'bg-[#020509] border-gold/25 text-white focus:border-gold focus:ring-gold/20' 
                      : 'bg-[#FAF6EE] border-stone-300 text-[#1E120A] focus:border-[#0B4628] focus:ring-crimson/10'
                  }`}
                />
              </div>

              {/* SUBMIT BUTTON */}
              <button
                type="submit"
                disabled={submitting}
                className={`w-full py-2 px-4 rounded-xs text-xs font-mono font-bold uppercase tracking-wider border cursor-pointer select-none transition-all duration-300 flex items-center justify-center gap-2 ${
                  isSpace 
                    ? 'border-gold bg-gold/10 text-gold hover:bg-gold hover:text-space' 
                    : 'border-[#0B4628] bg-[#0B4628]/5 text-[#0B4628] hover:bg-[#0B4628] hover:text-[#FAF6EE]'
                } ${submitting ? 'opacity-40 pointer-events-none' : ''}`}
              >
                <span>{submitting ? 'Streaming Ledger...' : 'Post Scholar Question'}</span>
                <Send className="h-3.5 w-3.5" />
              </button>

            </form>
          </div>
        </div>

        {/* FEED PREVIEWS LISTING (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-pulse flex flex-col items-center gap-3">
                <div className={`h-6 w-6 border-2 border-t-transparent rounded-full animate-spin ${
                  isSpace ? 'border-gold' : 'border-[#0B4628]'
                }`} />
                <p className="text-xs font-mono text-stone-500">Retrieving assembly scroll...</p>
              </div>
            </div>
          ) : filteredQuestions.length === 0 ? (
            <div className={`p-8 text-center rounded border border-dashed ${
              isSpace ? 'border-gold/15 bg-[#020509]' : 'border-stone-300 bg-stone-50/50'
            }`}>
              <BookOpen className="h-8 w-8 mx-auto opacity-30 mb-2 text-stone-400" />
              <p className="font-serif italic text-xs text-stone-500">
                Silence is golden. No active questions have been raised under this discipline.
              </p>
              <p className="text-[10px] uppercase font-mono tracking-widest text-[#0B4628]/60 dark:text-gold-light/60 mt-1">
                Be the first to commence!
              </p>
            </div>
          ) : (
            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-stone-400">
              <AnimatePresence initial={false}>
                {filteredQuestions.map((q) => {
                  const queryDate = q.createdAt?.toDate ? q.createdAt.toDate() : new Date();
                  const isOwner = currentUser && currentUser.uid === q.uid;
                  
                  return (
                    <motion.div
                      key={q.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      layout
                      className={`p-4 rounded border relative group hover:shadow-sm transition-all duration-300 ${
                        isSpace 
                          ? 'bg-[#020509] border-gold/10 hover:border-gold/25' 
                          : 'bg-[#FAF6EE] border-stone-200 hover:border-stone-300'
                      }`}
                    >
                      
                      {/* HEADER INFO */}
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-2 pb-2 border-b border-stone-200/50 dark:border-white/5">
                        <div className="flex items-center gap-1.5 select-none">
                          <span className={`text-[8.5px] px-2 py-0.5 rounded-sm font-mono uppercase tracking-wider font-extrabold ${
                            isSpace 
                              ? 'bg-gold/10 text-gold-light border border-gold/20' 
                              : 'bg-[#0B4628]/10 text-[#0B4628] border border-[#0B4628]/15'
                          }`}>
                            {q.courseName}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-[10px] font-mono text-stone-400">
                          <Clock className="h-3 w-3" />
                          <span>{queryDate.toLocaleDateString()}</span>
                        </div>
                      </div>

                      {/* QUESTION CONTENT */}
                      <p className="text-xs leading-relaxed text-stone-850 dark:text-neutral-200 font-serif font-medium italic mb-3 select-all">
                        "{q.questionText}"
                      </p>

                      {/* FOOTER METADATA */}
                      <div className="flex items-center justify-between mt-1">
                        <div className="flex items-center gap-1 text-[10.5px] font-mono">
                          <span className="opacity-65 text-stone-400">Author:</span>
                          <span className={isSpace ? 'text-gold-light font-bold' : 'text-[#0B4628] font-bold'}>
                            {q.studentName}
                          </span>
                          {q.uid !== 'guest' && (
                            <span className="text-[9px] px-1 bg-emerald-500/10 text-emerald-600 rounded-sm scale-90">
                              ✓ Verified
                            </span>
                          )}
                        </div>

                        {isOwner && (
                          <button
                            onClick={() => handleDelete(q.id, q.uid)}
                            title="Retract question"
                            className="text-stone-400 hover:text-red-500 p-1 rounded-sm hover:bg-red-500/5 dark:hover:bg-red-500/10 transition-colors cursor-pointer"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>

                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
