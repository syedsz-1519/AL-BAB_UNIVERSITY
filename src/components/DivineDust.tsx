import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';

interface DivineDustProps {
  currentTheme: 'parchment' | 'space';
}

interface Mote {
  id: number;
  x: number; // percentage left
  y: number; // percentage top
  size: number; // size in px
  delay: number; // stagger delay
  duration: number; // speed
  color: string;
}

export default function DivineDust({ currentTheme }: DivineDustProps) {
  const isSpace = currentTheme === 'space';
  const [motes, setMotes] = useState<Mote[]>([]);

  useEffect(() => {
    // Generate simple, lightweight particles to prevent any DOM lag
    const count = window.innerWidth < 640 ? 12 : 24;
    const items: Mote[] = [];

    // Colors that look celestial/spiritual in both themes
    // Space: brilliant gold/amber, pale cyan stardust
    // Parchment: warm sunlit gold, subtle forest emerald motes
    const colors = isSpace
      ? ['rgba(232, 184, 109, 0.4)', 'rgba(196, 163, 90, 0.3)', 'rgba(165, 243, 252, 0.25)', 'rgba(255, 255, 255, 0.3)']
      : ['rgba(201, 147, 58, 0.25)', 'rgba(11, 70, 40, 0.15)', 'rgba(245, 230, 202, 0.4)', 'rgba(155, 28, 28, 0.15)'];

    for (let i = 0; i < count; i++) {
      items.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 4 + 2, // 2px to 6px
        delay: Math.random() * -20, // Negative delay to start immediately mid-animation
        duration: Math.random() * 25 + 20, // Slow graceful 20s to 45s float
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }
    setMotes(items);
  }, [currentTheme, isSpace]);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-20 select-none">
      {motes.map((mote) => (
        <motion.div
          key={mote.id}
          className="absolute rounded-full"
          style={{
            left: `${mote.x}%`,
            top: `${mote.y}%`,
            width: mote.size,
            height: mote.size,
            backgroundColor: mote.color,
            boxShadow: isSpace 
              ? `0 0 6px ${mote.color.replace(/0\.\d+/, '0.6')}`
              : `0 0 4px ${mote.color.replace(/0\.\d+/, '0.3')}`,
          }}
          animate={{
            y: [0, -120, -240], // Drift upward gracefully
            x: [0, Math.random() * 60 - 30, Math.random() * 120 - 60], // Sway gently sideways
            opacity: [0, 0.8, 0.8, 0],
            scale: [0.8, 1.2, 1, 0.8],
          }}
          transition={{
            duration: mote.duration,
            repeat: Infinity,
            delay: mote.delay,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}
