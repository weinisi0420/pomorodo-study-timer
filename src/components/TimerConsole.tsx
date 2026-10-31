import React from 'react';
import { Play, Pause, RotateCcw, FastForward, Plus, Minus, Power, Clock } from 'lucide-react';
import { TimerMode, TimerStatus } from '../types';
import { soundEngine } from '../utils/soundEngine';

interface TimerConsoleProps {
  mode: TimerMode;
  status: TimerStatus;
  timeLeft: number; // in seconds
  totalTime: number; // in seconds
  studyDuration: number; // in minutes
  breakDuration: number; // in minutes
  onToggleStartPause: () => void;
  onReset: () => void;
  onSkip: () => void;
  onEndSession: () => void;
  onUpdateStudyDuration: (minutes: number) => void;
  onUpdateBreakDuration: (minutes: number) => void;
  onSelectPreset: (study: number, breakMins: number) => void;
}

export const TimerConsole: React.FC<TimerConsoleProps> = ({
  mode,
  status,
  timeLeft,
  totalTime,
  studyDuration,
  breakDuration,
  onToggleStartPause,
  onReset,
  onSkip,
  onEndSession,
  onUpdateStudyDuration,
  onUpdateBreakDuration,
  onSelectPreset,
}) => {
  // Format MM:SS
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  // Progress percentage
  const progressPercent = totalTime > 0 ? Math.min(100, Math.max(0, Math.round(((totalTime - timeLeft) / totalTime) * 100))) : 0;
  const totalBlocks = 12;
  const filledBlocks = Math.round((progressPercent / 100) * totalBlocks);

  const isRunning = status === 'running';
  const isStudy = mode === 'study';

  return (
    <div className="bg-[#FAF7F0] dark:bg-[#1E2235] pixel-box p-4 sm:p-5 select-none w-full max-w-lg mx-auto">
      {/* Top Session Badge & Presets */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-3 border-b-2 border-dashed border-[#2B2D42]/30 dark:border-[#94A3B8]/30">
        <div className="flex items-center gap-2">
          <span
            className={`px-2.5 py-1 text-[11px] font-pixel border-2 border-[#2B2D42] tracking-wider transition-colors ${
              isStudy
                ? 'bg-[#FDCAD5] text-[#831843]'
                : 'bg-[#C5E0FD] text-[#1E3A8A]'
            }`}
          >
            {isStudy ? '📖 STUDY SESSION' : '☕ BREAK TIME'}
          </span>
          <span className="text-[9px] font-silkscreen text-[#64748B] dark:text-[#94A3B8]">
            {isRunning ? '● ACTIVE' : status === 'paused' ? '❚❚ PAUSED' : 'READY'}
          </span>
        </div>

        {/* Quick Presets */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => {
              soundEngine.playClick(600);
              onSelectPreset(25, 5);
            }}
            className={`px-2 py-0.5 text-[9px] font-pixel border border-[#2B2D42] ${
              studyDuration === 25 && breakDuration === 5
                ? 'bg-[#2B2D42] text-white'
                : 'bg-white dark:bg-[#282E47] text-[#475569] dark:text-[#CBD5E1] hover:bg-[#F1F5F9]'
            }`}
            title="Pomodoro standard 25m study / 5m break"
          >
            25/5
          </button>
          <button
            onClick={() => {
              soundEngine.playClick(650);
              onSelectPreset(50, 10);
            }}
            className={`px-2 py-0.5 text-[9px] font-pixel border border-[#2B2D42] ${
              studyDuration === 50 && breakDuration === 10
                ? 'bg-[#2B2D42] text-white'
                : 'bg-white dark:bg-[#282E47] text-[#475569] dark:text-[#CBD5E1] hover:bg-[#F1F5F9]'
            }`}
            title="Deep focus 50m study / 10m break"
          >
            50/10
          </button>
          <button
            onClick={() => {
              soundEngine.playClick(700);
              onSelectPreset(90, 20);
            }}
            className={`px-2 py-0.5 text-[9px] font-pixel border border-[#2B2D42] ${
              studyDuration === 90 && breakDuration === 20
                ? 'bg-[#2B2D42] text-white'
                : 'bg-white dark:bg-[#282E47] text-[#475569] dark:text-[#CBD5E1] hover:bg-[#F1F5F9]'
            }`}
            title="Ultradian rhythm 90m study / 20m break"
          >
            90/20
          </button>
        </div>
      </div>

      {/* Main Digital Clock Box */}
      <div className="bg-[#FFFFFF] dark:bg-[#151724] border-3 border-[#2B2D42] dark:border-[#10121C] p-5 sm:p-6 mb-4 text-center shadow-inner relative overflow-hidden">
        {/* Subtle retro clockwork header */}
        <div className="text-[10px] font-silkscreen text-[#64748B] dark:text-[#818CF8] tracking-widest uppercase mb-1">
          DIGITAL RETRO CLOCKWORK
        </div>

        {/* Large Pixel Timer Display */}
        <div
          className={`font-pixel text-4xl sm:text-5xl md:text-6xl tracking-wider py-1 font-bold ${
            isStudy ? 'text-[#2B2D42] dark:text-[#F8FAFC]' : 'text-[#1E40AF] dark:text-[#93C5FD]'
          }`}
          style={{ fontVariantNumeric: 'tabular-nums' }}
        >
          {formattedTime}
        </div>

        {/* Pixel Progress Segment Bar */}
        <div className="mt-3 max-w-xs mx-auto">
          <div className="flex items-center gap-1 justify-center py-1 bg-[#F1F5F9] dark:bg-[#1E2235] border border-[#2B2D42] p-1">
            {Array.from({ length: totalBlocks }).map((_, idx) => (
              <div
                key={idx}
                className={`h-2.5 flex-1 transition-colors duration-200 ${
                  idx < filledBlocks
                    ? isStudy
                      ? 'bg-[#F472B6] border border-[#DB2777]'
                      : 'bg-[#60A5FA] border border-[#2563EB]'
                    : 'bg-[#CBD5E1] dark:bg-[#334155] opacity-40'
                }`}
              />
            ))}
          </div>

          <div className="flex justify-between items-center text-[9px] font-silkscreen text-[#64748B] dark:text-[#94A3B8] mt-1.5 px-0.5">
            <span>PROGRESS: {progressPercent}%</span>
            <span>TARGET: {isStudy ? `${studyDuration}M FOCUS` : `${breakDuration}M BREAK`}</span>
          </div>
        </div>
      </div>

      {/* Primary Action Buttons as seen in image.png and screenshot */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-4">
        {/* Start / Pause Button */}
        <button
          onClick={() => {
            soundEngine.playClick(isRunning ? 550 : 850);
            onToggleStartPause();
          }}
          className={`py-3 px-3 text-xs sm:text-sm font-pixel flex items-center justify-center gap-1.5 pixel-btn ${
            isRunning
              ? 'bg-[#FDE047] text-[#713F12]'
              : isStudy
              ? 'bg-[#FDCAD5] text-[#831843]'
              : 'bg-[#C5E0FD] text-[#1E3A8A]'
          }`}
          title={isRunning ? 'Pause Timer' : 'Start Timer'}
        >
          {isRunning ? (
            <>
              <Pause className="w-3.5 h-3.5 fill-current" />
              <span>PAUSE</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{status === 'paused' ? 'RESUME' : 'START'}</span>
            </>
          )}
        </button>

        {/* Skip to Next Mode */}
        <button
          onClick={() => {
            soundEngine.playClick(720);
            onSkip();
          }}
          className="py-3 px-3 text-xs sm:text-sm font-pixel bg-[#C5E0FD] text-[#1E3A8A] flex items-center justify-center gap-1.5 pixel-btn"
          title={isStudy ? 'Skip to Break Time' : 'Skip to Study Time'}
        >
          <FastForward className="w-3.5 h-3.5 fill-current" />
          <span>SKIP</span>
        </button>

        {/* Reset Current Timer */}
        <button
          onClick={() => {
            soundEngine.playClick(500);
            onReset();
          }}
          className="py-3 px-3 text-xs sm:text-sm font-pixel bg-white dark:bg-[#282E47] text-[#2B2D42] dark:text-white flex items-center justify-center gap-1.5 pixel-btn"
          title="Reset current interval"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>RESET</span>
        </button>
      </div>

      {/* User Duration Setting Controls as requested:
          "user are allowed to set their own time, for study and break" */}
      <div className="p-3 bg-[#FFFFFF] dark:bg-[#282E47] border-2 border-[#2B2D42] mb-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Study Duration Setter */}
          <div>
            <label className="block text-[10px] font-pixel text-[#64748B] dark:text-[#CBD5E1] mb-1.5 flex items-center gap-1">
              <Clock className="w-3 h-3 text-[#DB2777]" />
              <span>STUDY TIME (MIN)</span>
            </label>
            <div className="flex items-center">
              <button
                disabled={isRunning}
                onClick={() => {
                  soundEngine.playClick(450);
                  onUpdateStudyDuration(Math.max(1, studyDuration - 5));
                }}
                className="w-8 h-8 flex items-center justify-center bg-[#F1F5F9] dark:bg-[#1E2235] text-[#2B2D42] dark:text-white border-2 border-[#2B2D42] hover:bg-[#E2E8F0] disabled:opacity-40 disabled:cursor-not-allowed active:bg-[#CBD5E1]"
                aria-label="Decrease study duration by 5 minutes"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>

              <div className="flex-1 h-8 flex items-center justify-center border-y-2 border-[#2B2D42] bg-white dark:bg-[#1E2235] font-pixel text-sm text-[#2B2D42] dark:text-white">
                {studyDuration}
              </div>

              <button
                disabled={isRunning}
                onClick={() => {
                  soundEngine.playClick(650);
                  onUpdateStudyDuration(Math.min(180, studyDuration + 5));
                }}
                className="w-8 h-8 flex items-center justify-center bg-[#F1F5F9] dark:bg-[#1E2235] text-[#2B2D42] dark:text-white border-2 border-[#2B2D42] hover:bg-[#E2E8F0] disabled:opacity-40 disabled:cursor-not-allowed active:bg-[#CBD5E1]"
                aria-label="Increase study duration by 5 minutes"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Break Duration Setter */}
          <div>
            <label className="block text-[10px] font-pixel text-[#64748B] dark:text-[#CBD5E1] mb-1.5 flex items-center gap-1">
              <Clock className="w-3 h-3 text-[#2563EB]" />
              <span>BREAK TIME (MIN)</span>
            </label>
            <div className="flex items-center">
              <button
                disabled={isRunning}
                onClick={() => {
                  soundEngine.playClick(450);
                  onUpdateBreakDuration(Math.max(1, breakDuration - 1));
                }}
                className="w-8 h-8 flex items-center justify-center bg-[#F1F5F9] dark:bg-[#1E2235] text-[#2B2D42] dark:text-white border-2 border-[#2B2D42] hover:bg-[#E2E8F0] disabled:opacity-40 disabled:cursor-not-allowed active:bg-[#CBD5E1]"
                aria-label="Decrease break duration by 1 minute"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>

              <div className="flex-1 h-8 flex items-center justify-center border-y-2 border-[#2B2D42] bg-white dark:bg-[#1E2235] font-pixel text-sm text-[#2B2D42] dark:text-white">
                {breakDuration}
              </div>

              <button
                disabled={isRunning}
                onClick={() => {
                  soundEngine.playClick(650);
                  onUpdateBreakDuration(Math.min(60, breakDuration + 1));
                }}
                className="w-8 h-8 flex items-center justify-center bg-[#F1F5F9] dark:bg-[#1E2235] text-[#2B2D42] dark:text-white border-2 border-[#2B2D42] hover:bg-[#E2E8F0] disabled:opacity-40 disabled:cursor-not-allowed active:bg-[#CBD5E1]"
                aria-label="Increase break duration by 1 minute"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* End Session Button as explicitly requested:
          "there will be a button to end session to reset the entire timer" */}
      <button
        onClick={() => {
          soundEngine.playClick(400);
          onEndSession();
        }}
        className="w-full py-2 px-3 text-[10px] font-pixel bg-[#FEE2E2] hover:bg-[#FECACA] text-[#991B1B] dark:bg-[#451A1A] dark:hover:bg-[#5C1D1D] dark:text-[#FCA5A5] border-2 border-[#2B2D42] flex items-center justify-center gap-2 pixel-btn"
        title="Reset entire timer session, stop sound, and restore default interval"
      >
        <Power className="w-3.5 h-3.5" />
        <span>END SESSION & RESET ENTIRE TIMER</span>
      </button>
    </div>
  );
};
