import React from 'react';
import { Bell, BellOff, Coffee, BookOpen, PlusCircle, XCircle } from 'lucide-react';
import { TimerMode } from '../types';
import { soundEngine } from '../utils/soundEngine';

interface AlarmModalProps {
  isOpen: boolean;
  completedMode: TimerMode;
  studyDuration: number;
  breakDuration: number;
  onStartBreak: () => void;
  onContinueStudying: () => void;
  onAddBreakTime: (minutes: number) => void;
  onEndSession: () => void;
  onDismissAlarmOnly: () => void;
}

export const AlarmModal: React.FC<AlarmModalProps> = ({
  isOpen,
  completedMode,
  studyDuration,
  breakDuration,
  onStartBreak,
  onContinueStudying,
  onAddBreakTime,
  onEndSession,
  onDismissAlarmOnly,
}) => {
  if (!isOpen) return null;

  const isStudy = completedMode === 'study';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[#FFF9F2] dark:bg-[#1E2235] pixel-box p-5 sm:p-6 text-[#2B2D42] dark:text-[#E2E8F0] shadow-[8px_8px_0px_#2B2D42]">
        {/* Animated Alarm Header */}
        <div className="flex items-center justify-between pb-3 mb-4 border-b-2 border-dashed border-[#2B2D42]">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-[#FF6B6B] border-2 border-[#2B2D42] animate-bounce">
              <Bell className="w-5 h-5 text-white animate-spin" />
            </div>
            <div>
              <span className="text-[13px] font-pixel text-[#E11D48] dark:text-[#FB7185] tracking-wide">
                ALARM RINGING!
              </span>
              <p className="text-[10px] font-silkscreen text-[#64748B] dark:text-[#94A3B8]">
                {isStudy ? 'STUDY TIMER FINISHED' : 'BREAK TIMER FINISHED'}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              soundEngine.playClick();
              onDismissAlarmOnly();
            }}
            className="px-2 py-1 text-[9px] font-pixel bg-[#CBD5E1] hover:bg-[#94A3B8] text-[#1E293B] pixel-btn flex items-center gap-1"
            title="Silence the alarm sound"
          >
            <BellOff className="w-3 h-3" />
            <span>MUTE</span>
          </button>
        </div>

        {/* Content Box */}
        <div className="mb-5 p-4 bg-white dark:bg-[#282E47] border-2 border-[#2B2D42] text-center">
          {isStudy ? (
            <>
              <div className="text-3xl mb-2">🎉</div>
              <h3 className="text-sm sm:text-base font-pixel mb-1 text-[#2B2D42] dark:text-white">
                GREAT WORK!
              </h3>
              <p className="text-xs font-silkscreen text-[#475569] dark:text-[#CBD5E1] leading-relaxed">
                You finished your <span className="font-bold text-[#E11D48]">{studyDuration} min</span> study block.
                Time to rest your eyes or keep momentum!
              </p>
            </>
          ) : (
            <>
              <div className="text-3xl mb-2">☕</div>
              <h3 className="text-sm sm:text-base font-pixel mb-1 text-[#2B2D42] dark:text-white">
                BREAK FINISHED!
              </h3>
              <p className="text-xs font-silkscreen text-[#475569] dark:text-[#CBD5E1] leading-relaxed">
                Your <span className="font-bold text-[#2563EB]">{breakDuration} min</span> break is over.
                Ready for another round of focus, or need a few more minutes?
              </p>
            </>
          )}
        </div>

        {/* Action Buttons as requested */}
        <div className="space-y-2.5">
          {isStudy ? (
            <>
              {/* Option 1: Start Break Time */}
              <button
                onClick={() => {
                  soundEngine.playClick();
                  onStartBreak();
                }}
                className="w-full py-2.5 px-3 bg-[#C5E0FD] hover:bg-[#A8D3FC] text-[#1E3A8A] font-pixel text-xs flex items-center justify-center gap-2 pixel-btn"
              >
                <Coffee className="w-4 h-4" />
                <span>START BREAK ({breakDuration} MIN)</span>
              </button>

              {/* Option 2: Continue Studying */}
              <button
                onClick={() => {
                  soundEngine.playClick();
                  onContinueStudying();
                }}
                className="w-full py-2.5 px-3 bg-[#FDCAD5] hover:bg-[#FBA8BC] text-[#831843] font-pixel text-xs flex items-center justify-center gap-2 pixel-btn"
              >
                <BookOpen className="w-4 h-4" />
                <span>CONTINUE STUDYING</span>
              </button>
            </>
          ) : (
            <>
              {/* Option 1: Continue Study */}
              <button
                onClick={() => {
                  soundEngine.playClick();
                  onContinueStudying();
                }}
                className="w-full py-2.5 px-3 bg-[#FDCAD5] hover:bg-[#FBA8BC] text-[#831843] font-pixel text-xs flex items-center justify-center gap-2 pixel-btn"
              >
                <BookOpen className="w-4 h-4" />
                <span>CONTINUE STUDYING ({studyDuration} MIN)</span>
              </button>

              {/* Option 2: Add 5 more minutes to break */}
              <button
                onClick={() => {
                  soundEngine.playClick();
                  onAddBreakTime(5);
                }}
                className="w-full py-2.5 px-3 bg-[#C5E0FD] hover:bg-[#A8D3FC] text-[#1E3A8A] font-pixel text-xs flex items-center justify-center gap-2 pixel-btn"
              >
                <PlusCircle className="w-4 h-4" />
                <span>ADD +5 MIN BREAK</span>
              </button>
            </>
          )}

          {/* End Session Button */}
          <button
            onClick={() => {
              soundEngine.playClick();
              onEndSession();
            }}
            className="w-full py-2 px-3 bg-white dark:bg-[#1A1C29] hover:bg-[#F1F5F9] dark:hover:bg-[#25283D] text-[#64748B] dark:text-[#94A3B8] font-silkscreen text-xs flex items-center justify-center gap-2 border-2 border-[#2B2D42]"
          >
            <XCircle className="w-3.5 h-3.5" />
            <span>END SESSION & RESET</span>
          </button>
        </div>
      </div>
    </div>
  );
};
