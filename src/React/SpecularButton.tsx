import React, { useEffect, useRef, useState } from "react";

export interface SpecularButtonProps {
  children: React.ReactNode;
  size?: "sm" | "md" | "lg";
  radius?: number;
  tint?: string;
  tintOpacity?: number;
  textColor?: string;
  lineColor?: string;
  baseColor?: string;
  intensity?: number;
  idleIntensity?: number;
  shineSize?: number;
  shineFade?: number;
  thickness?: number;
  glow?: number;
  followMouse?: boolean;
  proximity?: number;
  href?: string;
  download?: string;
  target?: string;
  rel?: string;
  type?: "button" | "submit" | "reset";
  className?: string;
  disabled?: boolean;
  ariaLabel?: string;
  onClick?: React.MouseEventHandler<HTMLElement>;
}

const SIZE_CLASSES: Record<NonNullable<SpecularButtonProps["size"]>, string> = {
  sm: "px-4 py-2 text-xs",
  md: "px-5 py-2.5 text-sm",
  lg: "px-6 py-3.5 text-base",
};

type PointerListener = (clientX: number, clientY: number) => void;
const pointerListeners = new Set<PointerListener>();
let sharedRafId: number | null = null;
let latestPointer = { x: 0, y: 0 };

function onSharedPointerMove(e: PointerEvent) {
  latestPointer.x = e.clientX;
  latestPointer.y = e.clientY;
  if (sharedRafId !== null) return;
  sharedRafId = window.requestAnimationFrame(() => {
    sharedRafId = null;
    pointerListeners.forEach((cb) => cb(latestPointer.x, latestPointer.y));
  });
}

function subscribePointer(cb: PointerListener): () => void {
  if (pointerListeners.size === 0 && typeof window !== "undefined") {
    window.addEventListener("pointermove", onSharedPointerMove, { passive: true });
  }
  pointerListeners.add(cb);
  return () => {
    pointerListeners.delete(cb);
    if (pointerListeners.size === 0 && typeof window !== "undefined") {
      window.removeEventListener("pointermove", onSharedPointerMove);
      if (sharedRafId !== null) {
        window.cancelAnimationFrame(sharedRafId);
        sharedRafId = null;
      }
    }
  };
}

function hexToRgba(hex: string, alpha: number): string {
  const clean = hex.replace("#", "").trim();
  if (clean.length === 3) {
    const r = parseInt(clean[0] + clean[0], 16);
    const g = parseInt(clean[1] + clean[1], 16);
    const b = parseInt(clean[2] + clean[2], 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
  if (clean.length === 6) {
    const r = parseInt(clean.slice(0, 2), 16);
    const g = parseInt(clean.slice(2, 4), 16);
    const b = parseInt(clean.slice(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
  return hex;
}

export default function SpecularButton({
  children,
  size = "md",
  radius = 18,
  tint = "#ffffff",
  tintOpacity = 0.04,
  textColor = "#f5f5f5",
  lineColor = "#ffffff",
  baseColor = "#525252",
  intensity = 1,
  idleIntensity = 0.35,
  shineSize = 10,
  shineFade = 34,
  thickness = 1.2,
  glow = 1,
  followMouse = true,
  proximity = 250,
  href,
  download,
  target,
  rel,
  type = "button",
  className = "",
  disabled = false,
  ariaLabel,
  onClick,
}: SpecularButtonProps) {
  const ref = useRef<HTMLButtonElement | HTMLAnchorElement | null>(null);
  const [angle, setAngle] = useState<number>(315);
  const [activeStrength, setActiveStrength] = useState<number>(idleIntensity);
  const [pointerPos, setPointerPos] = useState<{ x: number; y: number }>({
    x: 50,
    y: 50,
  });

  useEffect(() => {
    if (!followMouse || disabled) {
      setActiveStrength(idleIntensity);
      return;
    }

    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) {
      setActiveStrength(idleIntensity);
      return;
    }

    const handlePointerMove: PointerListener = (clientX, clientY) => {
      const el = ref.current;
      if (!el) return;

      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;

      const dx = Math.max(rect.left - clientX, 0, clientX - rect.right);
      const dy = Math.max(rect.top - clientY, 0, clientY - rect.bottom);
      const dist = Math.hypot(dx, dy);

      if (dist <= proximity) {
        const factor = 1 - dist / Math.max(proximity, 1);
        const nextStrength =
          idleIntensity + (intensity - idleIntensity) * factor;
        const deg =
          (Math.atan2(clientY - cy, clientX - cx) * 180) / Math.PI + 90;

        setAngle(deg);
        setActiveStrength(nextStrength);
        setPointerPos({
          x: ((clientX - rect.left) / Math.max(rect.width, 1)) * 100,
          y: ((clientY - rect.top) / Math.max(rect.height, 1)) * 100,
        });
      } else {
        setActiveStrength(idleIntensity);
      }
    };

    return subscribePointer(handlePointerMove);
  }, [followMouse, proximity, intensity, idleIntensity, disabled]);

  const shineHalf = Math.max(2, shineSize);
  const fadeSpan = Math.max(shineHalf + 4, shineHalf + shineFade);
  const lineAlpha = Math.min(1, Math.max(0, activeStrength));
  const specularGradient = `conic-gradient(from ${angle}deg at 50% 50%, ${hexToRgba(lineColor, lineAlpha)} 0deg, ${hexToRgba(lineColor, lineAlpha)} ${shineHalf}deg, transparent ${fadeSpan}deg, transparent ${360 - fadeSpan}deg, ${hexToRgba(lineColor, lineAlpha)} ${360 - shineHalf}deg, ${hexToRgba(lineColor, lineAlpha)} 360deg)`;

  const containerStyle: React.CSSProperties = {
    borderRadius: `${radius}px`,
    color: textColor,
    backgroundColor: hexToRgba(tint, tintOpacity),
  };

  const borderMaskStyle: React.CSSProperties = {
    borderRadius: `${radius}px`,
    padding: `${thickness}px`,
    background: `${specularGradient}, ${baseColor}`,
    WebkitMask:
      "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
    WebkitMaskComposite: "xor",
    maskComposite: "exclude",
  };

  const glowStyle: React.CSSProperties = {
    borderRadius: `${radius}px`,
    background: specularGradient,
    opacity: Math.min(1, glow * activeStrength * 0.45),
    filter: `blur(${Math.max(4, glow * 10)}px)`,
  };

  const innerSheenStyle: React.CSSProperties = {
    borderRadius: `${radius}px`,
    background: `radial-gradient(circle at ${pointerPos.x}% ${pointerPos.y}%, ${hexToRgba(tint, Math.min(0.2, tintOpacity * 3 * activeStrength))}, transparent 65%)`,
  };

  const sharedClassName = `relative inline-flex items-center justify-center gap-2 font-medium select-none cursor-pointer transition-transform duration-200 active:scale-[0.98] backdrop-blur-md focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--sec)] ${SIZE_CLASSES[size]} ${disabled ? "opacity-50 pointer-events-none" : ""} ${className}`;

  const content = (
    <>
      {glow > 0 && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -inset-[1px] transition-opacity duration-200"
          style={glowStyle}
        />
      )}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={innerSheenStyle}
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={borderMaskStyle}
      />
      <span className="relative z-10 inline-flex w-full items-center justify-center gap-2">
        {children}
      </span>
    </>
  );

  if (href) {
    return (
      <a
        ref={ref as React.RefObject<HTMLAnchorElement>}
        href={href}
        download={download}
        target={target}
        rel={rel}
        aria-label={ariaLabel}
        onClick={onClick}
        style={containerStyle}
        className={sharedClassName}
      >
        {content}
      </a>
    );
  }

  return (
    <button
      ref={ref as React.RefObject<HTMLButtonElement>}
      type={type}
      disabled={disabled}
      aria-label={ariaLabel}
      onClick={onClick}
      style={containerStyle}
      className={sharedClassName}
    >
      {content}
    </button>
  );
}
