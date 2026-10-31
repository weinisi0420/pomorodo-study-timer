import React from 'react';
import { CloudRain, Lamp, Maximize, Minimize, Calendar, Flame } from 'lucide-react';
import { soundEngine } from '../utils/soundEngine';

interface HeaderNavProps {
  isNight: boolean;
  isRaining: boolean;
  isFullscreen: boolean;
  studyCycles: number;
  totalFocusMinutes: number;
  selectedDate: string;
  onDateChange: (date: string) => void;
  onSetToday: () => void;
  onStepDate: (days: number) => void;
  onOpenCalendar: () => void;
  onToggleNight: () => void;
  onToggleRain: () => void;
  onToggleFullscreen: () => void;
}

export const HeaderNav: React.FC<HeaderNavProps> = ({
  isNight,
  isRaining,
  isFullscreen,
  studyCycles,
  totalFocusMinutes,
  selectedDate,
  onDateChange,
  onSetToday,
  onStepDate,
  onOpenCalendar,
  onToggleNight,
  onToggleRain,
  onToggleFullscreen,
}) => {
  const todayStr = (() => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  })();

  const isToday = selectedDate === todayStr;

  const formatDateDisplay = (dateStr: string) => {
    try {
      const [year, month, day] = dateStr.split('-').map(Number);
      const date = new Date(year, month - 1, day);
      const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
      return `${months[date.getMonth()]} ${String(date.getDate()).padStart(2, '0')}, ${date.getFullYear()}`;
    } catch {
      return dateStr;
    }
  };

  return (
    <header className="w-full bg-[#FAF7F0] dark:bg-[#1E2235] border-b-3 border-[#2B2D42] dark:border-[#10121C] px-3 sm:px-6 py-2.5 sm:py-3 select-none">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Brand Lockup */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#C5E0FD] border-2 border-[#2B2D42] flex items-center justify-center shadow-[2px_2px_0px_#2B2D42]">
            <span className="font-pixel text-xs text-[#1E3A8A]">⏱</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xs sm:text-sm font-pixel text-[#2B2D42] dark:text-white tracking-wide">
                PIXEL POMO
              </h1>
              <span className="text-[9px] font-silkscreen px-1.5 py-0.2 bg-[#FDCAD5] text-[#831843] border border-[#2B2D42]">
                STUDY SANCTUARY
              </span>
            </div>
            <div className="text-[9px] font-silkscreen text-[#64748B] dark:text-[#94A3B8]">
              COZY LO-FI PRODUCTIVITY NOOK
            </div>
          </div>
        </div>

        {/* Center Indicators: Date Chooser, Cycle counter, Focus time, Streak */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap justify-center">
          {/* Target Element: Choose Current Date / Custom Date Selector */}
          <div className="px-2.5 py-1 bg-white dark:bg-[#151724] border-2 border-[#2B2D42] shadow-[2px_2px_0px_#2B2D42] flex items-center gap-1.5 text-[10px] font-pixel relative group">
            <Calendar className="w-3.5 h-3.5 text-[#DB2777] shrink-0" />
            <span className="text-[#DB2777] hidden sm:inline">DATE:</span>

            {/* Stepper & Date Display */}
            <div className="relative flex items-center gap-1">
              <button
                onClick={() => {
                  soundEngine.playClick(450);
                  onStepDate(-1);
                }}
                className="px-1 py-0.5 hover:bg-[#E2E8F0] dark:hover:bg-[#282E47] border border-[#2B2D42] text-[8px] font-pixel cursor-pointer leading-none"
                title="Previous Day"
                aria-label="Previous Day"
              >
                ◀
              </button>

              <label
                onClick={(e) => {
                  e.preventDefault();
                  soundEngine.playClick(700);
                  onOpenCalendar();
                }}
                className="relative cursor-pointer flex items-center gap-1 px-1.5 py-0.5 bg-[#F1F5F9] dark:bg-[#1E2235] border border-[#2B2D42] hover:bg-[#E2E8F0] dark:hover:bg-[#282E47] hover:border-[#DB2777] transition-colors"
                title="Click to open Pixel Calendar & view previous study stats"
              >
                <span className="font-silkscreen font-bold text-[#2B2D42] dark:text-white whitespace-nowrap">
                  {formatDateDisplay(selectedDate)}
                </span>
                <span className="text-[8px] text-[#DB2777] font-pixel animate-pulse">
                  📅
                </span>
                <input
                  type="button"
                  value=""
                  onClick={(e) => {
                    e.preventDefault();
                    soundEngine.playClick(700);
                    onOpenCalendar();
                  }}
                  className="opacity-0 absolute inset-0 w-full h-full cursor-pointer z-10"
                  title="Click to open Pixel Calendar & view previous study stats"
                  aria-label="Open Pixel Calendar and view study stats"
                />
              </label>

              <button
                onClick={() => {
                  soundEngine.playClick(550);
                  onStepDate(1);
                }}
                className="px-1 py-0.5 hover:bg-[#E2E8F0] dark:hover:bg-[#282E47] border border-[#2B2D42] text-[8px] font-pixel cursor-pointer leading-none"
                title="Next Day"
                aria-label="Next Day"
              >
                ▶
              </button>
            </div>

            {/* Quick Button to choose Current Date */}
            <button
              onClick={() => {
                soundEngine.playClick(700);
                onSetToday();
              }}
              className={`px-1.5 py-0.5 text-[8px] font-pixel border border-[#2B2D42] pixel-btn cursor-pointer ${
                isToday
                  ? 'bg-[#C5E0FD] text-[#1E3A8A] font-bold'
                  : 'bg-[#FDCAD5] text-[#831843] hover:bg-[#FBA8BC]'
              }`}
              title="Click to choose current date (Today)"
            >
              {isToday ? 'TODAY ★' : 'CHOOSE TODAY'}
            </button>
          </div>

          {/* Cycle count */}
          <div className="px-2.5 py-1 bg-white dark:bg-[#151724] border-2 border-[#2B2D42] shadow-[2px_2px_0px_#2B2D42] flex items-center gap-1.5 text-[10px] font-pixel">
            <span className="text-[#DB2777]">CYCLE</span>
            <span className="text-[#2B2D42] dark:text-white">
              {String((studyCycles % 4) + 1).padStart(2, '0')}/04
            </span>
            <div className="flex items-center gap-0.5 ml-1">
              {[0, 1, 2, 3].map((idx) => (
                <div
                  key={idx}
                  className={`w-2 h-2 border border-[#2B2D42] ${
                    idx < (studyCycles % 4)
                      ? 'bg-[#F43F5E]'
                      : 'bg-[#E2E8F0] dark:bg-[#334155]'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Today's Focus */}
          <div className="px-2.5 py-1 bg-white dark:bg-[#151724] border-2 border-[#2B2D42] shadow-[2px_2px_0px_#2B2D42] flex items-center gap-1.5 text-[10px] font-pixel">
            <span className="text-[#2563EB]">FOCUS:</span>
            <span className="text-[#2B2D42] dark:text-white font-silkscreen">
              {totalFocusMinutes}m
            </span>
          </div>

          {/* Streak */}
          <div className="px-2.5 py-1 bg-white dark:bg-[#151724] border-2 border-[#2B2D42] shadow-[2px_2px_0px_#2B2D42] flex items-center gap-1 text-[10px] font-pixel">
            <Flame className="w-3 h-3 text-[#F97316] fill-current" />
            <span className="text-[#EA580C]">1 DAY</span>
          </div>
        </div>

        {/* Action Controls: Rain toggle, Night Lamp toggle, Fullscreen toggle */}
        <div className="flex items-center gap-2">
          {/* Rain Button as requested */}
          <button
            onClick={() => {
              soundEngine.playClick(isRaining ? 500 : 700);
              onToggleRain();
            }}
            className={`px-2.5 py-1 text-[9px] font-pixel flex items-center gap-1.5 pixel-btn ${
              isRaining
                ? 'bg-[#C5E0FD] text-[#1E3A8A] font-bold'
                : 'bg-white dark:bg-[#282E47] text-[#475569] dark:text-[#CBD5E1]'
            }`}
            title="Toggle Rain ambiance and sound"
          >
            <CloudRain className={`w-3.5 h-3.5 ${isRaining ? 'text-[#2563EB]' : ''}`} />
            <span>RAIN: {isRaining ? 'ON' : 'OFF'}</span>
          </button>

          {/* Lamp / Night Mode button as requested */}
          <button
            onClick={() => {
              soundEngine.playClick(isNight ? 520 : 750);
              onToggleNight();
            }}
            className={`px-2.5 py-1 text-[9px] font-pixel flex items-center gap-1.5 pixel-btn ${
              isNight
                ? 'bg-[#FEF08A] text-[#854D0E] font-bold'
                : 'bg-[#FED7AA] text-[#7C2D12]'
            }`}
            title="Toggle Lamp / Night Mode"
          >
            <Lamp className="w-3.5 h-3.5" />
            <span>LAMP: {isNight ? 'NIGHT' : 'DAY'}</span>
          </button>

          {/* Fullscreen Button as requested */}
          <button
            onClick={() => {
              soundEngine.playClick(600);
              onToggleFullscreen();
            }}
            className="p-1.5 sm:px-2.5 sm:py-1 text-[9px] font-pixel bg-white dark:bg-[#282E47] text-[#2B2D42] dark:text-white pixel-btn flex items-center gap-1"
            title={isFullscreen ? 'Exit Fullscreen Mode' : 'Enter Fullscreen Mode'}
          >
            {isFullscreen ? (
              <>
                <Minimize className="w-3.5 h-3.5 text-[#E11D48]" />
                <span className="hidden sm:inline">EXIT FULL</span>
              </>
            ) : (
              <>
                <Maximize className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">FULLSCREEN</span>
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
