export type TimerMode = 'study' | 'break';

export type TimerStatus = 'idle' | 'running' | 'paused' | 'alarm';

export interface SoundState {
  playing: boolean;
  volume: number; // 0 to 1
}

export interface SoundTrackConfig {
  id: 'rain' | 'piano' | 'cafe';
  name: string;
  icon: string;
  color: string;
}

export interface DayStudyStats {
  date: string; // YYYY-MM-DD
  focusMinutes: number;
  cycles: number;
  xp: number;
}

