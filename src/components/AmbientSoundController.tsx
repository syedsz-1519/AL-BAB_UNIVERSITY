import React, { useState, useEffect, useRef } from 'react';
import * as LucideIcons from 'lucide-react';

interface AmbientSoundControllerProps {
  currentTheme: 'parchment' | 'space';
}

type SoundPreset = 'scholastic' | 'rain' | 'wind';

export default function AmbientSoundController({ currentTheme }: AmbientSoundControllerProps) {
  const isSpace = currentTheme === 'space';
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(30); // Percentage: 0 - 100
  const [selectedPreset, setSelectedPreset] = useState<SoundPreset>('scholastic');
  const [isOpen, setIsOpen] = useState(false);

  // Web Audio Nodes references
  const audioCtxRef = useRef<AudioContext | null>(null);
  const masterGainNodeRef = useRef<GainNode | null>(null);
  
  // Oscillators for scholastic hum
  const humOscsRef = useRef<OscillatorNode[]>([]);
  const humGainsRef = useRef<GainNode[]>([]);
  
  // Noise sources for rain and wind
  const noiseSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const filterNodeRef = useRef<BiquadFilterNode | null>(null);
  
  // Animation frames or intervals for LFOs
  const modulationIntervalRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Sync volume state to gain node
  useEffect(() => {
    if (masterGainNodeRef.current && audioCtxRef.current) {
      const dbVolume = volume / 100;
      masterGainNodeRef.current.gain.setValueAtTime(dbVolume * 0.5, audioCtxRef.current.currentTime);
    }
  }, [volume]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopAllSounds();
      if (audioCtxRef.current) {
        audioCtxRef.current.close();
      }
    };
  }, []);

  // Re-configure audio when preset changes and we are playing
  useEffect(() => {
    if (isPlaying) {
      // Re-initialize correct audio chain
      stopActiveSources();
      startPresetSound();
    }
  }, [selectedPreset]);

  // Initialize Audio Context if not already done
  const initAudio = () => {
    if (!audioCtxRef.current) {
      // Handle browser prefixes if needed
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      audioCtxRef.current = new AudioCtx();
      
      // Create Master Gain
      const masterGain = audioCtxRef.current.createGain();
      const dbVolume = volume / 100;
      masterGain.gain.setValueAtTime(dbVolume * 0.5, audioCtxRef.current.currentTime);
      masterGain.connect(audioCtxRef.current.destination);
      masterGainNodeRef.current = masterGain;
    }
    
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
  };

  // Generate White Noise Buffer
  const createNoiseBuffer = () => {
    if (!audioCtxRef.current) return null;
    const bufferSize = audioCtxRef.current.sampleRate * 2; // 2 seconds of loop
    const buffer = audioCtxRef.current.createBuffer(1, bufferSize, audioCtxRef.current.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    return buffer;
  };

  const stopActiveSources = () => {
    // Clear modulation intervals
    if (modulationIntervalRef.current) {
      clearInterval(modulationIntervalRef.current);
      modulationIntervalRef.current = null;
    }

    // Stop and clear Scholastic Hum Oscillators
    humOscsRef.current.forEach((osc) => {
      try { osc.stop(); } catch (e) {}
    });
    humOscsRef.current = [];
    humGainsRef.current = [];

    // Stop and clear Noise sources
    if (noiseSourceRef.current) {
      try { noiseSourceRef.current.stop(); } catch (e) {}
      noiseSourceRef.current = null;
    }
    if (filterNodeRef.current) {
      filterNodeRef.current = null;
    }
  };

  const stopAllSounds = () => {
    stopActiveSources();
    setIsPlaying(false);
  };

  const startPresetSound = () => {
    if (!audioCtxRef.current || !masterGainNodeRef.current) return;
    const ctx = audioCtxRef.current;
    const master = masterGainNodeRef.current;

    if (selectedPreset === 'scholastic') {
      // --- SCHOLASTIC HUM SYNTHESIS (ANCIENT Scriptorium Resonance) ---
      // Low organic, spiritual, rich multi-layered drone (110Hz, 165Hz, 220Hz, 330Hz)
      const frequencies = [110, 165, 220, 330];
      const gains = [0.4, 0.25, 0.2, 0.1]; // balance amplitudes

      frequencies.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();

        // Mix of sine (pure warm resonance) and triangle (warm harmonics)
        osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime);

        gainNode.gain.setValueAtTime(gains[idx] * 0.7, ctx.currentTime);
        
        osc.connect(gainNode);
        gainNode.connect(master);
        
        osc.start();

        humOscsRef.current.push(osc);
        humGainsRef.current.push(gainNode);
      });

      // Ambient dynamic modulation (Slow organic volume swaying to simulate human library breath)
      let phase = 0;
      modulationIntervalRef.current = setInterval(() => {
        if (!ctx || humGainsRef.current.length === 0) return;
        phase += 0.05;
        humGainsRef.current.forEach((gainNode, idx) => {
          // Unique wave offset for each node to ensure non-synchronous breathing
          const modulation = 1 + 0.25 * Math.sin(phase + idx * 1.5);
          try {
            gainNode.gain.setTargetAtTime(gains[idx] * 0.7 * modulation, ctx.currentTime, 0.2);
          } catch (e) {}
        });
      }, 100);

    } else if (selectedPreset === 'rain') {
      // --- NATURE FOCUS: SOFT STUDY SHOWER ---
      // Synthesizes soothing raindrops on window panes using bandpass-filtered noise
      const buffer = createNoiseBuffer();
      if (!buffer) return;

      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(750, ctx.currentTime); // Soft muffling of rain
      filter.Q.setValueAtTime(1.0, ctx.currentTime);

      // Second-order filter to add realistic splashy resonant texture
      const resonanceFilter = ctx.createBiquadFilter();
      resonanceFilter.type = 'peaking';
      resonanceFilter.frequency.setValueAtTime(2200, ctx.currentTime);
      resonanceFilter.gain.setValueAtTime(2.5, ctx.currentTime);
      resonanceFilter.Q.setValueAtTime(3.0, ctx.currentTime);

      source.connect(filter);
      filter.connect(resonanceFilter);
      resonanceFilter.connect(master);

      source.start();
      noiseSourceRef.current = source;
      filterNodeRef.current = filter;

      // Slow dynamic micro-shivers (rain gusts)
      let phase = 0;
      modulationIntervalRef.current = setInterval(() => {
        if (!ctx || !filterNodeRef.current) return;
        phase += 0.1;
        const randomShowerIntensity = 750 + 120 * Math.sin(phase) + (Math.random() - 0.5) * 50;
        try {
          filterNodeRef.current.frequency.setTargetAtTime(randomShowerIntensity, ctx.currentTime, 0.4);
        } catch (e) {}
      }, 150);

    } else if (selectedPreset === 'wind') {
      // --- MEDITATIVE DESERT WIND (Spiritual Breeze) ---
      // Bandpass-filtered white noise mimicking mountain/desert wind howling softly
      const buffer = createNoiseBuffer();
      if (!buffer) return;

      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(320, ctx.currentTime);
      filter.Q.setValueAtTime(2.5, ctx.currentTime); // Narrow band for a whistling breeze

      source.connect(filter);
      filter.connect(master);

      source.start();
      noiseSourceRef.current = source;
      filterNodeRef.current = filter;

      // Wind sweep modulation using brownian noise-like random walks
      let targetFreq = 320;
      modulationIntervalRef.current = setInterval(() => {
        if (!ctx || !filterNodeRef.current) return;
        // Slowly change target frequency in a beautiful wave
        const timeFactor = Date.now() * 0.00015;
        targetFreq = 340 + 150 * Math.sin(timeFactor) + 80 * Math.sin(timeFactor * 2.3);
        const randomGust = (Math.random() - 0.5) * 20;
        
        try {
          filterNodeRef.current.frequency.setTargetAtTime(targetFreq + randomGust, ctx.currentTime, 0.8);
          // Modulate Q slightly to change the "narrowness" or "chillness" of the wind
          const targetQ = 1.8 + 1.2 * Math.cos(timeFactor * 1.7);
          filterNodeRef.current.Q.setTargetAtTime(targetQ, ctx.currentTime, 0.8);
        } catch (e) {}
      }, 200);
    }
  };

  const togglePlayback = () => {
    initAudio();
    if (isPlaying) {
      stopAllSounds();
    } else {
      setIsPlaying(true);
      // Give context a brief moment to resume before playing sound
      setTimeout(() => {
        startPresetSound();
      }, 25);
    }
  };

  const selectPreset = (preset: SoundPreset) => {
    initAudio();
    setSelectedPreset(preset);
    if (!isPlaying) {
      setIsPlaying(true);
      setTimeout(() => {
        startPresetSound();
      }, 25);
    }
  };

  return (
    <div className="relative inline-block" ref={containerRef}>
      {/* TRIGGER BUTTON */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`p-1.5 sm:p-2 rounded-full transition-all duration-300 relative group cursor-pointer flex items-center gap-1.5
          ${isSpace 
            ? 'bg-[#2F2113]/40 text-[#EBC15A] border-2 border-gold/40 hover:border-gold' 
            : 'bg-stone-200/90 text-black border-2 border-stone-300 hover:border-stone-500'
          }
          ${isPlaying ? 'animate-pulse' : ''}
        `}
        title="Ambient Study Sounds"
      >
        <div className="relative h-4 w-4 sm:h-4.5 sm:w-4.5 flex items-center justify-center">
          {isPlaying ? (
            // Equalizer animation when playing
            <div className="flex items-end gap-0.5 h-3.5 w-3.5 sm:h-4 sm:w-4">
              <span className={`w-[2.5px] rounded-[1px] animate-[bounce_1s_infinite_100ms] ${isSpace ? 'bg-gold' : 'bg-crimson'}`} style={{ height: '30%' }} />
              <span className={`w-[2.5px] rounded-[1px] animate-[bounce_0.8s_infinite_300ms] ${isSpace ? 'bg-gold' : 'bg-crimson'}`} style={{ height: '80%' }} />
              <span className={`w-[2.5px] rounded-[1px] animate-[bounce_1.2s_infinite_500ms] ${isSpace ? 'bg-gold' : 'bg-crimson'}`} style={{ height: '50%' }} />
            </div>
          ) : (
            <LucideIcons.Headphones className="h-4 w-4 sm:h-4.5 sm:w-4.5 transition-transform duration-300 group-hover:scale-110" />
          )}
        </div>
        <span className="hidden md:inline text-[9px] font-mono tracking-widest uppercase font-black opacity-85 px-0.5">
          {isPlaying ? 'ACTIVE' : 'SOUND'}
        </span>
      </button>

      {/* FLOATING CONTROL POPOVER */}
      {isOpen && (
        <div 
          className={`absolute right-0 mt-2 w-64 p-4 border rounded-sm shadow-2xl z-50 animate-fade-in-up transition-all duration-300
            ${isSpace 
              ? 'bg-[#0a0f1d] border-gold/25 text-white shadow-[0_10px_30px_rgba(0,0,0,0.6)]' 
              : 'bg-[#FFFDF9] border-stone-200 text-[#0b4628] shadow-[0_10px_30px_rgba(11,70,40,0.15)]'
            }
          `}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-3 border-b pb-2 border-stone-200/10 dark:border-stone-800/40">
            <div className="flex items-center gap-1.5">
              <LucideIcons.Volume2 className={`h-4 w-4 ${isSpace ? 'text-gold' : 'text-crimson'}`} />
              <span className="text-[10px] font-mono tracking-widest font-black uppercase">
                AMBIENT IMMERSION
              </span>
            </div>
            <button
              onClick={togglePlayback}
              className={`text-[9px] font-mono tracking-wider px-2 py-0.5 rounded-sm uppercase transition-all duration-200 font-bold border cursor-pointer
                ${isPlaying
                  ? 'bg-red-500/10 border-red-500 text-red-500 hover:bg-red-500/20'
                  : isSpace
                    ? 'bg-gold/10 border-gold text-gold hover:bg-gold/20'
                    : 'bg-crimson/10 border-crimson text-crimson hover:bg-crimson/20'
                }
              `}
            >
              {isPlaying ? 'STOP' : 'START'}
            </button>
          </div>

          {/* Preset Buttons */}
          <div className="flex flex-col gap-1.5 mb-4">
            <span className="text-[8px] font-mono tracking-widest text-stone-400 dark:text-stone-500 font-bold uppercase mb-1">
              Select Scholar Atmosphere:
            </span>
            
            {/* Presets Grid */}
            <button
              onClick={() => selectPreset('scholastic')}
              className={`flex items-center justify-between px-3 py-2 border text-left rounded-sm transition-all duration-200 cursor-pointer
                ${selectedPreset === 'scholastic' && isPlaying
                  ? isSpace
                    ? 'bg-gold/10 border-gold text-white font-bold'
                    : 'bg-stone-100 border-[#0b4628] text-[#0b4628] font-bold'
                  : isSpace
                    ? 'bg-[#030712]/50 border-gold/10 text-stone-400 hover:border-gold/30 hover:text-white'
                    : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100'
                }
              `}
            >
              <div className="flex items-center gap-2">
                <LucideIcons.Library className="h-3.5 w-3.5 opacity-80" />
                <div className="flex flex-col">
                  <span className="text-[11px] font-serif font-bold">Academic Library Hum</span>
                  <span className="text-[8px] font-mono opacity-60">Warm acoustic drone loop</span>
                </div>
              </div>
              {selectedPreset === 'scholastic' && isPlaying && (
                <span className={`w-1.5 h-1.5 rounded-full ${isSpace ? 'bg-gold' : 'bg-crimson'} animate-ping`} />
              )}
            </button>

            <button
              onClick={() => selectPreset('rain')}
              className={`flex items-center justify-between px-3 py-2 border text-left rounded-sm transition-all duration-200 cursor-pointer
                ${selectedPreset === 'rain' && isPlaying
                  ? isSpace
                    ? 'bg-gold/10 border-gold text-white font-bold'
                    : 'bg-stone-100 border-[#0b4628] text-[#0b4628] font-bold'
                  : isSpace
                    ? 'bg-[#030712]/50 border-gold/10 text-stone-400 hover:border-gold/30 hover:text-white'
                    : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100'
                }
              `}
            >
              <div className="flex items-center gap-2">
                <LucideIcons.CloudRain className="h-3.5 w-3.5 opacity-80" />
                <div className="flex flex-col">
                  <span className="text-[11px] font-serif font-bold">Study Rain Shower</span>
                  <span className="text-[8px] font-mono opacity-60">Nature focus static filter</span>
                </div>
              </div>
              {selectedPreset === 'rain' && isPlaying && (
                <span className={`w-1.5 h-1.5 rounded-full ${isSpace ? 'bg-gold' : 'bg-crimson'} animate-ping`} />
              )}
            </button>

            <button
              onClick={() => selectPreset('wind')}
              className={`flex items-center justify-between px-3 py-2 border text-left rounded-sm transition-all duration-200 cursor-pointer
                ${selectedPreset === 'wind' && isPlaying
                  ? isSpace
                    ? 'bg-gold/10 border-gold text-white font-bold'
                    : 'bg-stone-100 border-[#0b4628] text-[#0b4628] font-bold'
                  : isSpace
                    ? 'bg-[#030712]/50 border-gold/10 text-stone-400 hover:border-gold/30 hover:text-white'
                    : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100'
                }
              `}
            >
              <div className="flex items-center gap-2">
                <LucideIcons.Wind className="h-3.5 w-3.5 opacity-80" />
                <div className="flex flex-col">
                  <span className="text-[11px] font-serif font-bold">Desert Wind Breeze</span>
                  <span className="text-[8px] font-mono opacity-60">Soft acoustic whistling</span>
                </div>
              </div>
              {selectedPreset === 'wind' && isPlaying && (
                <span className={`w-1.5 h-1.5 rounded-full ${isSpace ? 'bg-gold' : 'bg-crimson'} animate-ping`} />
              )}
            </button>
          </div>

          {/* Volume Control */}
          <div className="border-t border-stone-200/10 pt-3 dark:border-stone-800/40">
            <div className="flex justify-between items-center mb-1">
              <span className="text-[8px] font-mono tracking-widest text-stone-400 dark:text-stone-500 font-bold uppercase">
                ATMOSPHERE VOLUME: {volume}%
              </span>
              <button 
                onClick={() => setVolume(v => v === 0 ? 30 : 0)}
                className="hover:scale-110 transition-transform cursor-pointer"
              >
                {volume === 0 ? (
                  <LucideIcons.VolumeX className="h-3.5 w-3.5 opacity-70" />
                ) : (
                  <LucideIcons.Volume2 className="h-3.5 w-3.5 opacity-70" />
                )}
              </button>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={volume}
              onChange={(e) => {
                setVolume(parseInt(e.target.value));
                if (!isPlaying) {
                  // Auto-start if sliding volume
                  togglePlayback();
                }
              }}
              className={`w-full h-1 rounded-lg appearance-none cursor-pointer
                ${isSpace ? 'bg-stone-800 accent-gold' : 'bg-stone-200 accent-crimson'}
              `}
              style={{
                background: isSpace 
                  ? `linear-gradient(to right, #E8B86D 0%, #E8B86D ${volume}%, #292524 ${volume}%, #292524 100%)`
                  : `linear-gradient(to right, #9B1C1C 0%, #9B1C1C ${volume}%, #E7E5E4 ${volume}%, #E7E5E4 100%)`
              }}
            />
          </div>

          {/* Information */}
          <p className="text-[8px] font-mono text-center text-stone-400 dark:text-stone-500 mt-3 leading-tight uppercase font-bold opacity-80">
            Synthesized dynamically in real-time. No static bandwidth usage.
          </p>
        </div>
      )}
    </div>
  );
}
