import React, { useEffect, useRef } from "react";

export interface ElectricLineProps {
  color?: string;
  speed?: number;
  chaos?: number;
  spread?: number;
  strands?: number;
  thickness?: number;
  className?: string;
}

function pseudoNoise(x: number, seed: number): number {
  return (
    Math.sin(x * 1.7 + seed * 3.1) * 0.5 +
    Math.sin(x * 3.9 - seed * 1.9) * 0.3 +
    Math.sin(x * 8.3 + seed * 5.7) * 0.2
  );
}

export default function ElectricLine({
  color = "#7df9ff",
  speed = 1,
  chaos = 0.5,
  spread = 0.6,
  strands = 3,
  thickness = 1.5,
  className = "",
}: ElectricLineProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let rafId: number | null = null;
    let isVisible = true;
    let width = 0;
    const height = 24;

    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const updateSize = () => {
      const rect = container.getBoundingClientRect();
      width = rect.width;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.round(width * dpr));
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const drawFrame = (timeMs: number) => {
      if (!width) return;
      ctx.clearRect(0, 0, width, height);

      const tSec = (timeMs / 1000) * speed;
      const numStrands = Math.max(1, Math.min(6, Math.round(strands)));
      const segments = Math.max(48, Math.min(180, Math.round(width / 10)));
      const amp = 4.5 * chaos * spread;
      const midY = height / 2;

      ctx.save();
      ctx.lineJoin = "round";
      ctx.lineCap = "round";

      for (let s = 0; s < numStrands; s++) {
        const strandAlpha = s === 0 ? 0.9 : Math.max(0.22, 0.55 - s * 0.14);
        ctx.beginPath();

        for (let i = 0; i <= segments; i++) {
          const u = i / segments;
          const x = u * width;
          const edgeFade = Math.sin(u * Math.PI);
          const n = prefersReducedMotion
            ? 0
            : pseudoNoise(u * 20 + tSec * (2.6 + s * 0.7), s + 1.3);
          const y = midY + n * amp * (1 + s * 0.25) * edgeFade;

          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }

        ctx.strokeStyle = color;
        ctx.globalAlpha = strandAlpha;
        ctx.lineWidth = Math.max(0.75, thickness - s * 0.25);
        ctx.shadowColor = color;
        ctx.shadowBlur = s === 0 ? 10 * spread + 4 : 4;
        ctx.stroke();
      }

      ctx.restore();
    };

    const loop = (now: number) => {
      if (!isVisible) {
        rafId = null;
        return;
      }
      drawFrame(now);
      if (!prefersReducedMotion) {
        rafId = window.requestAnimationFrame(loop);
      }
    };

    updateSize();
    drawFrame(performance.now());
    if (!prefersReducedMotion) {
      rafId = window.requestAnimationFrame(loop);
    }

    const resizeObserver = new ResizeObserver(() => {
      updateSize();
      drawFrame(performance.now());
    });
    resizeObserver.observe(container);

    const intersectionObserver = new IntersectionObserver(
      (entries) => {
        isVisible = Boolean(entries[0]?.isIntersecting);
        if (isVisible && rafId === null && !prefersReducedMotion) {
          rafId = window.requestAnimationFrame(loop);
        }
      },
      { rootMargin: "100px" },
    );
    intersectionObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      if (rafId !== null) window.cancelAnimationFrame(rafId);
    };
  }, [color, speed, chaos, spread, strands, thickness]);

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className={`relative w-full h-6 pointer-events-none select-none overflow-visible ${className}`}
    >
      <canvas ref={canvasRef} className="block w-full h-full" />
    </div>
  );
}
