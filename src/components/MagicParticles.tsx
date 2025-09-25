'use client';

import { useEffect, useRef, useState } from 'react';

interface MagicParticlesProps {
  children: React.ReactNode;
  className?: string;
  particleCount?: number;
  colors?: string[];
  speed?: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  opacity: number;
  life: number;
  maxLife: number;
  trail: { x: number; y: number; opacity: number }[];
}

export default function MagicParticles({ 
  children, 
  className = '',
  particleCount = 12,
  colors = ['#FFD700', '#FF69B4', '#00CED1', '#98FB98', '#DDA0DD'],
  speed = 1
}: MagicParticlesProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationRef = useRef<number>();
  const [isClient, setIsClient] = useState(false);

  // Проверяем, что мы на клиентской стороне
  useEffect(() => {
    setIsClient(true);
  }, []);

  const createParticle = (rect: DOMRect): Particle => {
    const angle = Math.random() * Math.PI * 2;
    const velocity = Math.random() * 0.5 + 0.2;
    
    return {
      x: Math.random() * rect.width,
      y: Math.random() * rect.height,
      vx: Math.cos(angle) * velocity * speed,
      vy: Math.sin(angle) * velocity * speed,
      size: Math.random() * 3 + 1,
      color: colors[Math.floor(Math.random() * colors.length)],
      opacity: 1,
      life: 0,
      maxLife: Math.random() * 5000 + 3000, // 3-8 секунд
      trail: []
    };
  };

  const drawParticle = (ctx: CanvasRenderingContext2D, particle: Particle) => {
    // Рисуем след
    particle.trail.forEach((point, index) => {
      if (point.opacity > 0) {
        ctx.save();
        ctx.globalAlpha = point.opacity;
        ctx.fillStyle = particle.color;
        ctx.shadowColor = particle.color;
        ctx.shadowBlur = 5;
        ctx.beginPath();
        ctx.arc(point.x, point.y, particle.size * 0.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    });

    // Рисуем основную частицу
    ctx.save();
    ctx.globalAlpha = particle.opacity;
    ctx.fillStyle = particle.color;
    ctx.shadowColor = particle.color;
    ctx.shadowBlur = particle.size * 3;
    
    // Рисуем звездочку
    const spikes = 5;
    const outerRadius = particle.size;
    const innerRadius = particle.size * 0.5;
    
    ctx.translate(particle.x, particle.y);
    ctx.beginPath();
    
    for (let i = 0; i < spikes * 2; i++) {
      const angle = (i * Math.PI) / spikes;
      const radius = i % 2 === 0 ? outerRadius : innerRadius;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  };

  const updateParticle = (particle: Particle, deltaTime: number, rect: DOMRect) => {
    particle.life += deltaTime;
    
    // Обновляем позицию
    particle.x += particle.vx * deltaTime;
    particle.y += particle.vy * deltaTime;
    
    // Добавляем точку в след
    particle.trail.push({
      x: particle.x,
      y: particle.y,
      opacity: particle.opacity * 0.7
    });
    
    // Ограничиваем длину следа
    if (particle.trail.length > 10) {
      particle.trail.shift();
    }
    
    // Обновляем opacity следа
    particle.trail.forEach((point, index) => {
      point.opacity *= 0.95;
    });
    
    // Отражение от границ
    if (particle.x < 0 || particle.x > rect.width) {
      particle.vx *= -1;
      particle.x = Math.max(0, Math.min(rect.width, particle.x));
    }
    if (particle.y < 0 || particle.y > rect.height) {
      particle.vy *= -1;
      particle.y = Math.max(0, Math.min(rect.height, particle.y));
    }
    
    // Плавное исчезновение
    const lifeRatio = particle.life / particle.maxLife;
    if (lifeRatio < 0.2) {
      particle.opacity = lifeRatio / 0.2;
    } else if (lifeRatio > 0.8) {
      particle.opacity = (1 - lifeRatio) / 0.2;
    } else {
      particle.opacity = 1;
    }
    
    return particle.life < particle.maxLife;
  };

  useEffect(() => {
    if (!isClient) return;
    
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let lastTime = 0;

    const resizeCanvas = () => {
      const rect = container.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      
      ctx.scale(dpr, dpr);
    };

    // Инициализируем частицы
    const initParticles = () => {
      const rect = container.getBoundingClientRect();
      particlesRef.current = [];
      for (let i = 0; i < particleCount; i++) {
        particlesRef.current.push(createParticle(rect));
      }
    };

    const animate = (currentTime: number) => {
      const deltaTime = currentTime - lastTime;
      lastTime = currentTime;

      const rect = container.getBoundingClientRect();
      
      // Очищаем canvas
      ctx.clearRect(0, 0, rect.width, rect.height);
      
      // Обновляем и рисуем частицы
      particlesRef.current = particlesRef.current.filter(particle => {
        const alive = updateParticle(particle, deltaTime, rect);
        if (alive) {
          drawParticle(ctx, particle);
        }
        return alive;
      });
      
      // Добавляем новые частицы если нужно
      while (particlesRef.current.length < particleCount) {
        particlesRef.current.push(createParticle(rect));
      }
      
      animationRef.current = requestAnimationFrame(animate);
    };

    resizeCanvas();
    initParticles();
    window.addEventListener('resize', resizeCanvas);
    
    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [isClient, particleCount, colors, speed]);

  return (
    <div ref={containerRef} className={`relative overflow-hidden ${className}`}>
      {isClient && (
        <canvas
          ref={canvasRef}
          className="absolute inset-0 pointer-events-none z-10"
          style={{ mixBlendMode: 'screen' }}
        />
      )}
      <div className="relative z-20">
        {children}
      </div>
    </div>
  );
}
