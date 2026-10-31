import React, { useState } from 'react';
import { Calendar as CalendarIcon, X, ChevronLeft, ChevronRight, Clock, Award, Sprout, Flame } from 'lucide-react';
import { DayStudyStats } from '../types';
import { soundEngine } from '../utils/soundEngine';

interface PixelCalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: string; // YYYY-MM-DD
  onSelectDate: (dateStr: string) => void;
  dailyStats: Record<string, DayStudyStats>;
}

export const PixelCalendarModal: React.FC<PixelCalendarModalProps> = ({
  isOpen,
  onClose,
  selectedDate,
  onSelectDate,
  dailyStats,
}) => {
  if (!isOpen) return null;

  // Track the month currently viewed in the calendar
  const [viewYear, setViewYear] = useState<number>(() => {
    const parts = selectedDate.split('-').map(Number);
    return parts[0] || 2026;
  });
  const [viewMonth, setViewMonth] = useState<number>(() => {
    const parts = selectedDate.split('-').map(Number);
    return (parts[1] || 10) - 1; // 0-indexed
  });

  const [activeDateInspect, setActiveDateInspect] = useState<string>(selectedDate);

  const monthNames = [
    'JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE',
    'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'
  ];

  const daysOfWeek = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];

  // Current today string
  const todayStr = (() => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  })();

  // Navigate months
  const handlePrevMonth = () => {
    soundEngine.playClick(500);
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    soundEngine.playClick(650);
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const handleJumpToday = () => {
    soundEngine.playClick(750);
    const d = new Date();
    setViewYear(d.getFullYear());
    setViewMonth(d.getMonth());
    setActiveDateInspect(todayStr);
    onSelectDate(todayStr);
  };

  // Calendar math
  const firstDayOfMonth = new Date(viewYear, viewMonth, 1).getDay();
  const daysInCurrentMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

  // Inspect stats for activeDateInspect
  const inspectedStats = dailyStats[activeDateInspect] || {
    date: activeDateInspect,
    focusMinutes: 0,
    cycles: 0,
    xp: 0,
  };

  const formatLongDate = (dStr: string) => {
    try {
      const [y, m, d] = dStr.split('-').map(Number);
      const date = new Date(y, m - 1, d);
      return date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }).toUpperCase();
    } catch {
      return dStr;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150 select-none">
      <div className="relative w-full max-w-lg bg-[#FAF7F0] dark:bg-[#1E2235] pixel-box p-4 sm:p-5 text-[#2B2D42] dark:text-[#E2E8F0] shadow-[8px_8px_0px_#2B2D42]">
        {/* Header Bar */}
        <div className="flex items-center justify-between pb-3 mb-3 border-b-2 border-dashed border-[#2B2D42]/40 dark:border-[#CBD5E1]/30">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-[#C5E0FD] border-2 border-[#2B2D42]">
              <CalendarIcon className="w-4 h-4 text-[#1E3A8A]" />
            </div>
            <div>
              <h2 className="text-[12px] font-pixel text-[#2B2D42] dark:text-white">
                PIXEL STUDY CALENDAR
              </h2>
              <p className="text-[9px] font-silkscreen text-[#64748B] dark:text-[#94A3B8]">
                PICK DATE & VIEW PREVIOUS STUDY STATS
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              soundEngine.playClick(400);
              onClose();
            }}
            className="p-1 hover:bg-[#F1F5F9] dark:hover:bg-[#282E47] border-2 border-[#2B2D42] text-[#2B2D42] dark:text-white"
            title="Close Calendar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Month Navigation Row */}
        <div className="flex items-center justify-between mb-3 bg-white dark:bg-[#151724] border-2 border-[#2B2D42] p-2 shadow-xs">
          <div className="flex items-center gap-1">
            <button
              onClick={handlePrevMonth}
              className="p-1 hover:bg-[#E2E8F0] dark:hover:bg-[#282E47] border border-[#2B2D42] text-[9px] font-pixel"
              title="Previous Month"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span className="text-[11px] font-pixel px-2 text-[#2B2D42] dark:text-white">
              {monthNames[viewMonth]} {viewYear}
            </span>
            <button
              onClick={handleNextMonth}
              className="p-1 hover:bg-[#E2E8F0] dark:hover:bg-[#282E47] border border-[#2B2D42] text-[9px] font-pixel"
              title="Next Month"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            onClick={handleJumpToday}
            className={`px-2 py-1 text-[8px] font-pixel border border-[#2B2D42] pixel-btn ${
              selectedDate === todayStr
                ? 'bg-[#C5E0FD] text-[#1E3A8A] font-bold'
                : 'bg-[#FDCAD5] text-[#831843]'
            }`}
          >
            JUMP TO TODAY
          </button>
        </div>

        {/* Days of Week Header */}
        <div className="grid grid-cols-7 gap-1 text-center mb-1">
          {daysOfWeek.map((day, idx) => (
            <div
              key={day}
              className={`text-[9px] font-pixel py-1 ${
                idx === 0 || idx === 6
                  ? 'text-[#DB2777]'
                  : 'text-[#64748B] dark:text-[#94A3B8]'
              }`}
            >
              {day}
            </div>
          ))}
        </div>

        {/* 7x6 Calendar Month Grid */}
        <div className="grid grid-cols-7 gap-1 bg-[#E2E8F0]/40 dark:bg-[#151724]/40 p-1 border-2 border-[#2B2D42] mb-3">
          {/* Previous month trailing days */}
          {Array.from({ length: firstDayOfMonth }).map((_, idx) => {
            const dayNum = daysInPrevMonth - firstDayOfMonth + idx + 1;
            return (
              <div
                key={`prev-${idx}`}
                className="h-10 sm:h-11 p-1 bg-[#F1F5F9]/40 dark:bg-[#181B29]/40 border border-transparent opacity-30 text-[9px] font-silkscreen flex flex-col justify-between"
              >
                <span>{dayNum}</span>
              </div>
            );
          })}

          {/* Current month days */}
          {Array.from({ length: daysInCurrentMonth }).map((_, idx) => {
            const dayNum = idx + 1;
            const monthStr = String(viewMonth + 1).padStart(2, '0');
            const dayStr = String(dayNum).padStart(2, '0');
            const dateKey = `${viewYear}-${monthStr}-${dayStr}`;

            const isCurrentInspected = activeDateInspect === dateKey;
            const isActualToday = dateKey === todayStr;
            const dayData = dailyStats[dateKey];
            const hasStudyTime = dayData && dayData.focusMinutes > 0;

            return (
              <button
                key={dateKey}
                onClick={() => {
                  soundEngine.playClick(600);
                  setActiveDateInspect(dateKey);
                  onSelectDate(dateKey);
                }}
                className={`h-11 sm:h-12 p-1 border transition-all text-left flex flex-col justify-between cursor-pointer relative ${
                  isCurrentInspected
                    ? 'bg-[#FDCAD5] dark:bg-[#831843] border-2 border-[#2B2D42] shadow-[2px_2px_0px_#2B2D42] z-10'
                    : isActualToday
                    ? 'bg-[#C5E0FD]/70 dark:bg-[#1E3A8A]/50 border-2 border-[#2563EB]'
                    : hasStudyTime
                    ? 'bg-white dark:bg-[#282E47] border-[#2B2D42] hover:bg-[#F8FAFC]'
                    : 'bg-white/80 dark:bg-[#1A1D2E]/80 border-[#CBD5E1] dark:border-[#334155] hover:border-[#2B2D42]'
                }`}
              >
                {/* Day Number and Today star */}
                <div className="flex items-center justify-between w-full">
                  <span
                    className={`text-[9px] font-pixel ${
                      isCurrentInspected
                        ? 'text-[#831843] dark:text-white font-bold'
                        : isActualToday
                        ? 'text-[#1E40AF] dark:text-[#93C5FD] font-bold'
                        : 'text-[#2B2D42] dark:text-white'
                    }`}
                  >
                    {dayNum}
                  </span>
                  {isActualToday && (
                    <span className="text-[7px] text-[#2563EB] dark:text-[#93C5FD] font-pixel leading-none">
                      ★
                    </span>
                  )}
                </div>

                {/* Study Time badge if date has study minutes */}
                {hasStudyTime ? (
                  <div className="w-full flex items-center justify-between mt-auto">
                    <span className="text-[7.5px] font-silkscreen px-0.5 py-0.2 bg-[#DCFCE7] dark:bg-[#166534] text-[#166534] dark:text-[#86EFAC] border border-[#16A34A] leading-tight truncate">
                      {dayData.focusMinutes}m
                    </span>
                    <div className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-ping" />
                  </div>
                ) : (
                  <div className="h-2" />
                )}
              </button>
            );
          })}
        </div>

        {/* Selected Date Stats Card */}
        <div className="bg-white dark:bg-[#282E47] border-2 border-[#2B2D42] p-3 shadow-[2px_2px_0px_#2B2D42]">
          <div className="flex items-center justify-between pb-1.5 mb-2 border-b border-dashed border-[#2B2D42]/30 dark:border-[#94A3B8]/30">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-pixel text-[#DB2777]">
                DATE STATS:
              </span>
              <span className="text-[10px] font-pixel text-[#2B2D42] dark:text-white">
                {formatLongDate(activeDateInspect)}
              </span>
            </div>
            {activeDateInspect === todayStr && (
              <span className="text-[8px] font-pixel px-1.5 py-0.2 bg-[#C5E0FD] text-[#1E3A8A] border border-[#2B2D42]">
                CURRENT TODAY
              </span>
            )}
          </div>

          <div className="grid grid-cols-3 gap-2 text-center mb-2">
            {/* Focus Time */}
            <div className="p-2 bg-[#F8FAFC] dark:bg-[#1E2235] border border-[#2B2D42]">
              <div className="flex items-center justify-center gap-1 text-[8px] font-silkscreen text-[#64748B] dark:text-[#94A3B8] mb-0.5">
                <Clock className="w-3 h-3 text-[#2563EB]" />
                <span>STUDY TIME</span>
              </div>
              <div className="text-[12px] font-pixel font-bold text-[#1E40AF] dark:text-[#93C5FD]">
                {inspectedStats.focusMinutes}m
              </div>
            </div>

            {/* Cycles Completed */}
            <div className="p-2 bg-[#F8FAFC] dark:bg-[#1E2235] border border-[#2B2D42]">
              <div className="flex items-center justify-center gap-1 text-[8px] font-silkscreen text-[#64748B] dark:text-[#94A3B8] mb-0.5">
                <Award className="w-3 h-3 text-[#DB2777]" />
                <span>CYCLES</span>
              </div>
              <div className="text-[12px] font-pixel font-bold text-[#9D174D] dark:text-[#F472B6]">
                {inspectedStats.cycles}
              </div>
            </div>

            {/* XP Gained */}
            <div className="p-2 bg-[#F8FAFC] dark:bg-[#1E2235] border border-[#2B2D42]">
              <div className="flex items-center justify-center gap-1 text-[8px] font-silkscreen text-[#64748B] dark:text-[#94A3B8] mb-0.5">
                <Sprout className="w-3 h-3 text-[#16A34A]" />
                <span>XP EARNED</span>
              </div>
              <div className="text-[12px] font-pixel font-bold text-[#166534] dark:text-[#86EFAC]">
                +{inspectedStats.xp}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between gap-2 pt-1">
            <span className="text-[8px] font-silkscreen text-[#64748B] dark:text-[#94A3B8]">
              {inspectedStats.focusMinutes > 0
                ? `Completed ${inspectedStats.cycles} cycles (${inspectedStats.focusMinutes}m). Plant thrived!`
                : 'No study recorded on this date yet.'}
            </span>

            <button
              onClick={() => {
                soundEngine.playClick(800);
                onSelectDate(activeDateInspect);
                onClose();
              }}
              className="px-3 py-1 text-[9px] font-pixel bg-[#C5E0FD] hover:bg-[#A8D3FC] text-[#1E3A8A] border-2 border-[#2B2D42] pixel-btn cursor-pointer whitespace-nowrap"
            >
              SET ACTIVE DATE
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
