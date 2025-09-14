'use client';

import { useEffect, useState } from 'react';
import AnimatedPot from './AnimatedPot';
import type { PotPosition } from './PotController';

export default function PotManager() {
  const [activePots, setActivePots] = useState<PotPosition[]>([]);

  // Слушаем события появления и поедания горшочков
  useEffect(() => {
    const handlePotSpawned = (event: CustomEvent) => {
      const newPot = event.detail as PotPosition;
      setActivePots(prev => [...prev, newPot]);
      console.log(`🌱 Pot manager: Added pot ${newPot.id}`);
    };

    const handlePotEaten = (event: CustomEvent) => {
      const { potId } = event.detail;
      setActivePots(prev => prev.filter(pot => pot.id !== potId));
      console.log(`🍽️ Pot manager: Removed pot ${potId}`);
    };

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
  }, []);

  // Функция для удаления горшочка (вызывается из AnimatedPot)
  const handlePotEaten = (potId: string) => {
    setActivePots(prev => prev.filter(pot => pot.id !== potId));
  };

  return (
    <>
      {activePots.map(pot => (
        <AnimatedPot
          key={pot.id}
          pot={pot}
          onEaten={handlePotEaten}
        />
      ))}
    </>
  );
}
