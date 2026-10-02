'use client';

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export interface GhostCursorProps {
  color?: string;
  brightness?: number;
  trailLength?: number;
  inertia?: number;
  grainIntensity?: number;
  bloomStrength?: number;
  bloomRadius?: number;
  bloomThreshold?: number;
  fadeDelayMs?: number;
  fadeDurationMs?: number;
  maxDevicePixelRatio?: number;
  className?: string;
}

export default function GhostCursor({
  color = '#5EEAD4',
  brightness = 1.2,
  trailLength = 20,
  inertia = 0.4,
  grainIntensity = 0.05,
  bloomStrength = 0.5,
  bloomRadius = 0.7,
  bloomThreshold = 0,
  fadeDelayMs = 200,
  fadeDurationMs = 1000,
  maxDevicePixelRatio = 0.5,
  className = '',
}: GhostCursorProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const parent = container.parentElement;
    if (!parent) return;

    // Set up Three.js Scene, Camera, and Renderer
    const width = parent.clientWidth;
    const height = parent.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-width / 2, width / 2, height / 2, -height / 2, 0.1, 1000);
    camera.position.z = 10;

    const pixelRatio = Math.min(window.devicePixelRatio || 1, maxDevicePixelRatio);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(pixelRatio);
    renderer.domElement.style.position = 'absolute';
    renderer.domElement.style.top = '0';
    renderer.domElement.style.left = '0';
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.pointerEvents = 'none';

    container.appendChild(renderer.domElement);

    // Particle Trail Buffer
    const numPoints = trailLength;
    const positions = new Float32Array(numPoints * 3);
    const opacities = new Float32Array(numPoints);
    const sizes = new Float32Array(numPoints);

    for (let i = 0; i < numPoints; i++) {
      positions[i * 3] = 0;
      positions[i * 3 + 1] = 0;
      positions[i * 3 + 2] = 0;
      opacities[i] = (1 - i / numPoints) * brightness;
      sizes[i] = (1 - i / numPoints) * 32 + 8;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('opacity', new THREE.BufferAttribute(opacities, 1));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    // Custom Shader Material
    const material = new THREE.ShaderMaterial({
      uniforms: {
        color: { value: new THREE.Color(color) },
      },
      vertexShader: `
        attribute float opacity;
        attribute float size;
        varying float vOpacity;
        void main() {
          vOpacity = opacity;
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = size;
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        uniform vec3 color;
        varying float vOpacity;
        void main() {
          float dist = length(gl_PointCoord - vec2(0.5));
          if (dist > 0.5) discard;
          float alpha = (1.0 - smoothstep(0.0, 0.5, dist)) * vOpacity;
          gl_FragColor = vec4(color, alpha);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthTest: false,
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);

    // Pointer Tracking State
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;
    let isMoving = false;
    let fadeTimeout: NodeJS.Timeout | null = null;
    let animationFrameId: number;

    const history: { x: number; y: number }[] = Array.from({ length: numPoints }, () => ({ x: 0, y: 0 }));

    const handlePointerMove = (e: MouseEvent | TouchEvent) => {
      const rect = parent.getBoundingClientRect();
      let clientX = 0;
      let clientY = 0;

      if ('touches' in e && e.touches.length > 0) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      } else if ('clientX' in e) {
        clientX = e.clientX;
        clientY = e.clientY;
      }

      targetX = clientX - rect.left - width / 2;
      targetY = -(clientY - rect.top - height / 2);
      isMoving = true;

      if (fadeTimeout) clearTimeout(fadeTimeout);
      fadeTimeout = setTimeout(() => {
        isMoving = false;
      }, fadeDelayMs);
    };

    parent.addEventListener('mousemove', handlePointerMove);
    parent.addEventListener('touchmove', handlePointerMove);

    // Animation Loop
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      // Interpolate pointer position for smooth inertia
      currentX += (targetX - currentX) * inertia;
      currentY += (targetY - currentY) * inertia;

      // Shift trail history
      history.unshift({ x: currentX, y: currentY });
      if (history.length > numPoints) history.pop();

      const posAttr = geometry.attributes.position as THREE.BufferAttribute;
      const opAttr = geometry.attributes.opacity as THREE.BufferAttribute;

      for (let i = 0; i < history.length; i++) {
        posAttr.setXYZ(i, history[i].x, history[i].y, 0);
        const fade = isMoving ? 1 : Math.max(0, 1 - fadeDurationMs / 1000);
        opAttr.setX(i, (1 - i / numPoints) * brightness * fade);
      }

      posAttr.needsUpdate = true;
      opAttr.needsUpdate = true;

      renderer.render(scene, camera);
    };

    animate();

    // Resize Handler
    const handleResize = () => {
      if (!parent) return;
      const w = parent.clientWidth;
      const h = parent.clientHeight;
      camera.left = -w / 2;
      camera.right = w / 2;
      camera.top = h / 2;
      camera.bottom = -h / 2;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      parent.removeEventListener('mousemove', handlePointerMove);
      parent.removeEventListener('touchmove', handlePointerMove);
      if (fadeTimeout) clearTimeout(fadeTimeout);
      cancelAnimationFrame(animationFrameId);
      renderer.dispose();
      geometry.dispose();
      material.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [
    color,
    brightness,
    trailLength,
    inertia,
    grainIntensity,
    bloomStrength,
    bloomRadius,
    bloomThreshold,
    fadeDelayMs,
    fadeDurationMs,
    maxDevicePixelRatio,
  ]);

  return (
    <div
      ref={containerRef}
      className={`absolute inset-0 pointer-events-none ${className}`}
      style={{ mixBlendMode: 'screen' }}
    />
  );
}
