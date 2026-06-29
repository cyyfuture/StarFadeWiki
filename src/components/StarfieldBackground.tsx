import { useEffect, useRef } from 'react';

interface Star {
  x: number;
  y: number;
  radius: number;
  opacity: number;
  speed: number;
  twinkleSpeed: number;
  twinklePhase: number;
}

interface Meteor {
  x: number;
  y: number;
  length: number;
  speed: number;
  opacity: number;
  angle: number;
  active: boolean;
  timer: number;
  cooldown: number;
}

export default function StarfieldBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let width = window.innerWidth;
    let height = window.innerHeight;

    const stars: Star[] = [];
    const meteors: Meteor[] = [];
    const STAR_COUNT = 200;
    const METEOR_COUNT = 3;

    function resize() {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas!.width = width;
      canvas!.height = height;
    }

    function createStars() {
      stars.length = 0;
      for (let i = 0; i < STAR_COUNT; i++) {
        stars.push({
          x: Math.random() * width,
          y: Math.random() * height,
          radius: Math.random() * 2 + 0.5,
          opacity: Math.random() * 0.7 + 0.3,
          speed: Math.random() * 0.3 + 0.05,
          twinkleSpeed: Math.random() * 0.02 + 0.005,
          twinklePhase: Math.random() * Math.PI * 2,
        });
      }
    }

    function createMeteors() {
      meteors.length = 0;
      for (let i = 0; i < METEOR_COUNT; i++) {
        meteors.push({
          x: Math.random() * width,
          y: Math.random() * height * 0.5,
          length: Math.random() * 80 + 40,
          speed: Math.random() * 4 + 3,
          opacity: 0,
          angle: (Math.random() * 15 + 20) * (Math.PI / 180),
          active: false,
          timer: 0,
          cooldown: Math.random() * 300 + 100,
        });
      }
    }

    function drawStar(star: Star, time: number) {
      const twinkle = Math.sin(time * star.twinkleSpeed + star.twinklePhase) * 0.3 + 0.7;
      const alpha = star.opacity * twinkle;

      ctx!.beginPath();
      ctx!.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
      ctx!.fillStyle = `rgba(200, 220, 255, ${alpha})`;
      ctx!.fill();

      if (star.radius > 1.5 && twinkle > 0.85) {
        ctx!.beginPath();
        ctx!.arc(star.x, star.y, star.radius * 2.5, 0, Math.PI * 2);
        ctx!.fillStyle = `rgba(180, 210, 255, ${alpha * 0.15})`;
        ctx!.fill();
      }
    }

    function drawMeteor(meteor: Meteor) {
      if (!meteor.active) return;

      const tailX = meteor.x - Math.cos(meteor.angle) * meteor.length;
      const tailY = meteor.y - Math.sin(meteor.angle) * meteor.length;

      const gradient = ctx!.createLinearGradient(meteor.x, meteor.y, tailX, tailY);
      gradient.addColorStop(0, `rgba(255, 255, 255, ${meteor.opacity})`);
      gradient.addColorStop(0.3, `rgba(180, 220, 255, ${meteor.opacity * 0.6})`);
      gradient.addColorStop(1, `rgba(100, 160, 255, 0)`);

      ctx!.beginPath();
      ctx!.moveTo(meteor.x, meteor.y);
      ctx!.lineTo(tailX, tailY);
      ctx!.strokeStyle = gradient;
      ctx!.lineWidth = 1.5;
      ctx!.stroke();

      ctx!.beginPath();
      ctx!.arc(meteor.x, meteor.y, 1.5, 0, Math.PI * 2);
      ctx!.fillStyle = `rgba(255, 255, 255, ${meteor.opacity})`;
      ctx!.fill();
    }

    function updateStars() {
      for (const star of stars) {
        star.y -= star.speed;
        if (star.y < -5) {
          star.y = height + 5;
          star.x = Math.random() * width;
        }
      }
    }

    function updateMeteors() {
      for (const meteor of meteors) {
        if (meteor.active) {
          meteor.x += Math.cos(meteor.angle) * meteor.speed;
          meteor.y += Math.sin(meteor.angle) * meteor.speed;
          meteor.timer++;

          if (meteor.timer < 10) {
            meteor.opacity = Math.min(meteor.opacity + 0.1, 0.9);
          } else if (meteor.timer > 40) {
            meteor.opacity = Math.max(meteor.opacity - 0.05, 0);
          }

          if (
            meteor.x > width + 100 ||
            meteor.y > height + 100 ||
            meteor.opacity <= 0
          ) {
            meteor.active = false;
            meteor.timer = 0;
            meteor.opacity = 0;
            meteor.cooldown = Math.random() * 400 + 200;
          }
        } else {
          meteor.cooldown--;
          if (meteor.cooldown <= 0) {
            meteor.active = true;
            meteor.x = Math.random() * width * 0.8;
            meteor.y = Math.random() * height * 0.3;
            meteor.length = Math.random() * 80 + 40;
            meteor.speed = Math.random() * 4 + 3;
            meteor.timer = 0;
            meteor.opacity = 0;
          }
        }
      }
    }

    function animate(time: number) {
      ctx!.clearRect(0, 0, width, height);

      updateStars();
      updateMeteors();

      for (const star of stars) {
        drawStar(star, time);
      }
      for (const meteor of meteors) {
        drawMeteor(meteor);
      }

      animationId = requestAnimationFrame(animate);
    }

    resize();
    createStars();
    createMeteors();
    animationId = requestAnimationFrame(animate);

    window.addEventListener('resize', resize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-0"
      aria-hidden="true"
    />
  );
}
