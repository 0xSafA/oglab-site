'use client';

import { useEffect, useState } from 'react';
import type { PotPosition } from './PotController';

interface AnimatedPotProps {
  pot: PotPosition;
  onEaten: (potId: string) => void;
}

export default function AnimatedPot({ pot, onEaten }: AnimatedPotProps) {
  const [growthStage, setGrowthStage] = useState(0); // 0-100%
  const [isEaten, setIsEaten] = useState(false);

  // Анимация роста растения
  useEffect(() => {
    const growthInterval = setInterval(() => {
      setGrowthStage(prev => {
        const newStage = prev + 2; // Увеличиваем на 2% каждые 160мс
        return newStage > 100 ? 100 : newStage;
      });
    }, 160); // 8 секунд до полного роста (100 * 160мс / 2)

    return () => clearInterval(growthInterval);
  }, []);

  // Слушаем события поедания
  useEffect(() => {
    const handlePotEaten = (event: CustomEvent) => {
      const { potId } = event.detail;
      if (potId === pot.id) {
        setIsEaten(true);
        // Через короткое время вызываем onEaten для удаления компонента
        setTimeout(() => onEaten(pot.id), 500);
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('potEaten', handlePotEaten as EventListener);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('potEaten', handlePotEaten as EventListener);
      }
    };
  }, [pot.id, onEaten]);

  return (
    <div
      className={`fixed pointer-events-none z-[999] transition-all duration-500 ${
        isEaten ? 'scale-0 opacity-0' : 'scale-100 opacity-100'
      }`}
      data-pot-id={pot.id}
      style={{
        left: `${pot.x}px`,
        top: `${pot.y}px`,
        transform: 'translate(-50%, -50%)',
      }}
    >
      <svg
        width="60"
        height="80"
        viewBox="0 0 60 80"
        className="drop-shadow-lg animate-bounce-gentle"
      >
        {/* Горшок */}
        <path
          d="M15 50 L45 50 L42 75 L18 75 Z"
          fill="#536C4A"
          stroke="#3d5037"
          strokeWidth="1"
        />
        
        {/* Земля в горшке */}
        <ellipse
          cx="30"
          cy="50"
          rx="15"
          ry="3"
          fill="#4A4A4A"
        />

        {/* Основной стебель */}
        <rect
          x="29"
          y={50 - (growthStage * 0.25)}
          width="2"
          height={growthStage * 0.25}
          fill="#228B22"
          opacity={growthStage > 10 ? 1 : 0}
        />
        
        {/* Продолжение стебля к бутону */}
        {growthStage > 50 && (
          <rect
            x="29"
            y={25 - (Math.min(growthStage - 50, 30) * 0.2)}
            width="2"
            height={Math.min(growthStage - 50, 30) * 0.2}
            fill="#228B22"
            opacity={Math.min((growthStage - 50) / 20, 1)}
          />
        )}

        {/* Листья каннабиса - появляются по мере роста */}
        {growthStage > 30 && (
          <g opacity={Math.min((growthStage - 30) / 20, 1)}>
            {/* Левый лист */}
            <path
              d="M25 40 Q20 35 18 30 Q20 32 25 35 Q28 38 30 40"
              fill="#32CD32"
              stroke="#228B22"
              strokeWidth="0.5"
              transform={`scale(${Math.min(growthStage / 100, 1)})`}
              style={{ transformOrigin: '30px 40px' }}
            />
            
            {/* Правый лист */}
            <path
              d="M35 40 Q40 35 42 30 Q40 32 35 35 Q32 38 30 40"
              fill="#32CD32"
              stroke="#228B22"
              strokeWidth="0.5"
              transform={`scale(${Math.min(growthStage / 100, 1)})`}
              style={{ transformOrigin: '30px 40px' }}
            />
          </g>
        )}

        {/* Бутон каннабиса - появляется при полном росте */}
        {growthStage > 70 && (
          <g opacity={Math.min((growthStage - 70) / 30, 1)}>
            {/* Новый бутон каннабиса - точно центрирован на стебле */}
            <g transform={`translate(30, 18) scale(${Math.min(growthStage / 100, 1) * 0.8})`} style={{ transformOrigin: '0 0' }}>
              <svg x="-12" y="-12" width="24" height="24" viewBox="0 0 24 24">
                <path fill="none" stroke="#228B22" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" d="M11.5 23.5v-4m5.5 3l-3.5-4l4.5.5l4.5-1.5L18 16l-4.5.521l5-3.469l2.899-5.451l-5.021 2.92l-3.879 5l1.5-8L11.5.5L9 7.522l1.5 8l-3.879-5l-5.02-2.92L4.5 13.053l5 3.469L5 16L.5 17.5L5 19l4.5-.5l-3.5 4l5.5-3z" strokeWidth="1"/>
              </svg>
            </g>
          </g>
        )}

        {/* Эффект блеска при полном росте */}
        {growthStage >= 100 && (
          <circle
            cx="30"
            cy="30"
            r="25"
            fill="url(#shine)"
            opacity="0.3"
            className="animate-pulse"
          />
        )}

        {/* Градиент для эффекта блеска */}
        <defs>
          <radialGradient id="shine" cx="0.3" cy="0.3">
            <stop offset="0%" stopColor="#FFD700" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#FFD700" stopOpacity="0" />
          </radialGradient>
        </defs>
      </svg>

      {/* Индикатор роста (опционально, для отладки) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs text-white px-1 rounded" style={{ backgroundColor: '#B0BF93' }}>
          {Math.round(growthStage)}%
        </div>
      )}
    </div>
  );
}
