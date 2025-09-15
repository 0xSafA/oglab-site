'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import type { PotPosition } from './PotController';

export default function PacmanTrail() {
  const pacmanRef = useRef<SVGSVGElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const trailRef = useRef<{ x: number; y: number; id: number }[]>([]);
  const [angle, setAngle] = useState(0);
  const [position, setPosition] = useState({ x: 68, y: 68 }); // pacmanSize + 20
  
  // Состояние для охоты на горшочки
  const [isHunting, setIsHunting] = useState(false);
  const [targetPot, setTargetPot] = useState<PotPosition | null>(null);
  
  // Refs для доступа к состоянию внутри анимации
  const isHuntingRef = useRef(false);
  const targetPotRef = useRef<PotPosition | null>(null);
  
  // Оптимизация: кэшируем вычисления и состояние
  const lastPositionRef = useRef({ x: 68, y: 68 });
  const lastAngleRef = useRef(0);
  const frameCountRef = useRef(0);

  // Оптимизированные event handlers с useCallback
  const handlePotSpawned = useCallback((event: CustomEvent) => {
    const newPot = event.detail as PotPosition;
    if (process.env.NODE_ENV === 'development') {
      console.log(`🎯 Pacman noticed new pot ${newPot.id} at (${newPot.x}, ${newPot.y})`);
    }
    
    // Сразу начинаем охоту
    setIsHunting(true);
    setTargetPot(newPot);
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

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = window.innerWidth;
    const h = window.innerHeight;

    // Set canvas size
    canvas.width = w;
    canvas.height = h;

    const pacmanSize = 48;
    const margin = pacmanSize + 20; // Add margin to keep Pacman visible
    
    let x = margin;
    let y = margin;
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
    const getActivePot = (): PotPosition | null => {
      if (typeof document === 'undefined') return null;
      
      const potData = document.body.dataset.activePot;
      if (!potData) return null;
      
      try {
        return JSON.parse(potData);
      } catch {
        return null;
      }
    };

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
      for (let i = 0; i < trailLength; i++) {
        const point = trail[i];
        // i=0 - самая старая точка (должна быть прозрачной)
        // i=trailLength-1 - самая новая точка (должна быть плотной)
        const normalizedAge = i / (trailLength - 1); // От 0 (старая) до 1 (новая)
        const opacity = Math.max(0.05, normalizedAge * 1.0); // От 0.05 (старая) до 1.0 (новая)
        
        ctx.globalAlpha = opacity;
        ctx.beginPath();
        ctx.arc(point.x + 24, point.y + 24, 24, 0, Math.PI * 2);
        ctx.fill();
      }
      
      // Restore opacity
      ctx.globalAlpha = 1;
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

      // Оптимизация: обновляем React state только при изменении
      const positionChanged = lastPositionRef.current.x !== x || lastPositionRef.current.y !== y;
      const angleChanged = lastAngleRef.current !== localAngle;
      
      if (positionChanged) {
        lastPositionRef.current = { x, y };
        setPosition({ x, y });
      }
      
      if (angleChanged) {
        lastAngleRef.current = localAngle;
        setAngle(localAngle);
      }

      // Add new trail point (offset 15px behind Pacman based on direction) - только каждый 2-й кадр для оптимизации
      if (frameCountRef.current % 2 === 0) {
        let trailX = x;
        let trailY = y;
        
        // Offset trail 15px in opposite direction of movement
        if (localAngle === 0) trailX -= 15;      // Moving right, trail goes left
        else if (localAngle === 180) trailX += 15; // Moving left, trail goes right  
        else if (localAngle === 90) trailY -= 15;  // Moving down, trail goes up
        else if (localAngle === -90) trailY += 15; // Moving up, trail goes down
        
        trailRef.current.push({ x: trailX, y: trailY, id: lastId++ });
        // Возвращаем нормальную длину trail
        if (trailRef.current.length > 370) {
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
          left: `${position.x}px`,
          top: `${position.y}px`,
          willChange: 'transform',
          transform: 'translateZ(0)', // GPU acceleration
        }}
      >
        <g transform={`rotate(${angle}, 50, 50)`}>
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
