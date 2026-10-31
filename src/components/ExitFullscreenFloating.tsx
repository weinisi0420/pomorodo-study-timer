import React from 'react';
import { Minimize } from 'lucide-react';
import { soundEngine } from '../utils/soundEngine';

interface ExitFullscreenFloatingProps {
  isFullscreen: boolean;
  onExitFullscreen: () => void;
}

export const ExitFullscreenFloating: React.FC<ExitFullscreenFloatingProps> = ({
  isFullscreen,
  onExitFullscreen,
}) => {
  if (!isFullscreen) return null;

  return (
    <div className="fixed top-4 right-4 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
      <button
        onClick={() => {
          soundEngine.playClick(600);
          onExitFullscreen();
        }}
        className="px-3 py-1.5 bg-[#FFF1F2] dark:bg-[#3F121E] border-2 border-[#2B2D42] text-[#BE123C] dark:text-[#FDA4AF] font-pixel text-[10px] pixel-btn flex items-center gap-1.5 shadow-[3px_3px_0px_#2B2D42]"
        title="Exit Full Screen (or press Esc)"
      >
        <Minimize className="w-3.5 h-3.5" />
        <span>EXIT FULLSCREEN</span>
        <span className="text-[8px] opacity-75">(ESC)</span>
      </button>
    </div>
  );
};
