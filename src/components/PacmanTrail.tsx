'use client';

import { useEffect, useRef, useState } from 'react';

export default function PacmanTrail() {
  const pacmanRef = useRef<SVGSVGElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const trailRef = useRef<{ x: number; y: number; id: number }[]>([]);
  const [angle, setAngle] = useState(0);
  const [position, setPosition] = useState({ x: 68, y: 68 }); // pacmanSize + 20

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
    const speed = 0.4;

    let animationFrame: number;

    const drawTrail = () => {
      // Clear canvas
      ctx.clearRect(0, 0, w, h);
      
      // Draw trail with smooth fade
      const trail = trailRef.current;
      const trailLength = trail.length;
      
      ctx.fillStyle = 'white';
      
      trail.forEach((point, index) => {
        // Calculate opacity from 0.2 (new points) to 0.0 (old points)
        const age = trailLength - index;
        const opacity = Math.max(0, 0.2 - (age / trailLength) * 0.2);
        
        if (opacity > 0) {
          ctx.globalAlpha = opacity;
          ctx.beginPath();
          ctx.arc(point.x + 24, point.y + 24, 24, 0, Math.PI * 2); // Center trail on Pacman position
          ctx.fill();
        }
      });
      
      // Restore opacity
      ctx.globalAlpha = 1;
    };

    const animate = () => {
      const dx = target.x - x;
      const dy = target.y - y;

      if (Math.abs(dx) < speed && Math.abs(dy) < speed) {
        x = target.x;
        y = target.y;
        pathIndex = (pathIndex + 1) % path.length;
        target = path[pathIndex];

        const nextDx = target.x - x;
        const nextDy = target.y - y;
        if (nextDx !== 0) localAngle = nextDx > 0 ? 0 : 180;
        else if (nextDy !== 0) localAngle = nextDy > 0 ? 90 : -90;
      } else {
        if (x !== target.x) {
          x += speed * Math.sign(dx);
          localAngle = dx > 0 ? 0 : 180;
        } else if (y !== target.y) {
          y += speed * Math.sign(dy);
          localAngle = dy > 0 ? 90 : -90;
        }
      }

      // Remove offset - Pacman position should match trail position

      setPosition({ x, y });
      setAngle(localAngle);

      // Add new trail point (centered on Pacman)
      trailRef.current.push({ x: x, y: y, id: lastId++ });
      if (trailRef.current.length > 370) {
        trailRef.current.shift();
      }

      // Draw trail on canvas
      drawTrail();
      
      animationFrame = requestAnimationFrame(animate);
    };

    animationFrame = requestAnimationFrame(animate);
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
        }}
      >
        <g transform={`rotate(${angle}, 50, 50)`}>
          <defs>
            <mask id="mouth">
              <rect width="100" height="100" fill="white" />
              <path>
                <animate
                  attributeName="d"
                  dur="0.6s"
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
          <circle cx="40" cy="26" r="9" fill="#536C4A" />
        </g>
      </svg>
    </>
  );
}
