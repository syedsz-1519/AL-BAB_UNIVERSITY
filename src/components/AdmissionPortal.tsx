import React, { useState } from 'react';
import { EnrollmentState } from '../types';
import { COURSES } from '../data';
import { X, Check, Award, Printer, ClipboardCheck, Sparkles, AlertCircle, Mail } from 'lucide-react';

interface AdmissionPortalProps {
  currentTheme: 'parchment' | 'space';
  onClose: () => void;
}

export default function AdmissionPortal({ currentTheme, onClose }: AdmissionPortalProps) {
  const isSpace = currentTheme === 'space';
  const [enrollment, setEnrollment] = useState<EnrollmentState>({
    fullName: '',
    email: '',
    selectedCourse: 'quran',
    statementOfPurpose: '',
    priorKnowledge: 'beginner'
  });

  const [submitted, setSubmitted] = useState(false);
  const [showChoice, setShowChoice] = useState(false);
  const [copied, setCopied] = useState(false);
  const [errorText, setErrorText] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEnrollment({
      ...enrollment,
      [name]: value
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!enrollment.fullName.trim()) {
      setErrorText('Please supply your scholarly title/name under certification.');
      return;
    }
    if (!enrollment.email.includes('@')) {
      setErrorText('Scholar require a direct registered email endpoint.');
      return;
    }
    if (enrollment.statementOfPurpose.length < 15) {
      setErrorText('Statement of purpose must consist of at least 15 characters of sincere thought.');
      return;
    }

    setErrorText('');
    setShowChoice(true);
  };

  const activeCourseName = COURSES.find(c => c.id === enrollment.selectedCourse)?.name || "Theological Sciences";

  const getKnowledgeLabel = (tier: string) => {
    switch(tier) {
      case 'none': return 'Humble Beginner';
      case 'beginner': return 'Beginner (Basic Arabic/Texts)';
      case 'intermediate': return 'Intermediate (Familiar with Usul)';
      case 'advanced': return 'Advanced (Scholarly Competency)';
      default: return 'Seeker of Wisdom';
    }
  };

  // Pre-formatted Email URL matching user spec and refined to feel highly professional & structured
  const getEmailUrl = () => {
    const subject = `Admission Covenant: ${enrollment.fullName} - Albab Islamic University`;
    const body = `Assalamu'alaikum wa Rahmatullahi wa Barakatuhu,

I would love to enroll and become a student at Albab Islamic University.

Here are my Admission Covenant details:
• Scholar Name: ${enrollment.fullName}
• Email Endpoint: ${enrollment.email}
• Area of Pursuit: ${activeCourseName}
• Prior Knowledge: ${getKnowledgeLabel(enrollment.priorKnowledge)}

Statement of Sincere Purpose:
"${enrollment.statementOfPurpose}"

Please guide me regarding the official enrollment steps to finalize my student status.

JazakAllah khair!`;

    return `mailto:adnaanibnfarooq@gmail.com?cc=${encodeURIComponent(enrollment.email)}&subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  const saveAdmissionToLocalStorage = (enrollmentData: typeof enrollment) => {
    try {
      const existingStr = localStorage.getItem('albab_admissions');
      const existing = existingStr ? JSON.parse(existingStr) : [];
      
      const isDuplicate = existing.some((app: any) => 
        app.email.toLowerCase() === enrollmentData.email.toLowerCase() && 
        app.selectedCourse === enrollmentData.selectedCourse
      );
      if (isDuplicate) return;

      const newRecord = {
        fullName: enrollmentData.fullName,
        email: enrollmentData.email,
        selectedCourse: enrollmentData.selectedCourse,
        statementOfPurpose: enrollmentData.statementOfPurpose,
        priorKnowledge: enrollmentData.priorKnowledge,
        id: 'app_' + Math.random().toString(36).substring(2, 9),
        date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
        status: 'Pending'
      };
      existing.push(newRecord);
      localStorage.setItem('albab_admissions', JSON.stringify(existing));

      // Asynchronously send to backend Supabase endpoint
      fetch('/api/admissions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newRecord)
      })
      .then(res => res.json())
      .then(data => {
        console.log('Successfully synced admission with Supabase:', data);
      })
      .catch(err => {
        console.warn('Backend Supabase sync failed, operating with double-safe local backup:', err);
      });
    } catch (e) {
      console.error('Error saving admission details to localStorage:', e);
    }
  };

  const handleEmailSubmit = () => {
    saveAdmissionToLocalStorage(enrollment);
    setShowChoice(false);
    setSubmitted(true);
  };

  const handleInstagramSubmit = () => {
    saveAdmissionToLocalStorage(enrollment);
    // Copy summary ledger to clipboard for easy DM paste
    const summaryLedger = `Assalamu'alaikum, I want to enroll to Albab Islamic University!
• Name: ${enrollment.fullName}
• Email: ${enrollment.email}
• Course: ${activeCourseName}
• Knowledge: ${getKnowledgeLabel(enrollment.priorKnowledge)}
• Purpose: ${enrollment.statementOfPurpose}`;

    navigator.clipboard.writeText(summaryLedger).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    });

    window.open('https://www.instagram.com/albabuniversity?igsh=Z295OXpjNGZpaWEy', '_blank', 'noopener,noreferrer');
    setShowChoice(false);
    setSubmitted(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in select-none">
      
      {/* LEDGER CARD FRAME CONTAINER */}
      <div className={`relative max-w-2xl w-full rounded-sm overflow-hidden shadow-2xl transition-all duration-500 max-h-[90vh] overflow-y-auto border
        ${isSpace 
          ? 'bg-space border-gold/30 text-white' 
          : 'bg-[#FAF8F5] border-crimson/20 text-charcoal'
        }
      `}>
        {/* Fine Press Corner Lines */}
        <div className={`absolute top-0 left-0 w-4 h-4 border-t border-l
          ${isSpace ? 'border-gold' : 'border-crimson'}
        `} />
        <div className={`absolute bottom-0 right-0 w-4 h-4 border-b border-r
          ${isSpace ? 'border-gold' : 'border-crimson'}
        `} />

        {/* HEADER */}
        <div className="p-6 md:p-8 flex justify-between items-center border-b border-stone-200/15">
          <div className="flex items-center gap-3">
            <ClipboardCheck className={`h-6 w-6
              ${isSpace ? 'text-gold' : 'text-crimson'}
            `} />
            <div>
              <h3 className="font-serif font-black text-xl md:text-2xl tracking-wide leading-none">Admission Portal</h3>
              <span className="text-[9px] tracking-widest font-mono text-stone-400 uppercase">Apply to the Albab Islamic University Covenant</span>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-full hover:bg-black/10 transition-colors"
          >
            <X className="h-6 w-6 text-stone-400 group-hover:text-gold" />
          </button>
        </div>

        {/* SUBMISSION MODAL / FORM CONDITIONAL LAYER */}
        {submitted ? (
          /* CERTIFICATE / ADMISSION LETTER SYNTHESIS SHEET */
          <div className="p-6 md:p-8 flex flex-col items-center">
            
            {/* Admission Success Notice */}
            <div className="mb-4 flex items-center gap-2 text-xs text-green-600 dark:text-green-400 font-semibold font-mono uppercase bg-green-500/5 py-1 px-3 border border-green-500/20 rounded-xs">
              <Check className="h-4 w-4" />
              Covenant successfully inscribed &amp; transmitted!
            </div>

            {/* SYNTHESIZED SCHOLAR DIPLOMA */}
            <div className="relative w-full border-4 border-double p-6 sm:p-10 text-center font-serif bg-[#FAF6EF] text-[#1A1A1A] rounded-sm shadow-md max-w-lg mx-auto border-[#C9933A]/85">
              
              {/* Ornamental Vellum Star Watermark */}
              <div className="absolute inset-0 opacity-10 bg-repeat bg-contain arabesque-grid pointer-events-none rounded-inner" />

              {/* Crimson corner ticks */}
              <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-[#8B1A1A]" />
              <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-[#8B1A1A]" />

              <h4 className="text-[10px] tracking-[0.3em] font-mono font-black uppercase text-[#8B1A1A] mb-2 leading-none">
                Albab Islamic University
              </h4>
              <p className="text-[9px] uppercase tracking-widest font-mono text-[#C9933A] mb-6 block leading-none">
                U L U L · A L B A B · S E M I N A R Y
              </p>

              <h3 className="font-display font-black text-2xl lg:text-3xl tracking-wide text-stone-900 leading-none mb-6">
                Covenant of Admission
              </h3>

              <p className="text-stone-500 text-xs tracking-wider uppercase font-mono mb-1 leading-none">
                Let it be known to all scholars that
              </p>
              <h2 className="text-xl sm:text-2xl font-black italic text-stone-950 underline decoration-[#C9933A] decoration-wavy underline-offset-4 mb-4 select-all">
                {enrollment.fullName}
              </h2>

              <p className="text-stone-600 text-sm max-w-sm mx-auto leading-relaxed mb-6 font-serif">
                has officially inscribed their name, declaring full commitment of intellect under the path of canonical understanding in the field of:
              </p>

              <div className="inline-block py-2.5 px-6 border-y border-[#C9933A]/45 mb-6 text-sm font-semibold uppercase tracking-widest text-[#8B0000] bg-[#FAF8F5]">
                {activeCourseName}
              </div>

              <p className="text-[11px] text-stone-400 font-mono leading-relaxed mb-8 max-w-md mx-auto">
                Given on this day of study, to evaluate and restore Islamic tradition for the contemporary digital climate. Graded as an active seeker with prior "{getKnowledgeLabel(enrollment.priorKnowledge)}" competency.
              </p>

              {/* DIPLOMA BASE MARKS (Seal + Signatures) */}
              <div className="flex justify-between items-end pt-4 border-t border-[#C9933A]/25">
                <div className="text-left">
                  <span className="font-mono text-[9px] text-stone-400 block tracking-wider leading-none">Covenant Signee</span>
                  <span className="font-serif italic font-bold text-xs select-all block mt-1">Syed Shahnawaz</span>
                  <span className="text-[8px] font-mono text-stone-400 tracking-widest block leading-none uppercase mt-0.5">Seminary Prefect</span>
                </div>

                {/* THE GOLD ADMISSION SEAL */}
                <div className="relative flex justify-center items-center h-16 w-16">
                  <div className="absolute inset-0 rounded-full border-2 border-[#C9933A] border-dashed animate-spin-slow duration-[15s]" />
                  <div className="absolute inset-1 rounded-full border border-[#C9933A]/50 bg-[#C9933A]/10 flex flex-col justify-center items-center text-center">
                    <span className="font-arabic text-[11px] text-[#C9933A] leading-none font-bold">الْبَاب</span>
                    <span className="text-[6px] font-mono font-bold tracking-widest text-[#C9933A] leading-none mt-0.5">SEAL</span>
                  </div>
                </div>
              </div>

            </div>

            {/* BACK BUTTON */}
            <div className="mt-8 flex gap-4">
              <button 
                onClick={() => window.print()}
                className="text-xs font-bold tracking-widest uppercase py-3 px-6 rounded-sm border border-stone-300 text-stone-600 dark:text-stone-300 flex items-center gap-1.5 hover:bg-black/5"
              >
                <Printer className="h-4 w-4" />
                Print Certificate
              </button>
              <button 
                onClick={onClose}
                className="text-xs font-bold tracking-widest uppercase py-3 px-6 rounded-sm bg-crimson dark:bg-gold text-white dark:text-space flex items-center gap-1.5"
              >
                Return to Campus
              </button>
            </div>

          </div>
        ) : showChoice ? (
          /* SUBMISSION CHANNEL CHOOSE SYSTEM */
          <div className="p-6 md:p-8 space-y-8 animate-fade-in text-center selection-none">
            <div className="max-w-md mx-auto">
              <h4 className="text-xs font-mono font-bold uppercase tracking-[0.2em] text-[#C9933A] mb-2 leading-none">
                Select Transmission Channel
              </h4>
              <p className="text-sm text-stone-500 dark:text-stone-400 font-serif leading-relaxed">
                Your admission ledger has been sealed. Select one of the official channels below to submit your covenant of admission to the university administration.
              </p>
            </div>

            {/* TWO OPTIONS CHOICE LIST */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-xl mx-auto text-left">
              
              {/* EMAIL ACTION CARD */}
              <a
                href={getEmailUrl()}
                onClick={handleEmailSubmit}
                className={`group relative p-6 rounded border transition-all duration-300 text-left flex flex-col justify-between hover:scale-[1.02] shadow-sm hover:shadow-md
                  ${isSpace 
                    ? 'bg-space-dark/60 border-blue-500/20 hover:border-gold text-stone-200' 
                    : 'bg-blue-50/20 border-blue-200 hover:border-crimson text-charcoal'
                  }
                `}
              >
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2.5 rounded-full bg-blue-500/10 text-blue-500">
                      <Mail className="h-6 w-6" />
                    </div>
                    <h5 className="font-serif font-black text-base text-stone-900 dark:text-stone-100">Submit via Email</h5>
                  </div>
                  <p className="text-xs font-serif leading-relaxed text-stone-500 mb-6 font-medium">
                    This will finalize your admission files as a formal message, automatically setting your email <strong className="text-stone-800 dark:text-stone-200">({enrollment.email})</strong> in CC, and direct you to draft an email directly to Founder <strong className="text-blue-500 font-bold font-serif">Adnan ibn Farooq (adnaanibnfarooq@gmail.com)</strong>.
                  </p>
                </div>

                <div className="w-full pt-2">
                  <span className={`w-full inline-flex justify-center items-center text-[10px] font-mono tracking-widest uppercase py-2.5 px-4 font-bold rounded shadow transition-all duration-200
                    ${isSpace 
                      ? 'bg-gold hover:bg-white text-space' 
                      : 'bg-crimson hover:bg-black text-white'
                    }
                  `}>
                    Draft Mail Application
                  </span>
                </div>
              </a>

              {/* INSTAGRAM ACTION CARD */}
              <button
                onClick={handleInstagramSubmit}
                className={`group relative p-6 rounded border transition-all duration-300 text-left flex flex-col justify-between hover:scale-[1.02] shadow-sm hover:shadow-md
                  ${isSpace 
                    ? 'bg-space-dark/60 border-rose-500/20 hover:border-rose-500 text-stone-200' 
                    : 'bg-rose-50/20 border-rose-200 hover:border-rose-500 text-charcoal'
                  }
                `}
              >
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2.5 rounded-full bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 text-white">
                      <svg viewBox="0 0 24 24" className="h-6 w-6 stroke-current stroke-2 fill-none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                      </svg>
                    </div>
                    <h5 className="font-serif font-black text-base text-stone-900 dark:text-stone-100">Submit via Instagram DM</h5>
                  </div>
                  <p className="text-xs font-serif leading-relaxed text-stone-500 mb-6 font-medium">
                    This copies the complete ledger text of your application to your clipboard and routes you directly to <strong className="text-rose-500 font-bold font-serif">Albab Islamic University (@albabuniversity)</strong>, where you can paste it straight into our chat.
                  </p>
                </div>

                <div className="w-full pt-2">
                  <span className="w-full inline-flex justify-center items-center text-[10px] font-mono tracking-widest uppercase py-2.5 px-4 bg-gradient-to-r from-[#f09433] via-[#e6683c] via-[#dc2743] via-[#cc2366] to-[#bc1888] text-white font-bold rounded shadow transition-all duration-200">
                    {copied ? 'Ledger Copied!' : 'Submit on Instagram'}
                  </span>
                </div>
              </button>

            </div>

            {/* BACK LINK ACTION */}
            <div className="pt-2 border-t border-stone-200/10 max-w-lg mx-auto">
              <button
                onClick={() => setShowChoice(false)}
                className="text-[10px] font-mono font-bold tracking-widest uppercase text-stone-400 hover:text-white transition-all duration-200"
              >
                ← Back to Alter Form Details
              </button>
            </div>

          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
            
            {errorText && (
              <div className="flex items-center gap-2 p-3 text-xs border border-red-500/20 bg-red-500/5 text-red-600 dark:text-red-400 rounded-sm">
                <AlertCircle className="h-4 w-4" />
                <span>{errorText}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* FULL NAME */}
              <div className="flex flex-col">
                <label className="text-[10px] uppercase font-mono tracking-[0.2em] font-black text-stone-400 dark:text-stone-500 mb-2">
                  Scholarly Title / Full Name
                </label>
                <input 
                  type="text"
                  name="fullName"
                  placeholder="e.g. Syed Al-Ghazali"
                  value={enrollment.fullName}
                  onChange={handleInputChange}
                  className="signature-input py-2 text-sm bg-transparent"
                />
              </div>

              {/* EMAIL */}
              <div className="flex flex-col">
                <label className="text-[10px] uppercase font-mono tracking-[0.2em] font-black text-stone-400 dark:text-stone-500 mb-2">
                  Direct Email Endpoint
                </label>
                <input 
                  type="email"
                  name="email"
                  placeholder="e.g. ghazali@albab.edu"
                  value={enrollment.email}
                  onChange={handleInputChange}
                  className="signature-input py-2 text-sm bg-transparent"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* SELECTED SUBJECT */}
              <div className="flex flex-col">
                <label className="text-[10px] uppercase font-mono tracking-[0.2em] font-black text-stone-400 dark:text-stone-500 mb-2">
                  Selected Area of Pursuit
                </label>
                <select 
                  name="selectedCourse"
                  value={enrollment.selectedCourse}
                  onChange={handleInputChange}
                  className={`py-2 text-sm bg-transparent border-b outline-none cursor-pointer font-serif
                    ${isSpace ? 'border-stone-800 text-white' : 'border-stone-200 text-charcoal'}
                  `}
                >
                  {COURSES.map((course) => (
                    <option key={course.id} value={course.id} className="bg-space text-white">
                      {course.name} ({course.count})
                    </option>
                  ))}
                </select>
              </div>

              {/* PRIOR KNOWLEDGE */}
              <div className="flex flex-col">
                <label className="text-[10px] uppercase font-mono tracking-[0.2em] font-black text-stone-400 dark:text-stone-500 mb-2">
                  Prior Knowledge Tier
                </label>
                <select 
                  name="priorKnowledge"
                  value={enrollment.priorKnowledge}
                  onChange={handleInputChange}
                  className={`py-2 text-sm bg-transparent border-b outline-none cursor-pointer font-serif
                    ${isSpace ? 'border-stone-800 text-white' : 'border-stone-200 text-charcoal'}
                  `}
                >
                  <option value="none" className="bg-space text-white">None (Humble Beginner)</option>
                  <option value="beginner" className="bg-space text-white">Beginner (Basic Arabic/Texts)</option>
                  <option value="intermediate" className="bg-space text-white">Intermediate (Familiar with Usul)</option>
                  <option value="advanced" className="bg-space text-white">Advanced (Scholarly Competency)</option>
                </select>
              </div>
            </div>

            {/* STATEMENT OF PURPOSE */}
            <div className="flex flex-col">
              <label className="text-[10px] uppercase font-mono tracking-[0.2em] font-black text-stone-400 dark:text-stone-500 mb-2">
                Statement of Sincere Purpose
              </label>
              <textarea 
                name="statementOfPurpose"
                rows={3}
                placeholder="What motivates your search for wisdom in Albab Islamic University?"
                value={enrollment.statementOfPurpose}
                onChange={handleInputChange}
                className={`py-2 px-3 text-sm bg-transparent border rounded-xs focus:outline-none transition-all font-serif
                  ${isSpace 
                    ? 'border-gold/20 text-white focus:border-gold' 
                    : 'border-stone-200 text-charcoal focus:border-crimson'
                  }
                `}
              />
            </div>

            {/* SUBMIT BUTTON */}
            <div className="pt-4 flex justify-end">
              <button 
                type="submit"
                className={`w-full sm:w-auto text-xs font-bold tracking-[0.25em] uppercase py-3.5 px-10 rounded-sm shadow-md transition-all duration-300
                  ${isSpace 
                    ? 'bg-gold hover:bg-white text-space hover:text-space' 
                    : 'bg-crimson hover:bg-black text-white'
                  }
                `}
              >
                Inscribe Admission Covenant
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
}
