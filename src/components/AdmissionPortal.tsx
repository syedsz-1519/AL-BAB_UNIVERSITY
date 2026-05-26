import React, { useState } from 'react';
import { EnrollmentState } from '../types';
import { COURSES } from '../data';
import { X, Check, Award, Printer, ClipboardCheck, Sparkles, AlertCircle } from 'lucide-react';

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
    setSubmitted(true);
  };

  const activeCourseName = COURSES.find(c => c.id === enrollment.selectedCourse)?.name || "Theological Sciences";

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
              <span className="text-[9px] tracking-widest font-mono text-stone-400 uppercase">Apply to the Albab Covenant</span>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-full hover:bg-black/10 transition-colors"
          >
            <X className="h-6 w-6 text-stone-400 group-hover:text-gold" />
          </button>
        </div>

        {/* INPUT FORM CONTENT */}
        {!submitted ? (
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
        ) : (
          /* CERTIFICATE / ADMISSION LETTER SYNTHESIS SHEET */
          <div className="p-6 md:p-8 flex flex-col items-center">
            
            {/* Admission Success Notice */}
            <div className="mb-4 flex items-center gap-2 text-xs text-green-600 dark:text-green-400 font-semibold font-mono uppercase bg-green-500/5 py-1 px-3 border border-green-500/20 rounded-xs">
              <Check className="h-4 w-4" />
              Covenant successfully inscribed!
            </div>

            {/* SYNTHESIZED SCHOLAR DIPLOMA */}
            <div className="relative w-full border-4 border-double p-6 sm:p-10 text-center font-serif bg-[#FAF6EF] text-[#1A1A1A] rounded-sm shadow-md max-w-lg mx-auto border-[#C9933A]/85">
              
              {/* Ornamental Vellum Star Watermark */}
              <div className="absolute inset-0 opacity-10 bg-repeat bg-contain arabesque-grid pointer-events-none rounded-inner" />

              {/* Crimson corner ticks */}
              <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-[#8B0000]" />
              <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-[#8B0000]" />

              <h4 className="text-[10px] tracking-[0.3em] font-mono font-black uppercase text-[#8B0000] mb-2 leading-none">
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
                Given on this day of study, to evaluate and restore Islamic tradition for the contemporary digital climate. Graded as an active seeker with prior "{enrollment.priorKnowledge}" competency.
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
        )}

      </div>
    </div>
  );
}
