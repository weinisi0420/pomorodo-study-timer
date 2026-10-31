import React, { useState } from 'react';
import { Heart } from 'lucide-react';
import { soundEngine } from '../utils/soundEngine';

export const PixelCat: React.FC = () => {
  const [isWagging, setIsWagging] = useState<boolean>(false);
  const [showHeart, setShowHeart] = useState<boolean>(false);
  const [speech, setSpeech] = useState<string>('Zzz...');

  const handleCatClick = () => {
    // Play meow sound
    soundEngine.playCatMeow();

    // Trigger tail wag 2 times
    setIsWagging(false);
    // Use requestAnimationFrame to re-trigger CSS animation cleanly if clicked repeatedly
    requestAnimationFrame(() => {
      setIsWagging(true);
    });

    // Show cheerful bubble
    const meows = ['Meow! 🐾', 'Purr~ ❤️', 'Nya! ✨', 'Mew! (wag wag)'];
    const randomMeow = meows[Math.floor(Math.random() * meows.length)];
    setSpeech(randomMeow);
    setShowHeart(true);

    setTimeout(() => {
      setShowHeart(false);
      setSpeech('Zzz...');
    }, 2000);
  };

  return (
    <div
      onClick={handleCatClick}
      className="p-1 flex flex-col items-center cursor-pointer group select-none transition-transform hover:-translate-y-0.5"
      title="Click me! I'll wag my tail 2 times!"
    >
      {/* Speech / Reaction Bubble */}
      <div className="h-4 flex items-center justify-center mb-0.5">
        <span
          className={`text-[8px] font-pixel tracking-tighter transition-all duration-200 ${
            showHeart
              ? 'text-[#E11D48] scale-110 font-bold'
              : 'text-[#818CF8] animate-bounce'
          }`}
        >
          {speech}
        </span>
      </div>

      {/* Cat Sprite Container with Body and Animated Tail Layer */}
      <div className="relative w-18 sm:w-22 aspect-[687/592] pixelated">
        {/* Cat Body Layer (static, exact reference artwork) */}
        <img
          src="/assets/aistudio/cat_body_layer.png"
          alt="Pixel Art Cat Body"
          className="absolute inset-0 w-full h-full object-contain pointer-events-none select-none pixelated"
          loading="eager"
        />

        {/* Cat Tail Layer (rotates around its base pivot to wag 2 times when clicked) */}
        <img
          src="/assets/aistudio/cat_tail_layer.png"
          alt="Pixel Art Cat Tail"
          onAnimationEnd={() => setIsWagging(false)}
          className={`absolute inset-0 w-full h-full object-contain pointer-events-none select-none pixelated ${
            isWagging ? 'animate-tail-wag-twice' : ''
          }`}
          style={{
            transformOrigin: '87% 75%',
          }}
          loading="eager"
        />

        {/* Floating Heart Effect when clicked */}
        {showHeart && (
          <div className="absolute -top-3 right-0 animate-bounce pointer-events-none">
            <Heart className="w-3.5 h-3.5 fill-[#F43F5E] text-[#F43F5E]" />
          </div>
        )}
      </div>

      {/* Cat Name Tag */}
      <div className="text-[8px] font-silkscreen text-[#451A03] dark:text-[#FEF08A] font-bold mt-1 flex items-center gap-1 drop-shadow-xs">
        <Heart className="w-2.5 h-2.5 fill-[#F43F5E] text-[#F43F5E]" />
        <span>MOCHI (CLICK ME)</span>
      </div>
    </div>
  );
};
