'use client';

interface CSSParticlesProps {
  children: React.ReactNode;
  className?: string;
  particleCount?: number;
}

export default function CSSParticles({ 
  children, 
  className = '',
  particleCount = 6
}: CSSParticlesProps) {
  const getParticleStyle = (i: number) => {
    const hue = (i * 60) % 360;
    const left = (i * 17 + 10) % 80;
    const top = (i * 23 + 15) % 70;
    const animationType = i % 3;
    const duration = 3 + (i % 3);
    const glowDuration = 2 + (i % 2);
    const delay = i * 0.5;

    return {
      background: `hsl(${hue}, 70%, 60%)`,
      left: `${left}%`,
      top: `${top}%`,
      animationDelay: `${delay}s`,
      '--particle-type': animationType,
      '--duration': `${duration}s`,
      '--glow-duration': `${glowDuration}s`,
    } as React.CSSProperties & { [key: string]: string | number };
  };

  return (
    <div className={`relative ${className}`}>
      {/* CSS-only частицы */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {Array.from({ length: particleCount }, (_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 rounded-full opacity-70 animate-css-particle"
            style={getParticleStyle(i)}
          />
        ))}
      </div>
      
      {/* Контент */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}
