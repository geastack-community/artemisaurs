import { useEffect, useRef, JSX } from 'react';

interface Star {
  x: number;
  y: number;
  baseX: number;
  baseY: number;
  z: number;
  r: number;
  a: number;
  da: number;
  hue: number;
  isGlow: boolean;
  angle: number;
  angleSpeed: number;
}

interface ShootingStar {
  x: number;
  y: number;
  dx: number;
  dy: number;
  length: number;
  life: number;
  decay: number;
  width: number;
  hue: number;
}

interface Spark {
  x: number;
  y: number;
  dx: number;
  dy: number;
  life: number;
  decay: number;
  size: number;
  hue: number;
}

export default function StarringBackground(): JSX.Element {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (reducedMotionQuery.matches) {
      return;
    }

    const isDarkTheme = () =>
      document.documentElement.getAttribute('data-theme') === 'dark';

    let animationFrameId: number | null = null;
    let isPaused = false;
    let w = (canvas.width = window.innerWidth);
    let h = (canvas.height = window.innerHeight);

    const mouse = { x: w / 2, y: h / 2, targetX: w / 2, targetY: h / 2 };

    const hues = [220, 210, 280, 45, 15];
    let stars: Star[] = [];
    let shootingStars: ShootingStar[] = [];
    let sparks: Spark[] = [];

    function createStars(count: number) {
      stars = [];
      for (let i = 0; i < count; i++) {
        const z = Math.random();
        const x = Math.random() * w;
        const y = Math.random() * h;
        stars.push({
          x,
          y,
          baseX: x,
          baseY: y,
          z,
          r: (z * 1.8 + 0.3),
          a: Math.random() * 0.7 + 0.2,
          da: (Math.random() * 0.02 + 0.005) * (Math.random() < 0.5 ? 1 : -1),
          hue: hues[Math.floor(Math.random() * hues.length)],
          isGlow: z > 0.7 && Math.random() < 0.25,
          angle: Math.random() * Math.PI * 2,
          angleSpeed: Math.random() * 0.02 + 0.005,
        });
      }
    }

    function createShootingStar() {
      const startX = Math.random() * w * 0.8 + w * 0.2;
      const startY = Math.random() * h * 0.3;
      const length = Math.random() * 100 + 150;
      const speed = Math.random() * 8 + 16;
      const angle = Math.PI * 0.75;

      shootingStars.push({
        x: startX,
        y: startY,
        dx: Math.cos(angle) * speed,
        dy: Math.sin(angle) * speed,
        length,
        life: 1.0,
        decay: Math.random() * 0.015 + 0.01,
        width: Math.random() * 1.8 + 1.2,
        hue: Math.random() < 0.5 ? 200 : 280,
      });
    }

    let nextShootingStarTime = Date.now() + Math.random() * 3000 + 2000;

    function draw() {
      if (!ctx) return;

      if (!isDarkTheme()) {
        ctx.clearRect(0, 0, w, h);
        animationFrameId = requestAnimationFrame(draw);
        return;
      }

      ctx.clearRect(0, 0, w, h);

      mouse.x += (mouse.targetX - mouse.x) * 0.05;
      mouse.y += (mouse.targetY - mouse.y) * 0.05;

      const offsetX = (mouse.x - w / 2) * 0.03;
      const offsetY = (mouse.y - h / 2) * 0.03;

      const nearStars = stars.filter((s) => s.z > 0.65);
      for (let i = 0; i < nearStars.length; i++) {
        for (let j = i + 1; j < nearStars.length; j++) {
          const s1 = nearStars[i];
          const s2 = nearStars[j];
          const dist = Math.hypot(s1.x - s2.x, s1.y - s2.y);
          if (dist < 110) {
            const lineOpacity = (1 - dist / 110) * 0.15 * s1.a;
            ctx.beginPath();
            ctx.moveTo(s1.x, s1.y);
            ctx.lineTo(s2.x, s2.y);
            ctx.strokeStyle = `hsla(${s1.hue}, 80%, 75%, ${lineOpacity})`;
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }
      }

      for (const s of stars) {
        s.a += s.da;
        if (s.a >= 0.95) { s.a = 0.95; s.da *= -1; }
        if (s.a <= 0.1) { s.a = 0.1; s.da *= -1; }

        s.angle += s.angleSpeed;
        const wiggleX = Math.cos(s.angle) * (s.z * 1.5);
        const wiggleY = Math.sin(s.angle) * (s.z * 1.5);

        s.baseX += (s.z * 0.12);
        s.baseY += (s.z * 0.06);

        if (s.baseX > w + 20) s.baseX = -20;
        if (s.baseY > h + 20) s.baseY = -20;

        s.x = s.baseX + wiggleX + offsetX * s.z;
        s.y = s.baseY + wiggleY + offsetY * s.z;

        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${s.hue}, 75%, 85%, ${s.a})`;
        ctx.fill();

        if (s.isGlow && s.a > 0.3) {
          ctx.beginPath();
          ctx.arc(s.x, s.y, s.r * 3.5, 0, Math.PI * 2);
          ctx.fillStyle = `hsla(${s.hue}, 90%, 75%, ${s.a * 0.12})`;
          ctx.fill();
        }
      }

      if (Date.now() > nextShootingStarTime) {
        createShootingStar();
        nextShootingStarTime = Date.now() + Math.random() * 4000 + 2500;
      }

      for (let i = shootingStars.length - 1; i >= 0; i--) {
        const ss = shootingStars[i];
        const tailX = ss.x - (ss.dx / Math.hypot(ss.dx, ss.dy)) * ss.length;
        const tailY = ss.y - (ss.dy / Math.hypot(ss.dx, ss.dy)) * ss.length;

        const grad = ctx.createLinearGradient(ss.x, ss.y, tailX, tailY);
        grad.addColorStop(0, `rgba(255, 255, 255, ${ss.life})`);
        grad.addColorStop(0.15, `hsla(${ss.hue}, 100%, 75%, ${ss.life * 0.8})`);
        grad.addColorStop(1, `hsla(${ss.hue}, 100%, 50%, 0)`);

        ctx.beginPath();
        ctx.moveTo(ss.x, ss.y);
        ctx.lineTo(tailX, tailY);
        ctx.strokeStyle = grad;
        ctx.lineWidth = ss.width;
        ctx.lineCap = 'round';
        ctx.stroke();

        if (Math.random() < 0.6) {
          sparks.push({
            x: ss.x,
            y: ss.y,
            dx: (Math.random() - 0.5) * 2 - ss.dx * 0.05,
            dy: (Math.random() - 0.5) * 2 - ss.dy * 0.05,
            life: 1.0,
            decay: Math.random() * 0.05 + 0.03,
            size: Math.random() * 1.2 + 0.5,
            hue: ss.hue,
          });
        }

        ss.x += ss.dx;
        ss.y += ss.dy;
        ss.life -= ss.decay;

        if (ss.life <= 0 || ss.x < -150 || ss.y > h + 150) {
          shootingStars.splice(i, 1);
        }
      }

      for (let i = sparks.length - 1; i >= 0; i--) {
        const sp = sparks[i];
        ctx.beginPath();
        ctx.arc(sp.x, sp.y, sp.size, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${sp.hue}, 100%, 80%, ${sp.life})`;
        ctx.fill();

        sp.x += sp.dx;
        sp.y += sp.dy;
        sp.life -= sp.decay;

        if (sp.life <= 0) {
          sparks.splice(i, 1);
        }
      }

      animationFrameId = requestAnimationFrame(draw);
    }

    function startLoop() {
      if (animationFrameId === null && !isPaused) {
        animationFrameId = requestAnimationFrame(draw);
      }
    }

    function stopLoop() {
      if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
      }
    }

    const handleResize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
      createStars(Math.floor((w * h) / 8000));
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.targetX = e.clientX;
      mouse.targetY = e.clientY;
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        isPaused = true;
        stopLoop();
      } else {
        isPaused = false;
        startLoop();
      }
    };

    const handleReducedMotionChange = (e: MediaQueryListEvent) => {
      if (e.matches) {
        isPaused = true;
        stopLoop();
        ctx.clearRect(0, 0, w, h);
      } else {
        isPaused = false;
        startLoop();
      }
    };

    handleResize();
    startLoop();

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    reducedMotionQuery.addEventListener('change', handleReducedMotionChange);

    return () => {
      stopLoop();
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      reducedMotionQuery.removeEventListener('change', handleReducedMotionChange);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: -1,
        pointerEvents: 'none',
      }}
    />
  );
}