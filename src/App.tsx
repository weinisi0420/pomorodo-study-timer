import React, { useState, useEffect, useRef } from 'react';
import { HeaderNav } from './components/HeaderNav';
import { DioramaDesk } from './components/DioramaDesk';
import { TimerConsole } from './components/TimerConsole';
import { AmbientMixer, AmbientTrack } from './components/AmbientMixer';
import { AlarmModal } from './components/AlarmModal';
import { PixelCalendarModal } from './components/PixelCalendarModal';
import { ExitFullscreenFloating } from './components/ExitFullscreenFloating';
import { TimerMode, TimerStatus, DayStudyStats } from './types';
import { soundEngine } from './utils/soundEngine';

export default function App() {
  // Theme & Environment States
  const [isNight, setIsNight] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Timer Configuration & State
  const [studyDuration, setStudyDuration] = useState<number>(25); // minutes
  const [breakDuration, setBreakDuration] = useState<number>(5); // minutes
  const [mode, setMode] = useState<TimerMode>('study');
  const [status, setStatus] = useState<TimerStatus>('idle');
  const [timeLeft, setTimeLeft] = useState<number>(25 * 60); // seconds
  const [totalTime, setTotalTime] = useState<number>(25 * 60); // seconds

  // Stats & Date & Botanical Level XP (1 min = 1 XP, 1000 mins = 1 Level)
  const [studyCyclesCompleted, setStudyCyclesCompleted] = useState<number>(0);
  const [totalFocusMinutes, setTotalFocusMinutes] = useState<number>(0);
  const [totalXp, setTotalXp] = useState<number>(0);
  const studySecondsCounterRef = useRef<number>(0);

  const handleAddTestXp = (amount: number) => {
    setTotalXp((prev) => prev + amount);
    setTotalFocusMinutes((prev) => prev + amount);
  };
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  });

  const handleSetToday = () => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    setSelectedDate(`${y}-${m}-${day}`);
  };

  const handleStepDate = (days: number) => {
    const [y, m, d] = selectedDate.split('-').map(Number);
    const cur = new Date(y, m - 1, d);
    cur.setDate(cur.getDate() + days);
    const year = cur.getFullYear();
    const month = String(cur.getMonth() + 1).padStart(2, '0');
    const day = String(cur.getDate()).padStart(2, '0');
    setSelectedDate(`${year}-${month}-${day}`);
  };

  // Calendar Modal & Historical Study Stats
  const [isCalendarOpen, setIsCalendarOpen] = useState<boolean>(false);
  const [dailyStats, setDailyStats] = useState<Record<string, DayStudyStats>>({
    '2026-10-24': { date: '2026-10-24', focusMinutes: 60, cycles: 2, xp: 60 },
    '2026-10-25': { date: '2026-10-25', focusMinutes: 120, cycles: 4, xp: 120 },
    '2026-10-26': { date: '2026-10-26', focusMinutes: 45, cycles: 2, xp: 45 },
    '2026-10-27': { date: '2026-10-27', focusMinutes: 90, cycles: 3, xp: 90 },
    '2026-10-28': { date: '2026-10-28', focusMinutes: 50, cycles: 2, xp: 50 },
    '2026-10-29': { date: '2026-10-29', focusMinutes: 110, cycles: 4, xp: 110 },
    '2026-10-30': { date: '2026-10-30', focusMinutes: 75, cycles: 3, xp: 75 },
    '2026-10-31': { date: '2026-10-31', focusMinutes: 0, cycles: 0, xp: 0 },
  });

  // Alarm modal state
  const [isAlarmModalOpen, setIsAlarmModalOpen] = useState<boolean>(false);
  const [completedMode, setCompletedMode] = useState<TimerMode>('study');

  // Ambient Sounds State (Rain, Piano, Coffee Shop)
  const [tracks, setTracks] = useState<AmbientTrack[]>([
    {
      id: 'rain',
      name: 'Rain',
      iconType: 'rain',
      isPlaying: false,
      volume: 0.6,
      badgeColor: '#C5E0FD',
    },
    {
      id: 'piano',
      name: 'Piano',
      iconType: 'piano',
      isPlaying: false,
      volume: 0.5,
      badgeColor: '#FDCAD5',
    },
    {
      id: 'cafe',
      name: 'Coffee Shop',
      iconType: 'cafe',
      isPlaying: false,
      volume: 0.5,
      badgeColor: '#FED7AA',
    },
  ]);

  // Ref to hold interval timer
  const timerIntervalRef = useRef<number | null>(null);

  // Sync Night mode with HTML document element class for Tailwind dark variant
  useEffect(() => {
    if (isNight) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isNight]);

  // Handle Fullscreen change listener (handles Esc key or browser UI changes)
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  // Main Timer Countdown Loop
  useEffect(() => {
    if (status === 'running') {
      timerIntervalRef.current = window.setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            // Timer has ended!
            handleTimerComplete();
            return 0;
          }

          // Accumulate 1 XP per minute during study time (1 min = 1 XP)
          if (mode === 'study') {
            studySecondsCounterRef.current += 1;
            if (studySecondsCounterRef.current >= 60) {
              studySecondsCounterRef.current = 0;
              setTotalXp((xp) => xp + 1);
              setTotalFocusMinutes((m) => m + 1);
              setDailyStats((prev) => {
                const existing = prev[selectedDate] || {
                  date: selectedDate,
                  focusMinutes: 0,
                  cycles: 0,
                  xp: 0,
                };
                return {
                  ...prev,
                  [selectedDate]: {
                    ...existing,
                    focusMinutes: existing.focusMinutes + 1,
                    xp: existing.xp + 1,
                  },
                };
              });
            }
          }

          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    }

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    };
  }, [status, mode, studyDuration, breakDuration, selectedDate]);

  // Handle timer reaching 00:00
  const handleTimerComplete = () => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }

    setStatus('alarm');
    setCompletedMode(mode);
    setIsAlarmModalOpen(true);

    // Play retro alarm chime
    soundEngine.startAlarm();

    if (mode === 'study') {
      // Award any leftover seconds as completed minute
      if (studySecondsCounterRef.current > 30) {
        setTotalXp((xp) => xp + 1);
        setTotalFocusMinutes((m) => m + 1);
        setDailyStats((prev) => {
          const existing = prev[selectedDate] || {
            date: selectedDate,
            focusMinutes: 0,
            cycles: 0,
            xp: 0,
          };
          return {
            ...prev,
            [selectedDate]: {
              ...existing,
              focusMinutes: existing.focusMinutes + 1,
              xp: existing.xp + 1,
            },
          };
        });
      }
      studySecondsCounterRef.current = 0;
      setStudyCyclesCompleted((prev) => prev + 1);
      setDailyStats((prev) => {
        const existing = prev[selectedDate] || {
          date: selectedDate,
          focusMinutes: 0,
          cycles: 0,
          xp: 0,
        };
        return {
          ...prev,
          [selectedDate]: {
            ...existing,
            cycles: existing.cycles + 1,
          },
        };
      });
    }
  };

  // Start / Pause timer toggle
  const handleToggleStartPause = () => {
    if (status === 'running') {
      setStatus('paused');
    } else {
      setStatus('running');
    }
  };

  // Reset current interval
  const handleReset = () => {
    setStatus('idle');
    const targetSeconds = (mode === 'study' ? studyDuration : breakDuration) * 60;
    setTimeLeft(targetSeconds);
    setTotalTime(targetSeconds);
  };

  // Skip to next interval
  const handleSkip = () => {
    setStatus('idle');
    if (mode === 'study') {
      setMode('break');
      setTimeLeft(breakDuration * 60);
      setTotalTime(breakDuration * 60);
    } else {
      setMode('study');
      setTimeLeft(studyDuration * 60);
      setTotalTime(studyDuration * 60);
    }
  };

  // End Session & Reset entirely
  const handleEndSession = () => {
    soundEngine.stopAlarm();
    setIsAlarmModalOpen(false);
    setStatus('idle');
    setMode('study');
    setTimeLeft(studyDuration * 60);
    setTotalTime(studyDuration * 60);
  };

  // Duration adjustments
  const handleUpdateStudyDuration = (minutes: number) => {
    setStudyDuration(minutes);
    if (mode === 'study' && status === 'idle') {
      setTimeLeft(minutes * 60);
      setTotalTime(minutes * 60);
    }
  };

  const handleUpdateBreakDuration = (minutes: number) => {
    setBreakDuration(minutes);
    if (mode === 'break' && status === 'idle') {
      setTimeLeft(minutes * 60);
      setTotalTime(minutes * 60);
    }
  };

  // Quick Preset Selection
  const handleSelectPreset = (studyMins: number, breakMins: number) => {
    setStudyDuration(studyMins);
    setBreakDuration(breakMins);
    if (status === 'idle') {
      const targetMins = mode === 'study' ? studyMins : breakMins;
      setTimeLeft(targetMins * 60);
      setTotalTime(targetMins * 60);
    }
  };

  // Alarm Actions
  const handleStartBreakAfterAlarm = () => {
    soundEngine.stopAlarm();
    setIsAlarmModalOpen(false);
    setMode('break');
    const seconds = breakDuration * 60;
    setTimeLeft(seconds);
    setTotalTime(seconds);
    setStatus('running');
  };

  const handleContinueStudyingAfterAlarm = () => {
    soundEngine.stopAlarm();
    setIsAlarmModalOpen(false);
    setMode('study');
    const seconds = studyDuration * 60;
    setTimeLeft(seconds);
    setTotalTime(seconds);
    setStatus('running');
  };

  const handleAddBreakTimeAfterAlarm = (extraMinutes: number) => {
    soundEngine.stopAlarm();
    setIsAlarmModalOpen(false);
    setMode('break');
    const seconds = extraMinutes * 60;
    setTimeLeft(seconds);
    setTotalTime(seconds);
    setStatus('running');
  };

  const handleDismissAlarmOnly = () => {
    soundEngine.stopAlarm();
    setIsAlarmModalOpen(false);
    setStatus('idle');
  };

  // Rain Vibe Toggle (synced with sound + visual)
  const isRaining = tracks.find((t) => t.id === 'rain')?.isPlaying || false;

  const handleToggleRain = () => {
    handleToggleTrack('rain');
  };

  // Ambient Sound Toggles & Volume
  const handleToggleTrack = (id: 'rain' | 'piano' | 'cafe') => {
    setTracks((prev) =>
      prev.map((track) => {
        if (track.id === id) {
          const nextState = !track.isPlaying;
          if (nextState) {
            if (id === 'rain') soundEngine.startRain(track.volume);
            if (id === 'piano') soundEngine.startPiano(track.volume);
            if (id === 'cafe') soundEngine.startCafe(track.volume);
          } else {
            if (id === 'rain') soundEngine.stopRain();
            if (id === 'piano') soundEngine.stopPiano();
            if (id === 'cafe') soundEngine.stopCafe();
          }
          return { ...track, isPlaying: nextState };
        }
        return track;
      })
    );
  };

  const handleVolumeChange = (id: 'rain' | 'piano' | 'cafe', vol: number) => {
    setTracks((prev) =>
      prev.map((track) => {
        if (track.id === id) {
          if (id === 'rain') soundEngine.setRainVolume(vol);
          if (id === 'piano') soundEngine.setPianoVolume(vol);
          if (id === 'cafe') soundEngine.setCafeVolume(vol);
          return { ...track, volume: vol };
        }
        return track;
      })
    );
  };

  // Fullscreen Toggle
  const handleToggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
        setIsFullscreen(true);
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
          setIsFullscreen(false);
        }
      }
    } catch {
      // Fallback
      setIsFullscreen(!isFullscreen);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F3F8FE] dark:bg-[#121420] text-[#25283D] dark:text-[#E2E8F0] transition-colors duration-500 font-pixel selection:bg-[#F8A5C2] selection:text-white">
      {/* Floating Exit Fullscreen Button */}
      <ExitFullscreenFloating
        isFullscreen={isFullscreen}
        onExitFullscreen={handleToggleFullscreen}
      />

      {/* Header Navigation */}
      {/* Header Navigation */}
      <HeaderNav
        isNight={isNight}
        isRaining={isRaining}
        isFullscreen={isFullscreen}
        studyCycles={studyCyclesCompleted}
        totalFocusMinutes={totalFocusMinutes}
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
        onSetToday={handleSetToday}
        onStepDate={handleStepDate}
        onOpenCalendar={() => setIsCalendarOpen(true)}
        onToggleNight={() => setIsNight(!isNight)}
        onToggleRain={handleToggleRain}
        onToggleFullscreen={handleToggleFullscreen}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 py-5 sm:py-7 flex flex-col justify-between">
        {/* Diorama Desk Section (Window with rain/sun/moon + Desk with Lamp, sleeping kitty, matcha, botanical companion) */}
        <DioramaDesk
          isNight={isNight}
          isRaining={isRaining}
          onToggleNight={() => setIsNight(!isNight)}
          onToggleRain={handleToggleRain}
          studyCyclesCompleted={studyCyclesCompleted}
          totalXp={totalXp}
          timerStatus={status}
          timerMode={mode}
          onAddTestXp={handleAddTestXp}
        />

        {/* Core Workspace Layout: Centered Timer Console + Vibe Mixer (matching image.png) */}
        <div className="flex flex-col lg:flex-row items-center lg:items-start justify-center gap-6 mt-2 max-w-4xl mx-auto w-full">
          {/* Center Column: Digital Retro Timer Console */}
          <div className="w-full flex-1 max-w-lg">
            <TimerConsole
              mode={mode}
              status={status}
              timeLeft={timeLeft}
              totalTime={totalTime}
              studyDuration={studyDuration}
              breakDuration={breakDuration}
              onToggleStartPause={handleToggleStartPause}
              onReset={handleReset}
              onSkip={handleSkip}
              onEndSession={handleEndSession}
              onUpdateStudyDuration={handleUpdateStudyDuration}
              onUpdateBreakDuration={handleUpdateBreakDuration}
              onSelectPreset={handleSelectPreset}
            />
          </div>

          {/* Right Column: Vibe Mixer / Lo-Fi Soundboard */}
          <div className="w-full lg:w-80 shrink-0">
            <AmbientMixer
              tracks={tracks}
              onToggleTrack={handleToggleTrack}
              onVolumeChange={handleVolumeChange}
            />
          </div>
        </div>

        {/* Quiet Footer */}
        <footer className="mt-8 pt-4 border-t-2 border-[#2B2D42]/20 dark:border-[#CBD5E1]/20 text-center select-none">
          <div className="flex flex-wrap items-center justify-center gap-3 text-[10px] font-silkscreen text-[#64748B] dark:text-[#94A3B8]">
            <span>PIXEL POMO STUDY SANCTUARY</span>
            <span>·</span>
            <span>AMBIENT SYNTH: RAIN / PIANO / CAFE</span>
            <span>·</span>
            <span>PRESS ESC FOR FULLSCREEN</span>
          </div>
        </footer>
      </main>

      {/* Alarm Ringing Modal */}
      <AlarmModal
        isOpen={isAlarmModalOpen}
        completedMode={completedMode}
        studyDuration={studyDuration}
        breakDuration={breakDuration}
        onStartBreak={handleStartBreakAfterAlarm}
        onContinueStudying={handleContinueStudyingAfterAlarm}
        onAddBreakTime={handleAddBreakTimeAfterAlarm}
        onEndSession={handleEndSession}
        onDismissAlarmOnly={handleDismissAlarmOnly}
      />

      {/* Pixel Style Calendar Modal with Previous Study Stats */}
      <PixelCalendarModal
        isOpen={isCalendarOpen}
        onClose={() => setIsCalendarOpen(false)}
        selectedDate={selectedDate}
        onSelectDate={setSelectedDate}
        dailyStats={dailyStats}
      />
    </div>
  );
}
