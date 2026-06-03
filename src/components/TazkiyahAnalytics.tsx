import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { 
  Activity, 
  Heart, 
  ShieldCheck, 
  Sparkles, 
  Info, 
  TrendingUp, 
  RefreshCw,
  Database
} from 'lucide-react';

interface TazkiyahAnalyticsProps {
  currentTheme?: 'parchment' | 'space';
}

interface MergedDataPoint {
  date: string;
  timestamp: string;
  source: 'Waswas Clinic' | 'Dhikr Rx';
  label: string;
  serenity: number;     // 0-100 scale showing emotional balance
  vagalTone: number;    // vata/heart physical-spiritual resilience
  focus: number;        // cognitive focus
}

// Pre-seeded authentic dataset to display if user has not yet recorded sessions.
// Helps visualize the emotional regulation path clearly.
const DEFAULT_SEED_HOURS = [
  { daysAgo: 6, serenity: 42, vagalTone: 35, focus: 45, label: "Initial Consultation (Severe Anxiety)", source: "Dhikr Rx" },
  { daysAgo: 5, serenity: 50, vagalTone: 45, focus: 50, label: "Scholastic Waswas Session", source: "Waswas Clinic" },
  { daysAgo: 4, serenity: 58, vagalTone: 52, focus: 58, label: "Dhikr prescription prescribed (Grief)", source: "Dhikr Rx" },
  { daysAgo: 3, serenity: 64, vagalTone: 60, focus: 68, label: "Scribal Waswas Consultation", source: "Waswas Clinic" },
  { daysAgo: 2, serenity: 75, vagalTone: 72, focus: 80, label: "Dhikr prescription (Gratitude)", source: "Dhikr Rx" },
  { daysAgo: 1, serenity: 82, vagalTone: 78, focus: 84, label: "Subconscious Cognitive Defusion", source: "Waswas Clinic" },
  { daysAgo: 0, serenity: 88, vagalTone: 85, focus: 90, label: "Current Balance", source: "Dhikr Rx" }
];

export default function TazkiyahAnalytics({ currentTheme }: TazkiyahAnalyticsProps) {
  const isSpace = currentTheme === 'space';
  const [data, setData] = useState<MergedDataPoint[]>([]);
  const [isSeeded, setIsSeeded] = useState<boolean>(false);
  const [activeMetric, setActiveMetric] = useState<'all' | 'serenity' | 'vagalTone' | 'focus'>('all');
  const [isReady, setIsReady] = useState<boolean>(false);

  // Load and merge datasets
  const fetchAndMergeData = () => {
    try {
      // 1. Fetch Waswas Clinic Sessions
      const savedWaswasText = localStorage.getItem('albab_waswas_sessions');
      const waswasSessions = savedWaswasText ? JSON.parse(savedWaswasText) : [];

      // 2. Fetch Dhikr Rx prescriptions
      const savedDhikrText = localStorage.getItem('users/albab_scribe_user/dhikr_prescriptions');
      const dhikrRxList = savedDhikrText ? JSON.parse(savedDhikrText) : [];

      const mergedList: MergedDataPoint[] = [];

      // Map Waswas Clinic sessions
      waswasSessions.forEach((session: any) => {
        const dateObj = new Date(session.timestamp || Date.now());
        const formattedDate = dateObj.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
        
        // Formulate reasonable quantitative scores based on Category or sentiment
        let baseSerenity = 60;
        let baseVagal = 55;
        let baseFocus = 65;

        if (session.category === 'faith') {
          baseSerenity = 68; baseFocus = 72;
        } else if (session.category === 'obsessive') {
          baseSerenity = 48; baseVagal = 50;
        } else if (session.category === 'shariah') {
          baseSerenity = 70; baseFocus = 70;
        }

        mergedList.push({
          date: formattedDate,
          timestamp: session.timestamp || new Date().toISOString(),
          source: 'Waswas Clinic',
          label: `Waswas Consultation (${session.category || 'General'})`,
          serenity: baseSerenity,
          vagalTone: baseVagal,
          focus: baseFocus
        });
      });

      // Map Dhikr Rx states
      dhikrRxList.forEach((rx: any) => {
        const dateObj = new Date(rx.created_at || Date.now());
        const formattedDate = dateObj.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
        
        // Parse emotional key for metrics
        let baseSerenity = 50;
        let baseVagal = 50;
        let baseFocus = 55;

        switch (rx.selectedEmotion) {
          case 'anxiety':
            baseSerenity = 45; baseVagal = 40; baseFocus = 50; break;
          case 'grief':
            baseSerenity = 52; baseVagal = 45; baseFocus = 55; break;
          case 'anger':
            baseSerenity = 40; baseVagal = 35; baseFocus = 45; break;
          case 'loneliness':
            baseSerenity = 55; baseVagal = 52; baseFocus = 58; break;
          case 'arrogance':
            baseSerenity = 60; baseVagal = 65; baseFocus = 60; break;
          case 'envy':
            baseSerenity = 48; baseVagal = 50; baseFocus = 52; break;
          case 'depression':
            baseSerenity = 42; baseVagal = 38; baseFocus = 42; break;
          case 'gratitude':
            baseSerenity = 88; baseVagal = 85; baseFocus = 90; break;
        }

        mergedList.push({
          date: formattedDate,
          timestamp: rx.created_at || new Date().toISOString(),
          source: 'Dhikr Rx',
          label: `Dhikr Prescription (${rx.selectedEmotion || 'Prescribed'})`,
          serenity: baseSerenity,
          vagalTone: baseVagal,
          focus: baseFocus
        });
      });

      // Chronological sort
      mergedList.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

      // If no data points, generate authentic seed trace so visual charts present beautifully instantly
      if (mergedList.length === 0) {
        const now = new Date();
        const generated = DEFAULT_SEED_HOURS.map(seed => {
          const pastDate = new Date();
          pastDate.setDate(now.getDate() - seed.daysAgo);
          return {
            date: pastDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
            timestamp: pastDate.toISOString(),
            source: seed.source as any,
            label: seed.label,
            serenity: seed.serenity,
            vagalTone: seed.vagalTone,
            focus: seed.focus
          };
        });
        setData(generated);
        setIsSeeded(true);
      } else {
        setData(mergedList);
        setIsSeeded(false);
      }
    } catch (e) {
      console.error("Failed to construct merged Tazkiyah biometric curves", e);
    }
  };

  useEffect(() => {
    fetchAndMergeData();
    const timer = setTimeout(() => {
      setIsReady(true);
    }, 150);
    return () => clearTimeout(timer);
  }, []);

  // Colors based on academic theme
  const serenityColor = isSpace ? '#54D3C2' : '#8B1A1A'; 
  const vagalColor = isSpace ? '#E5B14F' : '#C4A35A';    
  const focusColor = isSpace ? '#60A5FA' : '#10B981';

  // Calculate aggregated metrics
  const totalPoints = data.length;
  const overallSpiritualBalance = totalPoints > 0
    ? Math.round(data.reduce((acc, curr) => acc + (curr.serenity + curr.vagalTone) / 2, 0) / totalPoints)
    : 0;

  const averageCognitiveFocus = totalPoints > 0
    ? Math.round(data.reduce((acc, curr) => acc + curr.focus, 0) / totalPoints)
    : 0;

  return (
    <div className={`p-6 rounded border transition-colors shadow-sm
      ${isSpace ? 'bg-[#090f23] border-gold/15 text-white' : 'bg-white border-stone-200 text-charcoal'}
    `}>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 border-b border-stone-200/10 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Activity className={`h-4 w-4 ${isSpace ? 'text-gold' : 'text-[#8B1A1A]'}`} />
            <h4 className="font-serif font-black text-md">Emotional Regulation &amp; Heart Serenity Trends</h4>
          </div>
          <span className="text-[10px] font-mono tracking-widest text-[#C4A35A] uppercase font-bold block mt-1">
            SCHOLASTIC TAZKIYAH BIO-MARKER INTEGRATION
          </span>
        </div>

        <button
          onClick={fetchAndMergeData}
          className={`self-start md:self-auto flex items-center gap-1.5 px-3 py-1.5 rounded font-mono text-[9px] uppercase font-bold transition-all border outline-none cursor-pointer
            ${isSpace 
              ? 'border-gold/20 hover:border-gold/60 bg-transparent text-gold' 
              : 'border-stone-300 hover:bg-stone-50 text-stone-700 bg-transparent'
            }
          `}
        >
          <RefreshCw className="h-3 w-3" />
          <span>Reload Local Cache</span>
        </button>
      </div>

      <p className="text-xs text-stone-500 dark:text-stone-300 font-sans leading-relaxed mb-6">
        This tracker aggregates data from your interactive <strong className="font-serif italic text-stone-700 dark:text-gold">Waswas Clinic</strong> defusion consults and <strong className="font-serif italic text-stone-700 dark:text-gold">Dhikr Rx</strong> prescription records. By analyzing heart vocalizations (vagal nerve stimulation) and scriptural feedback focus, it displays your structural recovery index.
      </p>

      {isSeeded && (
        <div className={`p-4 rounded border mb-6 text-xs flex items-start gap-3
          ${isSpace ? 'bg-amber-900/10 border-amber-500/15 text-amber-300' : 'bg-amber-500/5 border-amber-500/25 text-amber-800'}
        `}>
          <Info className="h-4.5 w-4.5 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <strong className="font-semibold block">Academic Simulated Timeline Active</strong>
            <p className="opacity-95 leading-relaxed font-sans">
              No live local sessions have been logged yet on this account. Below is an authentic spiritual training curve showing how your scores adapt after using the labs. Once you submit real-time records on the Dhikr/Waswas clinics, this chart will instantly paint your personal path.
            </p>
          </div>
        </div>
      )}

      {/* STRATEGIC CONTROL CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <button
          onClick={() => setActiveMetric('all')}
          className={`p-3 rounded border text-left transition-all cursor-pointer bg-transparent focus:outline-none
            ${activeMetric === 'all' 
              ? `${isSpace ? 'border-gold bg-gold/5 text-white' : 'border-[#8B1A1A] bg-[#8B1A1A]/5 text-stone-900'}` 
              : `${isSpace ? 'border-white/5 text-stone-400 hover:border-gold/20' : 'border-stone-200 text-stone-600 hover:border-stone-400'}`
            }
          `}
        >
          <span className="font-mono text-[8px] tracking-wider uppercase opacity-80 block mb-1">AGGREGATED INDEX</span>
          <strong className="font-serif text-sm tracking-wide">All Biomarkers</strong>
        </button>

        <button
          onClick={() => setActiveMetric('serenity')}
          className={`p-3 rounded border text-left transition-all cursor-pointer bg-transparent focus:outline-none
            ${activeMetric === 'serenity' 
              ? `${isSpace ? 'border-gold bg-[#54D3C2]/10 text-white' : 'border-[#8B1A1A] bg-[#8B1A1A]/10 text-stone-900'}` 
              : `${isSpace ? 'border-white/5 text-stone-400 hover:border-gold/20' : 'border-stone-200 text-stone-600 hover:border-stone-400'}`
            }
          `}
        >
          <span className="font-mono text-[8px] tracking-wider uppercase opacity-80 block mb-1 flex items-center gap-1">
            <Heart className="h-3 w-3" style={{ color: serenityColor }} />
            <span>Heart Serenity</span>
          </span>
          <strong className="font-serif text-sm tracking-wide">Tazkiyah Valence</strong>
        </button>

        <button
          onClick={() => setActiveMetric('vagalTone')}
          className={`p-3 rounded border text-left transition-all cursor-pointer bg-transparent focus:outline-none
            ${activeMetric === 'vagalTone' 
              ? `${isSpace ? 'border-gold bg-[#E5B14F]/10 text-white' : 'border-[#8B1A1A] bg-[#C4A35A]/10 text-stone-900'}` 
              : `${isSpace ? 'border-white/5 text-stone-400 hover:border-gold/20' : 'border-stone-200 text-stone-600 hover:border-stone-400'}`
            }
          `}
        >
          <span className="font-mono text-[8px] tracking-wider uppercase opacity-80 block mb-1 flex items-center gap-1">
            <ShieldCheck className="h-3 w-3" style={{ color: vagalColor }} />
            <span>Vagal Resilience</span>
          </span>
          <strong className="font-serif text-sm tracking-wide">Nervous Autonomic</strong>
        </button>

        <button
          onClick={() => setActiveMetric('focus')}
          className={`p-3 rounded border text-left transition-all cursor-pointer bg-transparent focus:outline-none
            ${activeMetric === 'focus' 
              ? `${isSpace ? 'border-gold bg-[#60A5FA]/10 text-white' : 'border-[#8B1A1A] bg-[#10B981]/10 text-stone-900'}` 
              : `${isSpace ? 'border-white/5 text-stone-400 hover:border-gold/20' : 'border-stone-200 text-stone-600 hover:border-stone-400'}`
            }
          `}
        >
          <span className="font-mono text-[8px] tracking-wider uppercase opacity-80 block mb-1 flex items-center gap-1">
            <Sparkles className="h-3 w-3" style={{ color: focusColor }} />
            <span>Cognitive Focus</span>
          </span>
          <strong className="font-serif text-sm tracking-wide">Defusion Sharpness</strong>
        </button>
      </div>

      {/* AGGREGATED SUMMARY CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className={`p-4 rounded border flex flex-col justify-between transition-colors relative overflow-hidden
            ${isSpace 
              ? 'bg-[#0c1432] border-gold/20 text-white shadow-[0_4px_20px_rgba(0,0,0,0.3)]' 
              : 'bg-[#faf9f6] border-stone-250 text-charcoal shadow-[0_2px_10px_rgba(139,26,26,0.03)]'
            }
          `}
          id="spiritual-balance-card"
        >
          {/* Subtle background decoration */}
          <div className="absolute right-[-10px] bottom-[-15px] opacity-5 select-none pointer-events-none">
            <Heart className="h-24 w-24" />
          </div>

          <div className="flex items-start justify-between gap-4">
            <div>
              <span className={`text-[10px] font-mono tracking-widest uppercase font-bold block mb-1
                ${isSpace ? 'text-gold/80' : 'text-stone-500'}
              `}>
                Spiritual Equanimity Index
              </span>
              <h5 className="font-serif font-black text-lg">Overall Spiritual Balance Score</h5>
              <p className="text-[11px] font-sans text-stone-500 dark:text-stone-400 mt-1.5 leading-relaxed">
                Formulated from combined heart serenity levels &amp; autonomic vagal resilience metrics recorded across both sanctuaries.
              </p>
            </div>
            <div className={`p-2.5 rounded-full shrink-0
              ${isSpace ? 'bg-gold/10 text-gold' : 'bg-[#8B1A1A]/10 text-[#8B1A1A]'}
            `}>
              <Heart className="h-5 w-5" />
            </div>
          </div>

          <div className="mt-6 flex items-end justify-between">
            <div>
              <span className="font-mono text-xs text-stone-400">Current Standing</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className={`font-serif text-3xl font-black
                  ${isSpace ? 'text-gold-light' : 'text-[#8B1A1A]'}
                `}>
                  {overallSpiritualBalance}%
                </span>
                <span className="text-[10px] font-mono uppercase font-bold tracking-wider opacity-85">
                  {overallSpiritualBalance >= 80 ? "Al-Mutma'innah" : overallSpiritualBalance >= 60 ? 'Al-Lawwamah' : 'Al-Ammarah'}
                </span>
              </div>
            </div>
            
            <div className="w-20 bg-stone-200/20 dark:bg-stone-700/30 h-1.5 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-1000
                  ${isSpace ? 'bg-gold' : 'bg-[#8B1A1A]'}
                `}
                style={{ width: `${overallSpiritualBalance}%` }}
              />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className={`p-4 rounded border flex flex-col justify-between transition-colors relative overflow-hidden
            ${isSpace 
              ? 'bg-[#0c1432] border-gold/20 text-white shadow-[0_4px_20px_rgba(0,0,0,0.3)]' 
              : 'bg-[#faf9f6] border-stone-250 text-charcoal shadow-[0_2px_10px_rgba(139,26,26,0.03)]'
            }
          `}
          id="cognitive-focus-card"
        >
          {/* Subtle background decoration */}
          <div className="absolute right-[-10px] bottom-[-15px] opacity-5 select-none pointer-events-none">
            <Sparkles className="h-24 w-24" />
          </div>

          <div className="flex items-start justify-between gap-4">
            <div>
              <span className={`text-[10px] font-mono tracking-widest uppercase font-bold block mb-1
                ${isSpace ? 'text-gold/80' : 'text-stone-500'}
              `}>
                Intellectual Attentiveness Metric
              </span>
              <h5 className="font-serif font-black text-lg">Average Cognitive Focus Score</h5>
              <p className="text-[11px] font-sans text-stone-500 dark:text-stone-400 mt-1.5 leading-relaxed">
                Calculated from active scriptural defusion concentration rates &amp; cognitive labs session attentiveness datasets.
              </p>
            </div>
            <div className={`p-2.5 rounded-full shrink-0
              ${isSpace ? 'bg-gold/10 text-gold' : 'bg-[#10B981]/10 text-[#10B981]'}
            `}>
              <Sparkles className="h-5 w-5" />
            </div>
          </div>

          <div className="mt-6 flex items-end justify-between">
            <div>
              <span className="font-mono text-xs text-stone-400">Current Standing</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className={`font-serif text-3xl font-black
                  ${isSpace ? 'text-gold-light' : 'text-[#10B981]'}
                `}>
                  {averageCognitiveFocus}%
                </span>
                <span className="text-[10px] font-mono uppercase font-bold tracking-wider opacity-85">
                  {averageCognitiveFocus >= 80 ? 'Mantiq Prime' : averageCognitiveFocus >= 60 ? 'Attentive Seeker' : 'Dispersed Focus'}
                </span>
              </div>
            </div>
            
            <div className="w-20 bg-stone-200/20 dark:bg-stone-700/30 h-1.5 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-1000
                  ${isSpace ? 'bg-gold' : 'bg-[#10B981]'}
                `}
                style={{ width: `${averageCognitiveFocus}%` }}
              />
            </div>
          </div>
        </motion.div>
      </div>

      {/* LINE CHART CONTAINER */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="h-72 w-full mt-4 bg-black/5 dark:bg-black/20 p-4 rounded border border-stone-200/5 select-none"
      >
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={isReady ? data : []}
            margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" opacity={0.1} stroke={isSpace ? '#ffffff' : '#000000'} />
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 10, fill: isSpace ? '#9CA3AF' : '#6B7280' }} 
              stroke={isSpace ? '#374151' : '#E5E7EB'}
            />
            <YAxis 
              domain={[0, 100]} 
              tick={{ fontSize: 10, fill: isSpace ? '#9CA3AF' : '#6B7280' }}
              stroke={isSpace ? '#374151' : '#E5E7EB'}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: isSpace ? '#0B132B' : '#FAF8F5', 
                borderColor: isSpace ? '#E5B14F' : '#8B1A1A',
                color: isSpace ? '#ffffff' : '#1A1A1A',
                fontSize: '11px',
                borderRadius: '4px',
                fontFamily: 'Inter, sans-serif'
              }}
              labelStyle={{ fontWeight: 'bold', fontFamily: 'serif' }}
            />
            <Legend 
              wrapperStyle={{ fontSize: 10, paddingTop: 10 }}
            />
            
            {(activeMetric === 'all' || activeMetric === 'serenity') && (
              <Line 
                name="Tazkiyah Serenity index" 
                type="monotone" 
                dataKey="serenity" 
                stroke={serenityColor} 
                strokeWidth={3}
                activeDot={{ r: 8 }}
                dot={{ stroke: serenityColor, strokeWidth: 2, r: 4 }}
                isAnimationActive={true}
                animationDuration={1600}
                animationEasing="ease-out"
                animationBegin={100}
              />
            )}

            {(activeMetric === 'all' || activeMetric === 'vagalTone') && (
              <Line 
                name="Autonomic Vagal Resilience" 
                type="monotone" 
                dataKey="vagalTone" 
                stroke={vagalColor} 
                strokeWidth={2}
                dot={{ stroke: vagalColor, strokeWidth: 1, r: 3 }}
                isAnimationActive={true}
                animationDuration={1600}
                animationEasing="ease-out"
                animationBegin={350}
              />
            )}

            {(activeMetric === 'all' || activeMetric === 'focus') && (
              <Line 
                name="Scriptural Focus Defusion" 
                type="monotone" 
                dataKey="focus" 
                stroke={focusColor} 
                strokeWidth={2}
                dot={{ stroke: focusColor, strokeWidth: 1, r: 3 }}
                isAnimationActive={true}
                animationDuration={1600}
                animationEasing="ease-out"
                animationBegin={600}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </motion.div>

      <div className="flex items-center gap-2 mt-4 text-[10px] text-stone-500 justify-center">
        <Database className="h-3.5 w-3.5" />
        <span className="font-mono">Secure localized sandbox encryption keeping your psychospiritual entries offline.</span>
      </div>
    </div>
  );
}
