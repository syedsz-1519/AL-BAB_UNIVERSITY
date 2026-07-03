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

    // Initialize 3D Stars
    const starCount = window.innerWidth < 640 ? 120 : 250;
    const stars: Star[] = [];
    const isToSpace = currentTheme === 'space';

    const starColors = isToSpace
      // Transitioning to space: start gold/amber (parchment) and morph to cyan/blue/white (space)
      ? ['#F5E6CA', '#E8B86D', '#C4A35A', '#E2E8F0', '#93C5FD', '#A5F3FC', '#FFFFFF']
      // Transitioning to parchment: start cool whites/blues/purples and morph to warm embers
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

    let animationFrameId: number;
    const startTime = Date.now();
    const duration = 1600; // 1.6s total transition time

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      const width = window.innerWidth;
      const height = window.innerHeight;

      // Clear with progressive tail/vignette fade
      // Ramping up opacity of background from previous theme color to current theme color
      const fromBg = previousTheme === 'space' ? { r: 2, g: 5, b: 9 } : { r: 250, g: 246, b: 239 };
      const toBg = currentTheme === 'space' ? { r: 2, g: 5, b: 9 } : { r: 250, g: 246, b: 239 };

      const r = Math.round(fromBg.r + (toBg.r - fromBg.r) * progress);
      const g = Math.round(fromBg.g + (toBg.g - fromBg.g) * progress);
      const b = Math.round(fromBg.b + (toBg.b - fromBg.b) * progress);

      // Create a gorgeous trailing alpha depending on speed (faster = lower alpha = longer streaks)
      // Speed ramp: starts moderate, warps to maximum around 40-70% of the transition, then decelerates
      let speedFactor = 1;
      if (progress < 0.4) {
        // Accelerating warp speed: easeInQuadratic
        const t = progress / 0.4;
        speedFactor = 2 + t * t * 45; 
      } else if (progress < 0.8) {
        // High speed cruise / peak celestial journey
        const t = (progress - 0.4) / 0.4;
        speedFactor = 47 - t * 35; // gradually decelerate from peak
      } else {
        // Slowing down to enter the destination theme
        const t = (progress - 0.8) / 0.2;
        speedFactor = 12 - t * 10;
      }

      // Trail opacity: at peak speed, we want more trails, so we use low background opacity
      const trailAlpha = Math.max(0.08, 0.35 - (speedFactor / 55) * 0.25);
      ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${trailAlpha})`;
      ctx.fillRect(0, 0, width, height);

      // Render & update stars
      stars.forEach((star) => {
        // Save previous projected coordinates for drawing the hyperdrive lines
        const k = 128.0 / star.z;
        const prevPx = (star.x * k) + width / 2;
        const prevPy = (star.y * k) + height / 2;

        // Move star closer to observer (decreasing Z)
        star.z -= speedFactor;

        // Recycle star to back of field if it flies past the camera viewport
        if (star.z <= 0) {
          star.z = 1000;
          star.x = (Math.random() - 0.5) * 2000;
          star.y = (Math.random() - 0.5) * 2000;
          return;
        }

        // Compute new projected coordinates
        const newK = 128.0 / star.z;
        const currPx = (star.x * newK) + width / 2;
        const currPy = (star.y * newK) + height / 2;

        star.px = currPx;
        star.py = currPy;

        // Only draw if within reasonable bounds
        if (currPx >= 0 && currPx <= width && currPy >= 0 && currPy <= height && star.z < 1000) {
          // Compute brightness based on distance Z (nearer is brighter and larger)
          const alpha = Math.min(1, (1000 - star.z) / 300);
          
          // Draw star/streak line
          ctx.beginPath();
          
          if (speedFactor > 15) {
            // Draw stunning streak lines
            ctx.strokeStyle = star.color;
            ctx.lineWidth = star.size * (speedFactor / 25) * (1.5 - star.z / 1000);
            ctx.globalAlpha = alpha * 0.8;
            ctx.moveTo(prevPx, prevPy);
            ctx.lineTo(currPx, currPy);
            ctx.stroke();
          } else {
            // Draw glowing circles
            ctx.fillStyle = star.color;
            ctx.globalAlpha = alpha;
            ctx.arc(currPx, currPy, star.size * (1.5 - star.z / 1000) * 1.5, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      });

      ctx.globalAlpha = 1.0; // Reset alpha for other draws

      // Draw celestial portal gateway vignette
      const grad = ctx.createRadialGradient(width / 2, height / 2, width * 0.1, width / 2, height / 2, width * 0.8);
      grad.addColorStop(0, 'rgba(0,0,0,0)');
      
      if (isToSpace) {
        // Fading to cosmic space
        grad.addColorStop(1, `rgba(2, 5, 9, ${Math.min(0.8, progress * 1.2)})`);
      } else {
        // Fading to celestial parchment
        grad.addColorStop(1, `rgba(250, 246, 239, ${Math.min(0.8, progress * 1.2)})`);
      }
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

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
