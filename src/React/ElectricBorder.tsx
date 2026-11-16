import React, { useEffect, useRef } from "react";

export interface ElectricBorderProps {
  children: React.ReactNode;
  color?: string;
  speed?: number;
  chaos?: number;
  spread?: number;
  strands?: number;
  thickness?: number;
  borderRadius?: number;
  className?: string;
}

function getPointOnRoundedRect(
  t: number,
  w: number,
  h: number,
  r: number,
): { x: number; y: number; nx: number; ny: number } {
  const radius = Math.min(r, w / 2, h / 2);
  const straightW = Math.max(0, w - 2 * radius);
  const straightH = Math.max(0, h - 2 * radius);
  const cornerLen = (Math.PI * radius) / 2;
  const totalLen = 2 * straightW + 2 * straightH + 4 * cornerLen;

  let d = ((t % 1) + 1) % 1;
  d *= totalLen;

  // Top edge
  if (d <= straightW) {
    return { x: radius + d, y: 0, nx: 0, ny: -1 };
  }
  d -= straightW;

  // Top-right corner
  if (d <= cornerLen) {
    const a = -Math.PI / 2 + (d / Math.max(cornerLen, 1e-4)) * (Math.PI / 2);
    return {
      x: w - radius + Math.cos(a) * radius,
      y: radius + Math.sin(a) * radius,
      nx: Math.cos(a),
      ny: Math.sin(a),
    };
  }
  d -= cornerLen;

  // Right edge
  if (d <= straightH) {
    return { x: w, y: radius + d, nx: 1, ny: 0 };
  }
  d -= straightH;

  // Bottom-right corner
  if (d <= cornerLen) {
    const a = (d / Math.max(cornerLen, 1e-4)) * (Math.PI / 2);
    return {
      x: w - radius + Math.cos(a) * radius,
      y: h - radius + Math.sin(a) * radius,
      nx: Math.cos(a),
      ny: Math.sin(a),
    };
  }
  d -= cornerLen;

  // Bottom edge
  if (d <= straightW) {
    return { x: w - radius - d, y: h, nx: 0, ny: 1 };
  }
  d -= straightW;

  // Bottom-left corner
  if (d <= cornerLen) {
    const a = Math.PI / 2 + (d / Math.max(cornerLen, 1e-4)) * (Math.PI / 2);
    return {
      x: radius + Math.cos(a) * radius,
      y: h - radius + Math.sin(a) * radius,
      nx: Math.cos(a),
      ny: Math.sin(a),
    };
  }
  d -= cornerLen;

  // Left edge
  if (d <= straightH) {
    return { x: 0, y: h - radius - d, nx: -1, ny: 0 };
  }
  d -= straightH;

  // Top-left corner
  const a = Math.PI + (d / Math.max(cornerLen, 1e-4)) * (Math.PI / 2);
  return {
    x: radius + Math.cos(a) * radius,
    y: radius + Math.sin(a) * radius,
    nx: Math.cos(a),
    ny: Math.sin(a),
  };
}

function pseudoNoise(x: number, seed: number): number {
  return (
    Math.sin(x * 1.7 + seed * 3.1) * 0.5 +
    Math.sin(x * 3.9 - seed * 1.9) * 0.3 +
    Math.sin(x * 8.3 + seed * 5.7) * 0.2
  );
}

export default function ElectricBorder({
  children,
  color = "#a476ff",
  speed = 1,
  chaos = 0.5,
  spread = 0.6,
  strands = 3,
  thickness = 1.5,
  borderRadius = 16,
  className = "",
}: ElectricBorderProps) {
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
    let height = 0;
    const pad = 12;

    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const updateSize = () => {
      const rect = container.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.round((width + pad * 2) * dpr));
      canvas.height = Math.max(1, Math.round((height + pad * 2) * dpr));
      canvas.style.width = `${width + pad * 2}px`;
      canvas.style.height = `${height + pad * 2}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const drawFrame = (timeMs: number) => {
      if (!width || !height) return;
      ctx.clearRect(0, 0, width + pad * 2, height + pad * 2);

      const tSec = (timeMs / 1000) * speed;
      const numStrands = Math.max(1, Math.min(6, Math.round(strands)));
      const perimeter = 2 * (width + height);
      const segments = Math.max(72, Math.min(220, Math.round(perimeter / 8)));
      const amp = 4.5 * chaos * spread;

      ctx.save();
      ctx.translate(pad, pad);
      ctx.lineJoin = "round";
      ctx.lineCap = "round";

      for (let s = 0; s < numStrands; s++) {
        const strandAlpha = s === 0 ? 0.9 : Math.max(0.22, 0.55 - s * 0.14);
        ctx.beginPath();

        for (let i = 0; i <= segments; i++) {
          const u = i / segments;
          const pt = getPointOnRoundedRect(u, width, height, borderRadius);
          const n = prefersReducedMotion
            ? 0
            : pseudoNoise(u * 26 + tSec * (2.6 + s * 0.7), s + 1.3);
          const offset = n * amp * (1 + s * 0.25);
          const px = pt.x + pt.nx * offset;
          const py = pt.y + pt.ny * offset;

          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }

        ctx.closePath();
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
  }, [color, speed, chaos, spread, strands, thickness, borderRadius]);

  return (
    <div
      ref={containerRef}
      className={`relative ${className}`}
      style={{ borderRadius: `${borderRadius}px` }}
    >
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="pointer-events-none absolute -top-[12px] -left-[12px] z-[5]"
      />
      <div
        className="relative z-20 h-full w-full"
        style={{ borderRadius: `${borderRadius}px` }}
      >
        {children}
      </div>
    </div>
  );
}
