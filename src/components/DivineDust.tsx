import React, { useEffect, useRef } from 'react';

interface DivineDustProps {
  currentTheme: 'parchment' | 'space';
}

interface Star {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  baseAlpha: number;
  alpha: number;
  twinkleSpeed: number;
  color: string;
}

export default function DivineDust({ currentTheme }: DivineDustProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mouseRef = useRef<{ x: number; y: number; active: boolean; lastMove: number }>({
    x: 0,
    y: 0,
    active: false,
    lastMove: 0,
  });

  const isSpace = currentTheme === 'space';

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let stars: Star[] = [];
    const isMobile = window.innerWidth < 768;
    const starCount = isSpace ? (isMobile ? 35 : 75) : (isMobile ? 15 : 30);

    // Setup Canvas Size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initializeStars();
    };

    const initializeStars = () => {
      stars = [];
      const colors = isSpace
        ? [
            'rgba(232, 184, 109, ',  // Gold #E8B86D
            'rgba(196, 163, 90, ',   // Darker Gold
            'rgba(165, 243, 252, ',  // Pale cyan stardust
            'rgba(255, 255, 255, ',  // Pure white
          ]
        : [
            'rgba(201, 147, 58, ',   // Warm gold
            'rgba(11, 70, 40, ',     // Dark green
            'rgba(155, 28, 28, ',    // Crimson
          ];

      for (let i = 0; i < starCount; i++) {
        const radius = Math.random() * (isSpace ? 2.5 : 3) + 0.8;
        stars.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * (isSpace ? 0.3 : 0.15),
          vy: (Math.random() - 0.5) * (isSpace ? 0.3 : 0.15) - (isSpace ? 0.05 : 0.15), // Drifts upwards slightly
          radius,
          baseAlpha: Math.random() * 0.4 + 0.3, // 0.3 to 0.7
          alpha: Math.random(),
          twinkleSpeed: Math.random() * 0.02 + 0.005,
          color: colors[Math.floor(Math.random() * colors.length)],
        });
      }
    };

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    // Mouse Tracking on entire window (background pointer-events-none won't block it, 
    // and we capture events globally)
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
      mouseRef.current.active = true;
      mouseRef.current.lastMove = Date.now();
    };

    const handleMouseLeave = () => {
      mouseRef.current.active = false;
    };

    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);

    // Animation Loop
    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const now = Date.now();
      // Disable mouse tracking if idle for 3 seconds
      if (mouseRef.current.active && now - mouseRef.current.lastMove > 3000) {
        mouseRef.current.active = false;
      }

      const mouse = mouseRef.current;
      const connectionDist = 110;
      const mouseConnectionDist = 160;

      // Draw Connection Lines (Only in 'space' theme)
      if (isSpace) {
        for (let i = 0; i < stars.length; i++) {
          const s1 = stars[i];

          // Star-to-Star connections
          for (let j = i + 1; j < stars.length; j++) {
            const s2 = stars[j];
            const dx = s1.x - s2.x;
            const dy = s1.y - s2.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < connectionDist) {
              const alpha = (1 - dist / connectionDist) * 0.15 * Math.min(s1.alpha, s2.alpha);
              ctx.beginPath();
              ctx.moveTo(s1.x, s1.y);
              ctx.lineTo(s2.x, s2.y);
              ctx.strokeStyle = `rgba(201, 147, 58, ${alpha})`; // Gold constellation lines
              ctx.lineWidth = 0.6;
              ctx.stroke();
            }
          }

          // Star-to-Mouse connections
          if (mouse.active) {
            const mdx = s1.x - mouse.x;
            const mdy = s1.y - mouse.y;
            const mdist = Math.sqrt(mdx * mdx + mdy * mdy);

            if (mdist < mouseConnectionDist) {
              const alpha = (1 - mdist / mouseConnectionDist) * 0.35 * s1.alpha;
              ctx.beginPath();
              ctx.moveTo(s1.x, s1.y);
              ctx.lineTo(mouse.x, mouse.y);
              
              // Cyan/Gold dual gradient-like or elegant stardust color connection
              if (s1.color.includes('165, 243, 252')) {
                ctx.strokeStyle = `rgba(165, 243, 252, ${alpha})`;
              } else {
                ctx.strokeStyle = `rgba(232, 184, 109, ${alpha})`;
              }
              
              ctx.lineWidth = 0.8;
              ctx.stroke();

              // Draw a tiny secondary glow ring on the star when connected to mouse
              ctx.beginPath();
              ctx.arc(s1.x, s1.y, s1.radius * 2, 0, Math.PI * 2);
              ctx.fillStyle = s1.color + (alpha * 0.3) + ')';
              ctx.fill();
            }
          }
        }
      }

      // Update and Draw Stars
      for (let i = 0; i < stars.length; i++) {
        const star = stars[i];

        // Slowly drift stars
        star.x += star.vx;
        star.y += star.vy;

        // Wrap around boundaries
        if (star.x < 0) star.x = canvas.width;
        if (star.x > canvas.width) star.x = 0;
        if (star.y < 0) star.y = canvas.height;
        if (star.y > canvas.height) star.y = 0;

        // Twinkle effect (alpha modulation)
        star.alpha += star.twinkleSpeed;
        if (star.alpha > 1 || star.alpha < 0) {
          star.twinkleSpeed = -star.twinkleSpeed;
        }
        
        const currentAlpha = star.baseAlpha * (0.3 + 0.7 * Math.abs(star.alpha));

        // Draw star particle
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        
        ctx.fillStyle = star.color + currentAlpha + ')';
        ctx.fill();

        // Extra glowing shadow for space stars
        if (isSpace) {
          ctx.shadowBlur = star.radius * 2.5;
          ctx.shadowColor = star.color + '0.8)';
          ctx.beginPath();
          ctx.arc(star.x, star.y, star.radius * 0.6, 0, Math.PI * 2);
          ctx.fillStyle = '#ffffff';
          ctx.fill();
          ctx.shadowBlur = 0; // reset
        }
      }

      animationId = requestAnimationFrame(render);
    };

    render();

    // Cleanup
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(animationId);
    };
  }, [currentTheme, isSpace]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-10 overflow-hidden select-none"
      style={{ mixBlendMode: isSpace ? 'screen' : 'screen', opacity: isSpace ? 0.75 : 0.45 }}
    />
  );
}
