import React, { useState, useEffect, useRef } from 'react';
import { Timer, X, Play, Square, Pause } from 'lucide-react';

export function RestTimer() {
  const [isOpen, setIsOpen] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [initialTime, setInitialTime] = useState(60);
  const audioCtxRef = useRef(null);

  // Initialize AudioContext lazily
  const getAudioContext = () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  };

  const playChime = () => {
    try {
      const ctx = getAudioContext();
      
      // Play a nice double-chime
      const playTone = (freq, startTime, duration) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + startTime);
        
        gain.gain.setValueAtTime(0, ctx.currentTime + startTime);
        gain.gain.linearRampToValueAtTime(0.5, ctx.currentTime + startTime + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + startTime + duration);
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.start(ctx.currentTime + startTime);
        osc.stop(ctx.currentTime + startTime + duration);
      };

      playTone(523.25, 0, 0.4); // C5
      playTone(659.25, 0.2, 0.6); // E5

    } catch (e) {
      console.error("Audio playback failed", e);
    }
  };

  useEffect(() => {
    let interval = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(time => time - 1);
      }, 1000);
    } else if (isActive && timeLeft === 0) {
      setIsActive(false);
      playChime();
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const startTimer = (seconds) => {
    getAudioContext(); // Initialize context on user interaction
    setInitialTime(seconds);
    setTimeLeft(seconds);
    setIsActive(true);
    setIsOpen(true);
  };

  const toggleTimer = () => {
    if (timeLeft > 0) {
      setIsActive(!isActive);
    }
  };

  const stopTimer = () => {
    setIsActive(false);
    setTimeLeft(0);
  };

  // Calculate SVG Circle Dash Offset
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = isActive || timeLeft > 0 
    ? circumference - (timeLeft / initialTime) * circumference 
    : 0;

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed bottom-24 right-4 md:bottom-8 md:right-8 z-50 flex flex-col items-end pointer-events-none">
      
      {/* Expanded Timer */}
      <div 
        className={`bg-background/90 backdrop-blur-xl border border-white/10 p-5 rounded-3xl shadow-glass transition-all duration-300 transform origin-bottom-right pointer-events-auto mb-4 ${isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0 pointer-events-none'}`}
      >
        <div className="flex justify-between items-center mb-4 border-b border-white/10 pb-2">
          <span className="font-bold text-sm text-textMuted tracking-wide uppercase">Rest Timer</span>
          <button onClick={() => setIsOpen(false)} className="text-textMuted hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="flex gap-6 items-center">
          {/* Visual Ring */}
          <div className="relative flex items-center justify-center w-24 h-24">
            <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 80 80">
              <circle
                cx="40"
                cy="40"
                r={radius}
                stroke="rgba(255,255,255,0.05)"
                strokeWidth="6"
                fill="none"
              />
              <circle
                cx="40"
                cy="40"
                r={radius}
                stroke={timeLeft === 0 && !isActive ? "rgba(255,255,255,0.05)" : "#0ea5e9"}
                strokeWidth="6"
                fill="none"
                strokeLinecap="round"
                style={{
                  strokeDasharray: circumference,
                  strokeDashoffset: strokeDashoffset,
                  transition: 'stroke-dashoffset 1s linear'
                }}
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span className={`text-2xl font-bold font-mono ${timeLeft <= 10 && timeLeft > 0 ? 'text-red-400' : 'text-white'}`}>
                {formatTime(timeLeft)}
              </span>
            </div>
          </div>

          {/* Controls & Presets */}
          <div className="flex flex-col gap-3">
            <div className="flex gap-2">
              <button onClick={() => startTimer(60)} className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs font-bold transition-colors">1m</button>
              <button onClick={() => startTimer(90)} className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs font-bold transition-colors">1.5m</button>
              <button onClick={() => startTimer(120)} className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs font-bold transition-colors">2m</button>
            </div>
            
            <div className="flex gap-2 w-full mt-1">
              <button 
                onClick={toggleTimer} 
                disabled={timeLeft === 0}
                className="flex-1 flex justify-center items-center py-2 bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isActive ? <Pause size={16} /> : <Play size={16} />}
              </button>
              <button 
                onClick={stopTimer}
                disabled={timeLeft === 0}
                className="flex-1 flex justify-center items-center py-2 bg-white/5 hover:bg-white/10 text-textMuted hover:text-white border border-white/10 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Square size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Toggle Button */}
      {!isOpen && (
        <button 
          onClick={() => setIsOpen(true)}
          className="pointer-events-auto p-4 bg-background/80 backdrop-blur-md border border-white/10 shadow-[0_0_20px_rgba(0,0,0,0.5)] rounded-full hover:bg-white/5 transition-all group relative"
        >
          <Timer size={24} className="text-primary group-hover:scale-110 transition-transform" />
          {isActive && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-primary border-2 border-background"></span>
            </span>
          )}
        </button>
      )}

    </div>
  );
}
