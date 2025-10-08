'use client';

import { useCallback, useEffect, useState } from 'react';

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
  lifeDuration: 40000,       // Горшочек живет 40 секунд (больше времени для медленных устройств)
  maxActivePots: 1,          // Максимум 1 горшочек одновременно
};

export default function PotController() {
  const [activePots, setActivePots] = useState<PotPosition[]>([]);

  // Функция удаления горшочка (объявлена раньше, т.к. используется в spawnPot)
  const removePot = useCallback((potId: string) => {
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
  }, []);

  // Функция создания нового горшочка
  const spawnPot = useCallback(() => {
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
  }, [activePots, removePot]);

  // Принудительная очистка старых горшочков
  const forceCleanup = useCallback(() => {
    const now = Date.now();
    setActivePots(prev => {
      const cleaned = prev.filter(pot => now - pot.createdAt < POT_CONFIG.lifeDuration + 5000);
      return cleaned;
    });
  }, []);

  // Экстренная очистка для медленных устройств
  const emergencyCleanup = useCallback(() => {
    if (activePots.length > POT_CONFIG.maxActivePots) {
      setActivePots([]);
      if (typeof document !== 'undefined') {
        document.body.dataset.activePot = '';
      }
    }
  }, [activePots]);

  // Основной цикл появления горшочков
  useEffect(() => {
    // Pause timers when page hidden (TV/low-power)
    const handleVisibility = () => {
      if (document.hidden) {
        clearTimeout(initialTimeout);
        clearInterval(spawnInterval);
        clearInterval(cleanupInterval);
        clearInterval(emergencyInterval);
      } else {
        // restart light timers when visible again
        spawnPot();
      }
    };

    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', handleVisibility);
    }
    // Первый горшочек через 10 секунд после загрузки
    const initialTimeout = setTimeout(spawnPot, 10000);

    // Регулярное появление горшочков
    const spawnInterval = setInterval(() => {
      spawnPot();
    }, POT_CONFIG.spawnInterval);

    // Принудительная очистка каждые 20 секунд
    const cleanupInterval = setInterval(forceCleanup, 20000);
    
    // Экстренная очистка каждые 10 секунд для медленных устройств
    const emergencyInterval = setInterval(emergencyCleanup, 10000);

    // Мягкий сброс: очищаем все горшочки и сбрасываем глобальное состояние
    const handleSoftRefresh = () => {
      try {
        setActivePots([]);
        if (typeof document !== 'undefined') {
          document.body.dataset.activePot = '';
        }
      } catch {}
    };
    window.addEventListener('softRefresh', handleSoftRefresh as EventListener);

    // Очистка при размонтировании
    return () => {
      clearTimeout(initialTimeout);
      clearInterval(spawnInterval);
      clearInterval(cleanupInterval);
      clearInterval(emergencyInterval);
      if (typeof document !== 'undefined') {
        document.removeEventListener('visibilitychange', handleVisibility);
      }
      if (typeof window !== 'undefined') {
        window.removeEventListener('softRefresh', handleSoftRefresh as EventListener);
      }
      if (typeof document !== 'undefined') {
        document.body.dataset.activePot = '';
      }
    };
  }, [spawnPot, forceCleanup, emergencyCleanup]);

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
