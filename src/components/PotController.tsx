'use client';

import { useEffect, useState } from 'react';

export interface PotPosition {
  id: string;
  x: number;
  y: number;
  isActive: boolean;
  createdAt: number;
}

// Фиксированные позиции для горшочков (адаптивные)
const POT_POSITIONS = [
  { x: 150, y: 200 },   // Левый верх
  { x: 400, y: 150 },   // Центр верх
  { x: 650, y: 300 },   // Правый центр
  { x: 300, y: 450 },   // Левый низ
  { x: 550, y: 500 },   // Правый низ
  { x: 200, y: 350 },   // Левый центр
  { x: 500, y: 250 },   // Центр
  { x: 350, y: 100 },   // Центр верх-2
];

const POT_CONFIG = {
  spawnInterval: 45000,      // Появление каждые 45 секунд
  lifeDuration: 25000,       // Горшочек живет 25 секунд
  maxActivePots: 1,          // Максимум 1 горшочек одновременно
};

export default function PotController() {
  const [activePots, setActivePots] = useState<PotPosition[]>([]);

  // Функция создания нового горшочка
  const spawnPot = () => {
    if (activePots.length >= POT_CONFIG.maxActivePots) {
      return; // Не создаем если уже максимум
    }

    // Выбираем случайную позицию из доступных
    const availablePositions = POT_POSITIONS.filter(pos => 
      !activePots.some(pot => pot.x === pos.x && pot.y === pos.y)
    );

    if (availablePositions.length === 0) {
      return; // Нет свободных позиций
    }

    const randomPos = availablePositions[Math.floor(Math.random() * availablePositions.length)];
    const newPot: PotPosition = {
      id: `pot-${Date.now()}-${Math.random()}`,
      x: randomPos.x,
      y: randomPos.y,
      isActive: true,
      createdAt: Date.now(),
    };

    setActivePots(prev => [...prev, newPot]);
    
    console.log(`🌱 New pot spawned at (${newPot.x}, ${newPot.y})`);

    // Устанавливаем глобальное состояние для пакмана
    if (typeof document !== 'undefined') {
      document.body.dataset.activePot = JSON.stringify(newPot);
      // Диспатчим кастомное событие для пакмана
      window.dispatchEvent(new CustomEvent('potSpawned', { detail: newPot }));
    }

    // Автоматическое удаление через lifeDuration
    setTimeout(() => {
      removePot(newPot.id);
    }, POT_CONFIG.lifeDuration);
  };

  // Функция удаления горшочка
  const removePot = (potId: string) => {
    setActivePots(prev => {
      const updatedPots = prev.filter(pot => pot.id !== potId);
      
      // Обновляем глобальное состояние
      if (typeof document !== 'undefined') {
        if (updatedPots.length > 0) {
          document.body.dataset.activePot = JSON.stringify(updatedPots[0]);
        } else {
          document.body.dataset.activePot = '';
        }
      }
      
      return updatedPots;
    });
    
    console.log(`🍽️ Pot ${potId} removed`);
  };

  // Функция для "поедания" горшочка пакманом
  const eatPot = (potId: string) => {
    console.log(`🎮 Pacman ate pot ${potId}!`);
    removePot(potId);
    
    // Диспатчим событие что горшочек съеден
    if (typeof document !== 'undefined') {
      window.dispatchEvent(new CustomEvent('potEaten', { detail: { potId } }));
    }
  };

  // Принудительная очистка старых горшочков
  const forceCleanup = () => {
    const now = Date.now();
    setActivePots(prev => {
      const cleaned = prev.filter(pot => now - pot.createdAt < POT_CONFIG.lifeDuration + 5000);
      if (cleaned.length !== prev.length) {
        console.log(`🧹 Force cleanup: removed ${prev.length - cleaned.length} old pots`);
      }
      return cleaned;
    });
  };

  // Основной цикл появления горшочков
  useEffect(() => {
    // Первый горшочек через 10 секунд после загрузки
    const initialTimeout = setTimeout(spawnPot, 10000);

    // Регулярное появление горшочков
    const spawnInterval = setInterval(() => {
      spawnPot();
    }, POT_CONFIG.spawnInterval);

    // Принудительная очистка каждые 20 секунд
    const cleanupInterval = setInterval(forceCleanup, 20000);

    // Слушаем события от пакмана
    const handlePotEaten = (event: CustomEvent) => {
      const { potId } = event.detail;
      eatPot(potId);
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('potEaten', handlePotEaten as EventListener);
    }

    // Очистка при размонтировании
    return () => {
      clearTimeout(initialTimeout);
      clearInterval(spawnInterval);
      clearInterval(cleanupInterval);
      if (typeof window !== 'undefined') {
        window.removeEventListener('potEaten', handlePotEaten as EventListener);
      }
      if (typeof document !== 'undefined') {
        document.body.dataset.activePot = '';
      }
    };
  }, []);

  // Обновляем глобальное состояние при изменении активных горшочков
  useEffect(() => {
    if (typeof document !== 'undefined') {
      if (activePots.length > 0) {
        document.body.dataset.activePot = JSON.stringify(activePots[0]);
      } else {
        document.body.dataset.activePot = '';
      }
    }
  }, [activePots]);

  // Компонент невидимый, только управляет логикой
  return null;
}
