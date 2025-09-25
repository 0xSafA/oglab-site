'use client';

import { useEffect, useRef } from 'react';

interface SparkleEffectProps {
  children: React.ReactNode;
  className?: string;
  intensity?: 'low' | 'medium' | 'high';
  color?: 'gold' | 'white' | 'rainbow';
}

interface Sparkle {
  id: number;
  x: number;
  y: number;
  size: number;
  opacity: number;
  life: number;
  maxLife: number;
  vx: number;
  vy: number;
  rotation: number;
  rotationSpeed: number;
  color: string;
}

export default function SparkleEffect({ 
  children, 
  className = '', 
  intensity = 'medium',
  color = 'gold'
}: SparkleEffectProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sparklesRef = useRef<Sparkle[]>([]);
  const animationRef = useRef<number>(0);
  const lastSpawnRef = useRef<number>(0);
  const sparkleIdRef = useRef<number>(0);

  // Настройки интенсивности
  const intensityConfig = {
    low: { maxSparkles: 8, spawnRate: 800 },
    medium: { maxSparkles: 15, spawnRate: 500 },
    high: { maxSparkles: 25, spawnRate: 300 }
  };

  // Цветовые схемы
  const colorSchemes = {
    gold: ['#FFD700', '#FFA500', '#FFFF00', '#FFE55C'],
    white: ['#FFFFFF', '#F0F8FF', '#E6E6FA', '#FFFACD'],
    rainbow: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD']
  };

  const getRandomColor = () => {
    const colors = colorSchemes[color];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  const createSparkle = (rect: DOMRect): Sparkle => {
    const margin = 20;
    return {
      id: sparkleIdRef.current++,
      x: Math.random() * (rect.width + margin * 2) - margin,
      y: Math.random() * (rect.height + margin * 2) - margin,
      size: Math.random() * 4 + 2,
      opacity: 1,
      life: 0,
      maxLife: Math.random() * 2000 + 1500, // 1.5-3.5 секунды
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 2,
      color: getRandomColor()
    };
  };

  const drawSparkle = (ctx: CanvasRenderingContext2D, sparkle: Sparkle) => {
    ctx.save();
    ctx.translate(sparkle.x, sparkle.y);
    ctx.rotate((sparkle.rotation * Math.PI) / 180);
    ctx.globalAlpha = sparkle.opacity;
    
    // Рисуем звездочку
    ctx.fillStyle = sparkle.color;
    ctx.shadowColor = sparkle.color;
    ctx.shadowBlur = sparkle.size * 2;
    
    const spikes = 4;
    const outerRadius = sparkle.size;
    const innerRadius = sparkle.size * 0.4;
    
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

  const updateSparkle = (sparkle: Sparkle, deltaTime: number) => {
    sparkle.life += deltaTime;
    sparkle.x += sparkle.vx * deltaTime;
    sparkle.y += sparkle.vy * deltaTime;
    sparkle.rotation += sparkle.rotationSpeed * deltaTime;
    
    // Плавное исчезновение
    const lifeRatio = sparkle.life / sparkle.maxLife;
    if (lifeRatio < 0.2) {
      sparkle.opacity = lifeRatio / 0.2;
    } else if (lifeRatio > 0.8) {
      sparkle.opacity = (1 - lifeRatio) / 0.2;
    } else {
      sparkle.opacity = 1;
    }
    
    return sparkle.life < sparkle.maxLife;
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const config = intensityConfig[intensity];
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
      
      // Создаем новые искорки
      if (currentTime - lastSpawnRef.current > config.spawnRate && 
          sparklesRef.current.length < config.maxSparkles) {
        sparklesRef.current.push(createSparkle(rect));
        lastSpawnRef.current = currentTime;
      }
      
      // Обновляем и рисуем искорки
      sparklesRef.current = sparklesRef.current.filter(sparkle => {
        const alive = updateSparkle(sparkle, deltaTime);
        if (alive) {
          drawSparkle(ctx, sparkle);
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
  }, [intensity, color]);

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none z-10"
        style={{ mixBlendMode: 'screen' }}
      />
      <div className="relative z-20">
        {children}
      </div>
    </div>
  );
}
