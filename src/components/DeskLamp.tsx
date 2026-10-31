import React from 'react';
import { soundEngine } from '../utils/soundEngine';

interface DeskLampProps {
  isNight: boolean;
  onToggleNight: () => void;
}

export const DeskLamp: React.FC<DeskLampProps> = ({ isNight, onToggleNight }) => {
  const handleClick = () => {
    soundEngine.playClick(isNight ? 520 : 780);
    onToggleNight();
  };

  return (
    <div className="relative flex flex-col items-center select-none group">
      {/* "Click me!" retro speech label just like image.png */}
      <button
        onClick={handleClick}
        className="mb-1 text-[11px] font-pixel text-[#2B2D42] dark:text-[#FEF08A] tracking-wider animate-bounce hover:scale-105 transition-transform cursor-pointer"
        title="Click to toggle Night Mode"
      >
        Click me!
      </button>

      {/* Interactive Lamp Graphic */}
      <button
        onClick={handleClick}
        className="relative flex flex-col items-center cursor-pointer p-1 focus:outline-none transition-transform active:scale-95"
        aria-label="Toggle Night Mode Lamp"
        title={isNight ? 'Click to turn off lamp / switch to Day' : 'Click to turn on lamp / switch to Night'}
      >
        {/* Lamp Dome Shade */}
        <div className="relative">
          {/* Top finial pixel */}
          <div className="mx-auto w-2 h-1 bg-[#2B2D42] border border-[#2B2D42]" />

          {/* Dome shade */}
          <div
            className={`w-14 sm:w-16 h-7 sm:h-8 rounded-t-full border-2 border-[#2B2D42] relative transition-all duration-300 ${
              isNight
                ? 'bg-[#FF6B6B] shadow-[0_0_20px_#FDE047]'
                : 'bg-[#FF7A70] hover:brightness-105'
            }`}
          >
            {/* Highlight gleam */}
            <div className="absolute top-1 left-2 w-3 h-1 bg-white/50 rounded-full" />
          </div>

          {/* Rim of lampshade */}
          <div
            className={`w-16 sm:w-18 -mx-1 h-2.5 border-2 border-[#2B2D42] transition-colors duration-300 ${
              isNight ? 'bg-[#FEF08A]' : 'bg-[#F4A261]'
            }`}
          />
        </div>

        {/* Lamp Stem */}
        <div className="w-2 sm:w-2.5 h-10 sm:h-12 bg-[#2B2D42] border-x border-[#1A1C29] relative">
          {/* Pull chain cord */}
          <div className="absolute top-1 -right-2 flex flex-col items-center">
            <div className="w-0.5 h-4 bg-[#718096]" />
            <div
              className={`w-1.5 h-1.5 rounded-full border border-[#2B2D42] ${
                isNight ? 'bg-[#FEF08A]' : 'bg-[#E2E8F0]'
              }`}
            />
          </div>
        </div>

        {/* Lamp Base Stand */}
        <div className="w-10 sm:w-12 h-2.5 sm:h-3 rounded-t-lg bg-[#FF7A70] border-2 border-[#2B2D42] shadow-[2px_2px_0px_#2B2D42]" />

        {/* Warm light cone radiating downward when night mode is active */}
        {isNight && (
          <div
            className="absolute top-8 pointer-events-none z-10 w-44 h-36 opacity-35 bg-gradient-to-b from-[#FEF08A] via-[#FDE047]/30 to-transparent"
            style={{
              clipPath: 'polygon(35% 0%, 65% 0%, 100% 100%, 0% 100%)',
            }}
          />
        )}
      </button>

      {/* Status indicator tag */}
      <div className="mt-1 px-2 py-0.5 text-[9px] font-pixel text-[#475569] dark:text-[#CBD5E1] bg-white/70 dark:bg-[#1E2235]/70 pixel-box-sm">
        {isNight ? 'LAMP: ON' : 'LAMP: OFF'}
      </div>
    </div>
  );
};
