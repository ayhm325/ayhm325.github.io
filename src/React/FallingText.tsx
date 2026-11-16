import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";

export interface FallingTextProps {
  text: string;
  highlightWords?: string[];
  trigger?: "auto" | "scroll" | "click" | "hover";
  fontSize?: string;
  gravity?: number;
  restoreDelay?: number;
  variant?: "text" | "pills";
  split?: "words" | "chars";
  order?: "sequential" | "random";
  bounciness?: number;
  scatter?: number;
  stagger?: number;
  cursorPush?: number;
  mouseConstraintStiffness?: number;
  accentColor?: string;
  draggable?: boolean;
  wireframes?: boolean;
  className?: string;
}

interface WordBody {
  id: number;
  token: string;
  isHighlighted: boolean;
  homeX: number;
  homeY: number;
  width: number;
  height: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  angle: number;
  va: number;
  delayMs: number;
  released: boolean;
}

export default function FallingText({
  text,
  highlightWords = [],
  trigger = "hover",
  fontSize = "1.75rem",
  gravity = 1,
  restoreDelay = 2.5,
  variant = "text",
  split = "words",
  order = "random",
  bounciness = 0.2,
  scatter = 0.5,
  stagger = 0.03,
  cursorPush = 0.5,
  mouseConstraintStiffness = 0.2,
  accentColor = "#a476ff",
  draggable = true,
  wireframes = false,
  className = "",
}: FallingTextProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const measureRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const bodiesRef = useRef<WordBody[]>([]);
  const domRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const rafRef = useRef<number | null>(null);
  const restoreTimerRef = useRef<number | null>(null);
  const dragIndexRef = useRef<number | null>(null);
  const pointerRef = useRef<{ x: number; y: number; prevX: number; prevY: number; inside: boolean }>({
    x: 0,
    y: 0,
    prevX: 0,
    prevY: 0,
    inside: false,
  });

  const [phase, setPhase] = useState<"idle" | "falling" | "restoring">("idle");
  const phaseRef = useRef(phase);
  phaseRef.current = phase;

  const tokens = useMemo(() => {
    const raw = split === "chars" ? Array.from(text) : text.split(/\s+/).filter(Boolean);
    const normalizedHighlights = highlightWords.map((w) => w.toLowerCase());
    return raw.map((token, idx) => {
      const clean = token.toLowerCase().replace(/[.,!?;:'"()]/g, "");
      const isHighlighted = normalizedHighlights.some(
        (hw) => hw === token.toLowerCase() || hw === clean,
      );
      return { id: idx, token, isHighlighted };
    });
  }, [text, split, highlightWords]);

  const stopLoop = useCallback(() => {
    if (rafRef.current !== null) {
      window.cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  const clearRestoreTimer = useCallback(() => {
    if (restoreTimerRef.current !== null) {
      window.clearTimeout(restoreTimerRef.current);
      restoreTimerRef.current = null;
    }
  }, []);

  const resetToIdle = useCallback(() => {
    stopLoop();
    clearRestoreTimer();
    dragIndexRef.current = null;
    domRefs.current.forEach((el) => {
      if (!el) return;
      el.style.transform = "translate3d(0px, 0px, 0px) rotate(0deg)";
    });
    setPhase("idle");
  }, [stopLoop, clearRestoreTimer]);

  const startSimulation = useCallback(() => {
    if (phaseRef.current === "falling") return;

    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    const container = containerRef.current;
    if (!container) return;

    const containerRect = container.getBoundingClientRect();
    const indices = tokens.map((_, i) => i);
    if (order === "random") {
      for (let i = indices.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [indices[i], indices[j]] = [indices[j], indices[i]];
      }
    }

    const delayMap = new Map<number, number>();
    indices.forEach((tokenIdx, seqIdx) => {
      delayMap.set(tokenIdx, seqIdx * stagger * 1000);
    });

    const bodies: WordBody[] = tokens.map((t, idx) => {
      const span = measureRefs.current[idx];
      const rect = span?.getBoundingClientRect();
      const homeX = rect ? rect.left - containerRect.left : 0;
      const homeY = rect ? rect.top - containerRect.top : 0;
      const width = rect ? rect.width : 40;
      const height = rect ? rect.height : 28;

      return {
        id: t.id,
        token: t.token,
        isHighlighted: t.isHighlighted,
        homeX,
        homeY,
        width,
        height,
        x: homeX,
        y: homeY,
        vx: (Math.random() - 0.5) * 6 * scatter,
        vy: -(Math.random() * 2.5 * scatter),
        angle: 0,
        va: (Math.random() - 0.5) * 4 * scatter,
        delayMs: delayMap.get(idx) ?? 0,
        released: false,
      };
    });

    bodiesRef.current = bodies;
    setPhase("falling");

    const startTime = performance.now();
    const boxW = containerRect.width;
    const boxH = containerRect.height;

    clearRestoreTimer();
    if (restoreDelay > 0) {
      const maxDelay = Math.max(...bodies.map((b) => b.delayMs), 0);
      restoreTimerRef.current = window.setTimeout(() => {
        if (dragIndexRef.current !== null) return;
        setPhase("restoring");
        window.setTimeout(() => {
          resetToIdle();
        }, 650);
      }, restoreDelay * 1000 + maxDelay + 600);
    }

    const step = (now: number) => {
      const elapsed = now - startTime;
      const pointer = pointerRef.current;
      const pointerVx = pointer.x - pointer.prevX;
      const pointerVy = pointer.y - pointer.prevY;
      pointer.prevX = pointer.x;
      pointer.prevY = pointer.y;

      for (let i = 0; i < bodies.length; i++) {
        const b = bodies[i];
        if (!b.released) {
          if (elapsed >= b.delayMs) {
            b.released = true;
          } else {
            continue;
          }
        }

        if (dragIndexRef.current === i && draggable) {
          const targetX = pointer.x - b.width / 2;
          const targetY = pointer.y - b.height / 2;
          b.vx = (targetX - b.x) * mouseConstraintStiffness * 2.2;
          b.vy = (targetY - b.y) * mouseConstraintStiffness * 2.2;
          b.x += b.vx;
          b.y += b.vy;
          b.va *= 0.85;
          b.angle += b.va;
        } else {
          b.vy += 0.48 * gravity;
          b.vx *= 0.992;
          b.va *= 0.985;

          if (pointer.inside && cursorPush > 0) {
            const cx = b.x + b.width / 2;
            const cy = b.y + b.height / 2;
            const dx = cx - pointer.x;
            const dy = cy - pointer.y;
            const dist = Math.hypot(dx, dy);
            const pushRadius = 85;
            if (dist > 0 && dist < pushRadius) {
              const force = ((pushRadius - dist) / pushRadius) * cursorPush * 1.6;
              b.vx += (dx / dist) * force + pointerVx * 0.08 * cursorPush;
              b.vy += (dy / dist) * force + pointerVy * 0.08 * cursorPush;
              b.va += ((dx > 0 ? 1 : -1) * force) * 0.35;
            }
          }

          b.x += b.vx;
          b.y += b.vy;
          b.angle += b.va;

          // Floor collision
          const floorY = boxH - b.height - 6;
          if (b.y > floorY) {
            b.y = floorY;
            if (Math.abs(b.vy) > 1.2) {
              b.vy = -b.vy * Math.max(0.05, bounciness);
              b.vx *= 0.92;
              b.va *= 0.85;
            } else {
              b.vy = 0;
              b.vx *= 0.88;
              b.va *= 0.8;
            }
          }

          // Ceiling & side walls
          if (b.y < 0) {
            b.y = 0;
            b.vy = -b.vy * bounciness;
          }
          if (b.x < 4) {
            b.x = 4;
            b.vx = -b.vx * Math.max(0.2, bounciness);
          } else if (b.x + b.width > boxW - 4) {
            b.x = boxW - b.width - 4;
            b.vx = -b.vx * Math.max(0.2, bounciness);
          }
        }

        const el = domRefs.current[i];
        if (el) {
          const dx = b.x - b.homeX;
          const dy = b.y - b.homeY;
          el.style.transform = `translate3d(${dx.toFixed(1)}px, ${dy.toFixed(1)}px, 0) rotate(${b.angle.toFixed(1)}deg)`;
        }
      }

      if (phaseRef.current === "falling") {
        rafRef.current = window.requestAnimationFrame(step);
      }
    };

    rafRef.current = window.requestAnimationFrame(step);
  }, [
    tokens,
    order,
    stagger,
    scatter,
    gravity,
    bounciness,
    cursorPush,
    draggable,
    mouseConstraintStiffness,
    restoreDelay,
    clearRestoreTimer,
    resetToIdle,
  ]);

  useEffect(() => {
    if (trigger === "auto") {
      startSimulation();
    } else if (trigger === "scroll" && containerRef.current) {
      const observer = new IntersectionObserver(
        (entries) => {
          if (entries[0]?.isIntersecting) {
            startSimulation();
            observer.disconnect();
          }
        },
        { threshold: 0.4 },
      );
      observer.observe(containerRef.current);
      return () => observer.disconnect();
    }
    return undefined;
  }, [trigger, startSimulation]);

  useEffect(() => {
    const handlePointerUp = () => {
      if (dragIndexRef.current !== null) {
        dragIndexRef.current = null;
      }
    };
    window.addEventListener("pointerup", handlePointerUp);
    return () => {
      window.removeEventListener("pointerup", handlePointerUp);
      stopLoop();
      clearRestoreTimer();
    };
  }, [stopLoop, clearRestoreTimer]);

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    pointerRef.current.x = e.clientX - rect.left;
    pointerRef.current.y = e.clientY - rect.top;
    pointerRef.current.inside = true;
  };

  return (
    <div
      ref={containerRef}
      onMouseEnter={trigger === "hover" ? startSimulation : undefined}
      onClick={trigger === "click" ? startSimulation : undefined}
      onPointerMove={handlePointerMove}
      onPointerLeave={() => {
        pointerRef.current.inside = false;
      }}
      className={`relative w-full h-full overflow-hidden select-none flex items-start justify-center p-6 md:p-8 ${
        trigger === "click" ? "cursor-pointer" : ""
      } ${className}`}
    >
      <p
        className="text-center leading-relaxed font-medium flex flex-wrap items-center justify-center gap-x-2.5 gap-y-2 max-w-3xl"
        style={{ fontSize }}
      >
        {tokens.map((t, idx) => (
          <span
            key={t.id}
            ref={(el) => {
              measureRefs.current[idx] = el;
              domRefs.current[idx] = el;
            }}
            onPointerDown={(e) => {
              if (!draggable || phaseRef.current !== "falling") return;
              e.stopPropagation();
              dragIndexRef.current = idx;
            }}
            style={{
              color: t.isHighlighted ? accentColor : "var(--white)",
              border: wireframes
                ? "1px dashed rgba(255,255,255,0.35)"
                : variant === "pills"
                  ? "1px solid rgba(255,255,255,0.12)"
                  : undefined,
              backgroundColor:
                variant === "pills"
                  ? t.isHighlighted
                    ? "rgba(164, 118, 255, 0.16)"
                    : "rgba(255, 255, 255, 0.05)"
                  : undefined,
              transition:
                phase === "restoring"
                  ? "transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)"
                  : undefined,
            }}
            className={`inline-block will-change-transform ${
              variant === "pills" ? "px-3 py-1 rounded-full" : ""
            } ${
              draggable && phase === "falling"
                ? "cursor-grab active:cursor-grabbing"
                : ""
            }`}
          >
            {t.token}
          </span>
        ))}
      </p>
    </div>
  );
}
