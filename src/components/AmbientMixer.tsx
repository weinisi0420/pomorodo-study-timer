import React from 'react';
import { CloudRain, Music, Coffee, Volume2, VolumeX, Play, Pause } from 'lucide-react';
import { soundEngine } from '../utils/soundEngine';

export interface AmbientTrack {
  id: 'rain' | 'piano' | 'cafe';
  name: string;
  iconType: 'rain' | 'piano' | 'cafe';
  isPlaying: boolean;
  volume: number;
  badgeColor: string;
}

interface AmbientMixerProps {
  tracks: AmbientTrack[];
  onToggleTrack: (id: 'rain' | 'piano' | 'cafe') => void;
  onVolumeChange: (id: 'rain' | 'piano' | 'cafe', vol: number) => void;
  compact?: boolean;
}

export const AmbientMixer: React.FC<AmbientMixerProps> = ({
  tracks,
  onToggleTrack,
  onVolumeChange,
  compact = false,
}) => {
  const getIcon = (type: 'rain' | 'piano' | 'cafe', active: boolean) => {
    switch (type) {
      case 'rain':
        return <CloudRain className={`w-4 h-4 ${active ? 'text-[#2563EB] animate-bounce' : 'text-[#64748B]'}`} />;
      case 'piano':
        return <Music className={`w-4 h-4 ${active ? 'text-[#DB2777] animate-pulse' : 'text-[#64748B]'}`} />;
      case 'cafe':
        return <Coffee className={`w-4 h-4 ${active ? 'text-[#D97706] animate-pulse' : 'text-[#64748B]'}`} />;
    }
  };

  return (
    <div className="bg-[#FAF7F0] dark:bg-[#1E2235] pixel-box p-3.5 sm:p-4 text-[#2B2D42] dark:text-[#E2E8F0] select-none">
      {/* Header bar */}
      <div className="flex items-center justify-between pb-2 mb-3 border-b-2 border-dashed border-[#2B2D42]/40 dark:border-[#CBD5E1]/30">
        <div className="flex items-center gap-2">
          <span className="text-[12px] font-pixel tracking-wider">VIBE MIXER</span>
          <span className="text-[9px] font-pixel px-1.5 py-0.5 bg-[#C5E0FD] text-[#1E3A8A] border border-[#2B2D42]">
            LO-FI
          </span>
        </div>
        <span className="text-[9px] font-silkscreen text-[#64748B] dark:text-[#94A3B8]">
          3-TRACK SYNTH
        </span>
      </div>

      {/* Tracks List */}
      <div className="space-y-3">
        {tracks.map((track) => {
          return (
            <div
              key={track.id}
              className={`p-2.5 transition-all border-2 ${
                track.isPlaying
                  ? 'border-[#2B2D42] bg-[#FFFFFF] dark:bg-[#282E47] shadow-[2px_2px_0px_#2B2D42]'
                  : 'border-[#CBD5E1] dark:border-[#334155] bg-[#F1F5F9]/60 dark:bg-[#181B29]/60'
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                {/* Track Title and Icon */}
                <div className="flex items-center gap-2">
                  <div className="p-1 bg-[#E8F1FC] dark:bg-[#1F2438] border border-[#2B2D42]">
                    {getIcon(track.iconType, track.isPlaying)}
                  </div>
                  <div>
                    <span className="text-[11px] font-pixel uppercase tracking-wide">
                      {track.name}
                    </span>
                    {track.id === 'cafe' && (
                      <div className="text-[8px] font-silkscreen text-[#B45309] dark:text-[#FBBF24] truncate">
                        Daydream (Lo-Fi)
                      </div>
                    )}
                  </div>
                </div>

                {/* Play / Stop Button */}
                <button
                  onClick={() => {
                    soundEngine.playClick();
                    onToggleTrack(track.id);
                  }}
                  className={`px-2.5 py-1 text-[9px] font-pixel flex items-center gap-1 pixel-btn ${
                    track.isPlaying
                      ? track.id === 'piano'
                        ? 'bg-[#FDCAD5] text-[#831843] font-bold'
                        : track.id === 'rain'
                        ? 'bg-[#C5E0FD] text-[#1E3A8A] font-bold'
                        : 'bg-[#FED7AA] text-[#7C2D12] font-bold'
                      : 'bg-white dark:bg-[#202538] text-[#475569] dark:text-[#CBD5E1]'
                  }`}
                  aria-label={`${track.isPlaying ? 'Stop' : 'Play'} ${track.name}`}
                >
                  {track.isPlaying ? (
                    <>
                      <Pause className="w-2.5 h-2.5 fill-current" />
                      <span>ON</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-2.5 h-2.5 fill-current" />
                      <span>OFF</span>
                    </>
                  )}
                </button>
              </div>

              {/* Volume Slider & Animated EQ Meter */}
              <div className="flex items-center gap-2 pt-1">
                {track.isPlaying && track.volume > 0 ? (
                  <Volume2 className="w-3.5 h-3.5 text-[#475569] dark:text-[#94A3B8] shrink-0" />
                ) : (
                  <VolumeX className="w-3.5 h-3.5 text-[#94A3B8] shrink-0" />
                )}

                <input
                  type="range"
                  min="0"
                  max="100"
                  value={Math.round(track.volume * 100)}
                  onChange={(e) => {
                    const newVol = Number(e.target.value) / 100;
                    onVolumeChange(track.id, newVol);
                  }}
                  className="w-full h-2 bg-[#E2E8F0] dark:bg-[#334155] rounded-none appearance-none cursor-pointer accent-[#2B2D42] dark:accent-[#818CF8]"
                  title={`${track.name} Volume: ${Math.round(track.volume * 100)}%`}
                />

                <span className="text-[9px] font-silkscreen tabular-nums w-8 text-right text-[#475569] dark:text-[#94A3B8] shrink-0">
                  {Math.round(track.volume * 100)}%
                </span>

                {/* Retro 3-bar animated EQ */}
                <div className="flex items-end gap-0.5 h-3 w-4 shrink-0 pl-1">
                  <div
                    className={`w-1 bg-[#2B2D42] dark:bg-[#818CF8] transition-all duration-150 ${
                      track.isPlaying ? 'animate-[bounce_0.6s_ease-in-out_infinite] h-3' : 'h-1 opacity-30'
                    }`}
                  />
                  <div
                    className={`w-1 bg-[#2B2D42] dark:bg-[#818CF8] transition-all duration-150 ${
                      track.isPlaying ? 'animate-[bounce_0.8s_ease-in-out_infinite_0.2s] h-2' : 'h-1 opacity-30'
                    }`}
                  />
                  <div
                    className={`w-1 bg-[#2B2D42] dark:bg-[#818CF8] transition-all duration-150 ${
                      track.isPlaying ? 'animate-[bounce_0.5s_ease-in-out_infinite_0.4s] h-2.5' : 'h-1 opacity-30'
                    }`}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
