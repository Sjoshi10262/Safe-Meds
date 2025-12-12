import React, { useEffect, useState } from 'react';

interface Props {
  onComplete: () => void;
}

const IntroAnimation: React.FC<Props> = ({ onComplete }) => {
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    // Total duration ~3.5s
    const timer = setTimeout(() => {
      setFinished(true);
      setTimeout(onComplete, 500); // Allow fade out
    }, 3500);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className={`fixed inset-0 z-[100] bg-black flex items-center justify-center overflow-hidden transition-opacity duration-500 ${finished ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
      
      <div className="relative flex flex-col items-center justify-center animate-zoom-in-out">
        
        {/* SVG Heart */}
        <div className="relative w-32 h-32 md:w-48 md:h-48">
          <svg viewBox="0 0 24 24" className="w-full h-full drop-shadow-[0_0_15px_rgba(37,99,235,0.8)]">
            <defs>
              <linearGradient id="heartGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#3b82f6" /> {/* Blue-500 */}
                <stop offset="100%" stopColor="#8b5cf6" /> {/* Violet-500 */}
              </linearGradient>
            </defs>
            
            {/* The Path: Draws outline first, then fills */}
            <path 
              d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
              fill="url(#heartGradient)"
              stroke="url(#heartGradient)"
              strokeWidth="1.5"
              strokeDasharray="1000"
              fillOpacity="0"
              className="animate-draw [&]:animate-fill-in [&]:animate-heartbeat"
            />
          </svg>
        </div>

        {/* Text */}
        <div className="mt-8 text-center opacity-0 animate-fade-in" style={{ animationDelay: '1.5s', animationFillMode: 'forwards' }}>
          <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-violet-400 tracking-[0.2em] uppercase">
            Safe-Meds
          </h1>
          <p className="text-[10px] text-slate-400 font-bold tracking-widest mt-2 uppercase">
            Your Personal Health AI
          </p>
        </div>

      </div>
    </div>
  );
};

export default IntroAnimation;