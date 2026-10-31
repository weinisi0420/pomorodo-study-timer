/**
 * Web Audio API synthesizer for ambient study sounds (Rain, Piano, Cafe)
 * and Pomodoro alarm chime + interactive retro UI blips.
 * 100% self-contained, no external network dependencies or 404s.
 */

class SoundEngine {
  private ctx: AudioContext | null = null;

  // Rain sound nodes
  private rainNoiseNode: AudioBufferSourceNode | null = null;
  private rainGainNode: GainNode | null = null;
  private rainFilterNode: BiquadFilterNode | null = null;
  private rainDropTimer: number | null = null;

  // Piano sound state
  private pianoGainNode: GainNode | null = null;
  private pianoTimer: number | null = null;
  private isPianoPlaying = false;

  // Cafe sound state
  private cafeAudio: HTMLAudioElement | null = null;
  private cafeGainNode: GainNode | null = null;
  private cafeNoiseNode: AudioBufferSourceNode | null = null;
  private cafeTimer: number | null = null;
  private isCafePlaying = false;

  // Alarm sound state
  private alarmTimer: number | null = null;
  private isAlarmPlaying = false;
  private alarmGainNode: GainNode | null = null;

  private initContext(): AudioContext {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  // --- Rain Generator ---
  public startRain(volume: number = 0.6) {
    const ctx = this.initContext();
    this.stopRain();

    // Create 5-second buffer of pink noise
    const bufferSize = ctx.sampleRate * 5;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;

    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.06;
      b6 = white * 0.115926;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1100, ctx.currentTime);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(Math.max(0.001, volume), ctx.currentTime);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    noise.start(0);

    this.rainNoiseNode = noise;
    this.rainFilterNode = filter;
    this.rainGainNode = gain;

    // Subtle random raindrop clicks
    const scheduleDrop = () => {
      if (!this.rainGainNode) return;
      const dropTime = ctx.currentTime + Math.random() * 0.4;
      const osc = ctx.createOscillator();
      const dropGain = ctx.createGain();
      const dropFilter = ctx.createBiquadFilter();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(1200 + Math.random() * 800, dropTime);
      osc.frequency.exponentialRampToValueAtTime(300, dropTime + 0.08);

      dropFilter.type = 'bandpass';
      dropFilter.frequency.setValueAtTime(1000, dropTime);
      dropFilter.Q.setValueAtTime(4, dropTime);

      const dropVol = (this.rainGainNode.gain.value || 0.5) * (0.04 + Math.random() * 0.06);
      dropGain.gain.setValueAtTime(dropVol, dropTime);
      dropGain.gain.exponentialRampToValueAtTime(0.0001, dropTime + 0.07);

      osc.connect(dropFilter);
      dropFilter.connect(dropGain);
      dropGain.connect(ctx.destination);

      osc.start(dropTime);
      osc.stop(dropTime + 0.08);

      this.rainDropTimer = window.setTimeout(scheduleDrop, 150 + Math.random() * 350);
    };

    scheduleDrop();
  }

  public setRainVolume(volume: number) {
    if (this.rainGainNode && this.ctx) {
      this.rainGainNode.gain.setTargetAtTime(Math.max(0, Math.min(1, volume)), this.ctx.currentTime, 0.05);
    }
  }

  public stopRain() {
    if (this.rainDropTimer) {
      clearTimeout(this.rainDropTimer);
      this.rainDropTimer = null;
    }
    if (this.rainNoiseNode) {
      try {
        this.rainNoiseNode.stop();
        this.rainNoiseNode.disconnect();
      } catch {
        // ignore
      }
      this.rainNoiseNode = null;
    }
    this.rainGainNode = null;
    this.rainFilterNode = null;
  }

  // --- Lo-Fi Piano Generator ---
  public startPiano(volume: number = 0.5) {
    const ctx = this.initContext();
    this.stopPiano();
    this.isPianoPlaying = true;

    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(Math.max(0.001, volume), ctx.currentTime);
    masterGain.connect(ctx.destination);
    this.pianoGainNode = masterGain;

    // Relaxing Lo-Fi chord progressions (MIDI-style notes in Hz)
    // Cmaj7 -> Am7 -> Dm7 -> G7 -> Fmaj7
    const chords = [
      [261.63, 329.63, 392.00, 493.88], // C E G B (Cmaj7)
      [220.00, 261.63, 329.63, 392.00], // A C E G (Am7)
      [293.66, 349.23, 440.00, 523.25], // D F A C (Dm7)
      [196.00, 246.94, 293.66, 349.23], // G B D F (G7)
      [349.23, 440.00, 523.25, 659.25], // F A C E (Fmaj7)
      [329.63, 392.00, 493.88, 587.33]  // E G B D (Em7)
    ];

    let chordIndex = 0;

    const playNote = (freq: number, startTime: number, duration: number, vel: number) => {
      if (!this.pianoGainNode || !this.isPianoPlaying) return;

      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const noteGain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc1.type = 'triangle';
      osc2.type = 'sine';

      // Subtle warm detune
      osc1.frequency.setValueAtTime(freq, startTime);
      osc2.frequency.setValueAtTime(freq * 1.002, startTime);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1400, startTime);
      filter.frequency.exponentialRampToValueAtTime(450, startTime + duration);

      noteGain.gain.setValueAtTime(0.0001, startTime);
      noteGain.gain.linearRampToValueAtTime(vel * 0.16, startTime + 0.04);
      noteGain.gain.exponentialRampToValueAtTime(vel * 0.08, startTime + 0.6);
      noteGain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(noteGain);
      noteGain.connect(this.pianoGainNode);

      osc1.start(startTime);
      osc2.start(startTime);
      osc1.stop(startTime + duration + 0.1);
      osc2.stop(startTime + duration + 0.1);
    };

    const playNextChord = () => {
      if (!this.isPianoPlaying || !this.pianoGainNode) return;
      const now = ctx.currentTime;
      const currentChord = chords[chordIndex % chords.length];
      chordIndex++;

      // Arpeggiate the chord softly
      currentChord.forEach((freq, idx) => {
        const offset = idx * 0.14 + (Math.random() * 0.03);
        const duration = 3.6 + Math.random() * 0.8;
        const velocity = 0.7 + Math.random() * 0.3;
        playNote(freq, now + offset, duration, velocity);
      });

      // Sometimes add a gentle high melodic accent
      if (Math.random() > 0.4) {
        const highNote = currentChord[currentChord.length - 1] * 2;
        playNote(highNote, now + 1.2 + Math.random() * 0.6, 2.5, 0.45);
      }

      const nextDelay = 3800 + Math.random() * 1200;
      this.pianoTimer = window.setTimeout(playNextChord, nextDelay);
    };

    playNextChord();
  }

  public setPianoVolume(volume: number) {
    if (this.pianoGainNode && this.ctx) {
      this.pianoGainNode.gain.setTargetAtTime(Math.max(0, Math.min(1, volume)), this.ctx.currentTime, 0.05);
    }
  }

  public stopPiano() {
    this.isPianoPlaying = false;
    if (this.pianoTimer) {
      clearTimeout(this.pianoTimer);
      this.pianoTimer = null;
    }
    if (this.pianoGainNode) {
      this.pianoGainNode.disconnect();
      this.pianoGainNode = null;
    }
  }

  // --- Coffee Shop / Cafe Sound Player (plays user mp3: massobeats - daydream) ---
  public startCafe(volume: number = 0.5) {
    this.stopCafe();
    this.isCafePlaying = true;

    // 1. Play user's uploaded Lo-Fi Cafe MP3: massobeats - daydream
    if (!this.cafeAudio) {
      this.cafeAudio = new Audio('/assets/aistudio/massobeats_-_daydream__royalty_free_lofi_music__45a0d930.mp3');
      this.cafeAudio.loop = true;
    }
    this.cafeAudio.volume = Math.max(0, Math.min(1, volume));
    this.cafeAudio.play().catch((err) => {
      console.warn('Cafe audio playback was prevented until user interaction:', err);
    });

    // 2. Also blend subtle warm cafe room ambiance & occasional soft cup clinks
    try {
      const ctx = this.initContext();
      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(Math.max(0.001, volume * 0.35), ctx.currentTime);
      masterGain.connect(ctx.destination);
      this.cafeGainNode = masterGain;

      // Random gentle porcelain cup clinks
      const scheduleCafeActivity = () => {
        if (!this.isCafePlaying || !this.cafeGainNode) return;
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const clinkGain = ctx.createGain();
        const clinkFilter = ctx.createBiquadFilter();

        const baseFreq = 2200 + Math.random() * 900;
        osc.type = 'sine';
        osc.frequency.setValueAtTime(baseFreq, now);

        clinkFilter.type = 'bandpass';
        clinkFilter.frequency.setValueAtTime(baseFreq, now);
        clinkFilter.Q.setValueAtTime(18, now);

        clinkGain.gain.setValueAtTime(0.05 * (Math.random() * 0.4 + 0.6), now);
        clinkGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);

        osc.connect(clinkFilter);
        clinkFilter.connect(clinkGain);
        clinkGain.connect(this.cafeGainNode);

        osc.start(now);
        osc.stop(now + 0.15);

        const nextDelay = 3500 + Math.random() * 4500;
        this.cafeTimer = window.setTimeout(scheduleCafeActivity, nextDelay);
      };

      scheduleCafeActivity();
    } catch {
      // AudioContext optional fallback
    }
  }

  public setCafeVolume(volume: number) {
    if (this.cafeAudio) {
      this.cafeAudio.volume = Math.max(0, Math.min(1, volume));
    }
    if (this.cafeGainNode && this.ctx) {
      this.cafeGainNode.gain.setTargetAtTime(Math.max(0, Math.min(1, volume * 0.35)), this.ctx.currentTime, 0.05);
    }
  }

  public stopCafe() {
    this.isCafePlaying = false;
    if (this.cafeAudio) {
      this.cafeAudio.pause();
    }
    if (this.cafeTimer) {
      clearTimeout(this.cafeTimer);
      this.cafeTimer = null;
    }
    if (this.cafeGainNode) {
      try {
        this.cafeGainNode.disconnect();
      } catch {
        // ignore
      }
      this.cafeGainNode = null;
    }
  }

  // --- Alarm Sound Generator (Cozy 8-bit / music-box chime) ---
  public startAlarm() {
    const ctx = this.initContext();
    this.stopAlarm();
    this.isAlarmPlaying = true;

    const alarmGain = ctx.createGain();
    alarmGain.gain.setValueAtTime(0.65, ctx.currentTime);
    alarmGain.connect(ctx.destination);
    this.alarmGainNode = alarmGain;

    // Upbeat gentle retro melody: E5 (659Hz), G#5 (830Hz), B5 (987Hz), E6 (1318Hz)
    const melody = [
      { freq: 659.25, time: 0.0, dur: 0.2 },
      { freq: 830.61, time: 0.16, dur: 0.2 },
      { freq: 987.77, time: 0.32, dur: 0.2 },
      { freq: 1318.51, time: 0.48, dur: 0.45 },
      { freq: 987.77, time: 0.95, dur: 0.2 },
      { freq: 1318.51, time: 1.12, dur: 0.55 },
    ];

    const playSequence = () => {
      if (!this.isAlarmPlaying || !this.alarmGainNode) return;
      const now = ctx.currentTime;

      melody.forEach(note => {
        const osc = ctx.createOscillator();
        const noteGain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(note.freq, now + note.time);

        noteGain.gain.setValueAtTime(0.001, now + note.time);
        noteGain.gain.linearRampToValueAtTime(0.3, now + note.time + 0.02);
        noteGain.gain.exponentialRampToValueAtTime(0.0001, now + note.time + note.dur);

        osc.connect(noteGain);
        noteGain.connect(this.alarmGainNode!);

        osc.start(now + note.time);
        osc.stop(now + note.time + note.dur + 0.05);
      });

      this.alarmTimer = window.setTimeout(playSequence, 2300);
    };

    playSequence();
  }

  public stopAlarm() {
    this.isAlarmPlaying = false;
    if (this.alarmTimer) {
      clearTimeout(this.alarmTimer);
      this.alarmTimer = null;
    }
    if (this.alarmGainNode) {
      try {
        this.alarmGainNode.disconnect();
      } catch {
        // ignore
      }
      this.alarmGainNode = null;
    }
  }

  public isAlarmActive(): boolean {
    return this.isAlarmPlaying;
  }

  // --- UI Retro Click Sound ---
  public playClick(pitch: number = 800) {
    try {
      const ctx = this.initContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const now = ctx.currentTime;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(pitch, now);
      osc.frequency.exponentialRampToValueAtTime(pitch * 0.4, now + 0.04);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.05);
    } catch {
      // AudioContext might be blocked until user gesture
    }
  }

  // --- Cute Cat Meow Sound ---
  public playCatMeow() {
    try {
      const ctx = this.initContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const now = ctx.currentTime;

      osc.type = 'sine';
      // Pitch contour: rising then descending meow tone
      osc.frequency.setValueAtTime(560, now);
      osc.frequency.exponentialRampToValueAtTime(800, now + 0.12);
      osc.frequency.exponentialRampToValueAtTime(520, now + 0.35);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.18, now + 0.06);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.36);
    } catch {
      // fallback
    }
  }
}

export const soundEngine = new SoundEngine();
