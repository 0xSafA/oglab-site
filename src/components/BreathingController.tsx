'use client';

import { useEffect, useState } from 'react';

/**
 * Порядок "дыхания" цветов.
 * Соответствует типам каннабиса в меню
 */
const BREATHING_SEQUENCE = ['hybrid', 'sativa', 'indica'] as const;

/** Длительность одного цикла дыхания (секунды) */
const BREATH_DURATION = 12;

/** Пауза между группами цветов (секунды) */
const GROUP_PAUSE = 6;

/** Пауза между полными циклами (секунды) */
const CYCLE_PAUSE = 15;

export default function BreathingController() {
  const [activeType, setActiveType] = useState<string | null>(null);
  const [isBreathing, setIsBreathing] = useState(false);

  useEffect(() => {
    let currentIndex = 0;
    let breathingTimeout: NodeJS.Timeout;
    let pauseTimeout: NodeJS.Timeout;

    const startBreathingCycle = () => {
      // Начинаем цикл дыхания для всех типов
      setIsBreathing(true);
      
      const breatheNextType = () => {
        if (currentIndex < BREATHING_SEQUENCE.length) {
          const type = BREATHING_SEQUENCE[currentIndex];
          setActiveType(type);
          
          // Устанавливаем CSS переменную для активного типа
          if (typeof document !== 'undefined') {
            document.body.dataset.breathingType = type;
            // Также устанавливаем класс на body для более надежной работы
            document.body.classList.remove('breathing-hybrid', 'breathing-sativa', 'breathing-indica');
            document.body.classList.add(`breathing-${type}`);
          }
          
          // Через BREATH_DURATION секунд останавливаем дыхание и делаем паузу
          breathingTimeout = setTimeout(() => {
            // Останавливаем дыхание
            if (typeof document !== 'undefined') {
              document.body.dataset.breathingType = '';
              document.body.classList.remove('breathing-hybrid', 'breathing-sativa', 'breathing-indica');
            }
            
            currentIndex++;
            
            if (currentIndex < BREATHING_SEQUENCE.length) {
              // Пауза между группами
              breathingTimeout = setTimeout(breatheNextType, GROUP_PAUSE * 1000);
            } else {
              // Переходим к завершению цикла
              breatheNextType();
            }
          }, BREATH_DURATION * 1000);
        } else {
          // Завершаем цикл дыхания
          setActiveType(null);
          setIsBreathing(false);
          currentIndex = 0;
          
          if (typeof document !== 'undefined') {
            document.body.dataset.breathingType = '';
            document.body.classList.remove('breathing-hybrid', 'breathing-sativa', 'breathing-indica');
          }
          
          // Пауза перед следующим циклом
          pauseTimeout = setTimeout(startBreathingCycle, CYCLE_PAUSE * 1000);
        }
      };
      
      breatheNextType();
    };

    // Запускаем первый цикл
    startBreathingCycle();

    // Очистка таймеров при размонтировании
    return () => {
      clearTimeout(breathingTimeout);
      clearTimeout(pauseTimeout);
      if (typeof document !== 'undefined') {
        document.body.dataset.breathingType = '';
      }
    };
  }, []);

  // Компонент невидимый, только управляет состоянием
  // Помечаем значения как используемые, чтобы удовлетворить линтер
  void activeType; // read-only usage
  void isBreathing; // read-only usage
  return null;
}
