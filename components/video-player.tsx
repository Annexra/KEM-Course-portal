'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useToast } from '@/components/toast-provider';
import { Play, Pause, Volume2, VolumeX, Maximize, RotateCcw, CheckCircle2, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface VideoPlayerProps {
  materialId: string;
  title: string;
  videoUrl: string;
  isRequired?: boolean;
  onCompleted?: () => void;
}

export function VideoPlayer({ materialId, title, videoUrl, isRequired = true, onCompleted }: VideoPlayerProps) {
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [highestWatchedTime, setHighestWatchedTime] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  // Load position state from localStorage
  useEffect(() => {
    const savedKey = `kem_video_pos_${materialId}`;
    const saved = localStorage.getItem(savedKey);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setHighestWatchedTime(parsed.highestWatchedTime || 0);
        if (parsed.isCompleted) setIsCompleted(true);
      } catch {
        // ignore
      }
    }
  }, [materialId]);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const current = videoRef.current.currentTime;
    setCurrentTime(current);

    if (current > highestWatchedTime) {
      setHighestWatchedTime(current);
    }

    const dur = videoRef.current.duration || 1;
    const watchPct = (Math.max(current, highestWatchedTime) / dur) * 100;

    // Save progress
    localStorage.setItem(
      `kem_video_pos_${materialId}`,
      JSON.stringify({
        lastPosition: current,
        highestWatchedTime: Math.max(current, highestWatchedTime),
        watchedPercentage: watchPct,
        isCompleted: watchPct >= 90 || isCompleted,
      })
    );

    // Enforce 90% watch completion requirement
    if (watchPct >= 90 && !isCompleted) {
      setIsCompleted(true);
      toast('Module Video Complete!', 'You have satisfied the 90% watch threshold requirement.', 'success');
      if (onCompleted) onCompleted();
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!videoRef.current) return;
    const targetTime = parseFloat(e.target.value);

    // Enforce non-skipping past highest watched time for required videos
    if (isRequired && targetTime > highestWatchedTime + 3 && !isCompleted) {
      toast('Fast-forward locked', 'Required videos cannot be skipped ahead past watched portions.', 'info');
      videoRef.current.currentTime = highestWatchedTime;
      setCurrentTime(highestWatchedTime);
      return;
    }

    videoRef.current.currentTime = targetTime;
    setCurrentTime(targetTime);
  };

  const handleSpeedChange = (speed: number) => {
    setPlaybackRate(speed);
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const watchedPercentage = duration > 0 ? Math.min(100, (highestWatchedTime / duration) * 100) : 0;

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-950 text-white overflow-hidden shadow-2xl space-y-0">
      {/* Video Container */}
      <div className="relative aspect-video bg-black flex items-center justify-center group">
        <video
          ref={videoRef}
          src={videoUrl}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          className="w-full h-full object-cover"
          poster="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1200"
        />

        {/* Completion Badge Overlay */}
        {isCompleted && (
          <div className="absolute top-4 right-4 bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 backdrop-blur-md">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            90% Watched Completed
          </div>
        )}

        {/* Play Overlay Big Icon */}
        <button
          onClick={togglePlay}
          className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/40 transition-colors opacity-90 group-hover:opacity-100"
        >
          <div className="w-16 h-16 rounded-full bg-sky-600/90 hover:bg-sky-500 text-white flex items-center justify-center shadow-xl backdrop-blur-md transform group-hover:scale-110 transition-transform">
            {isPlaying ? <Pause className="w-8 h-8 fill-current" /> : <Play className="w-8 h-8 fill-current ml-1" />}
          </div>
        </button>
      </div>

      {/* Video Controls Bar */}
      <div className="p-4 bg-slate-900/90 border-t border-slate-800 space-y-3">
        {/* Progress Slider */}
        <div className="space-y-1">
          <div className="flex justify-between text-[11px] text-slate-400 font-mono">
            <span>{formatTime(currentTime)}</span>
            <span className="flex items-center gap-2">
              {isRequired && !isCompleted && (
                <span className="flex items-center gap-1 text-amber-400">
                  <Lock className="w-3 h-3" /> Anti-skip active (Watched: {watchedPercentage.toFixed(0)}%)
                </span>
              )}
              <span>{formatTime(duration)}</span>
            </span>
          </div>

          <input
            type="range"
            min={0}
            max={duration || 100}
            value={currentTime}
            onChange={handleSeek}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-500"
          />
        </div>

        {/* Buttons Bar */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <button
              onClick={togglePlay}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white transition-colors"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>

            <button
              onClick={toggleMute}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white transition-colors"
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
          </div>

          {/* Speed selector */}
          <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-xl text-xs font-semibold">
            {[1, 1.25, 1.5, 2].map((speed) => (
              <button
                key={speed}
                onClick={() => handleSpeedChange(speed)}
                className={`px-2 py-0.5 rounded-lg transition-colors ${
                  playbackRate === speed ? 'bg-sky-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                {speed}x
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
