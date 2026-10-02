'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { GhostCursorProps } from './GhostCursor';

const GhostCursor = dynamic(() => import('./GhostCursor'), {
  ssr: false,
});

export interface GhostCursorLayerProps {
  tone?: 'hero' | 'auth' | 'subtle';
  color?: string;
  className?: string;
  zIndex?: number;
}

export function GhostCursorLayer({
  tone = 'hero',
  color = '#5EEAD4', // Placeholder for KEM brand accent (calm teal)
  className = '',
  zIndex = 10,
}: GhostCursorLayerProps) {
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    // a) Check prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    // b) Check fine pointer and hover capability
    const hasFinePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    if (!hasFinePointer) return;

    // c) Check WebGL support
    try {
      const canvas = document.createElement('canvas');
      const hasWebGL = !!(
        window.WebGLRenderingContext &&
        (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
      );
      if (!hasWebGL) return;
    } catch {
      return;
    }

    // d) Check tab visibility
    if (document.hidden) return;

    setShouldRender(true);

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setShouldRender(false);
      } else {
        setShouldRender(true);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  if (!shouldRender) return null;

  // Preset Configurations
  const presets: Record<'hero' | 'auth' | 'subtle', GhostCursorProps> = {
    hero: {
      color,
      brightness: 1.2,
      trailLength: 20,
      inertia: 0.4,
      grainIntensity: 0.05,
      bloomStrength: 0.5,
      bloomRadius: 0.7,
      bloomThreshold: 0,
      fadeDelayMs: 200,
      fadeDurationMs: 1000,
    },
    auth: {
      color,
      brightness: 1.0,
      trailLength: 16,
      inertia: 0.5,
      grainIntensity: 0.04,
      bloomStrength: 0.35,
      bloomRadius: 0.7,
      bloomThreshold: 0.01,
      fadeDelayMs: 300,
      fadeDurationMs: 1000,
    },
    subtle: {
      color,
      brightness: 0.8,
      trailLength: 12,
      inertia: 0.5,
      grainIntensity: 0.03,
      bloomStrength: 0.25,
      bloomRadius: 0.6,
      bloomThreshold: 0.02,
      fadeDelayMs: 300,
      fadeDurationMs: 800,
    },
  };

  const selectedPreset = presets[tone];

  return (
    <div
      className={`absolute inset-0 pointer-events-none ${className}`}
      style={{ zIndex }}
    >
      <GhostCursor {...selectedPreset} />
    </div>
  );
}
