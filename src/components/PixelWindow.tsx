import React, { useEffect, useRef } from 'react';
import { CloudRain, Sun, Moon, Sparkles } from 'lucide-react';

interface PixelWindowProps {
  isNight: boolean;
  isRaining: boolean;
  onToggleRain: () => void;
}

export const PixelWindow: React.FC<PixelWindowProps> = ({
  isNight,
  isRaining,
  onToggleRain,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Animated canvas for pixel rain drops streaking down
  useEffect(() => {
    if (!isRaining) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    const width = (canvas.width = canvas.parentElement?.clientWidth || 240);
    const height = (canvas.height = canvas.parentElement?.clientHeight || 260);

    // Rain drop streaks
    const drops = Array.from({ length: 38 }, () => ({
      x: Math.floor(Math.random() * width),
      y: Math.floor(Math.random() * height),
      length: 6 + Math.floor(Math.random() * 8),
      speed: 3 + Math.floor(Math.random() * 4),
      alpha: 0.4 + Math.random() * 0.5,
    }));

    // Window pane condensation drops
    const paneDrops = Array.from({ length: 14 }, () => ({
      x: Math.floor(Math.random() * (width - 16)) + 8,
      y: Math.floor(Math.random() * (height - 16)) + 8,
      size: 2 + Math.floor(Math.random() * 3),
      trailY: 0,
      slideSpeed: 0.1 + Math.random() * 0.25,
    }));

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw pixel rain streaks (crisp rectangular steps for pixel art look)
      ctx.fillStyle = isNight ? '#93C5FD' : '#60A5FA';
      for (const d of drops) {
        ctx.globalAlpha = d.alpha;
        // Pixel line: draw 2px wide vertical blocks
        ctx.fillRect(d.x, d.y, 2, d.length);

        d.y += d.speed;
        d.x -= 0.5; // slight angle
        if (d.y > height) {
          d.y = -d.length;
          d.x = Math.floor(Math.random() * width);
        }
      }

      // Draw sliding droplets on glass
      ctx.fillStyle = isNight ? '#E0F2FE' : '#BAE6FD';
      for (const pd of paneDrops) {
        ctx.globalAlpha = 0.75;
        // Draw pixel cluster for droplet
        ctx.fillRect(pd.x, pd.y + pd.trailY, pd.size, pd.size + 1);
        ctx.fillRect(pd.x - 1, pd.y + pd.trailY + 1, pd.size + 2, pd.size - 1);

        pd.trailY += pd.slideSpeed;
        if (pd.trailY > 40) {
          pd.trailY = 0;
          pd.x = Math.floor(Math.random() * (width - 16)) + 8;
          pd.y = Math.floor(Math.random() * (height - 20)) + 4;
        }
      }

      ctx.globalAlpha = 1.0;
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isRaining, isNight]);

  return (
    <div className="relative flex flex-col items-center">
      {/* Outer Window Frame with retro pixel borders and shadow */}
      <div className="relative w-56 sm:w-64 md:w-72 h-64 sm:h-72 bg-[#FAF7F0] dark:bg-[#1E2235] border-4 border-[#2B2D42] dark:border-[#10121C] shadow-[5px_5px_0px_0px_#2B2D42] dark:shadow-[5px_5px_0px_0px_#0B0D14] p-3 rounded-none overflow-hidden select-none">
        {/* Sky View */}
        <div
          className={`relative w-full h-full transition-colors duration-700 overflow-hidden ${
            isNight
              ? isRaining
                ? 'bg-gradient-to-b from-[#0F172A] via-[#1E293B] to-[#334155]'
                : 'bg-gradient-to-b from-[#0B0F19] via-[#182035] to-[#2B3553]'
              : isRaining
              ? 'bg-gradient-to-b from-[#7F9EB2] via-[#9AB8CE] to-[#B8D3E6]'
              : 'bg-gradient-to-b from-[#87CEEB] via-[#BFE6FF] to-[#E2F3FF]'
          }`}
        >
          {/* Celestial Body: Sun or Moon */}
          {!isNight ? (
            <div className="absolute top-4 right-6 group transition-transform duration-500">
              {/* Pixel Sun with glowing aura */}
              <div
                className={`w-12 h-12 rounded-none transition-all duration-500 ${
                  isRaining ? 'bg-[#FBBF24]/70' : 'bg-[#FFA94D]'
                } shadow-[0_0_24px_rgba(255,170,0,0.6)] relative`}
              >
                {/* Pixel corner cutouts to make a pixel circle */}
                <div className="absolute top-0 left-0 w-2 h-2 bg-[#87CEEB]" />
                <div className="absolute top-0 right-0 w-2 h-2 bg-[#87CEEB]" />
                <div className="absolute bottom-0 left-0 w-2 h-2 bg-[#87CEEB]" />
                <div className="absolute bottom-0 right-0 w-2 h-2 bg-[#87CEEB]" />
                <div className="absolute inset-1 border-2 border-[#FFE8A3] opacity-80" />
              </div>
            </div>
          ) : (
            <div className="absolute top-4 right-7">
              {/* Pixel Moon */}
              <div className="w-10 h-10 bg-[#FEF08A] shadow-[0_0_20px_rgba(254,240,138,0.5)] relative">
                {/* Pixel corner cutouts */}
                <div className="absolute top-0 left-0 w-2 h-2 bg-[#0B0F19]" />
                <div className="absolute top-0 right-0 w-2 h-2 bg-[#0B0F19]" />
                <div className="absolute bottom-0 left-0 w-2 h-2 bg-[#0B0F19]" />
                <div className="absolute bottom-0 right-0 w-2 h-2 bg-[#0B0F19]" />
                {/* Crescent inner shadow */}
                <div className="absolute top-1 left-1 w-6 h-6 bg-[#182035] rounded-none" />
              </div>
            </div>
          )}

          {/* Night Stars */}
          {isNight && (
            <>
              <div className="absolute top-6 left-6 w-1.5 h-1.5 bg-white animate-pulse" />
              <div className="absolute top-14 left-16 w-2 h-2 bg-[#FDE047] animate-ping opacity-75" />
              <div className="absolute top-9 left-28 w-1 h-1 bg-white" />
              <div className="absolute top-20 right-20 w-1.5 h-1.5 bg-[#BAE6FD]" />
              <div className="absolute top-36 left-10 w-2 h-2 bg-white opacity-80" />
              <div className="absolute top-28 right-8 w-1 h-1 bg-white" />
            </>
          )}

          {/* Pixel Clouds */}
          <div
            className={`absolute top-12 left-2 transition-all duration-700 ${
              isRaining ? 'opacity-90' : isNight ? 'opacity-30' : 'opacity-70'
            }`}
          >
            <div
              className={`h-5 w-24 relative ${
                isRaining
                  ? isNight
                    ? 'bg-[#334155]'
                    : 'bg-[#64748B]'
                  : isNight
                  ? 'bg-[#334155]'
                  : 'bg-white/85'
              }`}
            >
              <div
                className={`absolute -top-3 left-3 w-14 h-4 ${
                  isRaining
                    ? isNight
                      ? 'bg-[#334155]'
                      : 'bg-[#64748B]'
                    : isNight
                    ? 'bg-[#334155]'
                    : 'bg-white/85'
                }`}
              />
              <div
                className={`absolute -top-5 left-7 w-8 h-3 ${
                  isRaining
                    ? isNight
                      ? 'bg-[#334155]'
                      : 'bg-[#64748B]'
                    : isNight
                    ? 'bg-[#334155]'
                    : 'bg-white/85'
                }`}
              />
            </div>
          </div>

          {/* Rain canvas overlay */}
          {isRaining && (
            <canvas
              ref={canvasRef}
              className="absolute inset-0 pointer-events-none z-10"
            />
          )}

          {/* Window Glass Pane Grid (4 panes with thick frame like image.png) */}
          <div className="absolute inset-0 pointer-events-none z-20">
            {/* Horizontal divider */}
            <div className="absolute top-1/2 left-0 right-0 h-2 bg-[#FAF7F0] dark:bg-[#1E2235] border-y border-[#2B2D42]/30 -translate-y-1/2" />
            {/* Vertical divider */}
            <div className="absolute top-0 bottom-0 left-1/2 w-2 bg-[#FAF7F0] dark:bg-[#1E2235] border-x border-[#2B2D42]/30 -translate-x-1/2" />
            {/* Glass reflection streak */}
            <div className="absolute top-2 left-3 w-1 h-20 bg-white/30 -rotate-12 pointer-events-none" />
            <div className="absolute top-4 left-6 w-1 h-14 bg-white/20 -rotate-12 pointer-events-none" />
          </div>
        </div>

        {/* Window Sill Bottom Accent */}
        <div className="absolute bottom-0 left-0 right-0 h-2 bg-[#E2D9CC] dark:bg-[#151722] border-t-2 border-[#2B2D42]" />
      </div>

      {/* Mini quick rain toggle button beneath window */}
      <button
        onClick={onToggleRain}
        className={`mt-2 px-2.5 py-1 text-[10px] font-pixel flex items-center gap-1.5 pixel-btn ${
          isRaining
            ? 'bg-[#C5E0FD] text-[#1E3A8A] font-bold'
            : 'bg-white dark:bg-[#202538] text-[#475569] dark:text-[#CBD5E1]'
        }`}
        title="Toggle Rain Vibe"
      >
        <CloudRain className={`w-3.5 h-3.5 ${isRaining ? 'text-[#2563EB] animate-bounce' : ''}`} />
        <span>RAIN: {isRaining ? 'ON' : 'OFF'}</span>
      </button>
    </div>
  );
};
