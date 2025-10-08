'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import type { PotPosition } from './PotController';

export default function PacmanTrail() {
  const pacmanRef = useRef<SVGSVGElement>(null);
  const pacmanGroupRef = useRef<SVGGElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const trailRef = useRef<{ x: number; y: number; t: number; id: number }[]>([]);
  
  // Состояние для охоты на горшочки
  const [isHunting, setIsHunting] = useState(false);
  const [targetPot, setTargetPot] = useState<PotPosition | null>(null);
  
  // Refs для доступа к состоянию внутри анимации
  const isHuntingRef = useRef(false);
  const targetPotRef = useRef<PotPosition | null>(null);
  // Используем состояния, чтобы удовлетворить линтер (значения управляются через refs)
  void targetPot;
  
  // Оптимизация: кэшируем вычисления
  const frameCountRef = useRef(0);
  const lastDrawTimeRef = useRef(0);
  const minFrameMsRef = useRef(22); // ~45 FPS cap for drawing trail (movement stays smooth)
  const lastTrailCenterRef = useRef({ cx: 68 + 24, cy: 68 + 24 });

  // Оптимизированные event handlers с useCallback
  const handlePotSpawned = useCallback((event: CustomEvent) => {
    const newPot = event.detail as PotPosition;
    
    // Сразу начинаем охоту
    setIsHunting(true);
    setTargetPot(newPot);
    isHuntingRef.current = true;
    targetPotRef.current = newPot;
  }, []);

  const handlePotEaten = useCallback((event: CustomEvent) => {
    const { potId } = event.detail;
    
    // Возвращаемся к обычному поведению
    setIsHunting(false);
    setTargetPot(null);
    isHuntingRef.current = false;
    targetPotRef.current = null;
  }, []);

  // Слушаем события появления горшочков
  useEffect(() => {

    if (typeof window !== 'undefined') {
      window.addEventListener('potSpawned', handlePotSpawned as EventListener);
      window.addEventListener('potEaten', handlePotEaten as EventListener);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('potSpawned', handlePotSpawned as EventListener);
        window.removeEventListener('potEaten', handlePotEaten as EventListener);
      }
    };
  }, [handlePotSpawned, handlePotEaten]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

      // Добавляем тип к filter, чтобы избежать any
      const ctx = canvas.getContext('2d') as (CanvasRenderingContext2D & { filter?: string }) | null;
    if (!ctx) return;

    const w = window.innerWidth;
    const h = window.innerHeight;
    const rawDpr = window.devicePixelRatio || 1;
    // Cap DPR on large screens/TVs to reduce fill cost
    const dpr = (w >= 1200) ? 1 : Math.min(2, Math.max(1, Math.floor(rawDpr)));

    // Set canvas size with HiDPI support
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    ctx.scale(dpr, dpr);

    const pacmanSize = 48;
    const pacmanRadius = pacmanSize / 2; // 24
    const margin = pacmanSize + 20; // Add margin to keep Pacman visible
    
    let x = margin;
    let y = margin;
    // Синхронизируем стартовую позицию центра трейла с пакманом
    lastTrailCenterRef.current = { cx: x + pacmanRadius, cy: y + pacmanRadius };
    let localAngle = 0;
    let lastId = 0;
    const path = [
      { x: margin, y: margin },
      { x: w - margin, y: margin },
      { x: w - margin, y: 200 },
      { x: margin, y: 200 },
      { x: margin, y: 350 },
      { x: w - margin, y: 350 },
      { x: w - margin, y: 500 },
      { x: margin, y: 500 },
      { x: margin, y: h - margin },
      { x: w / 2, y: h - margin },
      { x: w / 2, y: h / 2 },
      { x: w / 2 + 150, y: h / 2 },
      { x: w / 2 + 150, y: h - margin - 50 },
      { x: margin, y: h - margin - 50 },
    ];

    let pathIndex = 1;
    let target = path[pathIndex];
    
    // Фиксированная скорость в пикселях за секунду (независимо от FPS)
    const normalSpeed = 25; // пикселей в секунду (очень спокойное движение)
    const huntingSpeed = 50; // пикселей в секунду (быстрее при охоте, но не слишком)
    
    // Для синхронизации времени
    let lastTime = performance.now();
    let animationFrame: number;

    // Оптимизированная функция проверки столкновения (squared distance)
    const checkPotCollision = (pacX: number, pacY: number, pot: PotPosition) => {
      const dx = pacX + 24 - pot.x;
      const dy = pacY + 24 - pot.y;
      const distanceSquared = dx * dx + dy * dy;
      return distanceSquared < 1600; // 40 * 40 = 1600
    };

    // Функция получения активного горшочка
    // const getActivePot = (): PotPosition | null => {
    //   if (typeof document === 'undefined') return null;
    //   const potData = document.body.dataset.activePot;
    //   if (!potData) return null;
    //   try {
    //     return JSON.parse(potData);
    //   } catch {
    //     return null;
    //   }
    // };

    // Fade-layer отрисовка: O(1) на кадр
    const drawTrail = (cx: number, cy: number) => {
      const radius = pacmanRadius;

      // Периодическая полная очистка, чтобы не было постоянного серого налёта
      if (frameCountRef.current % 216 === 0) { // ~20% реже очищаем → хвост длиннее
        ctx.clearRect(0, 0, w, h);
      }

      // 1) Плавное затухание предыдущих кадров (fade layer)
      ctx.save();
      ctx.globalCompositeOperation = 'destination-out';
      ctx.globalAlpha = 0.05; // чуть меньше стираем → хвост длиннее (~+20%)
      ctx.fillRect(0, 0, w, h);
      ctx.restore();

      // 1.1) Пробиваем отверстие под телом пакмана, чтобы хвост не просвечивал внутри рта
      ctx.save();
      ctx.globalCompositeOperation = 'destination-out';
      ctx.beginPath();
      ctx.arc(cx, cy, radius + 1, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // 2) Рисуем новую голову хвоста (рядом с пакманом)
      ctx.save();
      ctx.globalCompositeOperation = 'source-over';
      // Полностью прозрачная у рта — не рисуем "комок" вовсе
      ctx.globalAlpha = 0.0;
      ctx.fillStyle = 'white';
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // 3) Усиление средней части хвоста профилем альфы:
      //    дальний край бледный, середина плотная, у рта — полностью прозрачный
      const trail = trailRef.current;
      const n = trail.length;
      if (n > 1) {
        // Ограничим сложность: используем не более 216 последних точек (~+20%)
        const maxSamples = 216;
        const startIndex = Math.max(0, n - maxSamples);
        const count = n - startIndex;
        const inv = count > 1 ? 1 / (count - 1) : 0;
        ctx.save();
        ctx.fillStyle = 'white';
        ctx.globalCompositeOperation = 'source-over';
        for (let k = 0; k < count; k++) {
          const i = startIndex + k;
          const p = trail[i];
          const t = k * inv; // 0..1 (старый→новый) в пределах окна
          let alpha: number;
          // t: 0 (самый старый хвост) → 1 (у рта пакмана)
          // Дальний край (старые 20%): плавное появление до 0.35
          if (t < 0.2) {
            alpha = 0.35 * (t / 0.2); // 0 → 0.35
          // Голова: последние 20% всегда 95% прозрачные (alpha 0.05)
          } else if (t > 0.8) {
            alpha = 0.05;
          // Переходная зона 0.7–0.8: линейно от 1.0 к 0.05
          } else if (t > 0.7) {
            const k = (t - 0.7) / 0.1; // 0..1
            alpha = 1 - 0.95 * k; // 1.0 → 0.05
          } else {
            alpha = 1.0; // середина полностью непрозрачная
          }
          if (alpha <= 0) continue;
          ctx.globalAlpha = alpha;
          ctx.beginPath();
          ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }
    };

    const animate = (currentTime: number) => {
      // Вычисляем deltaTime для независимости от FPS
      const deltaTime = (currentTime - lastTime) / 1000; // в секундах
      lastTime = currentTime;
      
      // Ограничиваем deltaTime для стабильности на очень медленных устройствах
      const clampedDeltaTime = Math.min(deltaTime, 0.05); // максимум 50ms
      
      frameCountRef.current++;
      
      // Определяем скорость в зависимости от режима (пиксели в секунду)
      const currentSpeed = isHuntingRef.current ? huntingSpeed : normalSpeed;
      const frameSpeed = currentSpeed * clampedDeltaTime; // пиксели за этот кадр
      
      // Определяем цель движения на основе refs
      if (isHuntingRef.current && targetPotRef.current) {
        // Охотимся - двигаемся к горшочку
        target = { x: targetPotRef.current.x - 24, y: targetPotRef.current.y - 24 }; // Центрируем на горшочке
        
        // Проверяем столкновение
        if (checkPotCollision(x, y, targetPotRef.current)) {
          // Съели горшочек!
          window.dispatchEvent(new CustomEvent('potEaten', { 
            detail: { potId: targetPotRef.current.id } 
          }));
        }
      } else {
        // Обычное поведение - следуем по маршруту
        const dx = target.x - x;
        const dy = target.y - y;
        const absDx = Math.abs(dx);
        const absDy = Math.abs(dy);

        if (absDx < frameSpeed && absDy < frameSpeed) {
          x = target.x;
          y = target.y;
          pathIndex = (pathIndex + 1) % path.length;
          target = path[pathIndex];

          const nextDx = target.x - x;
          const nextDy = target.y - y;
          if (nextDx !== 0) localAngle = nextDx > 0 ? 0 : 180;
          else if (nextDy !== 0) localAngle = nextDy > 0 ? 90 : -90;
        }
      }
      
      // Движение к цели - только по горизонтали или вертикали
      const dx = target.x - x;
      const dy = target.y - y;
      const absDx = Math.abs(dx);
      const absDy = Math.abs(dy);
      
      if (absDx > frameSpeed || absDy > frameSpeed) {
        // Сначала двигаемся по горизонтали, потом по вертикали
        if (absDx > frameSpeed) {
          x += frameSpeed * Math.sign(dx);
          localAngle = dx > 0 ? 0 : 180;
        } else if (absDy > frameSpeed) {
          y += frameSpeed * Math.sign(dy);
          localAngle = dy > 0 ? 90 : -90;
        }
      }

      // Синхронно обновляем позицию и поворот SVG без React state
      if (pacmanRef.current) {
        pacmanRef.current.style.left = `${x}px`;
        pacmanRef.current.style.top = `${y}px`;
      }
      if (pacmanGroupRef.current) {
        pacmanGroupRef.current.setAttribute('transform', `rotate(${localAngle}, 50, 50)`);
      }

      // Добавляем точку следа из предыдущей позиции центра пакмана (лаг 1 кадр),
      // чтобы хвост гарантированно не опережал при вертикальном движении
      {
        const tx = lastTrailCenterRef.current.cx;
        const ty = lastTrailCenterRef.current.cy;
        trailRef.current.push({ x: tx, y: ty, t: currentTime, id: lastId++ });
        lastTrailCenterRef.current = { cx: x + pacmanRadius, cy: y + pacmanRadius };
        
        // Нормализуем длину хвоста по времени, чтобы она была одинаковой на любых FPS
        const TRAIL_WINDOW_MS = 2400; // ~20% длиннее окно по времени
        const cutoff = currentTime - TRAIL_WINDOW_MS;
        while (trailRef.current.length && trailRef.current[0].t < cutoff) {
          trailRef.current.shift();
        }
        // Защитный лимит по количеству точек (вдобавок к окну времени)
        if (trailRef.current.length > 624) {
          trailRef.current.splice(0, trailRef.current.length - 624);
        }
      }

      // Draw trail on canvas using fade-layer with lightweight FPS cap
      if (currentTime - lastDrawTimeRef.current >= minFrameMsRef.current) {
        drawTrail(x + pacmanRadius, y + pacmanRadius);
        lastDrawTimeRef.current = currentTime;
      }
      
      animationFrame = requestAnimationFrame(animate);
    };

    // Инициализируем анимацию с первым timestamp
    animationFrame = requestAnimationFrame((time) => {
      lastTime = time;
      animate(time);
    });
    // Обработчик мягкого сброса: очищаем след и переинициализируем параметры
    const handleSoftRefresh = () => {
      try {
        trailRef.current = [];
        frameCountRef.current = 0;
        lastDrawTimeRef.current = 0;
        minFrameMsRef.current = 22;
        const ctx = canvas.getContext('2d');
        if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
        if (pacmanRef.current) {
          pacmanRef.current.style.left = `68px`;
          pacmanRef.current.style.top = `68px`;
        }
        if (pacmanGroupRef.current) {
          pacmanGroupRef.current.setAttribute('transform', `rotate(0, 50, 50)`);
        }
      } catch {}
    };
    window.addEventListener('softRefresh', handleSoftRefresh as EventListener);

    return () => {
      cancelAnimationFrame(animationFrame);
      window.removeEventListener('softRefresh', handleSoftRefresh as EventListener);
    };
  }, []);

  return (
    <>
      {/* Canvas for trail rendering */}
      <canvas
        ref={canvasRef}
        className="pacman-canvas"
        style={{
          width: '100%',
          height: '100%',
          willChange: 'contents',
          transform: 'translateZ(0)', // GPU acceleration
        }}
      />

      {/* SVG Pacman */}
      <svg
        ref={pacmanRef}
        className="pacman"
        viewBox="0 0 100 100"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          left: `68px`,
          top: `68px`,
          willChange: 'transform',
          transform: 'translateZ(0)', // GPU acceleration
        }}
      >
        <g ref={pacmanGroupRef} transform={`rotate(0, 50, 50)`}>
          <defs>
            <mask id="mouth">
              <rect width="100" height="100" fill="white" />
              <path>
                <animate
                  attributeName="d"
                  dur="0.72s"
                  repeatCount="indefinite"
                  values="
                    M50,50 L100,30 A50,50 0 1,1 100,70 Z;
                    M50,50 L100,48 A50,50 0 1,1 100,52 Z;
                    M50,50 L100,30 A50,50 0 1,1 100,70 Z"
                />
              </path>
            </mask>
          </defs>
          <circle cx="50" cy="50" r="50" fill="#B0BF93" mask="url(#mouth)" />
          {/* Глаз - меняется в зависимости от состояния охоты */}
          {isHunting ? (
            // Сосредоточенный диагональный овальный глаз при охоте
            <ellipse cx="40" cy="26" rx="8" ry="8.5" fill="#536C4A" transform="rotate(-20 40 26)" />
          ) : (
            // Обычный круглый глаз
            <circle cx="40" cy="26" r="9" fill="#536C4A" />
          )}
        </g>
      </svg>
    </>
  );
}
