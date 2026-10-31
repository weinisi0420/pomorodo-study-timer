import React, { useState } from 'react';
import { PixelWindow } from './PixelWindow';
import { DeskLamp } from './DeskLamp';
import { PixelCat } from './PixelCat';
import { Sparkles, Sprout, Heart, Flower2, Plus } from 'lucide-react';
import { TimerMode, TimerStatus } from '../types';
import { soundEngine } from '../utils/soundEngine';

interface DioramaDeskProps {
  isNight: boolean;
  isRaining: boolean;
  onToggleNight: () => void;
  onToggleRain: () => void;
  studyCyclesCompleted: number;
  totalXp: number; // 1 min = 1 XP
  timerStatus: TimerStatus;
  timerMode: TimerMode;
  onAddTestXp?: (amount: number) => void;
}

export const DioramaDesk: React.FC<DioramaDeskProps> = ({
  isNight,
  isRaining,
  onToggleNight,
  onToggleRain,
  studyCyclesCompleted,
  totalXp,
  timerStatus,
  timerMode,
  onAddTestXp,
}) => {
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  // Level calculation: 1000 minutes = 1 Level
  const currentLevel = Math.floor(totalXp / 1000) + 1;
  const currentLevelXp = totalXp % 1000;
  const xpNeeded = 1000 - currentLevelXp;
  const progressPercent = Math.min(100, Math.floor((currentLevelXp / 1000) * 100));

  // Determine botanical growth stage
  // Level 1: Seed
  // Level 2: Sprout
  // Level 3: Leafy Plant
  // Level 4+: Blooming Plant with Flowers
  const getStageInfo = (lvl: number) => {
    if (lvl === 1) {
      return {
        name: 'Seedling',
        stage: 'Seed in Soil',
        icon: 'seed',
        desc: 'Nurture your seed with study time',
      };
    } else if (lvl === 2) {
      return {
        name: 'Young Shoot',
        stage: 'Green Sprout',
        icon: 'sprout',
        desc: 'Two healthy green leaves emerging',
      };
    } else if (lvl === 3) {
      return {
        name: 'Lush Foliage',
        stage: 'Foliage Plant',
        icon: 'plant',
        desc: 'Tall leafy plant building strength',
      };
    } else {
      return {
        name: 'Cherry Blossom',
        stage: 'Plant with Flowers',
        icon: 'flowers',
        desc: 'Fully bloomed with radiant flowers!',
      };
    }
  };

  const stageInfo = getStageInfo(currentLevel);

  // Study Status formatting
  const getStudyStatusBadge = () => {
    if (timerStatus === 'running') {
      if (timerMode === 'study') {
        return {
          label: 'STUDYING (+1 XP/MIN)',
          bg: 'bg-[#DCFCE7] text-[#166534] border-[#16A34A] animate-pulse',
        };
      } else {
        return {
          label: 'RESTING BREAK',
          bg: 'bg-[#DBEAFE] text-[#1E40AF] border-[#3B82F6]',
        };
      }
    } else if (timerStatus === 'paused') {
      return {
        label: 'PAUSED',
        bg: 'bg-[#FEF08A] text-[#854D0E] border-[#CA8A04]',
      };
    } else if (timerStatus === 'alarm') {
      return {
        label: 'SESSION COMPLETE',
        bg: 'bg-[#FCE7F3] text-[#9D174D] border-[#EC4899]',
      };
    }
    return {
      label: 'READY TO STUDY',
      bg: 'bg-[#F1F5F9] dark:bg-[#1E2235] text-[#475569] dark:text-[#CBD5E1] border-[#94A3B8]',
    };
  };

  const studyStatus = getStudyStatusBadge();

  return (
    <div className="relative w-full max-w-4xl mx-auto mb-6 select-none">
      {/* Wall backdrop behind the desk */}
      <div className="relative pt-4 pb-2 px-4 flex flex-col items-center">
        {/* The Window is mounted directly above the desk */}
        <PixelWindow
          isNight={isNight}
          isRaining={isRaining}
          onToggleRain={onToggleRain}
        />
      </div>

      {/* The Wooden / Pastel Study Desk Shelf (matching image.png) */}
      <div className="relative w-full">
        {/* Top lip of wooden desk */}
        <div className="h-5 sm:h-6 bg-[#E0A97C] dark:bg-[#3E2E28] border-t-3 border-x-3 border-[#2B2D42] dark:border-[#10121C] shadow-inner relative flex items-center justify-between px-6">
          <div className="w-full h-1 bg-[#FAD4B2] dark:bg-[#5C453C] opacity-70" />
        </div>

        {/* Front surface of desk */}
        <div className="bg-[#D09364] dark:bg-[#32231E] border-3 border-[#2B2D42] dark:border-[#10121C] shadow-[5px_5px_0px_#2B2D42] dark:shadow-[5px_5px_0px_#0B0D14] p-3 sm:p-5 relative min-h-[110px] sm:min-h-[130px]">
          {/* Desk Wood grain texture lines */}
          <div className="absolute inset-0 opacity-15 pointer-events-none overflow-hidden">
            <div className="h-0.5 w-full bg-[#52331F] mt-4" />
            <div className="h-0.5 w-full bg-[#52331F] mt-10" />
            <div className="h-0.5 w-full bg-[#52331F] mt-8" />
          </div>

          {/* Desk Items Row: Lamp on the left, Sleeping Cat & Matcha in center-left, Botanical Sprout */}
          <div className="relative z-10 flex flex-wrap items-end justify-between gap-4">
            {/* Left Item: The iconic Mini Table Lamp from image.png */}
            <div className="-mt-14 sm:-mt-16">
              <DeskLamp isNight={isNight} onToggleNight={onToggleNight} />
            </div>

            {/* Center Items: Matcha Cup & Sleeping Pixel Cat */}
            <div className="flex items-end gap-3 sm:gap-6">
              {/* Steaming Pixel Matcha Cup */}
              <div className="flex flex-col items-center group cursor-pointer" title="Cozy Hot Matcha">
                {/* Pixel Steam rising */}
                <div className="flex gap-1 mb-1">
                  <div className="w-1 h-3 bg-white/70 animate-pulse" />
                  <div className="w-1 h-4 bg-white/50 animate-pulse delay-150" />
                  <div className="w-1 h-2 bg-white/60 animate-pulse delay-300" />
                </div>
                {/* Cup Body */}
                <div className="w-7 h-7 bg-[#A7F3D0] border-2 border-[#2B2D42] relative flex items-center justify-center shadow-[1px_1px_0px_#2B2D42]">
                  {/* Cup handle */}
                  <div className="absolute -right-2 top-1.5 w-2.5 h-3.5 border-2 border-[#2B2D42] rounded-r-sm" />
                  {/* Tea liquid top */}
                  <div className="w-4 h-1.5 bg-[#10B981] rounded-none mb-2" />
                </div>
                <span className="text-[8px] font-pixel text-[#2B2D42] dark:text-[#CBD5E1] mt-1">
                  MATCHA
                </span>
              </div>

              {/* Interactive Pixel Art Cat from image_e75c5c9c.png */}
              <PixelCat />
            </div>

            {/* Target Element: Botanical Companion with Level, Study Status, 1min=1XP, 1000min=1 Level, Seed-to-Flowers */}
            <div
              className="p-2 sm:p-2.5 bg-[#FAF7F0] dark:bg-[#1E2235] border-2 border-[#2B2D42] shadow-[3px_3px_0px_#2B2D42] flex flex-col gap-1.5 min-w-[210px] sm:min-w-[240px]"
              title={`Level ${currentLevel} - ${stageInfo.stage}: ${currentLevelXp}/1000 XP`}
            >
              {/* Top Row: Current Study Status Badge */}
              <div className="flex items-center justify-between gap-1.5">
                <span
                  className={`text-[8px] font-pixel px-1.5 py-0.5 border ${studyStatus.bg} tracking-tight`}
                >
                  {studyStatus.label}
                </span>

                <span className="text-[8px] font-pixel text-[#DB2777]">
                  1M = 1XP
                </span>
              </div>

              {/* Middle Row: Pixel Plant Illustration & Level Info */}
              <div className="flex items-center gap-2.5 pt-0.5">
                {/* Visual Plant Stage Icon Container */}
                <div className="relative p-2 bg-[#DCFCE7] dark:bg-[#14532D] border-2 border-[#2B2D42] flex items-center justify-center shrink-0 w-10 h-10 shadow-[1px_1px_0px_#2B2D42]">
                  {currentLevel === 1 ? (
                    // Level 1: Seed in Soil
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-3.5 h-2.5 bg-[#854D0E] border border-[#2B2D42] rounded-t-sm relative">
                        <div className="w-1.5 h-1.5 bg-[#22C55E] -top-1 -right-0.5 absolute" />
                      </div>
                      <div className="w-6 h-1.5 bg-[#78350F] mt-0.5" />
                    </div>
                  ) : currentLevel === 2 ? (
                    // Level 2: Sprout
                    <div className="flex flex-col items-center justify-center">
                      <Sprout className="w-5 h-5 text-[#16A34A] dark:text-[#86EFAC] animate-bounce" />
                    </div>
                  ) : currentLevel === 3 ? (
                    // Level 3: Leafy Plant
                    <div className="flex flex-col items-center justify-center">
                      <div className="flex -space-x-1">
                        <Sprout className="w-4 h-4 text-[#15803D]" />
                        <Sprout className="w-4 h-4 text-[#22C55E]" />
                      </div>
                      <div className="w-5 h-2 bg-[#D97706] border border-[#2B2D42]" />
                    </div>
                  ) : (
                    // Level 4+: Blooming Plant with Flowers!
                    <div className="relative flex items-center justify-center">
                      <Flower2 className="w-6 h-6 text-[#EC4899] animate-spin-slow" />
                      <div className="absolute w-2 h-2 rounded-full bg-[#FACC15] animate-ping opacity-60" />
                      <Sparkles className="w-3 h-3 text-[#F59E0B] absolute -top-1.5 -right-1.5 animate-pulse" />
                    </div>
                  )}
                </div>

                {/* Level Title & Stage Name */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-pixel text-[#166534] dark:text-[#86EFAC] truncate">
                      {stageInfo.stage.toUpperCase()}
                    </span>
                    <span className="text-[8px] font-pixel px-1 bg-[#FDCAD5] text-[#831843] border border-[#2B2D42] shrink-0">
                      LV {currentLevel}
                    </span>
                  </div>

                  <div className="text-[8px] font-silkscreen text-[#64748B] dark:text-[#94A3B8] truncate mt-0.5">
                    {stageInfo.desc}
                  </div>
                </div>
              </div>

              {/* Bottom Row: 1000 Minutes XP Progress Bar */}
              <div className="mt-1">
                <div className="w-full h-2 bg-[#E2E8F0] dark:bg-[#334155] border border-[#2B2D42] p-0.2">
                  <div
                    className="h-full bg-gradient-to-r from-[#86EFAC] via-[#34D399] to-[#EC4899] transition-all duration-300"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[8px] font-silkscreen text-[#475569] dark:text-[#CBD5E1] mt-1 tabular-nums">
                  <span>
                    {currentLevelXp}/1000 XP ({progressPercent}%)
                  </span>
                  <span className="text-[#DB2777]">
                    {xpNeeded}m to LV {currentLevel + 1}
                  </span>
                </div>
              </div>

              {/* Quick XP Testing / Stage Preview Buttons */}
              <div className="flex items-center justify-between gap-1 pt-1 border-t border-dashed border-[#2B2D42]/20 dark:border-[#CBD5E1]/20">
                <span className="text-[7.5px] font-silkscreen text-[#94A3B8]">
                  TOTAL: {totalXp} MINS ({totalXp} XP)
                </span>

                {onAddTestXp && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        soundEngine.playClick(650);
                        onAddTestXp(100);
                      }}
                      className="px-1 py-0.2 text-[7px] font-pixel bg-[#C5E0FD] hover:bg-[#93C5FD] text-[#1E3A8A] border border-[#2B2D42]"
                      title="Add 100 XP / study minutes for preview"
                    >
                      +100m
                    </button>
                    <button
                      onClick={() => {
                        soundEngine.playClick(850);
                        onAddTestXp(1000);
                      }}
                      className="px-1 py-0.2 text-[7px] font-pixel bg-[#FDCAD5] hover:bg-[#F472B6] text-[#831843] border border-[#2B2D42]"
                      title="Add 1000 XP to level up instantly and see flowers bloom"
                    >
                      +1000m (LV UP)
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

