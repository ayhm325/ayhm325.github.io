import React, { useId, useMemo, useRef, useState } from "react";

export interface ShinyTextProps {
  text: string;
  color?: string;
  shineColor?: string;
  speed?: number;
  shineWidth?: number;
  softness?: number;
  trigger?: "loop" | "hover" | "once";
  delay?: number;
  angle?: number;
  bands?: number;
  glow?: number;
  direction?: "left" | "right";
  easing?: "linear" | "smooth" | "ease-in-out";
  yoyo?: boolean;
  followPointer?: boolean;
  pauseOnHover?: boolean;
  disabled?: boolean;
  className?: string;
}

export default function ShinyText({
  text,
  color = "#a476ff",
  shineColor = "#f3ecff",
  speed = 4,
  shineWidth = 70,
  softness = 0.8,
  trigger = "loop",
  delay = 0.7,
  angle = 120,
  bands = 1,
  glow = 0,
  direction = "left",
  easing = "smooth",
  yoyo = false,
  followPointer = false,
  pauseOnHover = false,
  disabled = false,
  className = "",
}: ShinyTextProps) {
  const uid = useId().replace(/:/g, "");
  const spanRef = useRef<HTMLSpanElement | null>(null);
  const [hovered, setHovered] = useState(false);
  const [pointerPct, setPointerPct] = useState<number>(50);

  const timingFn =
    easing === "linear"
      ? "linear"
      : easing === "ease-in-out"
        ? "ease-in-out"
        : "cubic-bezier(0.45, 0, 0.55, 1)";

  const gradient = useMemo(() => {
    const safeBands = Math.max(1, Math.min(4, Math.round(bands)));
    const halfBand = Math.max(4, Math.min(45, (shineWidth / 2) * softness));
    const stops: string[] = [];

    if (safeBands === 1) {
      const center = 50;
      const start = Math.max(0, center - halfBand);
      const end = Math.min(100, center + halfBand);
      stops.push(`${color} 0%`);
      stops.push(`${color} ${start.toFixed(1)}%`);
      stops.push(`${shineColor} ${center}%`);
      stops.push(`${color} ${end.toFixed(1)}%`);
      stops.push(`${color} 100%`);
    } else {
      stops.push(`${color} 0%`);
      for (let i = 0; i < safeBands; i++) {
        const center = ((i + 1) / (safeBands + 1)) * 100;
        const spread = halfBand / safeBands;
        stops.push(`${color} ${Math.max(0, center - spread).toFixed(1)}%`);
        stops.push(`${shineColor} ${center.toFixed(1)}%`);
        stops.push(`${color} ${Math.min(100, center + spread).toFixed(1)}%`);
      }
      stops.push(`${color} 100%`);
    }

    return `linear-gradient(${angle}deg, ${stops.join(", ")})`;
  }, [angle, bands, color, shineColor, shineWidth, softness]);

  const animName = `shinySweep_${uid}`;
  const fromPos = direction === "left" ? "100% 50%" : "0% 50%";
  const toPos = direction === "left" ? "0% 50%" : "100% 50%";

  const iteration =
    trigger === "once" ? "1" : trigger === "hover" ? "1" : "infinite";
  const animDirection = yoyo ? "alternate" : "normal";
  const shouldAnimate =
    !disabled &&
    !followPointer &&
    (trigger === "loop" || trigger === "once" || (trigger === "hover" && hovered));

  const handlePointerMove = (e: React.PointerEvent<HTMLSpanElement>) => {
    if (!followPointer || disabled) return;
    const rect = spanRef.current?.getBoundingClientRect();
    if (!rect || rect.width <= 0) return;
    const pct = ((e.clientX - rect.left) / rect.width) * 100;
    setPointerPct(Math.max(0, Math.min(100, pct)));
  };

  return (
    <>
      <style>{`
        @keyframes ${animName} {
          0% { background-position: ${fromPos}; }
          100% { background-position: ${toPos}; }
        }
      `}</style>
      <span
        ref={spanRef}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onPointerMove={handlePointerMove}
        className={`inline-block bg-clip-text text-transparent ${className}`}
        style={{
          backgroundImage: disabled ? "none" : gradient,
          backgroundColor: disabled ? color : undefined,
          color: disabled ? color : "transparent",
          backgroundSize: "250% 100%",
          backgroundPosition: followPointer
            ? `${100 - pointerPct}% 50%`
            : fromPos,
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: disabled ? color : "transparent",
          animationName: shouldAnimate ? animName : "none",
          animationDuration: `${speed}s`,
          animationTimingFunction: timingFn,
          animationDelay: `${delay}s`,
          animationIterationCount: iteration,
          animationDirection: animDirection,
          animationPlayState:
            pauseOnHover && hovered ? "paused" : "running",
          filter:
            glow > 0
              ? `drop-shadow(0 0 ${Math.round(glow * 14)}px ${shineColor}55)`
              : undefined,
        }}
      >
        {text}
      </span>
    </>
  );
}
