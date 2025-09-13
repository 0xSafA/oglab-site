'use client';

import { useEffect, useState } from 'react';

export default function MenuTime() {
  const [currentTime, setCurrentTime] = useState<Date>(new Date());

  useEffect(() => {
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(timeInterval);
  }, []);

  const formatTime = (date: Date) => {
    const timeString = date.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit'
    });
    const [hours, minutes] = timeString.split(':');
    
    return (
      <>
        {hours}
        <span className="animate-blink">:</span>
        {minutes}
      </>
    );
  };

  return (
    <div className="text-xs font-mono text-[#536C4A] font-semibold">
      <div>
        {currentTime.toLocaleDateString('en-GB', {
          weekday: 'short'
        })}, {currentTime.toLocaleDateString('en-GB', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        })}
      </div>
      <div className="text-lg">
        {formatTime(currentTime)}
      </div>
    </div>
  );
}
