'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import type { PotPosition } from './PotController';

export default function PacmanTrail() {
  const pacmanRef = useRef<SVGSVGElement>(null);
  const pacmanGroupRef = useRef<SVGGElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const trailRef = useRef<{ x: number; y: number; id: number }[]>([]);
  
  // Состояние для охоты на горшочки
  const [isHunting, setIsHunting] = useState(false);
  
  // Refs для доступа к состоянию внутри анимации
  const isHuntingRef = useRef(false);
  const targetPotRef = useRef<PotPosition | null>(null);
  
  // Оптимизация: кэшируем вычисления
  const frameCountRef = useRef(0);
  const lastTrailCenterRef = useRef({ cx: 68 + 24, cy: 68 + 24 });

  // Оптимизированные event handlers с useCallback
  const handlePotSpawned = useCallback((event: CustomEvent) => {
    const newPot = event.detail as PotPosition;
    if (process.env.NODE_ENV === 'development') {
      console.log(`🎯 Pacman noticed new pot ${newPot.id} at (${newPot.x}, ${newPot.y})`);
    }
    
    // Сразу начинаем охоту
    setIsHunting(true);
    isHuntingRef.current = true;
    targetPotRef.current = newPot;
  }, []);

  const handlePotEaten = useCallback((event: CustomEvent) => {
    const { potId } = event.detail;
    if (process.env.NODE_ENV === 'development') {
      console.log(`🍽️ Pacman finished eating pot ${potId}, returning to normal path`);
    }
    
    // Возвращаемся к обычному поведению
    setIsHunting(false);
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

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = window.innerWidth;
    const h = window.innerHeight;
    const dpr = Math.max(1, Math.floor(window.devicePixelRatio || 1));

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

    // (removed unused getActivePot)

    // Оптимизированная функция отрисовки trail
    const drawTrail = () => {
      const trail = trailRef.current;
      const trailLength = trail.length;
      
      // Всегда очищаем весь canvas для корректной работы trail
      ctx.clearRect(0, 0, w, h);
      
      if (trailLength === 0) return;
      
      ctx.fillStyle = 'white';
      
      // Batch операции для лучшей производительности
      // Правильная логика: новые точки (конец массива) плотные, старые (начало) прозрачные
      // Отключаем фильтры (дорогая операция) — прозрачность достаточна визуально
      ctx.filter = 'none';

      for (let i = 0; i < trailLength; i++) {
        const point = trail[i];
        // i=0 - самая старая точка (должна быть прозрачной)
        // i=trailLength-1 - самая новая точка (должна быть плотной)
        const normalizedAge = i / (trailLength - 1); // 0 (старая) → 1 (новая)
        // Бóльшая прозрачность у рта и длиннее зона у переднего и заднего краёв
        const minAlpha = 0.08; // у рта и дальнего края
        const maxAlpha = 0.55; // в середине хвоста
        const centered = 1 - Math.pow(2 * normalizedAge - 1, 2); // 0 на краях, 1 в середине
        const tailStretch = Math.min(1, normalizedAge / 0.35); // держим дальний край бледным до ~35% длины
        const headStretch = Math.min(1, (1 - normalizedAge) / 0.30); // зона бледности у рта ~30% длины
        const opacity = minAlpha + (maxAlpha - minAlpha) * centered * tailStretch * headStretch;
        
        ctx.globalAlpha = opacity;
        ctx.beginPath();
        // Рисуем трейл в сохранённых координатах центра
        ctx.arc(point.x, point.y, pacmanRadius, 0, Math.PI * 2);
        ctx.fill();
      }
      
      // Restore opacity
      ctx.globalAlpha = 1;
      ctx.filter = 'none';
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
          if (process.env.NODE_ENV === 'development') {
            console.log(`🍽️ Pacman ate pot ${targetPotRef.current.id}!`);
          }
          
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
        trailRef.current.push({ x: tx, y: ty, id: lastId++ });
        lastTrailCenterRef.current = { cx: x + pacmanRadius, cy: y + pacmanRadius };
        // Ограничиваем длину следа (увеличено на ~20%)
        if (trailRef.current.length > 240) {
          trailRef.current.shift();
        }
      }

      // Draw trail on canvas
      drawTrail();
      
      animationFrame = requestAnimationFrame(animate);
    };

    // Инициализируем анимацию с первым timestamp
    animationFrame = requestAnimationFrame((time) => {
      lastTime = time;
      animate(time);
    });
    return () => cancelAnimationFrame(animationFrame);
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
