import React, { useEffect, useRef } from 'react';

interface AvatarVisualizerProps {
  volume: number; // 0 to 255
  isActive: boolean;
}

const AvatarVisualizer: React.FC<AvatarVisualizerProps> = ({ volume, isActive }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let currentRadius = 80;
    const targetRadius = 80 + (volume / 255) * 60; // Scale radius based on volume

    const render = () => {
      // Smooth interpolation
      currentRadius += (targetRadius - currentRadius) * 0.1;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;

      if (isActive) {
        // Outer glow
        const gradient = ctx.createRadialGradient(centerX, centerY, currentRadius * 0.5, centerX, centerY, currentRadius * 1.5);
        gradient.addColorStop(0, 'rgba(56, 189, 248, 0.8)'); // Sky blue core
        gradient.addColorStop(0.6, 'rgba(56, 189, 248, 0.2)');
        gradient.addColorStop(1, 'rgba(56, 189, 248, 0)');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(centerX, centerY, currentRadius * 1.5, 0, Math.PI * 2);
        ctx.fill();

        // Inner circle
        ctx.beginPath();
        ctx.arc(centerX, centerY, 50, 0, Math.PI * 2);
        ctx.fillStyle = '#0ea5e9';
        ctx.fill();
        
        // Eyes (Decor)
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(centerX - 15, centerY - 5, 5, 0, Math.PI * 2);
        ctx.arc(centerX + 15, centerY - 5, 5, 0, Math.PI * 2);
        ctx.fill();

      } else {
        // Sleeping state
        ctx.beginPath();
        ctx.arc(centerX, centerY, 40, 0, Math.PI * 2);
        ctx.fillStyle = '#475569'; // Slate 600
        ctx.fill();
        
        // "Zzz" line
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(centerX - 10, centerY);
        ctx.lineTo(centerX + 10, centerY);
        ctx.stroke();
      }

      animationId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animationId);
  }, [volume, isActive]);

  return (
    <div className="relative flex justify-center items-center h-64 w-full">
      <canvas 
        ref={canvasRef} 
        width={300} 
        height={300} 
        className="z-10"
      />
      {isActive && (
        <div className="absolute bottom-4 text-sky-300 text-sm animate-pulse font-medium tracking-wide">
          ESCUCHANDO / HABLANDO...
        </div>
      )}
    </div>
  );
};

export default AvatarVisualizer;
