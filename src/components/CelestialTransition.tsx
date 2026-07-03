import React, { useEffect, useRef } from 'react';
import { motion } from 'motion/react';

interface CelestialTransitionProps {
  previousTheme: 'parchment' | 'space';
  currentTheme: 'parchment' | 'space';
  onComplete: () => void;
}

interface Star {
  x: number;
  y: number;
  z: number;
  px: number;
  py: number;
  color: string;
  size: number;
}

interface Spark {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  decay: number;
}

export default function CelestialTransition({ previousTheme, currentTheme, onComplete }: CelestialTransitionProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle high-DPI screens
    const resizeCanvas = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.scale(dpr, dpr);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const width = window.innerWidth;
    const height = window.innerHeight;

    // Origin of the circular screen wipe (near the top-right theme toggle button)
    const x0 = width * 0.9;
    const y0 = 50;
    const maxRadius = Math.sqrt(Math.pow(x0, 2) + Math.pow(height - y0, 2)) * 1.1;

    // Initialize 3D Stars
    const starCount = width < 640 ? 100 : 220;
    const stars: Star[] = [];
    const isToSpace = currentTheme === 'space';

    const starColors = isToSpace
      ? ['#F5E6CA', '#E8B86D', '#C4A35A', '#E2E8F0', '#93C5FD', '#A5F3FC', '#FFFFFF']
      : ['#A5F3FC', '#93C5FD', '#C084FC', '#F5E6CA', '#E8B86D', '#FDBA74', '#FAF8F5'];

    for (let i = 0; i < starCount; i++) {
      stars.push({
        x: (Math.random() - 0.5) * 2000,
        y: (Math.random() - 0.5) * 2000,
        z: Math.random() * 1000,
        px: 0,
        py: 0,
        color: starColors[Math.floor(Math.random() * starColors.length)],
        size: Math.random() * 1.5 + 0.5,
      });
    }

    // Boundary Sparks for the screen wipe
    const sparks: Spark[] = [];
    let sparkId = 0;
    const sparkColors = isToSpace 
      ? ['#E8B86D', '#C4A35A', '#A5F3FC', '#38BDF8', '#FFFFFF']
      : ['#0B4628', '#C9933A', '#9B1C1C', '#E8B86D', '#F5E6CA'];

    let animationFrameId: number;
    const startTime = Date.now();
    const duration = 1800; // 1.8 seconds for an immersive journey

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      const w = window.innerWidth;
      const h = window.innerHeight;

      // Theme Colors
      const spaceBg = { r: 2, g: 5, b: 9 };
      const parchmentBg = { r: 250, g: 246, b: 239 };

      const fromBg = previousTheme === 'space' ? spaceBg : parchmentBg;
      const toBg = currentTheme === 'space' ? spaceBg : parchmentBg;

      // Clear with previous theme background first
      ctx.fillStyle = `rgb(${fromBg.r}, ${fromBg.g}, ${fromBg.b})`;
      ctx.fillRect(0, 0, w, h);

      // --- CIRCULAR SCREEN WIPE ---
      // Wipe expands over the first 65% of the animation
      const wipeProgress = Math.min(progress / 0.65, 1);
      const radius = wipeProgress * maxRadius;

      if (radius > 0) {
        ctx.save();
        
        // Create clipping region of the expanding circle
        ctx.beginPath();
        ctx.arc(x0, y0, radius, 0, Math.PI * 2);
        ctx.clip();

        // Draw new theme background inside the clipped circle
        ctx.fillStyle = `rgb(${toBg.r}, ${toBg.g}, ${toBg.b})`;
        ctx.fillRect(0, 0, w, h);

        ctx.restore();
      }

      // --- SPAWN SPARK PARTICLES AT THE WIPE BOUNDARY ---
      if (wipeProgress > 0 && wipeProgress < 1) {
        // Spawn sparks along the circle edge
        const spawnCount = w < 640 ? 4 : 8;
        for (let s = 0; s < spawnCount; s++) {
          // Angle centered towards the screen direction from top-right
          const angle = Math.PI * 0.5 + (Math.random() - 0.5) * Math.PI * 1.1;
          const sx = x0 + radius * Math.cos(angle);
          const sy = y0 + radius * Math.sin(angle);

          // Only spawn if within viewport plus bounds
          if (sx >= -50 && sx <= w + 50 && sy >= -50 && sy <= h + 50) {
            // Push outwards
            const speed = Math.random() * 4 + 2;
            const vx = Math.cos(angle) * speed + (Math.random() - 0.5) * 1.5;
            const vy = Math.sin(angle) * speed + (Math.random() - 0.5) * 1.5;

            sparks.push({
              id: sparkId++,
              x: sx,
              y: sy,
              vx,
              vy,
              size: Math.random() * 4 + 2,
              color: sparkColors[Math.floor(Math.random() * sparkColors.length)],
              alpha: 1.0,
              decay: Math.random() * 0.03 + 0.015,
            });
          }
        }
      }

      // --- UPDATE & RENDER SPARKS ---
      for (let i = sparks.length - 1; i >= 0; i--) {
        const spark = sparks[i];
        spark.x += spark.vx;
        spark.y += spark.vy;
        spark.alpha -= spark.decay;
        spark.size *= 0.96;

        if (spark.alpha <= 0 || spark.size < 0.5) {
          sparks.splice(i, 1);
          continue;
        }

        ctx.beginPath();
        ctx.arc(spark.x, spark.y, spark.size, 0, Math.PI * 2);
        ctx.fillStyle = spark.color;
        ctx.globalAlpha = spark.alpha;
        
        // Add subtle bloom
        ctx.shadowBlur = spark.size * 2;
        ctx.shadowColor = spark.color;
        
        ctx.fill();
        ctx.shadowBlur = 0; // reset
      }
      ctx.globalAlpha = 1.0;

      // --- DYNAMIC STARS HYPERDRIVE (CELESTIAL JOURNEY) ---
      // Speed ramp: accelerates to warp during 30% - 75% then slows down
      let speedFactor = 1;
      if (progress < 0.3) {
        const t = progress / 0.3;
        speedFactor = 1 + t * t * 35;
      } else if (progress < 0.75) {
        const t = (progress - 0.3) / 0.45;
        speedFactor = 36 - t * t * 26;
      } else {
        const t = (progress - 0.75) / 0.25;
        speedFactor = 10 - t * 9;
      }

      // Render 3D Stars
      stars.forEach((star) => {
        const k = 128.0 / star.z;
        const prevPx = (star.x * k) + w / 2;
        const prevPy = (star.y * k) + h / 2;

        star.z -= speedFactor;

        if (star.z <= 0) {
          star.z = 1000;
          star.x = (Math.random() - 0.5) * 2000;
          star.y = (Math.random() - 0.5) * 2000;
          return;
        }

        const newK = 128.0 / star.z;
        const currPx = (star.x * newK) + w / 2;
        const currPy = (star.y * newK) + h / 2;

        star.px = currPx;
        star.py = currPy;

        if (currPx >= 0 && currPx <= w && currPy >= 0 && currPy <= h && star.z < 1000) {
          const alpha = Math.min(1, (1000 - star.z) / 400) * (1 - Math.pow(Math.abs(progress - 0.5) * 2, 4));
          
          if (alpha > 0.05) {
            ctx.beginPath();
            if (speedFactor > 12) {
              // Streak trails during warp speed
              ctx.strokeStyle = star.color;
              ctx.lineWidth = star.size * (speedFactor / 20) * (1.5 - star.z / 1000);
              ctx.globalAlpha = alpha * 0.85;
              ctx.moveTo(prevPx, prevPy);
              ctx.lineTo(currPx, currPy);
              ctx.stroke();
            } else {
              // Normal twinkling stardust
              ctx.fillStyle = star.color;
              ctx.globalAlpha = alpha;
              ctx.arc(currPx, currPy, star.size * (1.5 - star.z / 1000) * 1.5, 0, Math.PI * 2);
              ctx.fill();
            }
          }
        }
      });
      ctx.globalAlpha = 1.0;

      // --- SCREEN SHINE / WIPING HIGHLIGHT LINE ---
      // Draw a gold/white shimmering ring at the wipe boundary for high-end aesthetic
      if (wipeProgress > 0 && wipeProgress < 1) {
        ctx.beginPath();
        ctx.arc(x0, y0, radius, 0, Math.PI * 2);
        
        const boundaryGrad = ctx.createRadialGradient(x0, y0, radius - 15, x0, y0, radius + 5);
        boundaryGrad.addColorStop(0, 'rgba(255,255,255,0)');
        boundaryGrad.addColorStop(0.5, isToSpace ? 'rgba(232, 184, 109, 0.7)' : 'rgba(11, 70, 40, 0.45)');
        boundaryGrad.addColorStop(0.8, 'rgba(255,255,255,0.9)');
        boundaryGrad.addColorStop(1, 'rgba(255,255,255,0)');
        
        ctx.strokeStyle = boundaryGrad;
        ctx.lineWidth = w < 640 ? 6 : 12;
        ctx.stroke();
      }

      // --- OVERALL FADE OUT ENTRANCE ---
      // Smoothly fade out the entire canvas over the last 15% of the transition
      if (progress > 0.85) {
        const fadeAlpha = (1 - progress) / 0.15;
        ctx.fillStyle = isToSpace ? `rgba(2, 5, 9, ${1 - fadeAlpha})` : `rgba(250, 246, 239, ${1 - fadeAlpha})`;
        ctx.globalAlpha = 1 - fadeAlpha;
        ctx.fillRect(0, 0, w, h);
        ctx.globalAlpha = 1.0;
      }

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(animate);
      } else {
        onComplete();
      }
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [previousTheme, currentTheme, onComplete]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-[99999] pointer-events-none select-none overflow-hidden"
    >
      <canvas
        ref={canvasRef}
        className="block w-full h-full"
      />
    </motion.div>
  );
}
