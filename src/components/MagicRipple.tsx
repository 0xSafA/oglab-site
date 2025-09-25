'use client';

import { useEffect, useRef } from 'react';

interface MagicRippleProps {
  children: React.ReactNode;
  className?: string;
  color?: string;
  speed?: 'slow' | 'normal' | 'fast';
}

interface Ripple {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  opacity: number;
  hue: number;
  life: number;
  maxLife: number;
}

export default function MagicRipple({ 
  children, 
  className = '',
  color = '#B0BF93',
  speed = 'normal'
}: MagicRippleProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ripplesRef = useRef<Ripple[]>([]);
  const animationRef = useRef<number>(0);
  const lastSpawnRef = useRef<number>(0);

  // Настройки скорости
  const speedConfig = {
    slow: { spawnRate: 2000, rippleSpeed: 0.5 },
    normal: { spawnRate: 1500, rippleSpeed: 0.8 },
    fast: { spawnRate: 1000, rippleSpeed: 1.2 }
  };

  const hexToHsl = (hex: string) => {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0;
    const l = (max + min) / 2;
    const s = max === min ? 0 : l > 0.5 ? (max - min) / (2 - max - min) : (max - min) / (max + min);

    if (max !== min) {
      switch (max) {
        case r: h = (g - b) / (max - min) + (g < b ? 6 : 0); break;
        case g: h = (b - r) / (max - min) + 2; break;
        case b: h = (r - g) / (max - min) + 4; break;
      }
      h /= 6;
    }

    return { h: h * 360, s: s * 100, l: l * 100 };
  };

  const createRipple = (rect: DOMRect): Ripple => {
    const baseHsl = hexToHsl(color);
    return {
      x: Math.random() * rect.width,
      y: Math.random() * rect.height,
      radius: 0,
      maxRadius: Math.random() * 80 + 40,
      opacity: 1,
      hue: baseHsl.h + (Math.random() - 0.5) * 60, // Вариация оттенка
      life: 0,
      maxLife: Math.random() * 3000 + 2000 // 2-5 секунд
    };
  };

  const drawRipple = (ctx: CanvasRenderingContext2D, ripple: Ripple) => {
    const gradient = ctx.createRadialGradient(
      ripple.x, ripple.y, 0,
      ripple.x, ripple.y, ripple.radius
    );
    
    // Создаем радужный градиент
    gradient.addColorStop(0, `hsla(${ripple.hue}, 70%, 60%, ${ripple.opacity * 0.8})`);
    gradient.addColorStop(0.3, `hsla(${ripple.hue + 30}, 70%, 60%, ${ripple.opacity * 0.6})`);
    gradient.addColorStop(0.6, `hsla(${ripple.hue + 60}, 70%, 60%, ${ripple.opacity * 0.4})`);
    gradient.addColorStop(1, `hsla(${ripple.hue + 90}, 70%, 60%, 0)`);
    
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(ripple.x, ripple.y, ripple.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  };

  const updateRipple = (ripple: Ripple, deltaTime: number, config: typeof speedConfig.normal) => {
    ripple.life += deltaTime;
    ripple.radius += config.rippleSpeed * deltaTime * 0.05;
    
    // Плавное исчезновение
    const lifeRatio = ripple.life / ripple.maxLife;
    if (lifeRatio < 0.3) {
      ripple.opacity = lifeRatio / 0.3;
    } else if (lifeRatio > 0.7) {
      ripple.opacity = (1 - lifeRatio) / 0.3;
    } else {
      ripple.opacity = 1;
    }
    
    return ripple.life < ripple.maxLife && ripple.radius < ripple.maxRadius;
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const config = speedConfig[speed];
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

    const animate = (currentTime: number) => {
      const deltaTime = currentTime - lastTime;
      lastTime = currentTime;

      const rect = container.getBoundingClientRect();
      
      // Очищаем canvas
      ctx.clearRect(0, 0, rect.width, rect.height);
      
      // Создаем новые волны
      if (currentTime - lastSpawnRef.current > config.spawnRate) {
        ripplesRef.current.push(createRipple(rect));
        lastSpawnRef.current = currentTime;
      }
      
      // Обновляем и рисуем волны
      ripplesRef.current = ripplesRef.current.filter(ripple => {
        const alive = updateRipple(ripple, deltaTime, config);
        if (alive) {
          drawRipple(ctx, ripple);
        }
        return alive;
      });
      
      animationRef.current = requestAnimationFrame(animate);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [color, speed]);

  return (
    <div ref={containerRef} className={`relative overflow-hidden ${className}`}>
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none z-10"
        style={{ mixBlendMode: 'multiply' }}
      />
      <div className="relative z-20">
        {children}
      </div>
    </div>
  );
}
